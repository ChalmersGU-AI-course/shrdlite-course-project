# Add global things here
#window.init = init
PUZZLE_SIZE = 4
TILE_WIDTH = 64
TEXT_MAR = 25
pieces = [1..(PUZZLE_SIZE*PUZZLE_SIZE-1)].concat [0]
canvas = null
stage = null
mouse = null

window.init = ->
  setCanvas()
  initPuzzle()

  
setCanvas = ->
  canvas = document.getElementById("canvas")
  stage = canvas.getContext("2d")
  canvas.width = TILE_WIDTH*PUZZLE_SIZE
  canvas.height = TILE_WIDTH*PUZZLE_SIZE
  canvas.style.border = "1px solid black"
  canvas.onmousedown = onPuzzleClick
  
initPuzzle = ->
  shuffleArray()
  stage.strokeStyle = "black"
  stage.font = "20px arial"
  stage.strokeRect(0, 0, PUZZLE_SIZE*TILE_WIDTH, PUZZLE_SIZE*TILE_WIDTH)
  drawText()

drawText = ->
  for i in [0..PUZZLE_SIZE]
      for j in [0..PUZZLE_SIZE]
        y = i*TILE_WIDTH
        x = j*TILE_WIDTH
        idx = (i*PUZZLE_SIZE + j)
        stage.fillStyle = "white"
        stage.fillRect(x+2, y+2, x+TILE_WIDTH-2, y+TILE_WIDTH-2)
        stage.fillStyle = "black"
        stage.strokeRect(x, y, x+TILE_WIDTH, y+TILE_WIDTH)
        if pieces[idx] != 0
          stage.fillText("#{pieces[idx]}", x+TEXT_MAR, y+TEXT_MAR)
  stage.fillText("#{nyDistance()}", 6, 18)

shuffleArray = ->
  x = PUZZLE_SIZE-1
  y = PUZZLE_SIZE-1
  for i in [1..1337]
    direction = parseInt(Math.random()*4)
    if direction == 0 # up
      if y != 0
        swapCoordinates(y-1, x, y, x)
        y--
    else if direction == 1 # down
      if y != PUZZLE_SIZE-1
        swapCoordinates(y+1, x, y, x)
        y++
    else if direction == 2 # left
      if x != 0
        swapCoordinates(y, x-1, y, x)
        x--
    else if direction == 3 # right
      if x != PUZZLE_SIZE-1
        swapCoordinates(y, x+1, y, x)
        x++
  return 0

onPuzzleClick = (e) ->
  x = e.layerX//TILE_WIDTH
  y = e.layerY//TILE_WIDTH
  x0 = pieces.indexOf(0)%PUZZLE_SIZE
  y0 = pieces.indexOf(0)//PUZZLE_SIZE
  idx = y*PUZZLE_SIZE+x
  idx0 = y0*PUZZLE_SIZE+x0
  if (Math.abs(x-x0) + Math.abs(y-y0)) == 1
    [pieces[idx], pieces[idx0]] = [pieces[idx0], pieces[idx]]
    drawText()
    if isFinished()
      alert "Victory!"
      
isFinished = ->
  for y in [0..PUZZLE_SIZE-1]
    for x in [0..PUZZLE_SIZE-1]
      idx = y*PUZZLE_SIZE+x
      if pieces[idx] != (idx + 1) and pieces[idx] != 0
        return false
  return true
  
nyDistance = ->
  sum = 0
  for y in [0..PUZZLE_SIZE-1]
    for x in [0..PUZZLE_SIZE-1]
      idx = y*PUZZLE_SIZE+x
      if pieces[idx] != 0
        y0 = (pieces[idx]-1)//PUZZLE_SIZE
        x0 = (pieces[idx]-1)%PUZZLE_SIZE
        sum = sum + Math.abs(x0-x) + Math.abs(y0-y)
      else
        sum = sum + Math.abs(PUZZLE_SIZE-1-x) + Math.abs(PUZZLE_SIZE-1-y)
  return sum

swapCoordinates = (x1, y1, x2, y2) ->
  idx = y1*PUZZLE_SIZE+(x1)
  idx2 = y2*PUZZLE_SIZE+x2
  [pieces[idx], pieces[idx2]] = [pieces[idx2], pieces[idx]]
