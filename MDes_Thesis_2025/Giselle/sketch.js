let video;
let img;
let poseNet;
let poses = [];

let lastNoseX = null;
let direction = null;
let lastDirectionChangeTime = 0;
let spinCount = 0;
let angle = 0;
let targetAngle = 0;

let angles = Array(7).fill(0);          // current rotation for each model
let targetAngles = Array(7).fill(0);    // target rotation per model
let spinInProgress = false;
let spinStartTime = 0;
let spinDelayPerModel = 100; // ms between each model's rotation

let models = [];
let scales = [1, 1.1, 0.75, 0.75, 0.9, 0.9, 0.75]; 
let verticalOffsets = [45, 152, 235, 370, 460, 498, 585];
let horizontalOffsets = [-210, -195, -240, -240, -220, -220, -240];

function preload() {
  for (let i = 1; i <= 7; i++) {
    models.push(loadModel(`giselle${i}.obj`, true));
  }
}

function setup() {
  createCanvas(700, 1080, WEBGL);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  img = loadImage('/assets/Gbx.png');
  imageMode(CENTER);


  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });
}

function modelReady() {
  console.log('PoseNet ready!');
}

function detectSpinCycles() {
  if (poses.length > 0 && !spinInProgress) {
    let noseX = poses[0].pose.nose.x;

    if (lastNoseX !== null) {
      let dx = noseX - lastNoseX;

      if (abs(dx) > 5) {
        let newDirection = dx > 0 ? 'right' : 'left';

        if (direction && newDirection !== direction) {
          let now = millis();

          if (now - lastDirectionChangeTime < 1000) {
            spinCount++;
            spinStartTime = millis();
            spinInProgress = true;

            for (let i = 0; i < targetAngles.length; i++) {
              targetAngles[i] += TWO_PI; // queue one full spin
            }

            console.log("Spin!", spinCount);
          }

          lastDirectionChangeTime = now;
        }

        direction = newDirection;
      }
    }

    lastNoseX = noseX;
  }
}


function draw() {
  background(0);
  image(img, 0, 0, 710, 1080);
  detectSpinCycles();
  ortho();
  for (let i = 0; i < models.length; i++) {
    let delay = i * spinDelayPerModel;
    let elapsed = millis() - spinStartTime;
  
    if (spinInProgress && elapsed > delay) {
      if (angles[i] < targetAngles[i]) {
        angles[i] += 0.05;
        if (angles[i] > targetAngles[i]) angles[i] = targetAngles[i];
      }
    }
  }
  

  // Set lighting
  ambientLight(150);
  directionalLight(255, 255, 255, 0, 0, -1);

  // Center vertically
  translate(0, -200); // shift starting point upward

  for (let i = 0; i < models.length; i++) {
    push();
    translate(horizontalOffsets[i], verticalOffsets[i], 0);
    rotateY(angles[i]);
    scale(scales[i], -scales[i], scales[i]); // flip Y, keep proportions
    ambientMaterial(236, 232, 226);
    noStroke();
    model(models[i]);
    pop();
  }
  if (
    spinInProgress &&
    angles.every((a, i) => abs(a - targetAngles[i]) < 0.01)
  ) {
    spinInProgress = false; // ready for next spin
  }
  
}
