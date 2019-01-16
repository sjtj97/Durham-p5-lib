// Used to create new particles objects
class Particle{
	constructor(x, y, vx, vy, velocityVector, sliderValues){
		this.Color = sliderValues[0] || 0.8;
		this.Size = sliderValues[1] || 0.8;
		this.Mass = 1;
		this.Friction = 0.1 * sliderValues[4] || 0;
		this.Location = createVector(x, y) || createVector(window.innerWidth/2, window.innerHeight/2);
		this.Velocity = velocityVector.mult(sliderValues[3]) || createVector(0,0);
		this.Acceleration = createVector(vx, vy) || createVector(0,0);
		if(this.Friction == 0.1){this.Friction=1;}
		this.createParticleImage();
	}
	
	// Used to update the particles velocity and acceleration and take in account friction (if there is any)
	update(){
		this.Velocity = this.Velocity.add(this.Acceleration);
		this.Velocity = this.Velocity.mult(1-this.Friction);
		this.Location = this.Location.add(this.Velocity);
		this.Acceleration = createVector(0,0);
	}
	
	// Used to draw the particle image at its location to show the user where the particle is
	display(){
		image(this.Image, this.Location.x, this.Location.y);
	}
	
	// Used to calculate a force to a given attractor
	attract(attractor){
		let force = p5.Vector.sub(attractor.Location, this.Location);
		let distance = force.mag();
		distance = constrain(distance, 60.0, 600.0);
		force.normalize();
		let strength = (this.Mass*attractor.Mass)/pow(distance, 2.0);
		force.mult(strength);
		return force;
	}
	
	// This function applies the force to the particle using Newtons F = ma --> a = F / m
	applyForce(force){
		let accel = p5.Vector.div(force, this.Mass);
		this.Acceleration = this.Acceleration.add(accel);
	}
	
	// This function is used to create an image for the particle
	createParticleImage(){
		let side = 300;
		let center = 150;

		this.Image = createImage(side, side);

		let num = pow(10, 1.8);

		let h = frameCount;
		let s = this.Color;
		let v = this.Size;
		let c = v * s;
		h = (h % 360) / 60;
		let x = c * (1 - abs(h % 2 - 1));
		let co;
		if (h >= 0 && h < 1) {
		co = createVector(1, 1, 1).mult(v - c).add(createVector(c, x, 0));
		} else if (h >= 1 && h < 2) {
		co = createVector(1, 1, 1).mult(v - c).add(createVector(x, c, 0));
		} else if (h >= 2 && h < 3) {
		co = createVector(1, 1, 1).mult(v - c).add(createVector(0, c, x));
		} else if (h >= 3 && h < 4) {
		co = createVector(1, 1, 1).mult(v - c).add(createVector(0, x, c));
		} else if (h >= 4 && h < 5) {
		co = createVector(1, 1, 1).mult(v - c).add(createVector(x, 0, c));
		} else if (h >= 5 && h < 6) {
		co = createVector(1, 1, 1).mult(v - c).add(createVector(c, 0, x));
		}

		let Cr = 255 * co.x;
		let Cg = 255 * co.y;
		let Cb = 255 * co.z;
		
		this.Image.loadPixels();
		for (let i = 0; i < side; i++) {
			for (let j = 0; j < side; j++) {
				let d = (sq(center - j) + sq(center - i))/num;
				let col = color(Cr/d, Cg/d, Cb/d);
				this.Image.set(j, i, col);
			}
		}
		this.Image.updatePixels();
		return this.Image;
	}
	
	// Setters
	set Size(data){
		this.size = data;
	}
	
	set Color(data){
		this.color = data;
	}
	
	set Mass(data){
		this.mass = data;
	}
	
	set Velocity(data){
		this.velocity = data;
	}
	
	set Location(data){
		this.location = data;
	}
	
	set Acceleration(data){
		this.acceleration = data;
	}
	
	set Friction(data){
		this.friction = data;
	}
	
	set Image(data){
		this.img = data;
	}
	
	// Getters
	get Color(){
		return this.color;
	}
	
	get Size(){
		return this.size;
	}
	
	get Image(){
		return this.img;
	}
	
	get Location(){
		return this.location;
	}
	
	get Velocity(){
		return this.velocity;
	}
	
	get Acceleration(){
		return this.acceleration;
	}
	
	get Friction(){
		return this.friction;
	}
	
	get Mass(){
		return this.mass;
	}
}

