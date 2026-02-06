const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let originalFileName = "image";
let imageLoaded = false;
canvas.width = 400;
canvas.height = 300;
drawPlaceholder();

// MODE
const modeRadios = document.querySelectorAll('input[name="mode"]');
const pixelControls = document.getElementById("pixelControls");
const resizeControls = document.getElementById("resizeControls");
let currentMode = "pixelate";

// PIXEL
const pixelSizeRange = document.getElementById("pixelSizeRange");
const pixelSizeNumber = document.getElementById("pixelSizeNumber");

// RESIZE
const resizeWidth = document.getElementById("resizeWidth");
const resizeHeight = document.getElementById("resizeHeight");
const lockRatio = document.getElementById("lockRatio");
const applyResizeBtn = document.getElementById("applyResize");

// ADJUST
const brightness = document.getElementById("brightness");
const contrast = document.getElementById("contrast");
const saturation = document.getElementById("saturation");
const bVal = document.getElementById("bVal");
const cVal = document.getElementById("cVal");
const sVal = document.getElementById("sVal");

const downloadBtn = document.getElementById("download");

/* =========================
   RESET CANVAS
========================= */
function resetCanvas() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = "none";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = 300;   // default canvas size
  canvas.height = 150;

  img.src = "";
  imageLoaded = false;
  originalFileName = "image";

  downloadBtn.disabled = true;

  drawPlaceholder();
}

/* =========================
   PLACEHOLDER
========================= */
function drawPlaceholder() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background lembut
  ctx.fillStyle = "#f5f7fb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border dashed
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = "#cbd3e3";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.setLineDash([]);

  // Text
  ctx.fillStyle = "#6b7280";
  ctx.font = "12px 'Press Start 2P', cursive";
  ctx.textAlign = "center";

  ctx.fillText(
    "UPLOAD IMAGE",
    canvas.width / 2,
    canvas.height / 2 - 10
  );

  ctx.font = "9px 'Press Start 2P', cursive";
  ctx.fillText(
    "to start editing",
    canvas.width / 2,
    canvas.height / 2 + 12
  );
}

/* =========================
   INITIAL STATE
========================= */
downloadBtn.disabled = true;

let img = new Image();
let aspectRatio = 1;

/* =========================
   FILTER
========================= */
function applyFilter() {
  ctx.filter = `
    brightness(${brightness.value}%)
    contrast(${contrast.value}%)
    saturate(${saturation.value}%)
  `;
}

/* =========================
   MODE SWITCH
========================= */
modeRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    currentMode = radio.value;
    pixelControls.style.display = currentMode === "pixelate" ? "block" : "none";
    resizeControls.style.display = currentMode === "resize" ? "block" : "none";
    redraw();
  });
});

/* =========================
   UPLOAD
========================= */
upload.addEventListener("change", e => {
  const file = e.target.files && e.target.files[0];

  // 🚫 USER CANCEL UPLOAD
  if (!file) {
    resetCanvas();
    return;
  }

  // ✅ FILE VALID
  originalFileName = file.name.replace(/\.[^/.]+$/, "");

  const reader = new FileReader();
  reader.onload = () => {
    img = new Image();
    img.onload = () => {
      imageLoaded = true;

      aspectRatio = img.width / img.height;
      canvas.width = img.width;
      canvas.height = img.height;
      resizeWidth.value = img.width;
      resizeHeight.value = img.height;

      downloadBtn.disabled = false;
      redraw();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

/* =========================
   REDRAW
========================= */
function redraw() {
  if (!img.src) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  applyFilter();

  currentMode === "pixelate" ? pixelate() : drawNormal();
}

/* =========================
   PIXELATE
========================= */
function pixelate() {
  const size = parseInt(pixelSizeRange.value);

  // scale down
  const w = Math.ceil(canvas.width / size);
  const h = Math.ceil(canvas.height / size);

  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext("2d");

  tctx.imageSmoothingEnabled = true;
  tctx.filter = ctx.filter;
  tctx.drawImage(img, 0, 0, w, h);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(temp, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
}

/* =========================
   NORMAL DRAW
========================= */
function drawNormal() {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

/* =========================
   PIXEL SIZE SYNC
========================= */
pixelSizeRange.addEventListener("input", () => {
  pixelSizeNumber.value = pixelSizeRange.value;
  if (currentMode === "pixelate") debouncedRedraw();
});

pixelSizeNumber.addEventListener("input", () => {
  let v = Math.max(2, Math.min(50, pixelSizeNumber.value));
  pixelSizeNumber.value = v;
  pixelSizeRange.value = v;
  if (currentMode === "pixelate") debouncedRedraw();
});

/* =========================
   RESIZE
========================= */
resizeWidth.addEventListener("input", () => {
  if (lockRatio.checked)
    resizeHeight.value = Math.round(resizeWidth.value / aspectRatio);
});

resizeHeight.addEventListener("input", () => {
  if (lockRatio.checked)
    resizeWidth.value = Math.round(resizeHeight.value * aspectRatio);
});

applyResizeBtn.addEventListener("click", () => {
  const w = +resizeWidth.value;
  const h = +resizeHeight.value;
  if (!w || !h) return;

  canvas.width = w;
  canvas.height = h;
  applyFilter();
  ctx.drawImage(img, 0, 0, w, h);

  const newImg = new Image();
  newImg.src = canvas.toDataURL();
  newImg.onload = () => {
    img = newImg;
    aspectRatio = img.width / img.height;
    redraw();
  };
});

/* =========================
   ADJUST LISTENERS
========================= */
[brightness, contrast, saturation].forEach(slider => {
  slider.addEventListener("input", () => {
    bVal.textContent = brightness.value + "%";
    cVal.textContent = contrast.value + "%";
    sVal.textContent = saturation.value + "%";
    debouncedRedraw();
  });
});

/* =========================
   DOWNLOAD
========================= */
downloadBtn.addEventListener("click", () => {
  if (!imageLoaded) {
    alert("Silakan upload gambar terlebih dahulu.");
    return;
  }

  const link = document.createElement("a");
  link.download = `${originalFileName}_pixe.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

/* =========================
   DEBOUNCE
========================= */
function debounce(fn, delay = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

const debouncedRedraw = debounce(redraw, 150);

/* =========================
   SERVICE WORKER
========================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.error("SW failed", err));
  });
}