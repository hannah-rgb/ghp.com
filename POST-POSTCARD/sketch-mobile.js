let cols = 6;
let gap = 7; // gap between columns

let cardAngleX = 0;
let cardAngleY = 0;
let cardTargetX = 0;
let cardTargetY = 0;
let cardStartTime = 0;
let cardDuration = 1200; // ms animation
let flippingCard = false;

let cardGraphics; // WEBGL buffer

let headerLeft  = "POST-POSTCARD WORKSHOP";
let headerRight = "G. HANNAH P";

let footerLeft  = "HGK BASEL 13.12.2025";
let footerRight = "09:00–13:00";

let btn;

// Text blocks
let allTexts = [
  "01",
  "INTRODUCTION\n02",
  "\nDESIGNING SYSTEM\n03",
  "\n\nPRACTICE BY MAKING VARIATIONS FROM TEMPLATES\n04",
  "\n\n\n\nHOLIDAY POSTCARD MAKING IDEATION & RESEARCH\n05",
  "\n\n\n\n\n\nPRACTICE BASED WORKSHOP & PUBLISHING"
];

// For each text: where it starts and how many columns it spans
// columns are 0-based (0..5)
let textSpans = [
  { startCol: 0, span: 1 }, // 1st text -> 1st column
  { startCol: 1, span: 2 }, // 2nd text -> 2nd and 3rd columns
  { startCol: 2, span: 2 }, // 3rd text -> 2nd column
  { startCol: 3, span: 2 }, // 4th text -> 3rd and 4th columns
  { startCol: 4, span: 2 }, // 5th text -> 3rd column
  { startCol: 5, span: 1 } // 6th text -> 4th and 5th columns
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  cardGraphics = createGraphics(400, 400, WEBGL);
cardGraphics.rectMode(CENTER);

  textFont("Helvetica");

  if (typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function") {

    btn = createButton("ENABLE MOTION");

    btn.position(width/2 - 40.5, height/8);
    btn.style("padding", "0px 0px");
    btn.style("background", "transparent");
    btn.style("color", "gray");
    btn.style("border", "0px solid white");
    btn.style("font-size", "10px");
    btn.style("letter-spacing", "0px");

    btn.mousePressed(() => {
      DeviceMotionEvent.requestPermission()
        .then(state => console.log(state))
        .catch(err => console.log(err));
    });
  }
}


function draw() {
  background(0);

  // Phone twist angle (in degrees)
  let angleDeg = isNaN(rotationZ) ? 0 : rotationZ;
  let angleRad = radians(angleDeg);

//   //Show angle for debugging – comment this out later if you want
//   fill(255);
//   textAlign(LEFT, TOP);
//   text("rotationZ: " + angleDeg.toFixed(1), 10, 10);

  // Normalize angle so 0..90 (0=portrait, 90=landscape)
  let a = abs(angleDeg) % 180;
  if (a > 90) a = 180 - a;
  let t = a / 90.0; // 0 portrait -> 1 landscape

  // Flexible column width depending on angle
  let diag = sqrt(width * width + height * height);
  let colPortrait   = width  / cols;
  let colDiagonal   = diag   / cols;
  let colLandscape  = height / cols;

  let colWidth;
  if (t <= 0.5) {
    let tt = t / 0.5;
    colWidth = lerp(colPortrait, colDiagonal, tt);
  } else {
    let tt = (t - 0.5) / 0.5;
    colWidth = lerp(colDiagonal, colLandscape, tt);
  }

  let colInnerWidth = colWidth - gap;
  let totalWidth = (colInnerWidth + gap) * cols;

  // World: rotate with phone
  push();
  translate(width / 2, height / 2);
  rotate(angleRad);   // <– if you want opposite rotation, change this to rotate(-angleRad);
  let startX = -totalWidth / 2;
  let columnHeight = max(width, height) * 2;

  // 1) Draw column backgrounds
  for (let i = 0; i < cols; i++) {
    let x = startX + i * (colInnerWidth + gap);
    fill(0);
    stroke(25);
    rect(x, -columnHeight / 2, colInnerWidth, columnHeight);
  }

  // 2) Draw text blocks with spanning
  let lineHeight = 10;
  textSize(10);
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);

  for (let i = 0; i < allTexts.length; i++) {
    let spanInfo = textSpans[i];
    if (!spanInfo) continue; // safety

    let startCol = spanInfo.startCol;
    let span = spanInfo.span;

    let spanLeft = startX + startCol * (colInnerWidth + gap);
    let spanWidth = span * colInnerWidth + (span - 1) * gap;

    let cx = spanLeft + spanWidth / 2;
    let cy = 0;

    let boxW = spanWidth-5; // no padding

    push();
    translate(cx, cy);

    let lines = getJustifiedLines(allTexts[i], boxW);
let textBlockHeight = lines.length * lineHeight;

let tx = -boxW / 2;
let ty = 0;   // = top aligned starting at center line


    drawJustifiedLines(lines, tx, ty, boxW, lineHeight);

    pop();
  }

    // 3) HEADER + FOOTER inside rotating world
  let minDim = min(width, height);
  let safeHalf = (minDim / 2) / sqrt(2);

  let PAD = 12;  // global padding

  let halfX = lerp(width  / 2 - PAD, safeHalf - PAD, t);
  let halfY = lerp(height / 2 - PAD, safeHalf - PAD, t);

  let topMargin    = lerp(5, 38, t);
  let bottomMargin = lerp(5, 38, t);

  // HEADER LEFT
  push();
  textAlign(LEFT, TOP);
  textSize(10);
  fill(255);
  text(headerLeft.toUpperCase(),
       -halfX + PAD,
       -halfY + topMargin);
  pop();

  // HEADER RIGHT
  push();
  textAlign(RIGHT, TOP);
  textSize(10);
  fill(255);
  text(headerRight.toUpperCase(),
       halfX - PAD,
       -halfY + topMargin);
  pop();

  // FOOTER LEFT
  push();
  textAlign(LEFT, BOTTOM);
  textSize(10);
  fill(255);
  text(footerLeft.toUpperCase(),
       -halfX + PAD,
       halfY - bottomMargin);
  pop();

  // FOOTER RIGHT
  push();
  textAlign(RIGHT, BOTTOM);
  textSize(10);
  fill(255);
  text(footerRight.toUpperCase(),
       halfX - PAD,
       halfY - bottomMargin);
  pop();


  pop(); // end rotating world

