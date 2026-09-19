import React, { useEffect, useRef } from 'react';

interface TransparentCanvasImageProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Renders an image onto an HTML5 Canvas, removing white/near-white/checkerboard
 * background pixels dynamically in real-time, producing a truly transparent PNG-like sprite
 * with smooth alpha edge anti-aliasing.
 */
export const TransparentCanvasImage: React.FC<TransparentCanvasImageProps> = ({
  src,
  alt = 'Transparent Box',
  className = 'w-full h-full object-contain',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Chroma-key removal for white, light-gray and checkerboard background artifacts
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is white or near-white/light gray (typical background in stock/png)
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

          // Neutral background (low saturation) with high brightness
          if (brightness > 215 && maxDiff < 28) {
            // Smooth edge feathering
            if (brightness > 240) {
              data[i + 3] = 0; // Fully transparent
            } else {
              // Linear alpha gradient at the edges for smooth anti-aliasing
              const alphaFactor = (240 - brightness) / 25;
              data[i + 3] = Math.floor(data[i + 3] * Math.max(0, Math.min(1, alphaFactor)));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
      } catch (err) {
        console.warn('Canvas pixel processing fallback', err);
      }
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={alt}
      className={className}
    />
  );
};
