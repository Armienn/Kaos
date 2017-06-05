"use strict"
var gameSettings = {
	updateInterval: 20,
	boardWidth: 1,
	boardHeight: 1,
	ballSize: 0.025,
	playerWidth: 0.025,
	playerHeight: 0.1,
	playerOffset: 0.05,
	playerMaxSpeed: 0.01
}
var gameState
var lastStateUpdate = new Date()
var gameInputs = {
	forward: new GameInput("ArrowUp"),
	backward: new GameInput("ArrowDown"),
	left: new GameInput("ArrowLeft"),
	right: new GameInput("ArrowRight")
}
var scale = 10

window.onload = () => {
	var canvas = document.getElementById("canvas")
	var context = canvas.getContext("2d")

	function draw() {
		if (sizeChanged) {
			sizeChanged = false
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
			var horisontalRatio = canvas.width / gameSettings.boardWidth
			var verticalRatio = canvas.height / gameSettings.boardHeight
			scale = Math.min(horisontalRatio, verticalRatio)
		}
		context.fillStyle = "black"
		context.fillRect(0, 0, canvas.width, canvas.height)
		var delta = (new Date().getTime() - lastStateUpdate.getTime()) / gameSettings.updateInterval
		for (var i in gameState.objects)
			drawObject(gameState.objects[i], context, delta)
		requestAnimationFrame(draw)
	}

	var sizeChanged = true
	window.onresize = function () { sizeChanged = true }
	initialise()
	setInterval(updateState, gameSettings.updateInterval)
	requestAnimationFrame(draw)
}

function initialise() {
	gameState = {}
	gameState.objects = []

	gameState.leftPlayer = new GameObject()
	gameState.leftPlayer.position = new Vector(gameSettings.playerOffset, gameSettings.boardHeight / 2)
	gameState.leftPlayer.draw = function (context) {
		context.fillStyle = "white"
		context.fillRect(-gameSettings.playerWidth / 2, -gameSettings.playerHeight / 2, gameSettings.playerWidth, gameSettings.playerHeight)
	}
	gameState.objects.push(gameState.leftPlayer)
	gameState.leftScore = 0

	gameState.rightPlayer = new GameObject()
	gameState.rightPlayer.position = new Vector(gameSettings.boardWidth - gameSettings.playerOffset, gameSettings.boardHeight / 2)
	gameState.rightPlayer.draw = function (context) {
		context.fillStyle = "white"
		context.fillRect(-gameSettings.playerWidth / 2, -gameSettings.playerHeight / 2, gameSettings.playerWidth, gameSettings.playerHeight)
	}
	gameState.objects.push(gameState.rightPlayer)
	gameState.rightScore = 0

	gameState.ball = new GameObject()
	gameState.ball.position = new Vector(gameSettings.boardWidth / 2, gameSettings.boardHeight / 2)
	gameState.ball.draw = function (context) {
		context.fillStyle = "white"
		context.fillRect(-gameSettings.ballSize / 2, -gameSettings.ballSize / 2, gameSettings.ballSize, gameSettings.ballSize)
	}
	gameState.objects.push(gameState.ball)
}

function GameObject() {
	this.position = new Vector()
	this.velocity = new Vector()
	this.rotation = 0
	this.rotationalVelocity = 0
	this.friction = 0.3
	this.rotationalFriction = 0.05
	this.draw = function (context) {
		context.fillStyle = "blue"
		context.fillRect(-5, -5, 10, 10)
	}
}

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x
		this.y = y
	}

	add(vector) {
		this.x += vector.x
		this.y += vector.y
		return this
	}

	multiply(factor) {
		this.x = this.x * factor
		this.y = this.y * factor
		return this
	}

	rotate(angle) {
		var x = this.x
		this.x = x * Math.cos(angle) - this.y * Math.sin(angle)
		this.y = x * Math.sin(angle) + this.y * Math.cos(angle)
		return this
	}

	lengthSquared() {
		return this.x * this.x + this.y * this.y
	}

	unitVector() {
		var length = this.length()
		if (length !== 0) {
			this.x = this.x / length
			this.y = this.y / length
		}
		return this
	}

	length() {
		if (this.x === 0 && this.y === 0)
			return 0
		return Math.sqrt(this.lengthSquared())
	}

	copy() {
		return new Vector(this.x, this.y)
	}

	clip(minX, minY, maxX, maxY, wrap = false) {
		this.x = clip(this.x, minX, maxX, wrap)
		this.y = clip(this.y, minY, maxY, wrap)
		return this
	}

	set(x, y) {
		this.x = x
		this.y = y
	}
}

