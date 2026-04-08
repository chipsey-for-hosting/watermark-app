import { useRef, useState, useEffect } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [watermarkImg, setWatermarkImg] = useState(null);

  // Load watermark once
  useEffect(() => {
    const wm = new Image();
    wm.src = "/watermark.png"; // place inside public folder
    wm.onload = () => setWatermarkImg(wm);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
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

    // Draw main image
    ctx.drawImage(img, 0, 0);

    // Scale watermark (20% of image width)
    const wmWidth = img.width * 0.2;
    const scale = wmWidth / wm.width;
    const wmHeight = wm.height * scale;

    const padding = 20;

    // Position bottom-right
    const x = canvas.width - wmWidth - padding;
    const y = canvas.height - wmHeight - padding;

    // Optional: control transparency
    ctx.globalAlpha = 0.6;

    ctx.drawImage(wm, x, y, wmWidth, wmHeight);

    ctx.globalAlpha = 1;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");

    link.download = "watermarked.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Redraw if watermark loads after image
  useEffect(() => {
    if (image && watermarkImg) {
      draw(image, watermarkImg);
    }
  }, [watermarkImg]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>PNG Watermark Tool</h2>

      <input type="file" accept="image/*" onChange={handleUpload} />

      <br />
      <br />

      <button onClick={downloadImage}>Download Image</button>

      <br />
      <br />

      <canvas
        ref={canvasRef}
        style={{ maxWidth: "100%", border: "1px solid #ccc" }}
      />
    </div>
  );
}
