let imgBottom, imgTop;

let btn;
let statusMsg = "Waiting…";
let ySmoothed = 0;

let tiltBeta = 0;   // front/back
let tiltGamma = 0;  // left/right
let hasOrientation = false;

function preload() {
  imgBottom = loadImage("assets/bottom.png");
  imgTop    = loadImage("assets/top.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  btn = createButton("ENABLE GYRO");
  btn.style("font-size", "16px");
  btn.style("padding", "12px 16px");
  btn.style("border", "1px solid #fff");
  btn.style("background", "black");
  btn.style("color", "white");
  btn.style("cursor", "pointer");
  btn.mousePressed(enableSensors);

  positionEnableButton();
}

function draw() {
  background(0);

  fill(255);
  noStroke();
  textSize(14);
  text(statusMsg, 16, 22);

  // show what we are actually using
  text("beta: " + tiltBeta.toFixed(1) + "  gamma: " + tiltGamma.toFixed(1), 16, 44);

  // bottom fixed
  drawCover(imgBottom, 0, 0, width, height);

  // choose ONE axis to drive vertical slide:
  // beta feels most natural for “tilt phone forward/back”
  let tilt = tiltBeta;

  tilt = constrain(tilt, -45, 45);
  let slideRange = height * 0.4;
  let targetY = map(tilt, -45, 45, -slideRange, slideRange);
  ySmoothed = lerp(ySmoothed, targetY, 0.12);

  push();
  translate(0, ySmoothed);
  drawCover(imgTop, 0, 0, width, height);
  pop();
}

async function enableSensors() {
  statusMsg = "Requesting permission…";

  try {
    let o = "n/a";
    let m = "n/a";

    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      o = await DeviceOrientationEvent.requestPermission();
    }

    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
      m = await DeviceMotionEvent.requestPermission();
    }

    statusMsg = `Orientation: ${o} | Motion: ${m}`;

    // Start listening explicitly (this is the key difference)
    if (!hasOrientation) {
      window.addEventListener("deviceorientation", (e) => {
        // e.beta (front/back), e.gamma (left/right)
        if (typeof e.beta === "number") tiltBeta = e.beta;
        if (typeof e.gamma === "number") tiltGamma = e.gamma;
      }, true);
      hasOrientation = true;
    }

    if (o === "granted" || m === "granted") {
      if (btn) btn.remove();
      btn = null;
    } else {
      statusMsg += " | If denied: iOS Settings → Safari → Motion & Orientation Access";
    }
  } catch (e) {
    statusMsg = "Permission error: " + e;
  }
}

function positionEnableButton() {
  if (!btn) return;

  let bw = 150;
  let bh = 44;
  let x = windowWidth / 2 - bw / 2;
  let y = windowHeight - bh - 20;

  btn.position(x, y);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionEnableButton();
}

function drawCover(img, x, y, w, h) {
  if (!img) return;

  let rImg = img.width / img.height;
  let rCan = w / h;

  let dw, dh;
  if (rImg > rCan) {
    dh = h;
    dw = h * rImg;
  } else {
    dw = w;
    dh = w / rImg;
  }

  imageMode(CENTER);
  image(img, x + w / 2, y + h / 2, dw, dh);
  imageMode(CORNER);
}
