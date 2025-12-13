let overlayG;
let showOverlay = false;
let overlayConfig = null;

// Hover data
let hoverZones = [];      // all word hitboxes for this frame
let activeHover = null;   // which word is currently hovered

let hoverImages = {};  

let clickZones = [];  

let snowflakes = [];
let isSnowing = true;

// === GRID SETTINGS ===
let cols = 12;
let gap  = 13;

// === TYPO SETTINGS ===
let baseTextSize = 14;
let lineHeight   = 18;

// Column state for layout
let colWidth;
let sections = [];

let copiedAt = 0;   // timestamp when copy happened (for feedback)


   // map: key -> { img, colStart, colSpan }

let clickTargets = {

  "Gyroscope": {
    colStart: 6,
    colSpan: 3,
    h: 300,
codeUrl: "sketches/gyroscope.js"

  },  

  "column": {
    colStart: 6,
    colSpan: 3,
    h: 300,
    code: `
let cols = 8;           // number of columns\n
let margin = 40;\n
let gutter = 16;\n
let totalGutterWidth = gutter * (cols - 1);\n
let colW = (width - 2 * margin - totalGutterWidth) / cols;\n\n
// draw column lines\n
stroke(200);\n
for (let i = 0; i <= cols; i++) {\n
  let x = margin + i * (colW + gutter);\n
  line(x, 0, x, height);\n
}\n\n

// helper: get x-position of a column index\n
function colX(colIndex) {\n
  return margin + colIndex * (colW + gutter);\n
}\n\n

// TEXT using column spans (e.g. spanning 3 columns from col 1 to 3)\n
let textStartCol = 1;\n
let textSpan = 3;\n
let textX = colX(textStartCol);\n
let textW = colW * textSpan + gutter * (textSpan - 1);\n
let textY = 100;\n\n
textAlign(LEFT, TOP);\n
text(\"Interactive postcard title\", textX, textY, textW, 200);\n\n

// IMAGE using column spans (e.g. spanning 4 columns from col 4 to 7)\n
let imgStartCol = 4;\n
let imgSpan = 4;\n
let imgX = colX(imgStartCol);\n
let imgW = colW * imgSpan + gutter * (imgSpan - 1);\n
let imgY = 260;\n
let imgH = 200;\n\n
image(myImage, imgX, imgY, imgW, imgH);\n\n`
  },

  "sound/audio": {
    colStart: 6,
    colSpan: 3,
    h: 400,
codeUrl: "sketches/sound-recursive.js"
  },

  "PROMPT": {
    colStart: 8,
    colSpan: 3,
    h: 400,
    code: `Title:\n[Short description of the task]\n\nContext:\n[Why you need it, who it’s for, or where it will run]\n\nTechnical Constraints (Strict):\n1.\n2.\n3.\n\nFunctional / Visual Requirements:\n[What the result must do or look like]\n\nInteraction Requirements (Optional):\n[Gestures, sensors, inputs, behaviours]\n\nOutput Format:\n[Code only, explanation + code, HTML, p5.js sketch, etc.]\n\nDo NOT:\n[What to avoid — libraries, assumptions, features]`
  },
    "BUTTON": {
    colStart: 8,
    colSpan: 3,
    h: 400,
    code: `
function positionEnableButton() {\n  if (!btn) return;\n\n  // bottom-center of the window\n  let bw = 140; // approximate button width\n  let bh = 40;  // approximate height\n  let x = windowWidth / 2 - bw / 2;\n  let y = windowHeight - bh - 20; // 20px above bottom\n\n  btn.position(x, y);\n}
`}
};



