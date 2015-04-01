# Add global things here
PUZZLE_SIZE = 3
TILE_WIDTH = 64
TEXT_MAR = 25
startPieces = [1..(PUZZLE_SIZE*PUZZLE_SIZE-1)].concat [0]
pieces = [1..(PUZZLE_SIZE*PUZZLE_SIZE-1)].concat [0]
canvas = null
stage = null
mouse = null

# "Enum" of the possible moves
# E.g: Move.LEFT
Move =
  LEFT: 1
  RIGHT:  2
  UP:   3
  DOWN: 4

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
  window.onkeypress = keyPressed
  
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
  stage.fillText("#{nyDist(pieces, startPieces)}", 6, 18)

keyPressed = (e) ->
  code = if e.keyCode then e.keyCode else e.which
  if code is 97
    document.getElementById("solution").innerHTML = "Trying to find solution"
    goalMoves = Astar(pieces, startPieces, nyDist, nextMoves, getNextState, equality) 
    if goalMoves != -1
      goalMoves = goalMoves.map(f)
      document.getElementById("solution").innerHTML = goalMoves.join(", ")
    else
      alert "Astar failed to find a solution!"

shuffleArray = ->
  x = PUZZLE_SIZE-1
  y = PUZZLE_SIZE-1
  for i in [1..1337]
    direction = parseInt(Math.random()*4)
    if direction == 0 # up
      if y != 0
        swapCoordinates(pieces, y-1, x, y, x)
        y--
    else if direction == 1 # down
      if y != PUZZLE_SIZE-1
        swapCoordinates(pieces, y+1, x, y, x)
        y++
    else if direction == 2 # left
      if x != 0
        swapCoordinates(pieces, y, x-1, y, x)
        x--
    else if direction == 3 # right
      if x != PUZZLE_SIZE-1
        swapCoordinates(pieces, y, x+1, y, x)
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

nextMoves = (currentState) ->
  possibleMoves = []
  blankIndex = currentState.indexOf(0)
  x = blankIndex%PUZZLE_SIZE
  y = blankIndex//PUZZLE_SIZE
  if x != PUZZLE_SIZE-1
    possibleMoves.push(Move.RIGHT)
  if x != 0
    possibleMoves.push(Move.LEFT)
  if y != PUZZLE_SIZE-1
    possibleMoves.push(Move.DOWN)
  if y != 0
    possibleMoves.push(Move.UP)
  return possibleMoves

# The heuristic function for the 15 puzzle game
# Returns the sum of the manhattan distance for all pieces
nyDist = (current, goal) ->
  sum = 0
  # Loop over all elements in current state
  for piece,i in current
    gIndex = goal.indexOf(piece)
    # Add the diff in x and the diff in y
    dx = (gIndex%PUZZLE_SIZE) - (i%PUZZLE_SIZE)
    dy = (gIndex//PUZZLE_SIZE) - (i//PUZZLE_SIZE)
    sum += (Math.abs(dx) + Math.abs(dy))
  return sum

equality = (state1, state2) ->
  for s,i in state1
    if s != state2[i]
      return false
  return true

getNextState = (state, move) ->
  newState = state.concat() # Copy/Clone the state
  blankIndex = newState.indexOf(0)
  switch move
    when Move.LEFT then swapIndex(newState, blankIndex, blankIndex - 1)
    when Move.RIGHT then swapIndex(newState, blankIndex, blankIndex + 1)
    when Move.UP then swapIndex(newState, blankIndex, blankIndex - PUZZLE_SIZE)
    when Move.DOWN then swapIndex(newState, blankIndex, blankIndex + PUZZLE_SIZE)
  return newState

swapIndex = (board, i1, i2) ->
  [board[i1], board[i2]] = [board[i2], board[i1]]

swapCoordinates = (board, x1, y1, x2, y2) ->
  idx = y1*PUZZLE_SIZE+(x1)
  idx2 = y2*PUZZLE_SIZE+x2
  swapIndex(board, idx, idx2)

f = (num) ->
  switch num
    when Move.LEFT then return "Left"
    when Move.RIGHT then return "Right"
    when Move.UP then return "Up"
    when Move.DOWN then return "Down"
    else return "Wat"