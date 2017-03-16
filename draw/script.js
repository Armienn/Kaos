function getEl(id){
	return document.getElementById(id)
}

//getEl("output").innerHTML = "Jürgen Rattenfänger"

var canvas = getEl("canvas")
var context = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

window.onresize = function(){
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	draw()
}

function draw(){
	context.fillStyle = "black"
	context.fillRect(0,0,canvas.width,canvas.height)
}

var mouseDown = false
window.onmousedown = function(){
	mouseDown = true
}
window.onmouseup = function(){
	mouseDown = false
}

window.onmousemove = function(event){
	context.fillStyle = "pink"
	if(mouseDown)
		context.fillRect(event.x, event.y, 3, 3)
}


draw()