function preload() {
  hoverImages["ヾ(´▽｀)ﾉ"] = {
    img: loadImage("assets/Hi.gif"),
    colStart: 6,
    colSpan: 4,
    yOffset: 30 
  };

  hoverImages["(◎≧v≦)人(≧v≦●)"] = {
    img: loadImage("assets/thankyou.gif"),
    colStart: 0,
    colSpan: 3,
    yOffset: 300 
  };

    hoverImages["｡｡oＯ"] = {
    img: loadImage("assets/zzz.gif"),
    colStart: 8,
    colSpan: 3,
    yOffset: 500 
  };

    hoverImages["[1]"] = {
    img: loadImage("assets/Conlie_postcard.jpg"),
    colStart: 0,
    colSpan: 3,
    yOffset: 470 
  };

    hoverImages["[2]"] = {
    img: loadImage("assets/Oura_Tenshudo_Temple.jpg"),
    colStart: 3,
    colSpan: 3,
    yOffset: 470 
  };

    hoverImages["[3]"] = {
    img: loadImage("assets/meowy.webp"),
    colStart: 6,
    colSpan: 3,
    yOffset: 470 
  };

    hoverImages["[4]"] = {
    img: loadImage("assets/postcards.jpg"),
    colStart: 9,
    colSpan: 3,
    yOffset: 470 
  };

    hoverImages["communication"] = {
    img: loadImage("assets/communication.gif"),
    colStart: 8,
    colSpan: 3,
    yOffset: 30 
  };

    hoverImages["POST-POSTCARD"] = {
    img: loadImage("assets/genius.gif"),
    colStart: 5,
    colSpan: 6,
    yOffset: 150 
  };

    hoverImages["Variable"] = {
    img: loadImage("assets/VariableFont.gif"),
    colStart: 5,
    colSpan: 6,
    yOffset: 600 
  };

    hoverImages["distance/proximity"] = {
    img: loadImage("assets/proximity.gif"),
    colStart: 5,
    colSpan: 6,
    yOffset: 600 
  };

    hoverImages["AUTHOR"] = {
    img: loadImage("assets/debug.jpeg"),
    colStart: 8,
    colSpan: 3,
    yOffset: 200 
  };
}

function setup() {
  createCanvas(windowWidth, 3000);
  textFont("Helvetica");
  textSize(baseTextSize);
  textAlign(LEFT, TOP);

  initSections();

  overlayG = createGraphics(600, 300);
}

function draw() {
  background(245, 245, 255);

  // 1) GRID + SECTIONS
  drawGridColumns();
  layoutAndDrawSections();

  // 2) HEADER BAR
  noStroke();
  fill(245, 245, 255);
  rect(0, 0, width, 30);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("POST-POSTCARD WORKSHOP", width / 2, 15);

  layoutAndDrawSections();


// --- DRAW HOVER IMAGE ---
if (activeHover) drawHoverImage();

drawClickOverlay();

// snow, overlay, etc.


  // // 3) OVERLAY SKETCH (on top of grid, under snow)
  // if (showOverlay) {
  //   drawOverlaySketch(overlayG);

  //   let startCol = 2;
  //   let span     = 8;

  //   let spanLeft  = gap + startCol * (colWidth + gap);
  //   let spanWidth = span * colWidth + (span - 1) * gap;

  //   let overlayY  = 380;
  //   let overlayH  = 1000;

  //   imageMode(CORNER);
  //   image(overlayG, spanLeft, overlayY, spanWidth, overlayH);
  // }

  // 4) SNOW ON TOP
  updateAndDrawSnow();

  // --- COPY FEEDBACK ---
if (millis() - copiedAt < 1000) {   // show for 1 second
  noStroke();
  fill(245,245, 255);
  rect(width/2-150, 0, 300, 30);

  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  text("CODE COPIED ٩( ᐛ )و", width/2, 15);
}


}

// ---------- SECTIONS DATA ----------