function clip(value, min, max, wrap = false) {
	if (max <= min)
		throw "Error"
	if (!wrap) {
		if (value < min)
			value = min
		else if (max <= value)
			value = max
		return value
	}
	while (value < min)
		value += max - min
	while (max <= value)
		value -= max - min
	return value
}

function drawObject(thing, context, delta) {
	context.save()
	var vector = thing.velocity.copy().multiply(delta).add(thing.position).multiply(scale)
	context.translate(Math.floor(vector.x), Math.floor(vector.y))
	context.rotate(thing.rotation + thing.rotationalVelocity * delta)
	context.scale(scale, scale)
	thing.draw(context)
	context.restore()
}

function updateState() {
	updatePositions(gameState.objects)
	gameLogic()
	updatePhysics([]) // gameState.objects)
	lastStateUpdate = new Date()
}

function gameLogic(){
	updateFromInputs()
	if(gameState.leftPlayer.position.y <= gameSettings.playerHeight / 2){
		gameState.leftPlayer.position.y = gameSettings.playerHeight / 2
		if(gameState.leftPlayer.velocity.y < 0 )
			gameState.leftPlayer.velocity.y = 0
	}
	else if(gameSettings.boardHeight - gameSettings.playerHeight / 2 <= gameState.leftPlayer.position.y){
		gameState.leftPlayer.position.y = gameSettings.boardHeight - gameSettings.playerHeight / 2
		if(0 < gameState.leftPlayer.velocity.y )
			gameState.leftPlayer.velocity.y = 0
	}
	if(gameState.rightPlayer.position.y <= gameSettings.playerHeight / 2){
		gameState.rightPlayer.position.y = gameSettings.playerHeight / 2
		if(gameState.rightPlayer.velocity.y < 0 )
			gameState.rightPlayer.velocity.y = 0
	}
	else if(gameSettings.boardHeight - gameSettings.playerHeight / 2 <= gameState.rightPlayer.position.y){
		gameState.rightPlayer.position.y = gameSettings.boardHeight - gameSettings.playerHeight / 2
		if(0 < gameState.rightPlayer.velocity.y )
			gameState.rightPlayer.velocity.y = 0
	}
	//ball collision and stuff
}

function updateFromInputs(){
	gameState.leftPlayer.velocity.y = 0
	if (gameInputs.forward.pressed)
		gameState.leftPlayer.velocity.y -= gameSettings.playerMaxSpeed
	if (gameInputs.backward.pressed)
		gameState.leftPlayer.velocity.y += gameSettings.playerMaxSpeed
}

function updatePositions(objects) {
	for (var i in objects) {
		var object = objects[i]
		object.position.add(object.velocity)
		object.rotation += object.rotationalVelocity
		object.position.clip(0, 0, gameSettings.boardWidth, gameSettings.boardHeight)
	}
}

function updatePhysics(objects) {
	for (var i in objects) {
		var object = objects[i]
		var frictionAcceleration = object.velocity.copy().unitVector().multiply(object.friction)
		if (object.velocity.lengthSquared < frictionAcceleration.lengthSquared)
			object.velocity.set(0, 0)
		else
			object.velocity.add(frictionAcceleration.multiply(-1))
		if (0 < object.rotationalVelocity) {
			object.rotationalVelocity -= object.rotationalFriction
			if (object.rotationalVelocity < 0)
				object.rotationalVelocity = 0
		} else if (object.rotationalVelocity < 0) {
			object.rotationalVelocity += object.rotationalFriction
			if (0 < object.rotationalVelocity)
				object.rotationalVelocity = 0
		}
	}
}

function GameInput(key) {
	this.key = key
	this.pressed = false
}

window.addEventListener("keydown", function (event) {
	if (event.defaultPrevented)
		return
	for (var i in gameInputs) {
		if (event.key == gameInputs[i].key) {
			gameInputs[i].pressed = true
			event.preventDefault()
		}
	}
}, true)

window.addEventListener("keyup", function (event) {
	if (event.defaultPrevented)
		return
	for (var i in gameInputs) {
		if (event.key == gameInputs[i].key) {
			gameInputs[i].pressed = false
			event.preventDefault()
		}
	}
}, true)