"use strict"
var gameSettings = {
	updateInterval: 20,
	boardWidth: 1,
	boardHeight: 1,
	ballSize: 0.025,
	playerWidth: 0.025,
	playerHeight: 0.1,
	playerOffset: 0.05,
	playerMaxSpeed: 0.015,
	ballMaxSpeed: 0.05,
	bounceFactor: 1.05,
	curveFactor: 0.1
}
var gameState
var lastStateUpdate = new Date()
var gameInputs = {
	rightUp: new GameInput("ArrowUp"),
	rightDown: new GameInput("ArrowDown"),
	leftUp: new GameInput("w"),
	leftDown: new GameInput("s")
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
	gameState.leftPlayer.draw = function (context) {
		context.fillStyle = "white"
		context.fillRect(-gameSettings.playerWidth / 2, -gameSettings.playerHeight / 2, gameSettings.playerWidth, gameSettings.playerHeight)
	}
	gameState.objects.push(gameState.leftPlayer)
	gameState.leftScore = 0
	gameState.leftScoreDisplay = new GameObject()
	gameState.leftScoreDisplay.draw = function (context) {
		context.fillStyle = "white"
		context.font="20px Georgia"
		context.fillText("asfd"+gameState.leftScore, gameState.boardWidth/4, gameState.boardHeight/10)
	}
	gameState.objects.push(gameState.leftScoreDisplay)
	gameState.leftScore = 0

	gameState.rightPlayer = new GameObject()
	gameState.rightPlayer.draw = function (context) {
		context.fillStyle = "white"
		context.fillRect(-gameSettings.playerWidth / 2, -gameSettings.playerHeight / 2, gameSettings.playerWidth, gameSettings.playerHeight)
	}
	gameState.objects.push(gameState.rightPlayer)
	gameState.rightScore = 0
	gameState.rightScoreDisplay = new GameObject()
	gameState.rightScoreDisplay.draw = function (context) {
		context.fillStyle = "white"
		context.fillText(gameState.leftScore, gameState.boardWidth/4, gameState.boardHeight/10)
	}
	gameState.objects.push(gameState.rightScoreDisplay)

	gameState.ball = new GameObject()
	gameState.ball.draw = function (context) {
		context.fillStyle = "white"
		context.fillRect(-gameSettings.ballSize / 2, -gameSettings.ballSize / 2, gameSettings.ballSize, gameSettings.ballSize)
	}
	gameState.objects.push(gameState.ball)
	resetPositions()
}

