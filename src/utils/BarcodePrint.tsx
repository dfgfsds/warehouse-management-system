import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { X, Printer, Download } from "lucide-react";

interface Props {
  open: boolean;
  barcode: any;
  productName?: string;
  onClose: () => void;
}

const BarcodePrintModal: React.FC<Props> = ({
  open,
  barcode,
  productName,
  onClose,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState<'barcode' | 'qrcode'>('barcode');
  const [qrImageUrl, setQrImageUrl] = useState<string>('');

  useEffect(() => {
    if (!open || !barcode) return;

    if (printType === 'barcode' && svgRef.current) {
      try {
        JsBarcode(svgRef.current, barcode, {
          format: "CODE128",
          width: 2,
          height: 70,
          displayValue: true,
        });
      } catch (e) {
        console.error("Barcode generation error", e);
      }
    } else if (printType === 'qrcode' && canvasRef.current) {
      try {
        QRCode.toDataURL(barcode, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        }).then(url => {
          setQrImageUrl(url);
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
              };
              img.src = url;
            }
          }
        });
      } catch (e) {
        console.error("QR Code generation error", e);
      }
    }
  }, [open, barcode, printType]);

  const handlePrint = () => {
    const content = document.getElementById("barcode-print-area");
    if (!content) return;

    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    let printContent = "";
    // Repeat content for number of copies
    for (let i = 0; i < copies; i++) {
      printContent += `
        <div style="page-break-inside: avoid; margin-bottom: 20px; border: 1px dashed #ccc; ;">
           ${content.innerHTML}
        </div>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print ${printType === 'barcode' ? 'Barcode' : 'QR Code'}</title>
          <style>
            body {
              font-family: Arial;
              padding: 20px;
            }
            @media print {
               body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const downloadBarcode = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.outerHTML;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size with extra space for text
      const padding = 40;
      const textHeight = 60;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2 + textHeight;
      
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw barcode image centered
      ctx.drawImage(img, padding, padding);
      
      // // Draw code text below barcode
      // const codeY = img.height + padding + 20;
      // ctx.fillStyle = '#000000';
      // ctx.font = 'bold 14px monospace';
      // ctx.textAlign = 'center';
      // ctx.fillText(barcode, canvas.width / 2, codeY);
      
      // // Draw product name if available
      // if (productName) {
      //   ctx.font = '12px Arial';
      //   ctx.fillText(productName, canvas.width / 2, codeY + 22);
      // }

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `barcode-${barcode}.png`;
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svg);
  };

  const downloadQRCode = () => {
    if (!qrImageUrl) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size with extra space for text
      const padding = 30;
      const textHeight = 60;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2 + textHeight;
      
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code image centered
      ctx.drawImage(img, padding, padding);
      
      // Draw code text below QR
      const codeY = img.height + padding + 20;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(barcode, canvas.width / 2, codeY);
      
      // Draw product name if available
      if (productName) {
        ctx.font = '12px Arial';
        ctx.fillText(productName, canvas.width / 2, codeY + 22);
      }

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qrcode-${barcode}.png`;
      link.click();
    };

    img.src = qrImageUrl;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Printer className="h-5 w-5 text-blue-600" /> Print {printType === 'barcode' ? 'Barcode' : 'QR Code'}
        </h2>

        {/* Print Type Switch */}
        <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPrintType('barcode')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                printType === 'barcode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Barcode
            </button>
            <button
              onClick={() => setPrintType('qrcode')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                printType === 'qrcode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              QR Code
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div
          id="barcode-print-area"
          className="border rounded-lg p-6 text-center bg-gray-50 mb-6"
        >
          {productName && (
            <div className="text-lg font-bold mb-4 text-gray-800">
              {productName}
            </div>
          )}
          
          <div className="flex justify-center bg-white p-4 rounded mb-4">
            {printType === 'barcode' ? (
              <svg ref={svgRef} />
            ) : (
              <canvas ref={canvasRef} width={200} height={200} />
            )}
          </div>

          {/* Display barcode/QR value and product name below */}
          {/* <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Code</p>
              <p className="text-sm font-mono font-bold text-gray-800">{barcode}</p>
            </div>
            {productName && (
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Product</p>
                <p className="text-sm font-semibold text-gray-800">{productName}</p>
              </div>
            )}
          </div> */}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Copies:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={copies}
            onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
            className="border rounded-lg px-3 py-2 w-24 text-center"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={printType === 'barcode' ? downloadBarcode : downloadQRCode}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print {copies} {copies === 1 ? 'Copy' : 'Copies'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrintModal;
