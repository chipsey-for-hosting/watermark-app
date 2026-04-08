import { useRef, useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [watermarkImg, setWatermarkImg] = useState(null);

  useEffect(() => {
    const wm = new Image();
    wm.src = "/watermark.png";
    wm.onload = () => setWatermarkImg(wm);
  }, []);

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

  const draw = (img, wm) => {
    if (!img || !wm) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const wmWidth = Math.min(img.width, img.height) * 0.25;
    const scale = wmWidth / wm.width;
    const wmHeight = wm.height * scale;

    const padding = 20;

    const x = canvas.width - wmWidth - padding;
    const y = canvas.height - wmHeight - padding;

    ctx.globalAlpha = 0.7;
    ctx.drawImage(wm, x, y, wmWidth, wmHeight);
    ctx.globalAlpha = 1;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");

    link.download = "dfn-aurudu-2026.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    if (image && watermarkImg) {
      draw(image, watermarkImg);
    }
  }, [watermarkImg]);

  return (
    <div className="app">
      <div className="card">
        <h1>🎉 DFN AURUDU 2026</h1>
        <p className="subtitle">Add your festive watermark instantly</p>

        <label className="upload-box">
          <input type="file" accept="image/*" onChange={handleUpload} />
          <span>📸 Upload Image</span>
        </label>

        <button className="download-btn" onClick={downloadImage}>
          ⬇ Download Image
        </button>

        <div className="canvas-wrapper">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
