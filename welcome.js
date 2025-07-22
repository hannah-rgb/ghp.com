let trackedMouseX = 0;

let labelsTop = [
  { name: "                G", col: 3, align: "left", yOffset: -10 },
  { name: "HANNAH", col: 3, align: "right", yOffset: -10 },
  { name: "PARK ", col: 4, align: "center", yOffset: -10 }
];

let labelsBottom = [
  { name: "                DESIGN", col: 3, align: "left", yOffset: 7 },
  { name: "ARCHIVE           ", col: 4, align: "right", yOffset: 7 }
];

let clickedLabels = [
  { name: "G", col: 0, align: "left", yOffset: () => -height / 2 + 20, x: 0, y: 0 },
  { name: "INDEX", col: 1, align: "left", yOffset: () => -height / 2 + 40, x: 0, y: 0 },
  { name: "HANNAH", col: 2, align: "left", yOffset: () => -height / 2 + 20, x: 0, y: 0 },
  { name: "PARK", col: 4, align: "left", yOffset: () => -height / 2 + 20, x: 0, y: 0 },
  { name: "ABOUT", col: 7, align: "left", yOffset: () => -height / 2 + 40, x: 0, y: 0 },
  { name: "Coming soon...", col: null, align: "center", yOffset: () => -height / 2 + 30, x: 0, y: 0, isCenter: true }
];

let font;
let fontSize = 16;
let clicked = false;
let phase = 1;
let centerY, centerX;
let animatedLineY;

function preload() {
  font = loadFont("fonts/commercial.otf");
}

function setup() {
  clicked = false;
  phase = 1;
  document.getElementById("welcomeSection").style.display = "block";
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("welcomeSection");
  textFont(font);
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  centerY = height / 2;
  centerX = width / 2;
  animatedLineY = centerY;
  for (let label of clickedLabels) {
    label.x = centerX;
    label.y = centerY;
  }
  cnv.elt.setAttribute('tabindex', '0');
  cnv.elt.focus(); // ensures canvas gets focus once

}

function draw() {
  console.log("trackedMouseX:", trackedMouseX);
  clear();
  centerX = width / 2;
  centerY = height / 2;
  let gapFactor = 1 + abs(mouseX - centerX) / centerX * 3;

  let columnCount = 8;
  let cssGapVW = 0.6;
  let cssGap = (cssGapVW / 100) * windowWidth;
  let totalGapWidth = (columnCount - 1) * cssGap;
  let padding = (cssGapVW / 100) * windowWidth;
  let columnWidth = (windowWidth - totalGapWidth - padding * 2) / columnCount;

  let targetLineY = clicked ? height / 2 - height / 2 + 32 : centerY;
  animatedLineY = lerp(animatedLineY, targetLineY, 0.1);

  stroke(255, 0, 0);
  line(0, animatedLineY, width, animatedLineY);
  line(trackedMouseX, 0, trackedMouseX, 10000);

  fill(0);
  noStroke();

  if (!clicked) {
    for (let label of labelsTop) {
      let x = getAlignedGridX(label.col, columnWidth, cssGap, columnCount, gapFactor, label.align);
      textAlign(getTextAlign(label.align), CENTER);
      text(label.name, x, centerY + label.yOffset);
    }
    for (let label of labelsBottom) {
      let x = getAlignedGridX(label.col, columnWidth, cssGap, columnCount, gapFactor, label.align);
      textAlign(getTextAlign(label.align), CENTER);
      text(label.name, x, centerY + label.yOffset);
    }
    fill(255, 0, 0);
    textAlign(CENTER);
    text("Coming soon...", mouseX, centerY - 3.5);
  } 
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getTextAlign(mode) {
  if (mode === "left") return LEFT;
  if (mode === "right") return RIGHT;
  return CENTER;
}

function getAlignedGridX(colIndex, columnWidth, gapWidth, columnCount, factor = 1, align = "center") {
  let totalWidth = columnWidth * columnCount * factor + gapWidth * (columnCount - 1) * factor;
  let padding = (0.6 / 100) * windowWidth;
  let gridStartX = padding + (width - totalWidth - 2 * padding) / 2;
  let colLeft = gridStartX + colIndex * (columnWidth + gapWidth) * factor;

  if (align === "left") return colLeft;
  if (align === "right") return colLeft + columnWidth * factor;
  return colLeft + (columnWidth * factor) / 2;
}
setTimeout(() => {
  document.querySelector('.thumbnail-row')?.scrollIntoView({ behavior: 'auto', block: 'center' });
}, 100);

document.querySelectorAll('.thumb-wrapper').forEach(wrapper => {
  const img = wrapper.querySelector('img');
  const baseName = wrapper.dataset.id;

  wrapper.addEventListener('mouseenter', () => {
    img.src = `assets/${baseName}.gif`;
  });

  wrapper.addEventListener('mouseleave', () => {
    img.src = `assets/${baseName}.png`;
  });
});

window.addEventListener('mousemove', (e) => {
  trackedMouseX = e.clientX;
});
window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    trackedMouseX = e.touches[0].clientX;
  }
});