function resetPositions(direction = 1) {
	gameState.leftPlayer.position = new Vector(gameSettings.playerOffset, gameSettings.boardHeight / 2)
	gameState.rightPlayer.position = new Vector(gameSettings.boardWidth - gameSettings.playerOffset, gameSettings.boardHeight / 2)
	gameState.ball.position = new Vector(gameSettings.boardWidth / 2, gameSettings.boardHeight / 2)
	gameState.ball.velocity = new Vector(0.01 * direction, 0)
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

function gameLogic() {
	updateFromInputs()
	if (gameState.leftPlayer.position.y <= gameSettings.playerHeight / 2) {
		gameState.leftPlayer.position.y = gameSettings.playerHeight / 2
		if (gameState.leftPlayer.velocity.y < 0)
			gameState.leftPlayer.velocity.y = 0
	}
	else if (gameSettings.boardHeight - gameSettings.playerHeight / 2 <= gameState.leftPlayer.position.y) {
		gameState.leftPlayer.position.y = gameSettings.boardHeight - gameSettings.playerHeight / 2
		if (0 < gameState.leftPlayer.velocity.y)
			gameState.leftPlayer.velocity.y = 0
	}
	if (gameState.rightPlayer.position.y <= gameSettings.playerHeight / 2) {
		gameState.rightPlayer.position.y = gameSettings.playerHeight / 2
		if (gameState.rightPlayer.velocity.y < 0)
			gameState.rightPlayer.velocity.y = 0
	}
	else if (gameSettings.boardHeight - gameSettings.playerHeight / 2 <= gameState.rightPlayer.position.y) {
		gameState.rightPlayer.position.y = gameSettings.boardHeight - gameSettings.playerHeight / 2
		if (0 < gameState.rightPlayer.velocity.y)
			gameState.rightPlayer.velocity.y = 0
	}
	//ball collision and stuff
	var ballCorners = getCorners(gameState.ball.position.x, gameState.ball.position.y, gameSettings.ballSize, gameSettings.ballSize)
	var leftCorners = getCorners(gameState.leftPlayer.position.x, gameState.leftPlayer.position.y, gameSettings.playerWidth, gameSettings.playerHeight)
	var rightCorners = getCorners(gameState.rightPlayer.position.x, gameState.rightPlayer.position.y, gameSettings.playerWidth, gameSettings.playerHeight)
	if (collides(ballCorners, leftCorners)) {
		gameState.ball.velocity.x *= -gameSettings.bounceFactor
		if (gameState.ball.velocity.x < -gameSettings.ballMaxSpeed)
			gameState.ball.velocity.x = -gameSettings.ballMaxSpeed
		if (gameSettings.ballMaxSpeed < gameState.ball.velocity.x)
			gameState.ball.velocity.x = gameSettings.ballMaxSpeed
		gameState.ball.velocity.y += gameSettings.curveFactor * (gameState.ball.position.y - gameState.leftPlayer.position.y)
	}
	else if (collides(ballCorners, rightCorners)) {
		gameState.ball.velocity.x *= -gameSettings.bounceFactor
		if (gameState.ball.velocity.x < -gameSettings.ballMaxSpeed)
			gameState.ball.velocity.x = -gameSettings.ballMaxSpeed
		if (gameSettings.ballMaxSpeed < gameState.ball.velocity.x)
			gameState.ball.velocity.x = gameSettings.ballMaxSpeed
		gameState.ball.velocity.y += gameSettings.curveFactor * (gameState.ball.position.y - gameState.rightPlayer.position.y)
	}
	if (gameState.ball.position.y < gameSettings.ballSize / 2 || gameSettings.boardHeight - gameSettings.ballSize / 2 < gameState.ball.position.y)
		gameState.ball.velocity.y *= -1
	if (gameState.ball.position.x <= 0){
		gameSettings.leftScore++
		resetPositions()
	}
	else if (gameSettings.boardHeight <= gameState.ball.position.x){
		gameSettings.rightScore++
		resetPositions()
	}
}

function getCorners(midX, midY, width, height) {
	return {
		topRight: new Vector(midX + width / 2, midY - height / 2),
		bottomRight: new Vector(midX + width / 2, midY + height / 2),
		bottomLeft: new Vector(midX - width / 2, midY + height / 2),
		topLeft: new Vector(midX - width / 2, midY - height / 2)
	}
}

function pointIsWithin(point, corners) {
	return corners.topLeft.x <= point.x && point.x <= corners.bottomRight.x &&
		corners.topLeft.y <= point.y && point.y <= corners.bottomRight.y
}

function collides(boxA, boxB) {
	return pointIsWithin(boxA.topRight, boxB) || pointIsWithin(boxA.bottomRight, boxB) || pointIsWithin(boxA.bottomLeft, boxB) || pointIsWithin(boxA.topLeft, boxB)
}

function updateFromInputs() {
	gameState.leftPlayer.velocity.y = 0
	if (gameInputs.leftUp.pressed)
		gameState.leftPlayer.velocity.y -= gameSettings.playerMaxSpeed
	if (gameInputs.leftDown.pressed)
		gameState.leftPlayer.velocity.y += gameSettings.playerMaxSpeed
	gameState.rightPlayer.velocity.y = 0
	if (gameInputs.rightUp.pressed)
		gameState.rightPlayer.velocity.y -= gameSettings.playerMaxSpeed
	if (gameInputs.rightDown.pressed)
		gameState.rightPlayer.velocity.y += gameSettings.playerMaxSpeed
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