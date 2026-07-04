export class ScreenshotFeature {
  async capture(): Promise<Blob | null> {
    const canvases = document.querySelectorAll('canvas');
    const renderCanvas = canvases[0];

    if (!renderCanvas) return null;

    return new Promise((resolve) => {
      renderCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  }

  async download(): Promise<void> {
    const blob = await this.capture();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stellaris-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async copyToClipboard(): Promise<void> {
    const blob = await this.capture();
    if (!blob) return;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
    } catch {
      console.warn('Failed to copy screenshot to clipboard');
    }
  }
}