push();

// time-based flip animation
let scaleFactor = 1;
// --- UPDATE CARD ANGLE IF ANIMATING ---
if (flippingCard) {
  let p = (millis() - cardStartTime) / cardDuration;
  p = constrain(p, 0, 1);
  let ease = sin(p * PI / 2); // ease out

  cardAngleX = lerp(cardAngleX, cardTargetX, ease);
  cardAngleY = lerp(cardAngleY, cardTargetY, ease);

  if (p === 1) flippingCard = false;
}

// --- DRAW CARD INTO WEBGL BUFFER ---
cardGraphics.clear();
cardGraphics.push();
cardGraphics.rotateX(cardAngleX);
cardGraphics.rotateY(cardAngleY);
cardGraphics.noFill();
cardGraphics.stroke(255);
cardGraphics.rect(0, 0, 178, 230);
cardGraphics.pop();

// --- DRAW WEBGL CARD ON MAIN CANVAS ---
imageMode(CENTER);
image(cardGraphics, width/2, height/2);


pop();

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ---------- JUSTIFY HELPERS ----------

function getJustifiedLines(str, w) {
  // Split into hard paragraphs using \n
  let paragraphs = str.split(/\n/);
  let finalLines = [];

  for (let p = 0; p < paragraphs.length; p++) {
    let para = paragraphs[p].trim();
    if (para.length === 0) {
      finalLines.push(""); // Keep empty line
      continue;
    }

    let words = para.split(/\s+/);
    let lines = [];
    let current = words[0];

    for (let i = 1; i < words.length; i++) {
      let test = current + " " + words[i];
      if (textWidth(test) < w) {
        current = test;
      } else {
        lines.push(current);
        current = words[i];
      }
    }

    lines.push(current);
    finalLines.push(...lines);

  }

  return finalLines;
}

function drawJustifiedLines(lines, x, y, w, lineHeight) {
  textAlign(LEFT, TOP);

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let isLast = (i === lines.length - 1);

    if (isLast) {
      text(line, x, y + i * lineHeight);
      continue;
    }

    let wordsInLine = line.split(" ");
    if (wordsInLine.length === 1) {
      text(line, x, y + i * lineHeight);
      continue;
    }

    let totalWordWidth = 0;
    for (let wI = 0; wI < wordsInLine.length; wI++) {
      totalWordWidth += textWidth(wordsInLine[wI]);
    }

    let totalSpaces = wordsInLine.length - 1;
    let extraSpace = (w - totalWordWidth) / totalSpaces;

    let dx = x;
    for (let wI = 0; wI < wordsInLine.length; wI++) {
      text(wordsInLine[wI], dx, y + i * lineHeight);
      dx += textWidth(wordsInLine[wI]) + extraSpace;
    }
  }
}

function mousePressed() {
  checkCardClick(mouseX, mouseY);
}

function touchStarted() {
  checkCardClick(mouseX, mouseY);
}

function checkCardClick(mx, my) {
  let x = mx - width/2;
  let y = my - height/2;

  if (abs(x) < 178/2 && abs(y) < 230/2) {
    flipCardToRandom();
  }
}

function flipCardToRandom() {
  flippingCard = true;
  cardStartTime = millis();

  // new random rotation target
  cardTargetX = random(-PI/2, PI/2);
  cardTargetY = random(-PI/2, PI/2);
}
