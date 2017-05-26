function getEl(id){
	return document.getElementById(id)
}

var canvas = getEl("canvas")
var context = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

window.onresize = function(){
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
}

window.onmousedown = function(event){
    var coordX = Math.floor(event.x/display.cellSize)
    var coordY = Math.floor(event.y/display.cellSize)
    if(coordX<game.width && coordY<game.height){
        game.grid[coordX][coordY]++
        if(game.factions < game.grid[coordX][coordY])
            game.grid[coordX][coordY] = 0
    }
    display.drawGrid()
}

class Game {
    constructor(options = {}){
        this.spawnPopulations = options.spawnPopulations || [3]
        this.survivalPopulations = options.survivalPopulations || [2,3]
        this.factions = options.factions || 3
        this.width = options.width || 50
        this.height = options.height || 50
        this.borderMode = options.borderMode !== undefined ? options.borderMode : "wrap"
        this.setupGrid(options.aliveRatio || 0.2)
    }

    setupGrid(aliveRatio = 0){
        this.grid = []
        for(var i = 0; i < this.width; i++){
            this.grid[i] = []
            for(var j = 0; j < this.height; j++){
                this.grid[i][j] = 0
                if(aliveRatio && aliveRatio > Math.random())
                    this.grid[i][j] = 1 + Math.floor(Math.random()*this.factions)
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
        var counts = this.countAdjacent(x,y)
        var count = 0
        var majorities = [0]
        var max = 0
        for(var i=0; i<this.factions; i++){
            count += counts[i]
            if(counts[i]>max){
                max = counts[i]
                majorities = [i]
            }
            else if(counts[i]==max){
                majorities.push(i)
            }
        }
        if(this.grid[x][y]){
            if(this.survivalPopulations.indexOf(count) !== -1)
                return this.selectRandom(majorities)+1
        }
        else
            if(this.spawnPopulations.indexOf(count) !== -1)
                return this.selectRandom(majorities)+1
        return 0
    }

    selectRandom(list){
        return list[Math.floor(Math.random()*list.length)]
    }

    countAdjacent(x, y){
        var counts = []
        for(var i=0; i<this.factions; i++)
            counts[i] = 0
        this.forAdjacent(x,y, (state)=>{
            if(state)
                counts[state-1]++
        })
        return counts
    }

    forAdjacent(x, y, callback){
        for(var i = x-1; i<=x+1; i++)
            for(var j = y-1; j<=y+1; j++){
                if(i==x && j==y)
                    continue
                if(i < 0 || j < 0 || this.width <= i || this.height <= j){
                    if(this.borderMode == "wrap"){
                        var wrapI = i<0 ? this.width-1 : (this.width <= i ? 0 : i)
                        var wrapJ = j<0 ? this.height-1 : (this.height <= j ? 0 : j)
                        callback(this.grid[wrapI][wrapJ])
                    }
                    else if(this.borderMode > 0)
                        callback(this.borderMode)
                    else
                        callback(0)
                }
                else
                    callback(this.grid[i][j])
            }
    }

    start(interval = 1000, callback = undefined){
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
        var colours = ["white"]
        for(var i=0; i<this.game.factions; i++){
            var rgb = GameDisplay.hsvToRgb(GameDisplay.integerToZeroToOneMap(i), 1, 0.8)
            colours[i+1] = "rgb("+Math.floor(rgb[0])+","+Math.floor(rgb[1])+","+Math.floor(rgb[2])+")"
        }
        if(this.game.factions == 1)
            colours[1] = "black"
        for(var i = 0; i < this.game.width; i++){
            for(var j = 0; j < this.game.height; j++){
                context.fillStyle = colours[this.game.grid[i][j]]
            	context.fillRect(i*this.cellSize,j*this.cellSize,this.cellSize,this.cellSize)
            }
        }
    }

    static integerToZeroToOneMap(n){
        if(n<1) return 0
        var m = GameDisplay.weirdRoundToPowerOfTwo(n)
        return (1+2*(n - m/2))/m
    }

    static weirdRoundToPowerOfTwo(n){
        return Math.pow(2,Math.floor(Math.log2(n*2)))
    }

    static hsvToRgb(h, s, v) {
        var r, g, b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [ r * 255, g * 255, b * 255 ];
        }
}

function showBar(){
	getEl("bar").style.display = "block"
}

function hideBar(){
	getEl("bar").style.display = "none"
}

function reset(){
    game.stop()
    game = new Game({
        width: +getEl("width").value,
        height: +getEl("height").value,
        factions: +getEl("factions").value,
        borderMode: "wrap",
        aliveRatio: +getEl("aliveRatio").value})
    display = new GameDisplay(game, {cellSize: +getEl("cellSize").value})
    display.drawGrid()
}

function autosize(){
    var width = Math.floor(window.innerWidth/display.cellSize)
    var height = Math.floor(window.innerHeight/display.cellSize)
    getEl("width").value = width
    getEl("height").value = height
    reset()
}

function run(interval = 100){
    game.start(interval, ()=>{display.drawGrid()})
}

var game = new Game()
var display = new GameDisplay(game)

window.onload = ()=>{
    autosize()
    run()
}