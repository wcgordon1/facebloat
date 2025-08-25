/**
 * Canvas to Blob utility - converts canvas to Blob for safe URL ownership
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement, 
  type = "image/png", 
  quality?: number
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("toBlob returned null")), 
      type, 
      quality
    );
  });
}
