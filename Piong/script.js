"use strict"
var stateInterval = 100
var gameState
var lastStateUpdate = new Date()
var gameInputs = {
	forward: new GameInput("ArrowUp"),
	backward: new GameInput("ArrowDown"),
	left: new GameInput("ArrowLeft"),
	right: new GameInput("ArrowRight")
}

window.onload = ()=>{
	var canvas = document.getElementById("canvas")
	var context = canvas.getContext("2d")

	function draw(){
		if(sizeChanged){
			sizeChanged = false
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
		}
		context.fillStyle = "black"
		context.fillRect(0, 0, canvas.width, canvas.height)
		var delta = (new Date().getTime() - lastStateUpdate.getTime())/stateInterval
		for(var i in gameState.objects)
			drawObject(gameState.objects[i], context, delta)
		requestAnimationFrame(draw)
	}

	var sizeChanged = true
	window.onresize = function(){ sizeChanged = true }
	initialise()
	setInterval(updateState, stateInterval)
	requestAnimationFrame(draw)
}

function initialise(){
	gameState = {}
	gameState.objects = []
    gameState.playerLeft = new GameObject()
	gameState.playerLeft.draw = function(context){
		context.fillStyle = "white"
		context.fillRect(-20, -200, 40, 400)
	}
    gameState.objects.push(gameState.playerLeft)
    gameState.ball = new GameObject()
	gameState.ball.draw = function(context){
		context.fillStyle = "white"
		context.fillRect(-20, -20, 40, 40)
	}
    gameState.objects.push(gameState.ball)
}

function GameObject(){
	this.position = new Vector()
	this.velocity = new Vector()
	this.rotation = 0
	this.rotationalVelocity = 0
	this.friction = 0.3
	this.rotationalFriction = 0.05
	this.draw = function(context){
		context.fillStyle = "blue"
		context.fillRect(-5, -5, 10, 10)
	}
}

class Vector {
  constructor(x=0, y=0) {
		this.x = x
		this.y = y
  }

	add(vector){
		this.x += vector.x
		this.y += vector.y
		return this
	}

	multiply(factor){
		this.x = this.x * factor
		this.y = this.y * factor
		return this
	}

	rotate(angle){
		var x = this.x
		this.x = x * Math.cos(angle) - this.y * Math.sin(angle)
		this.y = x * Math.sin(angle) + this.y * Math.cos(angle)
		return this
	}

	lengthSquared(){
		return this.x*this.x + this.y*this.y
	}

	unitVector(){
		var length = this.length()
		if(length !== 0){
			this.x = this.x / length
			this.y = this.y / length
		}
		return this
	}
	
	length(){
		if(this.x === 0 && this.y === 0)
			return 0
		return Math.sqrt(this.lengthSquared())
	}

	copy(){
		return new Vector(this.x, this.y)
	}

	clip(minX, minY, maxX, maxY){
		this.x = clip(this.x, minX, maxX)
		this.y = clip(this.y, minY, maxY)
		return this
	}

	set(x, y){
		this.x = x
		this.y = y
	}
}

function clip(value, min, max){
	if(max <= min)
		throw "Error"
	while(value < min)
		value += max-min
	while(max <= value)
		value -= max-min
	return value
}

function drawObject(thing, context, delta){
	context.save()
	var vector = thing.velocity.copy().multiply(delta).add(thing.position)
	context.translate(Math.floor(vector.x), Math.floor(vector.y))
	context.rotate(thing.rotation + thing.rotationalVelocity*delta)
	thing.draw(context)
	context.restore()
}

function updateState(){
	for(var i in gameState.objects) {
		var thing = gameState.objects[i]
		thing.position.add(thing.velocity)
		thing.rotation += thing.rotationalVelocity
		thing.position.clip(0,0,500,500)
	}
	/*for(var i in gameState.randomObjects) {
		var thing = gameState.randomObjects[i]
		thing.velocity.x += (Math.random()*2) - 1
		thing.velocity.y += (Math.random()*2) - 1
		thing.rotationalVelocity += (Math.random()*0.4) - 0.2
	}*/
	var playerAcceleration = new Vector()
	playerAcceleration.y = 0
	if(gameInputs.forward.pressed)
		playerAcceleration.y = -10
	if(gameInputs.backward.pressed)
		playerAcceleration.y = +10
	//playerAcceleration.rotate(gameState.playerObject.rotation)
	gameState.playerLeft.velocity.add(playerAcceleration)
	//if(gameInputs.left.pressed)
	//	gameState.playerObject.rotationalVelocity -= 0.1
	//if(gameInputs.right.pressed)
	//	gameState.playerObject.rotationalVelocity += 0.1

	for(var i in gameState.objects){
		var thing = gameState.objects[i]
		/*var frictionAcceleration = thing.velocity.copy().unitVector().multiply(thing.friction)
		if(thing.velocity.lengthSquared < frictionAcceleration.lengthSquared)
			thing.velocity.set(0,0)
		else
			thing.velocity.add(frictionAcceleration.multiply(-1))*/
		/*if(0 < thing.rotationalVelocity){
			thing.rotationalVelocity -= thing.rotationalFriction
			if(thing.rotationalVelocity < 0)
				thing.rotationalVelocity = 0
		} else if (thing.rotationalVelocity < 0){
			thing.rotationalVelocity += thing.rotationalFriction
			if(0 < thing.rotationalVelocity)
				thing.rotationalVelocity = 0
		}*/
	}
	lastStateUpdate = new Date()
}

function GameInput(key){
	this.key = key
	this.pressed = false
}

window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented)
		return
	for(var i in gameInputs){
		if(event.key == gameInputs[i].key){
			gameInputs[i].pressed = true
			event.preventDefault()
		}
	}
}, true)

window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented)
		return
	for(var i in gameInputs){
		if(event.key == gameInputs[i].key){
			gameInputs[i].pressed = false
			event.preventDefault()
		}
	}
}, true)