function initSections() {
  sections = [
    {
      title: "00. INTRODUCTION",
      body: "ヾ(´▽｀)ﾉ ______ (◎≧v≦)人(≧v≦●) ______ ｡｡oＯ  \n\n POSTCARD [1] [2] [3] [4]\nPostcard is a piece of thick paper or thin cardboard, typically rectangular, intended for writing and mailing without an envelope.(wikipedia)\n\nTechnology has evolved SO MUCH but why we haven't changed the communication format of POSTCARDS? \n\n.........................so, that's what we're going to make today, POST-POSTCARD!! \n ........................................but... how??",
      colStart: 1,
      colSpan: 4,
      expanded: false,
      box: null
    },
    {
      title: "01.0 SENSING < DEVICES/ >",
      body: "Smartphones and tablets already include a wide range of built-in sensors.\nHardware varies by model, but most devices contain the following categories:\n\nMotion & Orientation\n• Accelerometer – detects linear movement, tilt, shake, motion speed.\n• Gyroscope – detects rotation with high precision.\n• Magnetometer (Compass) – measures magnetic field direction.\n• Barometer – measures air pressure, improves altitude detection.\n\nPosition & Location\n• GPS – outdoor positioning.\n• GLONASS / Galileo / BeiDou – additional satellite systems.\n• Wi-Fi Positioning – indoor location via nearby networks.\n• Bluetooth Proximity (BLE) – detects nearby devices or beacons.\n\nEnvironment Sensing\n• Ambient Light Sensor – adjusts brightness, detects lighting conditions.\n• Proximity Sensor – senses if an object is close to the screen.\n• Temperature Sensor – internal, for battery safety.\n• Humidity Sensor – rare but present in some models.\n• Fingerprint / Touch ID – biometric input.\n\nSound & Vision\n• Microphone – sound detection, voice, noise levels.\n• Camera(s) – RGB, video, colour, depth (LiDAR on newer iPads/iPhones).\n• Infrared (FaceID) – IR depth mapping for facial geometry.\n• LiDAR Scanner – precise 3D spatial scanning for AR.\n\nTouch & Interaction\n• Multi-Touch Capacitive Screen – detects finger location and gestures.\n• Haptic Engine – provides vibration feedback (output, but part of interaction loops).\n\nConnectivity as Input\n• NFC – contactless reading (payments, tags).\n• Wi-Fi/LTE/5G signals – environmental network context.\n• Software gesture frameworks – combine multiple sensors for recognition.\n\n>> In simple terms, your phone can sense:\nMovement · Rotation · Direction\nLight · Distance · Sound\nLocation · Touch · Biometrics\nDepth · Faces · Motion in 3D space\n\n",
      colStart: 2,
      colSpan: 4,
      expanded: false,
      box: null
    },
    {
      title: "01.1 TYPOGRAPHY, GRID & LAYOUT AS SYSTEM",
      body: "We can connect typography directly to sensor data.\nVariable fonts (OTF) allow us to change properties such as weight, width, slant\nthrough code, instead of switching between static font files.\n\nWe can use the same logic with other sensors:\n• tilt → slant axis\n• sound/audio level → width or weight axis\n• distance/proximity → size, tracking, line spacing\n\nGrid & layout on canvas\nWe also treat the canvas like a small poster with a column system.\nWe define number of columns and gaps, then calculate column width.\n\nOnce the grid exists, we can place text and shapes\nby snapping to column x positions and using the grid as a layout system\nfor our interactive postcards.",
      colStart: 2,
      colSpan: 4,
      expanded: false,
      box: null
    },
    {
      title: "01.2 IMAGE & GRAPHICS",
      body: "1. Live Camera Data\nPhones and tablets provide real-time camera access (RGB, depth on some models).\nThis allows interaction through face detection, motion, colour, or AR.\nWe will not cover camera-based interaction today, since the possibilities are extremely broad,\nbut keep in mind that camera input can become another “material” for your postcard.\n\n2. Working with Images\nHere we focus on visual treatment:\n\n• blendMode() — multiply, screen, overlay for layered effects\n• tint() — recolour or adjust transparency\n• filter() — blur, threshold, invert, posterize\n• ASCII effect — converting pixels into characters for a coded texture\n\n3. Vector Shapes (from Illustrator → Code)\nVector graphics can be translated into p5.js as points or paths.\nWorkflow:\n• Export your Illustrator shape as SVG\n• Use an SVG-to-JSON converter OR manually extract path points\n• Import point coordinates into p5.js\n\nAnimating the vector shape\n• Move the entire shape using translate()\n• Animate individual points by adding noise(), sin(), or sensor values\n• Use mouse/tilt/light to distort the outline\n\nVector shapes let your postcard behave like digital paper:\nillustrations that bend, pulse, shake, or respond to sensors.\nThis bridges hand-drawn aesthetics with interactive behaviours.",
      colStart: 2,
      colSpan: 4,
      expanded: false,
      box: null
    },
{
  title: "02.0 SET UP",
  body:
"Test on Your Phone (Prototype Setup)\n\n" +
"Goal: Open your p5.js sketch on your phone and test touch AND motion sensors.\n\n" +

"Important:\n" +
"Touch input works over local Wi-Fi.\n" +
"Device motion (gyroscope / accelerometer) on iOS requires HTTPS.\n\n" +

"— A. Local Test (Touch Only)\n\n" +
"Requirements: Laptop + phone/tablet on the same Wi-Fi.\n\n" +

"1. Find your computer’s local IP address\n" +
"Option A — Terminal: ifconfig | grep \"inet \" → find 192.168.x.x or 10.0.x.x\n" +
"Option B — System Settings → Network → Wi-Fi → Details → TCP/IP → IPv4 Address\n\n" +

"2. Find Live Server’s port\n" +
"Live Server launches something like: http://127.0.0.1:5500/\n" +
"→ here 5500 is the port\n\n" +

"3. Build the URL\n" +
"http://YOUR_IP_ADDRESS:PORT/\n" +
"(example: http://192.168.0.23:5500/)\n\n" +

"4. Open on your phone\n" +
"Open Safari/Chrome → enter the full URL\n" +
"Touch replaces mouse input\n\n" +

"— B. Motion Sensor Test (Gyroscope / Accelerometer)\n\n" +
"Required for iOS Safari.\n\n" +

"5. Install ngrok (once)\n" +
"brew install ngrok\n" +
"https://ngrok.com → sign up → install\n\n" +

"6. Start ngrok tunnel\n" +
"In Terminal, run:\n" +
"ngrok http YOUR_LOCAL_PORT\n" +
"(example: ngrok http 5500)\n\n" +

"7. Open the HTTPS URL on your phone\n" +
"ngrok outputs a URL like:\n" +
"https://xxxx.ngrok-free.app\n\n" +
"Open this link in Safari (not inside another app).\n\n" +

"8. Enable motion\n" +
"Tap the ENABLE GYRO / ENABLE MOTION button.\n" +
"iOS will now allow device orientation input.\n\n" +

"Note:\n" +
"If you open the sketch via local IP only, motion sensors will be denied on iOS.",
  colStart: 3,
  colSpan: 4,
  expanded: false,
  box: null
},
    {
      title: "02.1 EXAMPLES AND TEMPLATES",
      body: "↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑",
      colStart: 3,
      colSpan: 4,
      expanded: false,
      box: null
    },
    {
      title: "03.0 PRACTICE — IDEATION",
      body: "30min\n Think of a front side graphic and a back side graphic for your postcard. \n We will discuss the idea together in following order of : \n •\n•\n•\n•\n•\n•\n•\n•\n•\n",
      colStart: 4,
      colSpan: 4,
      expanded: false,
      box: null
    },
    {
      title: "03.1 PRACTICE — PROMPT TEMPLATE - USING AI AS A DESIGN TOOL",
      body: "Design today exists at the intersection of creativity and computation.\nAlgorithms, data, and code are no longer hidden frameworks — they actively shape\nvisuals that adapt, evolve, and engage across mediums. \n ------------------------------- CODE CRAFTED, by Patrik Hübner and Tim Rodenbröker, 2025\n\nAI tools are especially powerful when language and coding are combined.\nHowever, it is essential that YOU REMAIN AS THE AUTHOR.\nDo not let AI take the lead, you must tell it exactly what you want.\n\nAI does not always give the best answer.\nRead outputs critically.\nTest them yourself.\nFix, adjust, and iterate until your idea comes to life.\n\n>> TEMPLATE OF PROMPT STRUCTURE\n\nTitle:\n[Short description of the task]\n\nContext:\n[Why you need it, who it’s for, or where it will run]\n\nTechnical Constraints (Strict):\n1.\n2.\n3.\n\nFunctional / Visual Requirements:\n[What the result must do or look like]\n\nInteraction Requirements (Optional):\n[Gestures, sensors, inputs, behaviours]\n\nOutput Format:\n[Code only, explanation + code, HTML, p5.js sketch, etc.]\n\nDo NOT:\n[What to avoid — libraries, assumptions, features]\n\n>> WHY This Structure Works?\n\nLarge language models interpret instructions hierarchically:\n\nTitle → global intent\nContext → background assumptions\nConstraints → rules that must be followed\nRequirements → what to produce\nOutput format → how to present it\nNegative instructions → prevent errors\n\nThis structure produces predictable,\nhigh-quality,\nrepeatable outputs\nwhile keeping you in control as the designer.",
      colStart: 4,
      colSpan: 4,
      expanded: false,
      box: null
    },
    {
      title: "03.2 PRACTICE — TROUBLESHOOTING",
      body: "1. Sensors Not Working on iPhone / Safari\nProblem:\nMotion, orientation, or sensor data does not respond on iOS devices.\n\nCause:\nSafari requires an explicit user gesture to grant sensor permissions.\nSensors will NOT activate automatically on page load.\n\nFix:\nCreate a button that asks for permission.\nThis BUTTON code lives OUTSIDE of setup() and draw().\n\nThe button must be clicked by the user\nto activate motion or orientation sensors.\n\n2. Performance Drops (Lag / Stutter)\nProblem:\nSketch feels slow, unresponsive, or jittery.\n\nCommon Causes:\n• Too many particles\n• Very large canvas resolution\n• Expensive pixel operations\n• filter() or pixel loops running every frame\n\nFixes:\n• Reduce particle counts\n• Use pixelDensity(1) on mobile\n• Avoid heavy per-pixel loops in draw()\n• Precompute values when possible\n• Use filters sparingly or only when needed\n\nRule of Thumb:\nIf it runs smoothly on your phone,\nit will almost always run smoothly elsewhere.",
      colStart: 4,
      colSpan: 4,
      expanded: false,
      box: null
    },
    {
      title: "04. PUBLISHING & SHARING",
      body: ">> Submission for the Workshop\n\nFolder structure:\n/YourName\n  ├─ index.html\n  ├─ style.css (optional)\n  ├─ sketch1.js\n  └─ sketch2.js\n\nYou can submit your folder via:\n• Email\n• AirDrop\n\nMake sure your sketch runs locally before sending.\n\n>> Sharing Your Postcard\nOnce your postcard exists as a webpage, it can be shared like a real postcard.\n\n1. Link (URL)\nUpload your folder to a hosting service (e.g. GitHub Pages).\nShare the link via message, email, or social media.\nThis is the simplest and most flexible method.\n\n2. QR Code\nGenerate a QR code that points to your postcard URL.\nPrint it on a physical postcard or poster.\n\n3. NFC Chip / Sticker\nProgram an NFC tag with your postcard URL.\nTap with phone → postcard opens.\n\n",
      colStart: 5,
      colSpan: 4,
      expanded: false,
      box: null
    },
    {
      title: "05. ARCHIVE & DOCUMENTATION",
      body: "Remember to make a screen recording and a video of 3rd POV including the device usage. \n+ Christmas Tree Coming soon!",
      colStart: 6,
      colSpan: 4,
      expanded: false,
      box: null
    },
    {
      title: ">> DOWNLOADS & RESOURCES <<",
      body: "DOUBLE_SIDE\nSKETCHES\nFONTS",
      colStart: 8,
      colSpan: 3,
      expanded: false,
      box: null
    }

  ];
}