// Used to create new attractor objects
class Attractor{
	constructor(x, y, attractorMassMultiplier){
		this.Mass = 10000.0 * attractorMassMultiplier || 10000;
		if(disp.ReverseAttractorDirection){ this.Mass = this.Mass * -1; }
		this.Location = createVector(x, y) || createVector(window.innerWidth/2, window.innerHeight/2);
		this.display();
	}
	
	// Used to create the attractor image on the scene
	display(){
		fill(0, 0, 0, 0);
		stroke(200);
		ellipse(this.Location.x, this.Location.y, 5, 5);
	}
	
	// Setters
	set Mass(data){
		this.mass = data;
	}
	
	set Location(data){
		this.location = data
	}
	
	// Getters
	get Mass(){
		return this.mass;
	}
	
	get Location(){
		return this.location;
	}
}

// Used to handle the inputs
class Input{
	constructor(){
		this.Pos1 = 0;
		this.Pos2 = 0;
		this.InitialVelocity = 0;
		this.ElementClicked = '';
		this.Particles = [];
		this.Attractors = [];
		this.GameHasStarted = false;
	}

	// Used to randomise all particle objects velocities and directions
	randomiseParticles(){
		for(let particle of this.Particles){
			particle.velocity.x = random(-5,5);
			particle.velocity.y = random(-5, 5);
		}
	}
	
	// Used to handle keyboard presses
	keyboardInput(key) {
		if(this.GameHasStarted){
			if (key === 'p' || key === 'P') {
				this.PushNewParticle = new Particle(mouseX, mouseY, 0, 0, createVector(random(-5, 5), random(-5, 5)), disp.SliderValues);
			}
			if (key === 'a' || key === 'A') {
				this.PushNewAttractor = new Attractor(mouseX, mouseY, disp.SliderValues[2]);
			}
			else if (key === 'r' || key === 'R') {
				this.Particles = [];
				this.Attractors = [];
			}
			else if (key === 'm' || key === 'M') {
				this.randomiseParticles();
			}
		}
	}
	
	// Used to calculaate velocities for each particle
	calculateVelocity(){
		let veloc = p5.Vector.sub(this.Pos2, this.Pos1);
		veloc.div(50);
		return veloc;
	}
	
	// This function is used to update every particle with every attractor
	updateObjects(){
		for (let i = 0; i < this.Particles.length; i++) {
			for (let j = 0; j < this.Attractors.length; j++) {
				let force = this.Particles[i].attract(this.Attractors[j]);
				this.Particles[i].applyForce(force);
			}
			this.Particles[i].update();
			this.Particles[i].display();
		}
		for (let i = 0; i < this.Attractors.length; i++) {
				this.Attractors[i].display();
			}
		if(mouseIsPressed && this.ElementClicked === "cnvs"){
			stroke(255);
			line(this.Pos1.x, this.Pos1.y, mouseX, mouseY);
		}
	}
	
	// Setters
	set PushNewParticle(data){
		this.particles.push(data);
	}
	
	set PushNewAttractor(data){
		this.attractors.push(data);
	}
	
	set Pos1(data){
		this.pos1 = data;
	}
	
	set Pos2(data){
		this.pos2 = data;
	}
	
	set InitialVelocity(data){
		this.initialVelocity = data;
	}
	
	set ElementClicked(data){
		this.elementClicked = data;
	}
	
	set Particles(data){
		this.particles = data;
	}
	
	set Attractors(data){
		this.attractors = data;
	}
	
	set GameHasStarted(data){
		this.gameHasStarted = data;
	}
	
	// Getters
	get Pos1(){
		return this.pos1;
	}
	
	get Pos2(){
		return this.pos2;
	}
	
	get InitialVelocity(){
		return this.initialVelocity;
	}
	
	get ElementClicked(){
		return this.elementClicked;
	}
	
	get Particles(){
		return this.particles;
	}
	
	get Attractors(){
		return this.attractors;
	}
	
	get GameHasStarted(){
		return this.gameHasStarted;
	}
}

class Display{
	constructor(){
		this.ShowControls = true;
		this.ShowHelp = true;
		this.ReverseAttractorDirection = false;
		this.Fr = frameRate();
		this.Buttons = this.setupButtons();
		this.Sliders = this.setupSliders();
	}
	
