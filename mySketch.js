/*
Frozen brush

Makes use of a delaunay algorithm to create crystal-like shapes.
I did NOT develop delaunay.js, and not sure who the author really is to give proper credit.

Controls:
	- Drag the mouse.
    - Press any key to toggle between fill and stroke.

Inspired by:
	Makio135's sketch www.openprocessing.org/sketch/385808

Author:
  Jason Labbe

Site:
  jasonlabbe3d.com
*/

var allParticles = [];
var maxLevel = 5;
var useFill = false;
var useRandom = false;

var data = [];


// Moves to a random direction and comes to a stop.
// Spawns other particles within its lifetime.
function Particle(x, y, level) {
  this.level = level;
  this.life = 0;

  this.pos = new p5.Vector(x, y);
  this.vel = p5.Vector.random2D();
  this.vel.mult(map(this.level, 0, maxLevel, 5, 2));

  this.move = function() {
    this.life++;

    // Add friction.
    this.vel.mult(0.9);

    this.pos.add(this.vel);

    // Spawn a new particle if conditions are met.
    if (this.life % 10 == 0) {
      if (this.level > 0) {
        this.level -= 1;
        var newParticle = new Particle(this.pos.x, this.pos.y, this.level-1);
        allParticles.push(newParticle);
      }
    }
  }
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  colorMode(HSB, 360);

  textAlign(CENTER);

  background(0);
}


function draw() {
  // Create fade effect.
  noStroke();
  fill(0, 30);
  rect(0, 0, width, height);

  // Move and spawn particles.
  // Remove any that is below the velocity threshold.
  for (var i = allParticles.length-1; i > -1; i--) {
    allParticles[i].move();

    if (allParticles[i].vel.mag() < 0.01) {
      allParticles.splice(i, 1);
    }
  }

  if (allParticles.length > 0) {
    // Run script to get points to create triangles with.
    data = Delaunay.triangulate(allParticles.map(function(pt) {
      return [pt.pos.x, pt.pos.y];
    }));

    strokeWeight(0.1);

    // Display triangles individually.
    for (var i = 0; i < data.length; i += 3) {
      // Collect particles that make this triangle.
      var p1 = allParticles[data[i]];
      var p2 = allParticles[data[i+1]];
      var p3 = allParticles[data[i+2]];

      // Don't draw triangle if its area is too big.
      var distThresh = 75;

      if (dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y) > distThresh) {
        continue;
      }

      if (dist(p2.pos.x, p2.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }

      if (dist(p1.pos.x, p1.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }

      // Base its hue by the particle's life.
      if (useFill) {
        noStroke();
        fill(160+p1.life*1.5, 300, 300);
      } else {
        noFill();
        stroke(165+p1.life*1.5, 360, 360);
      }

      triangle(p1.pos.x, p1.pos.y,
               p2.pos.x, p2.pos.y,
               p3.pos.x, p3.pos.y);
    }
  }

  noStroke();
  fill(255);
  text("Click and drag the mouse\nPress any key (besides spacebar) to change to fill/stroke", width/2, height-40);
  text("Orginally by Jason Labbe | Modified by Joe Sorensen", width/2, height-17)

  if (useRandom){
    var xran = Math.floor(Math.random() * (windowWidth - 1 + 1)) + 1;
    var yran = Math.floor(Math.random() * (windowHeight - 1 + 1)) + 1;
    var subs = Math.floor(Math.random() * (50 - 0 + 1)) + 0;
    /*var subs = 0*/
    var tran = Math.floor(Math.random() * (40 - 0 + 1)) + 1;
    if (tran == 1){
      for (i = 0; i < subs; i++){
        allParticles.push(new Particle(xran-subs+i, yran+subs-i, maxLevel));
        allParticles.push(new Particle(xran+subs-i, yran-subs+i, maxLevel));
        allParticles.push(new Particle(xran+subs, yran/subs+xran, maxLevel));
        allParticles.push(new Particle(xran-subs, yran/subs-xran, maxLevel));
      }
    }
  }

}


function mouseDragged() {
  allParticles.push(new Particle(mouseX, mouseY, maxLevel));
}


function keyPressed() {
  if (keyCode == 32){
    useRandom = ! useRandom
  }else{
    useFill = ! useFill;
  }
}