// ---------- GRID DRAWING ----------

function drawGridColumns() {
  let totalGaps = cols + 1;
  colWidth = (width - totalGaps * gap) / cols;

  noStroke();
  for (let i = 0; i < cols; i++) {
    let x = gap + i * (colWidth + gap);
    fill(245, 245, 255);
    rect(x, 0, colWidth, height);
  }
}

// ---------- LAYOUT + DRAW SECTIONS ----------

function layoutAndDrawSections() {
  hoverZones = [];
  clickZones = [];

  // track vertical flow per column
  let currentY = Array(cols).fill(24);

  textSize(baseTextSize);
  textAlign(LEFT, TOP);

  for (let s of sections) {

    let cs = s.colStart;
    let ce = s.colStart + s.colSpan - 1;

    let x = gap + cs * (colWidth + gap);
    let w = s.colSpan * colWidth + (s.colSpan - 1) * gap;

    // Y-position = the max occupied Y across all spanned columns
    let y = 0;
    for (let c = cs; c <= ce; c++) {
      y = max(y, currentY[c]);
    }

    // --- TITLE MEASURE ---
    let titleLines = wrapLines(s.title, w);
    let titleHeight = titleLines.length * lineHeight;

    // --- BODY MEASURE ---
    let bodyLines = [];
    let bodyHeight = 0;

    if (s.expanded) {
      bodyLines = wrapLines(s.body, w);
      bodyHeight = bodyLines.length * lineHeight + 12;
    }

    let blockHeight = titleHeight + bodyHeight + 10;

    // --- BACKGROUND BOX ---
    noStroke();
    fill(255);
    rect(x, y, w, blockHeight);

    // --- DRAW TITLE ---
    fill(0);
    let ty = y;
    for (let line of titleLines) {
      text(line, x, ty);
      ty += lineHeight;
    }

    // --- EXPAND/COLLAPSE INDICATOR ---
    textAlign(RIGHT, TOP);
    text(s.expanded ? "–" : "+", x + w, y);
    textAlign(LEFT, TOP);

    // --- DRAW BODY + REGISTER HOVER + CLICK ZONES ---
    if (s.expanded) {
      let by = y + titleHeight + 6;
      fill(0);

      for (let ln of bodyLines) {
        let words = ln.split(" ");
        let cx = x;

        for (let w of words) {
          if (!w) continue;
          let wordWidth = textWidth(w + " ");
          let clean = w.replace(/[.,;:!?]/g, "");

          // hover or click?
          // hover or click?
let hoverDef = hoverImages[clean];
let clickDef = clickTargets[clean];

if (hoverDef || clickDef) {

  // register zones
  if (hoverDef) {
    hoverZones.push({ x: cx, y: by, w: wordWidth, h: lineHeight, key: clean, def: hoverDef });
  }
  if (clickDef) {
    clickZones.push({ x: cx, y: by, w: wordWidth, h: lineHeight, key: clean, def: clickDef });
  }

  // ---- STYLE FOR CLICKABLE WORDS ----
  if (clickDef) {
    // bold
    textStyle(NORMAL);

    // draw word
    noStroke();
    fill(0);
    text(w, cx, by);

    // underline
    stroke(0);
    let underlineY = by + lineHeight - 3;
    line(cx, underlineY, cx + wordWidth - 4, underlineY);

    // cursor hint (optional)
    // (only works if you also set cursor() in mouseMoved)
  } else {
    // hover-only styling (not clickable)
    textStyle(NORMAL);
    noStroke();
    fill(0);
    text(w, cx, by);
  }

  // reset style so following words are normal
  textStyle(NORMAL);
  noStroke();
  fill(0);

} else {
  // normal word
  textStyle(NORMAL);
  fill(0);
  text(w, cx, by);
}


          cx += wordWidth;
        }

        by += lineHeight;
      }
    }

    // store clickable box for expanding/collapsing the section
    s.box = { x, y, w, h: blockHeight };

    // update column flow
    for (let c = cs; c <= ce; c++) {
      currentY[c] = y + blockHeight + 3;
    }
  }

  // grid lines
  stroke(240);
  for (let i = 0; i <= cols; i++) {
    let px = gap + i * (colWidth + gap) - gap/2;
    line(px, 0, px, height);
  }
  
}


