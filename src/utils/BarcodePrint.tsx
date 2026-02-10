import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { X, Printer, Download } from "lucide-react";

interface Props {
  open: boolean;
  barcode: string;
  productName?: string;
  trayName?: string;
  onClose: () => void;
}

const BarcodePrintModal: React.FC<Props> = ({
  open,
  barcode,
  productName,
  trayName,
  onClose,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState<"barcode" | "qrcode">("barcode");
  const [qrImageUrl, setQrImageUrl] = useState("");

  /* ================= GENERATE BARCODE / QR ================= */
  useEffect(() => {
    if (!open || !barcode) return;

    if (printType === "barcode" && svgRef.current) {
      JsBarcode(svgRef.current, barcode, {
        format: "CODE128",
        width: 2,
        height: 70,
        displayValue: true,
      });
    }

    if (printType === "qrcode") {
      QRCode.toDataURL(barcode, { width: 200, margin: 2 }).then((url) => {
        setQrImageUrl(url);
      });
    }
  }, [open, barcode, printType]);

  /* ================= PRINT ================= */
  const handlePrint = () => {
    const content = document.getElementById("barcode-print-area");
    if (!content) return;

    const printWindow = window.open("", "", "width=1000,height=800");
    if (!printWindow) return;

    let html = "";
    for (let i = 0; i < copies; i++) {
      html += `
        <div style="
          page-break-inside: avoid;
          border: 1px dashed #ccc;
          padding: 12px;
          margin-bottom: 20px;
          text-align: center;
          font-family: Arial;
        ">
          ${content.innerHTML}
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
        </head>
        <body>${html}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  /* ================= DOWNLOAD BARCODE ================= */
  const downloadBarcode = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current.outerHTML;
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const padding = 30;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2 + 60;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, padding, padding);

      let y = img.height + padding + 20;
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";

      ctx.font = "bold 14px monospace";
      ctx.fillText(barcode, canvas.width / 2, y);

      if (productName) {
        y += 18;
        ctx.font = "12px Arial";
        ctx.fillText(productName, canvas.width / 2, y);
      }

      if (trayName) {
        y += 18;
        ctx.font = "12px Arial";
        ctx.fillText(`Tray: ${trayName}`, canvas.width / 2, y);
      }

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `barcode-${barcode}.png`;
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svg);
  };

  /* ================= DOWNLOAD QR ================= */
  const downloadQRCode = () => {
    if (!qrImageUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const padding = 30;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2 + 60;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, padding, padding);

      let y = img.height + padding + 20;
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";

      ctx.font = "bold 14px monospace";
      ctx.fillText(barcode, canvas.width / 2, y);

      if (productName) {
        y += 18;
        ctx.font = "12px Arial";
        ctx.fillText(productName, canvas.width / 2, y);
      }

      if (trayName) {
        y += 18;
        ctx.font = "12px Arial";
        ctx.fillText(`Tray: ${trayName}`, canvas.width / 2, y);
      }

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `qrcode-${barcode}.png`;
      link.click();
    };

    img.src = qrImageUrl;
  };

  if (!open) return null;

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
        >
          <X />
        </button>

        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Printer className="h-5 w-5 text-blue-600" />
          Print {printType === "barcode" ? "Barcode" : "QR Code"}
        </h2>

        {/* TYPE SWITCH */}
        <div className="flex gap-2 mb-4">
          {["barcode", "qrcode"].map((t) => (
            <button
              key={t}
              onClick={() => setPrintType(t as any)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${printType === t
                  ? "bg-blue-600 text-white"
                  : "border hover:bg-gray-50"
                }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* PREVIEW */}
        <div
          id="barcode-print-area"
          className="border rounded-lg p-4 text-center bg-gray-50 mb-4"
        >
          {productName && (
            <div className="text-sm font-semibold">{productName}</div>
          )}
          {trayName && (
            <div className="text-xs text-gray-600 mb-2">
              Tray: {trayName}
            </div>
          )}

          <div className="flex justify-center bg-white p-3 rounded">
            {printType === "barcode" ? (
              <svg ref={svgRef} />
            ) : (
              <img src={qrImageUrl} alt="QR" className="h-40 w-40" />
            )}
          </div>
        </div>

        {/* COPIES */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium">Copies</span>
          <input
            type="number"
            min={1}
            value={copies}
            onChange={(e) => setCopies(Math.max(1, +e.target.value))}
            className="w-20 border rounded px-2 py-1 text-center"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={printType === "barcode" ? downloadBarcode : downloadQRCode}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg"
          >
            <Download size={16} /> Download
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrintModal;