	// Used to initialise the buttons and their properties
	setupButtons(){
		let buttonMenu = createButton('Controls');
		buttonMenu.position(window.innerWidth/2- 50,15);
		buttonMenu.mouseClicked(this.toggleControl);
		let buttonHelp = createButton('Help');
		buttonHelp.position(window.innerWidth/2 + 50, 15);
		buttonHelp.mouseClicked(this.toggleHelp);
		let buttonReverseAttraction = createButton('Reverse Attraction');
		buttonReverseAttraction.position(450, 87);
		buttonReverseAttraction.mouseClicked(this.toggleAttractorDirection);
		return [buttonMenu, buttonHelp, buttonReverseAttraction];
	}
	
	// Used to initialise the sliders and their properties
	setupSliders(){
		let sliderColor = createSlider(0, 1, 0.8, 0.1);
		sliderColor.position(290, 7);
		let sliderSize = createSlider(0, 1, 0.8, 0.1);
		sliderSize.position(290, 47);
		let sliderAttractorMass = createSlider(0, 10, 1, 0.5);
		sliderAttractorMass.position(290, 87);
		let sliderVelocity = createSlider(0, 5, 1, 0.1);
		sliderVelocity.position(290, 127);
		let sliderFriction = createSlider(0, 1, 0, 0.01);
		sliderFriction.position(290, 167);
		return [sliderColor, sliderSize, sliderAttractorMass, sliderVelocity, sliderFriction];
	}
	
	// Used to reset the sliders' values back to their default values prior to user changes
	resetSliders(){
		let sliders = this.Sliders
		sliders[0].value(0.8);
		sliders[1].value(0.8);
		sliders[2].value(1);
		sliders[3].value(1);
		sliders[4].value(0);
	}
	
	// Used to make all sliders visible to the user
	showSliders(){
		for(let slider of this.Sliders){
			slider.show();
		}
		this.Buttons[2].show();
	}
	
	// Used to make all slider invisible to the user (and button)
	hideSliders(){
		for(let slider of this.Sliders){
			slider.hide();
		}
		this.Buttons[2].hide();
	}
	
	// Updates all necessary information that is displayed to the user
	update(){
		this.updateFramerate();
		this.createFooterText();
		if(this.ShowControls){
			this.createControlText();
		}
		if (this.ShowHelp){
			this.createHelpText();
		}
	}
	
	// Used to create all the text seen in the footer
	createFooterText(){
		textFont('Monospace');
		textSize(24);
		fill("white");
		textAlign(RIGHT, BOTTOM);
		text(str(int(this.fr))+" fps", width, height);
		textAlign(LEFT, BOTTOM);
		text("Attractor : "+str(inp.attractors.length), 0, height);
		textAlign(CENTER, BOTTOM);
		text("Particle : "+str(inp.particles.length), width / 2, height);
		textAlign(LEFT, CENTER);
	}
	
	// Creates text to display help to the user
	createHelpText(){
		text("To create a particle you can either:", 10, 240);
		text("	1. Press P (creates a particle with a random direction and velocity at the position of the cursor).", 10, 280);
		text("  2. Click and drag to create a particle which has direction of the drag line", 10, 320)
		text("     and the velocity with respect to the size of the drag distance.", 10, 360);
		text("To create an attractor press the A key.", 10, 400);
		text("to randomise ALL particle directions and velocities press the M key.", 10, 440);
		text("To reset the scene press the R key.", 10, 480);
		text("The slider controls at the top left control the properties:", 10, 520);
		text("	1. The size slider adjusts the visual size of any new particle.", 10, 560);
		text("	2. The color slider allows for a variety of different coloured particles.", 10, 600);
		text("	3. The attra. strength slider allows for the effect of attractors with more gravitational force.", 10, 640);
		text("	4. The velocity slider adjusts the velocity multiplier of any new particle.", 10, 680);
		text("	5. The friction slider adds a 'drag' on any new particles.", 10, 720);
		text("	6. The REVERSE ATTRACTION button is used to repel particles from any new attractor.", 10, 760);
		text("To close this help, press the HELP button at the top. To close the slider controls, press the CONTROLS button at the top.", 10, 800);
		text("To go back to the home page of the website, press Escape (ESC)", 10, 840);
	}

	// Creates the text for the control sliders
	createControlText(){
		text("Color          : "+str(this.SliderValues[0]), 10, 20);
		text("Size           : "+str(this.SliderValues[1]), 10, 60);
		text("Attra. Strength: "+str(this.SliderValues[2]), 10, 100);
		if(disp.ReverseAttractorDirection){
			fill("green");
			text("ON", 585, 100);
		} else {
			fill("red");
			text("OFF", 585, 100);
		}
		fill("white");
		text("Velocity       : "+str(this.SliderValues[3]), 10, 140);
		text("Friction       : "+str(this.SliderValues[4]), 10, 180);
	}
	
