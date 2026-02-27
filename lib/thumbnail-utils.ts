/**
 * Utility functions for generating and managing project thumbnails
 */

/**
 * Generate a base64 thumbnail from a canvas element
 */
export function captureCanvasThumbnail(canvas: HTMLCanvasElement | null): string | null {
  if (!canvas) return null;
  try {
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error('Failed to capture thumbnail:', error);
    return null;
  }
}

/**
 * Compress and optimize a base64 image string
 */
export function compressBase64Image(base64: string, quality: number = 0.7): string {
  return base64; // In production, you might use a library like compressorjs
}

/**
 * Generate a placeholder thumbnail (gradient SVG)
 */
export function generatePlaceholderThumbnail(rooms: number = 1, windows: number = 1): string {
  const colors = ['#9333ea', '#3b82f6', '#06b6d4'];
  const bgColor = colors[Math.floor(Math.random() * colors.length)];
  
  const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#grad)"/>
    <text x="200" y="150" font-size="24" fill="white" text-anchor="middle" font-weight="bold">
      ${rooms} Room${rooms > 1 ? 's' : ''}
    </text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
