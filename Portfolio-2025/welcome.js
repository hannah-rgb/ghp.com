const params = new URLSearchParams(window.location.search);
const skipWelcome = params.get("skipWelcome") === "true";

if (skipWelcome) {
  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("homeContent").style.display = "block";
    decorateThumbs();
setupNavInteractions();
    document.getElementById("welcomeSection").style.display = "none";

    // Remove canvas if it exists
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach((c) => c.remove());

  });
} else {
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
    { name: "2025", col: null, align: "center", yOffset: () => -height / 2 + 30, x: 0, y: 0, isCenter: true }
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
    document.getElementById("homeContent").style.display = "none";
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
  }

  function draw() {
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
    line(mouseX, 0, mouseX, height);

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
      text("2025", mouseX, centerY - 2);
    } else {
      let allAtTarget = true;
      for (let label of clickedLabels) {
        let targetX = label.isCenter ? width / 2 : getAlignedGridX(label.col, columnWidth, cssGap, columnCount, 1, label.align);
        let targetY = centerY + label.yOffset();

        if (phase === 1) {
          label.x = lerp(label.x, targetX, 0.1);
          if (abs(label.x - targetX) > 0.5) allAtTarget = false;
        } else if (phase === 2) {
          label.y = lerp(label.y, targetY, 0.1);
          if (abs(label.y - targetY) > 0.5) allAtTarget = false;
        }

        textAlign(getTextAlign(label.align), CENTER);
        fill(label.name === "2025" ? color(255, 0, 0) : 0);
        text(label.name, label.x, label.y);
      }

      if (allAtTarget && phase === 1) {
        phase = 2;
      } else if (allAtTarget && phase === 2) {
        document.getElementById("homeContent").style.display = "block";
        decorateThumbs();
        setupNavInteractions();
        document.getElementById("welcomeSection").style.display = "none";
        noLoop();
        remove();
      }
    }
  }

  function mousePressed() {
    if (!clicked) {
      clicked = true;
      phase = 1;
    }
  }

  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }
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

// ---- THUMB INTERACTIONS ----


const SKIP_IDS = new Set(['snake', 'arc', '2025', 'shakeshack', 'Tmax', 'select']); // add more here

document.querySelectorAll('.thumb-wrapper').forEach(wrapper => {
  const img = wrapper.querySelector('img');
  const baseName = wrapper.dataset.id;

  // Hover swap stays
  wrapper.addEventListener('mouseenter', () => {
    img.src = `thumbs/${baseName}.gif`;
  });
  wrapper.addEventListener('mouseleave', () => {
    img.src = `thumbs/${baseName}.png`;
  });

  // Block navigation for skipped IDs (capture phase beats delegated handlers)
  if (SKIP_IDS.has(baseName)) {
    wrapper.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
  }

  // Normal navigation for the rest
wrapper.addEventListener('click', () => {
  if (SKIP_IDS.has(baseName)) return;
  window.location.href = `${baseName}/`;   // folder with index.html inside
});

});

document.addEventListener('mousemove', (e) => {
  const line = document.getElementById('mouseLine');
  const homeVisible = document.getElementById('homeContent').style.display === 'block';

  if (homeVisible) {
    line.style.display = 'block';
    line.style.left = `${e.clientX}px`;
  } else {
    line.style.display = 'none';
  }
});

// ---- NAV INTERACTION ----