	// Returns framerate value after every 10 frames
	updateFramerate(){
		if (frameCount % 10 == 0) {
			this.Fr = frameRate();
		}
	}
	
	// Used to switch a Boolean indicating whether or not to show sliders
	toggleControl(){
		if (disp.ShowControls){
			disp.hideSliders();
			disp.ShowControls = false;
		}else{
			disp.showSliders();
			disp.ShowControls = true;
		}
	}
	
	// Used to switch a Boolean indicating whether or not to show help
	toggleHelp(){
		if(disp.ShowHelp){
			disp.ShowHelp = false;
		} else{
			disp.ShowHelp = true;
		}
	}
	
	// Used to switch a Boolean indicating whether the newly created attractors are repellers or not
	toggleAttractorDirection(){
		if(disp.ReverseAttractorDirection){
			disp.ReverseAttractorDirection = false;
		}else{
			disp.ReverseAttractorDirection = true;
		}
	}
	
	// Setters
	set ShowControls(data){
		this.showControls = data;
	}
	
	set ShowHelp(data){
		this.showHelp = data;
	}
	
	set Fr(data){
		this.fr = data;
	}
	
	set Sliders(data){
		this.sliders = data;
	}
	
	set Buttons(data){
		this.buttons = data;
	}
	
	set ReverseAttractorDirection(data){
		this.reverseAttractorDirection = data;
	}
	
	// Getters
	
	get ShowControls(){
		return this.showControls;
	}
	
	get ShowHelp(){
		return this.showHelp;
	}
	
	get Fr(){
		return this.fr;
	}
	
	get Sliders(){
		return this.sliders;
	}
	
	get Buttons(){
		return this.buttons;
	}
	
	get SliderValues(){
		return [this.Sliders[0].value(), this.Sliders[1].value(), this.Sliders[2].value(), this.Sliders[3].value(), this.Sliders[4].value()]
	}
	
	get ReverseAttractorDirection(){
		return this.reverseAttractorDirection;
	}
}

// Declaring variables that are accessed throughout the script
let inp;
let disp;

// The first function called, used to get all the importating setting and properties set before the user interacts
function setup() {
	inp =  new Input();
	disp = new Display();
	document.getElementById("header").style.zIndex = "1";
	let scene = createCanvas(window.innerWidth, window.innerHeight);
	scene.id('cnvs');
	document.body.style.margin = 0;
	document.getElementById('cnvs').style.padding = 0;
	document.body.style.overflow = 'hidden';
	document.addEventListener('mousedown', function(e) {
			inp.ElementClicked = e.target.id;
		}, false);
	document.onkeydown = function(evt) {
		evt = evt || window.event;
		if (evt.keyCode == 27) {
			transitionToHomepage();
			disp.resetSliders();
			inp.Particles = [];
			inp.Attractors = [];
		}
	};
	blendMode(ADD);
	imageMode(CENTER);
	frameRate(60);
	background(0);
}

// Function called once per frame
function draw() {
  clear();
  background(0);
  disp.update();
  inp.updateObjects();
}

// A global function called when any of the mouse buttons are pressed
function mousePressed(){
	inp.Pos1 = createVector(mouseX, mouseY);
}

// A global function called when any of the mouse buttons that are held, are suddenly released
function mouseReleased(){
	inp.Pos2 = createVector(mouseX, mouseY);
	if(inp.ElementClicked == 'cnvs'){ inp.PushNewParticle = new Particle(inp.Pos1.x, inp.Pos1.y, 0, 0, inp.calculateVelocity(), disp.SliderValues); }
}

// A global function called everytime the browser window is resized
function windowResized() {
	resizeCanvas(window.innerWidth, window.innerHeight);
	disp.Buttons[0].position(window.innerWidth/2- 50,15);
	disp.Buttons[1].position(window.innerWidth/2 + 50, 15);
}

// A global function called everytime a key is pressed
function keyTyped() {
	inp.keyboardInput(key);
}

// Function used to transition from the home page to the scene
function transitionToGame(){
	document.getElementById("header").style.transition = "all 2s";
	document.getElementById("header").style.marginLeft = "-100%";
	inp.GameHasStarted = true;
}

// Function used to transition from the scene back to the home page
function transitionToHomepage(){
	document.getElementById("header").style.transition = "all 2s";
	document.getElementById("header").style.marginLeft = "0";
	inp.GameHasStarted = false;
}