// ---------- TEXT WRAP HELPER ----------
function normalizeEscapes(str) {
  return str
    .replace(/\/n/g, "\n")     // newline
.replace(/\/t/g, " ".repeat(int(colWidth / 20)));
  // tab = 4 spaces (change number if needed)
}


function wrapLines(str, maxW) {
  str = String(str);
  str = normalizeEscapes(str);   // <— ADD THIS LINE

  let paragraphs = str.split("\n");
  let lines = [];

  for (let p of paragraphs) {
    if (p.trim().length === 0) {
      lines.push(""); 
      continue;
    }

    let words = p.split(/\s+/);
    let current = "";

    for (let w of words) {
      // handle tab indent
      if (w.includes("\t")) {
        current += "    "; // add 4 spaces per tab
        w = w.replace(/\t/g, "    ");
      }

      let test = current.length ? current + " " + w : w;

      if (textWidth(test) <= maxW) {
        current = test;
      } else {
        if (current.length) lines.push(current);
        current = w;
      }
    }

    if (current.length) lines.push(current);
  }

  return lines;
}


// ---------- INTERACTION ----------

function mousePressed() {
  let clickedSpecial = false;

  for (let z of clickZones) {
    if (mouseX >= z.x && mouseX <= z.x + z.w && mouseY >= z.y && mouseY <= z.y + z.h) {

      overlayConfig = z.def;
      showOverlay = true;
      clickedSpecial = true;

      // NEW: if this target uses codeUrl, fetch it and cache into overlayConfig.code
      if (overlayConfig.codeUrl && !overlayConfig.code) {
        overlayConfig.code = "Loading…";

        fetch(overlayConfig.codeUrl)
          .then(r => r.text())
          .then(txt => {
            overlayConfig.code = txt; // now drawClickOverlay() + copy works
          })
          .catch(err => {
            console.error(err);
            overlayConfig.code = "Failed to load code. Check console + file path.";
          });
      }

      break;
    }
  }

  if (clickedSpecial) return;

  showOverlay = false;
  overlayConfig = null;

  for (let s of sections) {
    if (!s.box) continue;
    if (mouseX >= s.box.x && mouseX <= s.box.x + s.box.w && mouseY >= s.box.y && mouseY <= s.box.y + s.box.h) {
      s.expanded = !s.expanded;
      break;
    }
  }
}



