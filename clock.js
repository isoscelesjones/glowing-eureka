
/* Clock Object ********************************************/

function Clock() {
	this.updateTime();
}

Clock.prototype.updateTime = function() {
	this.time = new Date();
	this.extractTime();
}

Clock.prototype.extractTime = function() {
	this.hour = this.time.getHours();
	this.minute = this.time.getMinutes();
	this.second = this.time.getSeconds();
	this.amPm = this.hour >= 12 ? 'PM' : 'AM';

	// Convert to 12 hour clock, make sure midnight shows up as 12 instead of 00
	this.hour = (this.hour == 0 || this.hour == 12) ? 12 : this.hour %= 12;
}


/* ClockFace Object ****************************************/

const SECOND_LED_ANGLE = Math.PI / 30.0;

function ClockFace(draw_ctx) {
	this.ctx = draw_ctx;
}

ClockFace.prototype.clearCtx = function() {
	// draw my clock stuff on top of existing images
	this.ctx.globalCompositeOperation = 'source-over';
	// clear the canvas
	this.ctx.clearRect(0, 0, this.size, this.size);
}

ClockFace.prototype.setSize = function(size) {
	this.size = size;
	this.scaleConsts();
}

ClockFace.prototype.scaleConsts = function() {
	this.centerPos = this.size / 2.0;
	this.faceRadius = this.centerPos * 0.85;
	this.faceWidth = this.centerPos * 0.01;
	this.innerRadius = this.centerPos * 0.75;
	this.ctx.shadowColor = '#111';
	this.ctx.shadowBlur = this.centerPos * 0.025;
	this.ctx.shadowOffsetX = this.faceWidth;
	this.ctx.shadowOffsetY = this.faceWidth;
}

ClockFace.prototype.roundRect = function (x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  this.ctx.moveTo(x + radius, y);
  this.ctx.arcTo(x + width, y, x + width, y + height, radius);
  this.ctx.arcTo(x + width, y + height, x, y + height, radius);
  this.ctx.arcTo(x, y + height, x, y, radius);
  this.ctx.arcTo(x, y, x + width, y, radius);
  this.ctx.closePath();
  return this;
}

ClockFace.prototype.drawFace = function() {

	// Nice round clock face, or "Time Face", as I like to call it
	this.ctx.fillStyle = '#333';
	this.ctx.beginPath();
  this.ctx.arc(this.centerPos, this.centerPos, this.faceRadius, 0, Math.PI * 2.0, false);
	this.ctx.fill();

	// rectangle for the time, or "Time Rectangle", as I like to call it
	this.ctx.fillStyle = '#550000';
	this.ctx.beginPath();
	this.roundRect(
		this.centerPos - this.innerRadius/1.20,
		this.centerPos - this.innerRadius/6,
		this.innerRadius * 1.65,
	  this.innerRadius/2.5, 20);
	this.ctx.fill();
}

ClockFace.prototype.drawTime = function(clock) {
	//measureText could probably help here.
	fontSize = this.centerPos / 5.0;
	this.ctx.fillStyle = '#ee0000';
	this.ctx.font = fontSize + 'px Orbitron';
	this.ctx.textAlign = 'center';
	//template literals yay!
	this.ctx.fillText(
		`${clock.hour.toString().length == 1?'0'+clock.hour:clock.hour}:${clock.minute.toString().length == 1?'0'+clock.minute:clock.minute} ${clock.amPm}`,
		this.centerPos,
		this.centerPos + fontSize/2);

	for (var i=0; i <= 59; i++) {
		var angle = i * SECOND_LED_ANGLE - Math.PI / 2.0;
		var x = this.centerPos + this.innerRadius * Math.cos(angle);
		var y = this.centerPos + this.innerRadius * Math.sin(angle);

		// Off/On LEDs
		this.ctx.fillStyle = (i <= clock.second) ? '#ee0000' : '#550000';
		this.ctx.beginPath();
	  this.ctx.arc(x, y, this.faceWidth * 2.0, 0, Math.PI * 2.0, false);
		this.ctx.fill();
	}
}

/******************************************************/
/******************************************************/
/******************************************************/

var canvas;
var ctx;
var clockFace;
var boxWidth = 100;
var secondRad = Math.PI / 30.0;
var centerPos = 100;

function drawCurrent() {
	resize_to_window();

	clockFace.setSize(boxWidth);
	clockFace.clearCtx();

	var clock = new Clock();

	clockFace.drawFace();
	clockFace.drawTime(clock);

	// update animation before the browser repaints
	window.requestAnimationFrame(drawCurrent);
}

function resize_to_window() {
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;
	// if width is gt height, then height else width; then shrink it a bit.
	boxWidth = windowWidth > windowHeight ? windowHeight : windowWidth;
	boxWidth *= 0.95;

	ctx.canvas.style.width = window.boxWidth + 'px';
	ctx.canvas.style.height = window.boxWidth + 'px';

	ctx.canvas.width  = window.boxWidth * window.devicePixelRatio;
	ctx.canvas.height = window.boxWidth * window.devicePixelRatio;
	boxWidth *= window.devicePixelRatio;

	centerPos = boxWidth / 2.0;
}

function clock_init() {
	canvas = document.getElementById('royksoppclockbeta');
	ctx = canvas.getContext('2d');
	clockFace = new ClockFace(ctx);
	window.requestAnimationFrame(drawCurrent);
}
