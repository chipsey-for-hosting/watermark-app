import { useRef, useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [watermarkImg, setWatermarkImg] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  // Load watermark
  useEffect(() => {
    const wm = new Image();
    wm.src = "/watermark.png";
    wm.onload = () => setWatermarkImg(wm);
  }, []);

  // Handle image upload
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setImage(img);
      draw(img, watermarkImg);
    };

    img.src = URL.createObjectURL(file);
  };

  // Draw image + watermark
  const draw = (img, wm) => {
    if (!img || !wm) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const wmWidth = Math.min(img.width, img.height) * 0.2;
    const scale = wmWidth / wm.width;
    const wmHeight = wm.height * scale;

    const padding = 20;

    // const x = canvas.width - wmWidth - padding;
    const x = canvas.width / 2 - wmWidth / 2;
    const y = canvas.height - wmHeight - padding;

    ctx.globalAlpha = 0.9;
    ctx.drawImage(wm, x, y, wmWidth, wmHeight);
    ctx.globalAlpha = 1;
  };

  // Download only
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");

    link.download = "dfn-aurudu-2026.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", "dfn_aurudu_upload");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/djd170bwz/image/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      throw new Error("Upload failed");
    }

    return data.secure_url;
  };

  const shareOnWhatsApp = () => {
    if (!uploadedUrl) return;

    const message = `🌞 *DFN අවුරුදු 2026*

    සුභ අලුත් අවුරුද්දක් වේවා! 🌸
    ඔබට සහ ඔබගේ පවුලට සතුට, සෞභාග්‍යය හා සාර්ථකත්වයෙන් පිරි වසරක් වේවා!

    🔗 ${uploadedUrl}`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  // Upload only
  const uploadImage = () => {
    const canvas = canvasRef.current;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      setUploading(true);
      setUploadedUrl("");

      try {
        const url = await uploadToCloudinary(blob);
        setUploadedUrl(url);
      } catch (err) {
        alert("Upload failed. Check console.");
      } finally {
        setUploading(false);
      }
    });
  };

  const showToast = (message) => {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.innerText = message;
    toast.className = "toast";

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
  };

  // Redraw when watermark loads
  useEffect(() => {
    if (image && watermarkImg) {
      draw(image, watermarkImg);
    }
  }, [watermarkImg]);

  return (
    <div className="app">
      <div className="card">
        <div className="header">
          <img src="/watermark.png" alt="DFN Aurudu 2026" className="logo" />
          <p className="subtitle">Add your festive watermark instantly</p>
        </div>
        {/* Upload */}
        <label className="upload-box">
          <input type="file" accept="image/*" onChange={handleUpload} />
          <span>📸 Upload Image</span>
        </label>
        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button
            className="download-btn"
            onClick={downloadImage}
            disabled={!image}
          >
            Download
          </button>

          <button
            className="download-btn"
            onClick={uploadImage}
            disabled={!image || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {/* Uploaded URL */}
        {uploadedUrl && (
          <div className="share-section">
            <p className="success-text">✅ Uploaded Successfully</p>

            <input value={uploadedUrl} readOnly className="url-input" />

            <div className="action-buttons">
              <button
                className="big-btn copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(uploadedUrl);
                  showToast("Link Copied!");
                }}
              >
                Copy Link
              </button>

              <button
                className="big-btn whatsapp-btn"
                onClick={shareOnWhatsApp}
              >
                Share on WhatsApp
              </button>
            </div>
          </div>
        )}
        {/* Canvas */}
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