function mouseMoved() {
  activeHover = null;
  for (let z of hoverZones) {
    if (
      mouseX >= z.x &&
      mouseX <= z.x + z.w &&
      mouseY >= z.y &&
      mouseY <= z.y + z.h
    ) {
      activeHover = z;
      break;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, height);
}

// ---------- SNOW ----------

function updateAndDrawSnow() {
  let maxFlakes = 220;

  if (snowflakes.length < maxFlakes && random() < 0.6) {
    snowflakes.push({
      x: random(width),
      y: random(-50, 0),
      speedY: random(0.5, 2.2),
      drift: random(-0.4, 0.4),
      size: random(5, 10),
      phase: random(TWO_PI)
    });
  }

  noStroke();
  fill(255);

  for (let i = snowflakes.length - 1; i >= 0; i--) {
    let f = snowflakes[i];

    f.y += f.speedY;
    f.x += f.drift + 0.4 * sin(frameCount * 0.02 + f.phase);

    ellipse(f.x, f.y, f.size, f.size);

    if (f.y > height + 10 || f.x < -10 || f.x > width + 10) {
      snowflakes.splice(i, 1);
    }
  }
}

// ---------- OVERLAY EXAMPLE ----------

function drawFluffyTree(g) {
  g.clear();

  const topX = g.width / 2;
  const topY = g.height * 0.5;
  const baseY = g.height * 1;
  const leftBaseX = g.width * 0.15;
  const rightBaseX = g.width * 0.85;

  g.noStroke();
  g.fill(255);
  g.triangle(leftBaseX, baseY, rightBaseX, baseY, topX, topY);

  g.stroke(255, 200);
  g.strokeCap(ROUND);

  let steps = 1000;
  for (let i = 0; i < steps; i++) {
    let t = i / (steps - 1);

    let xL = lerp(topX, leftBaseX, t);
    let yL = lerp(topY, baseY, t);

    let xR = lerp(topX, rightBaseX, t);
    let yR = lerp(topY, baseY, t);

    let lengthFactor = 1.2 - t * 0.7;
    let len = g.random(10, 50) * lengthFactor;
    let weight = g.random(1, 4) * (1 - t * 0.5);

    g.strokeWeight(weight);
    g.line(
      xL, yL,
      xL - len,
      yL + g.random(-10, 4)
    );

    g.strokeWeight(weight);
    g.line(
      xR, yR,
      xR + len,
      yR + g.random(-10, 4)
    );
  }
}

function drawOverlaySketch(g) {
  g.clear();
  g.background(0, 0);

  g.noFill();
  g.stroke(255);
  g.strokeWeight(100);

  let t = frameCount * 0.002;
  for (let i = 0; i < 200; i++) {
    let x = g.width  * noise(i * 0.1, t);
    let y = g.height * noise(i * 0.1, t + 100);
    g.ellipse(x, y, 6, 6);
  }
  g.filter(BLUR, 2);
}

function drawHoverImage() {
  if (!activeHover) return;

  let def = activeHover.def;
  let img = def.img;

  let colStart = def.colStart || 0;
  let colSpan  = def.colSpan  || 3;

  // convert column → pixel, using your existing grid system
  let spanLeft  = gap + colStart * (colWidth + gap);
  let spanWidth = colSpan * colWidth + (colSpan - 1) * gap;

  // vertical position:
  // use explicit yOffset if defined, otherwise under the hovered word
  let y = (def.yOffset !== undefined)
    ? def.yOffset
    : activeHover.y + lineHeight + 6;

  let w = spanWidth;
  let h = w * (img.height / img.width);  // keep aspect ratio

  image(img, spanLeft, y, w, h);
}

function drawClickOverlay() {
  if (!showOverlay || !overlayConfig) return;

  let colStart = overlayConfig.colStart;
  let colSpan  = overlayConfig.colSpan;

  let spanLeft  = gap + colStart * (colWidth + gap);
  let spanWidth = colSpan * colWidth + (colSpan - 1) * gap;

let overlayY = mouseY;

  let overlayH  = overlayConfig.h;

  let code = overlayConfig.code;
  if (!code) return;

  // draw code box
  noStroke();
  fill(20);                   // dark background
  rect(spanLeft, overlayY, spanWidth, overlayH, 4);

  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);

  // wrap code manually
  let codeLines = code.split("\n");
  let cy = overlayY + 10;
  let cx = spanLeft + 10;

  for (let line of codeLines) {
    text(line, cx, cy);
    cy += 16;
    if (cy > overlayY + overlayH - 20) break;
  }
}

