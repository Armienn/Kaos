function getEl(id){
	return document.getElementById(id)
}

var lineSize = 3
var lineColor = "yellow"

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
window.onmousedown = function(event){
	mouseDown = true
	context.beginPath()
	context.moveTo(event.x, event.y)
	context.lineTo(event.x, event.y)
	context.lineWidth = lineSize
	context.strokeStyle = lineColor
	context.lineCap = "round"
	context.stroke()
	//context.fillStyle = lineColor
    //context.fillRect(Math.floor(event.x-lineSize/2), Math.floor(event.y-lineSize/2), lineSize, lineSize)
    lastX = event.x
    lastY = event.y
}
window.onmouseup = function(event){
	mouseDown = false
    lastX = -1
    lastY = -1
}

var lastX = -1
var lastY = -1
window.onmousemove = function(event){
	if(mouseDown){
        //context.fillStyle = lineColor
		//context.fillRect(Math.floor(event.x-lineSize/2), Math.floor(event.y-lineSize/2), lineSize, lineSize)
        if(lastX >= 0 && lastY >= 0){
            context.beginPath()
            context.moveTo(lastX, lastY)
            context.lineTo(event.x, event.y)
            context.lineWidth = lineSize
            context.strokeStyle = lineColor
			context.lineCap = "round"
            context.stroke()
        }
        lastX = event.x
        lastY = event.y
    }
}

window.onmousewheel = (event)=>{
    if(event.deltaY > 0)
        lineSize--
    else
        lineSize++
}

//draw()

class Game {
    constructor(width, height, wrapWorld = true, aliveRatio = 0){
        this.width = width
        this.height = height
        this.wrapWorld = wrapWorld
        this.setupGrid(aliveRatio)
    }

    setupGrid(aliveRatio = 0){
        this.grid = []
        for(var i = 0; i < this.width; i++){
            this.grid[i] = []
            for(var j = 0; j < this.height; j++){
                this.grid[i][j] = 0
                if(aliveRatio && aliveRatio > Math.random())
                    this.grid[i][j] = 1
            }
        }
    }

    updateState(){
        var newGrid = []
        for(var i = 0; i < this.width; i++){
            newGrid[i] = []
            for(var j = 0; j < this.height; j++)
                newGrid[i][j] = this.newStateFor(i,j)
        }
        this.grid = newGrid
    }

    newStateFor(x, y){
        var count = this.countAdjacent(x,y)
        if(this.grid[x][y]){
            if(count == 2 || count == 3)
                return 1
        }
        else
            if(count == 3)
                return 1
        return 0
    }

    countAdjacent(x, y){
        var count = 0
        this.forAdjacent(x,y, (state)=>{
            if(state)
                count++
        })
        return count
    }

    forAdjacent(x, y, callback){
        for(var i = x-1; i<=x+1; i++)
            for(var j = y-1; j<=y+1; j++){
                if(i==x && j==y)
                    continue
                if(i < 0 || j < 0 || this.width <= i || this.height <= j){
                    if(this.wrapWorld){
                        var wrapI = i<0 ? this.width-1 : (this.width <= i ? 0 : i)
                        var wrapJ = j<0 ? this.height-1 : (this.height <= j ? 0 : j)
                        callback(this.grid[wrapI][wrapJ])
                    }
                    else
                        callback(0)
                }
                else
                    callback(this.grid[i][j])
            }
    }

    run(interval = 1000, callback = undefined){
        if(this.intervalId)
            clearInterval(this.intervalId)
        this.intervalId = setInterval(()=>{
            this.updateState()
            if(callback)
                callback()
        },interval)
    }

    stop(){
        clearInterval(this.intervalId)
        this.intervalId = undefined
    }
}

class GameDisplay {
    constructor(game, options = {}){
        this.game = game
        this.cellSize = options.cellSize || 5
    }

    drawGrid(){
        for(var i = 0; i < this.game.width; i++){
            for(var j = 0; j < this.game.height; j++){
                context.fillStyle = this.game.grid[i][j] ? "black" : "white"
            	context.fillRect(i*this.cellSize,j*this.cellSize,this.cellSize,this.cellSize)
            }
        }
    }
}

var game = new Game(50, 50, true, 0.2)
var display = new GameDisplay(game)

game.run(100, ()=>{display.drawGrid()})