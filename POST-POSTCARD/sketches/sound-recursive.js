// Put the font file here:  your-project/fonts/RecursiveVF.ttf
// This uses the variable axes by setting the canvas font string directly.

let mic;
let ampSmoothed = 0;

const FONT_FAMILY = "RecursiveVF";
const FONT_URL = "fonts/RecursiveVF.ttf"; // relative to index.html

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  // Load the variable font via the FontFace API (more reliable for axes than loadFont()).
  const ff = new FontFace(FONT_FAMILY, `url(${FONT_URL})`);
  ff.load()
    .then((loaded) => {
      document.fonts.add(loaded);
    })
    .catch((err) => {
      console.error("Font failed to load:", err);
    });

  // Mic
  mic = new p5.AudioIn();
  mic.start(() => {
    // Some browsers need a user gesture; click/tap to start audio if needed.
  });

  textAlign(CENTER, CENTER);
  noStroke();
}

function draw() {
  background(0);

  // Mic amplitude (0..~0.2 typical)
  let level = mic ? mic.getLevel() : 0;

  // Smooth it so it feels less jittery
  ampSmoothed = lerp(ampSmoothed, level, 0.15);

  // Map sound -> axes
  // Recursive wght commonly supports ~300..1000 (depends on build).
  let wght = map(ampSmoothed, 0, 0.15, 300, 1000, true);

  // slnt axis is typically negative (e.g. 0 to -15). Canvas "oblique" expects a positive/negative angle.
  // We’ll map sound to a subtle left slant.
  let slntDeg = map(ampSmoothed, 0, 0.15, 0, -15, true);

  // Size can also breathe a bit with sound (optional)
  let fontSize = map(ampSmoothed, 0, 0.15, 56, 110, true);

  // Important: bypass p5's textFont/textSize and draw via the raw canvas context
  const ctx = drawingContext;

  // CSS font syntax: oblique <angle>deg <weight> <size>px "<family>"
  // This is what makes variable wght/slant react in browsers that support it.
  ctx.font = `oblique ${slntDeg}deg ${wght} ${fontSize}px "${FONT_FAMILY}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";

  const msg = "MERRY CHRISTMAS!";
  ctx.fillText(msg, width / 2, height / 2);

  // Debug readout (optional)
  ctx.font = `400 14px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(`level: ${ampSmoothed.toFixed(4)}   wght: ${Math.round(wght)}   slnt: ${slntDeg.toFixed(1)}°`, width / 2, height - 30);
}