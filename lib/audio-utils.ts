// Utility functions for audio processing

const TARGET_SAMPLE_RATE = 16000; // 16kHz — optimal for Azure Speech Service
const TARGET_CHANNELS = 1; // Mono

/**
 * Convert audio blob to 16kHz mono WAV format using Web Audio API.
 * Resamples from whatever the browser recorded (usually 44.1/48kHz) down to
 * 16kHz mono PCM, which is exactly what Azure Speech Service expects.
 */
export async function convertToWav(audioBlob: Blob): Promise<Blob> {
    try {
        // Create an audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Read the blob as an array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        // Decode the audio data (browser sample rate, may be stereo)
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioContext.close();

        console.log(`Audio decoded: ${audioBuffer.sampleRate}Hz, ${audioBuffer.numberOfChannels}ch, ${audioBuffer.duration.toFixed(1)}s`);

        // Resample to 16kHz mono
        const resampledBuffer = await resampleTo16kMono(audioBuffer);
        console.log(`Resampled to: ${resampledBuffer.sampleRate}Hz, ${resampledBuffer.numberOfChannels}ch, ${resampledBuffer.length} samples`);

        // Convert to WAV format
        const wavBlob = audioBufferToWav(resampledBuffer);
        
        return wavBlob;
    } catch (error) {
        console.error('Error converting audio to WAV:', error);
        throw error;
    }
}

/**
 * Resample an AudioBuffer to 16kHz mono using OfflineAudioContext.
 * This is critical — without resampling, a 48kHz recording pushed as 16kHz
 * plays back 3x too fast and Azure recognises garbage.
 */
async function resampleTo16kMono(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
    // If already at the target rate and mono, return as-is
    if (
        audioBuffer.sampleRate === TARGET_SAMPLE_RATE &&
        audioBuffer.numberOfChannels === TARGET_CHANNELS
    ) {
        return audioBuffer;
    }

    const duration = audioBuffer.duration;
    const targetLength = Math.round(duration * TARGET_SAMPLE_RATE);

    // OfflineAudioContext renders at the exact sample rate we need
    const offlineCtx = new OfflineAudioContext(
        TARGET_CHANNELS,
        targetLength,
        TARGET_SAMPLE_RATE
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    return await offlineCtx.startRendering();
}

/**
 * Convert AudioBuffer to WAV Blob (PCM 16-bit)
 */
function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    // Total data byte length (samples × channels × bytesPerSample)
    const length = audioBuffer.length * numberOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * bitDepth / 8, true);
    view.setUint16(32, numberOfChannels * bitDepth / 8, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);
    
    // Write audio data
    const offset = 44;
    const channels: Float32Array[] = [];
    for (let i = 0; i < numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }
    
    let pos = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, channels[channel][i]));
            view.setInt16(offset + pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            pos += 2;
        }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Write a string to a DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Record audio with proper settings for speech recognition
 */
export async function getOptimalAudioStream(): Promise<MediaStream> {
    return await navigator.mediaDevices.getUserMedia({
        audio: {
            channelCount: 1, // Mono
            sampleRate: 16000, // Azure Speech optimal sample rate
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        }
    });
}
