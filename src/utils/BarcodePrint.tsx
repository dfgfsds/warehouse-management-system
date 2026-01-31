import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  barcode: string;
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

  useEffect(() => {
    if (open && svgRef.current && barcode) {
      JsBarcode(svgRef.current, barcode, {
        format: "CODE128",
        width: 2,
        height: 70,
        displayValue: true,
      });
    }
  }, [open, barcode]);

  const handlePrint = () => {
    const content = document.getElementById("barcode-print-area");
    if (!content) return;

    const printWindow = window.open("", "", "width=600,height=400");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: Arial;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          Barcode Preview
        </h2>

        <div
          id="barcode-print-area"
          className="border rounded p-4 text-center"
        >
          {productName && (
            <div className="text-sm font-medium mb-2">
              {productName}
            </div>
          )}
          <div className="flex justify-center">
          <svg ref={svgRef} />
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrintModal;
