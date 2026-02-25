// Utility functions for audio processing

/**
 * Convert audio blob to WAV format using Web Audio API
 * This ensures the audio is in the correct format for Azure Speech Service
 */
export async function convertToWav(audioBlob: Blob): Promise<Blob> {
    try {
        // Create an audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Read the blob as an array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Convert to WAV format
        const wavBlob = audioBufferToWav(audioBuffer);
        
        // Close the audio context
        audioContext.close();
        
        return wavBlob;
    } catch (error) {
        console.error('Error converting audio to WAV:', error);
        throw error;
    }
}

/**
 * Convert AudioBuffer to WAV Blob
 */
function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    // Interleave channels
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