function setupNavInteractions() {
  const indexElement = document.getElementById('nav-index');
  const navHannah = document.getElementById('nav-hannah');
  const navPark = document.getElementById('nav-park');
  const navAbout = document.getElementById('nav-about');
  const contact = document.querySelector('.contact');
  const aboutH = document.querySelector('.AboutH');

  // INDEX dropdown toggle
  indexElement?.addEventListener('click', (event) => {
    event.stopPropagation();
    indexElement.classList.toggle('clicked');
  });

  // HANNAH click interaction
  navHannah?.addEventListener('click', (event) => {
    event.stopPropagation();
    navHannah.classList.toggle('clicked');
    navPark.classList.remove('clicked');
    navAbout.classList.remove('clicked');
    indexElement.classList.remove('clicked');

    aboutH.style.display = navHannah.classList.contains('clicked') ? 'block' : 'none';
    contact.style.display = 'none';
  });

  // PARK click interaction
  navPark?.addEventListener('click', (event) => {
    event.stopPropagation();
    navPark.classList.toggle('clicked');
    navHannah.classList.remove('clicked');
    navAbout.classList.remove('clicked');
    indexElement.classList.remove('clicked');

    aboutH.style.display = navPark.classList.contains('clicked') ? 'block' : 'none';
    contact.style.display = 'none';
  });

  // ABOUT click interaction
  navAbout?.addEventListener('click', (event) => {
    event.stopPropagation();
    navAbout.classList.toggle('clicked');
    navHannah.classList.remove('clicked');
    navPark.classList.remove('clicked');
    indexElement.classList.remove('clicked');

    contact.style.display = navAbout.classList.contains('clicked') ? 'block' : 'none';
    aboutH.style.display = 'none';
  });

  // Close all on outside click
  document.addEventListener('click', (event) => {
    if (!indexElement.contains(event.target)) indexElement.classList.remove('clicked');
    if (!navHannah.contains(event.target)) navHannah.classList.remove('clicked');
    if (!navPark.contains(event.target)) navPark.classList.remove('clicked');
    if (!navAbout.contains(event.target)) navAbout.classList.remove('clicked');

    if (!navHannah.contains(event.target) && !navPark.contains(event.target)) {
      aboutH.style.display = 'none';
    }

    if (!navAbout.contains(event.target) && !contact.contains(event.target)) {
      contact.style.display = 'none';
    }
  });
}

function decorateThumbs() {
  document.querySelectorAll('.thumb-wrapper').forEach((wrapper, i) => {
    if (!wrapper.querySelector('.thumb-number')) {
      const label = document.createElement('div');
      label.classList.add('thumb-number');
      label.textContent = `(${i + 1})`;
      wrapper.appendChild(label);
    }

    if (!wrapper.querySelector('.thumb-meta')) {
      const meta = document.createElement('div');
      meta.classList.add('thumb-meta');
      const title = wrapper.dataset.title || `TITLE ${i + 1}`;
      const category = wrapper.dataset.category || "CATEGORY";
      const year = wrapper.dataset.year || "2025";
      meta.innerHTML = `${title}<br><span class="meta-category">${category}</span><br><span class="meta-year">${year}</span>`;
      wrapper.appendChild(meta);
    }

    wrapper.addEventListener('mouseenter', () => {
      wrapper.classList.add('hovered');
      document.body.classList.add('hide-cursor');
    });
    wrapper.addEventListener('mouseleave', () => {
      wrapper.classList.remove('hovered');
      document.body.classList.remove('hide-cursor');
    });
  });
}
// ----- Dynamic center label by column (only over thumbnail rows) -----
const centerLabel = document.getElementById('nav-2025');
const labelsByCol = [
  'POSTERS',           // 1st col
  'BX DESIGN',  // 2nd
  'PUBLICATION',  // 3rd
  'TYPE DESIGN / LETTERING',       // 4th
  'DESIGN RESEARCH',   // 5th
  'CREATIVE CODING',   // 6th
  'MOTION GRAPHICS',   // 7th
  'GOODS'      // 8th
];

// calculates which column mouse is in
function getActiveColumn(x, ww) {
  const cols = 8;
  const gapVW = 0.6;
  const gap = (gapVW / 100) * ww;
  const padding = (gapVW / 100) * ww;
  const totalGap = (cols - 1) * gap;
  const colW = (ww - totalGap - padding * 2) / cols;

  const gridStart = padding;
  const rel = x - gridStart;
  if (rel < 0) return 0;
  const track = colW + gap;
  let idx = Math.floor(rel / track);
  const posInTrack = rel - idx * track;
  if (posInTrack > colW) {
    idx = posInTrack - colW < gap / 2 ? idx : idx + 1;
  }
  return Math.max(0, Math.min(cols - 1, idx));
}

document.addEventListener('mousemove', (e) => {
  const homeVisible = document.getElementById('homeContent').style.display === 'block';
  if (!homeVisible || !centerLabel) return;

  // find if mouse is over a thumbnail row
  const rows = document.querySelectorAll('.thumbnail-row');
  let overRow = false;
  rows.forEach(row => {
    const rect = row.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      overRow = true;
    }
  });

  if (overRow) {
    const col = getActiveColumn(e.clientX, window.innerWidth);
    centerLabel.textContent = labelsByCol[col];
  } else {
    centerLabel.textContent = '2025';
  }
});
