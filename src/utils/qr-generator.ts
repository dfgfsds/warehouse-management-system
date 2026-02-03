export class QRGenerator {
  static generateQRCode(type: 'asset' | 'tray' | 'section', id?: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    switch (type) {
      case 'asset':
        return `AST-${timestamp}-${randomSuffix}`;
      case 'tray':
        return `TRY-${timestamp}-${randomSuffix}`;
      case 'section':
        return `SEC-${timestamp}-${randomSuffix}`;
      default:
        return `QR-${timestamp}-${randomSuffix}`;
    }
  }

  static generateAssetId(): string {
    return 'asset-' + Math.random().toString(36).substr(2, 9);
  }

  static generateEventId(): string {
    return 'event-' + Math.random().toString(36).substr(2, 9);
  }
}