function copyCurrentCodeToClipboard() {
  if (!showOverlay || !overlayConfig || !overlayConfig.code) return;

  let codeText = overlayConfig.code.trim();

  // Modern Clipboard API (works on https or localhost)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(codeText)
      .then(() => {
        copiedAt = millis();   // for visual feedback
        console.log("Code copied to clipboard.");
      })
      .catch(err => {
        console.error("Clipboard copy failed:", err);
      });
  } else {
    // Fallback for older browsers
    let textarea = document.createElement("textarea");
    textarea.value = codeText;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      copiedAt = millis();
      console.log("Code copied to clipboard (fallback).");
    } catch (e) {
      console.error("Fallback copy failed:", e);
    }
    document.body.removeChild(textarea);
  }
}

function keyPressed() {
  if (key === 'c' || key === 'C') {
    copyCurrentCodeToClipboard();
  }
}

function openSection(key) {
  const section = sections[key];

  // show overlay UI
  showOverlay = true;

  // clear old code
  overlayCodeEl.textContent = "Loading…";

  if (section.codeUrl) {
    fetch(section.codeUrl)
      .then(r => r.text())
      .then(code => {
        overlayCodeEl.textContent = code;
      })
      .catch(err => {
        overlayCodeEl.textContent = "Failed to load code.";
        console.error(err);
      });
  }
}
