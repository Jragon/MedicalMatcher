var MedicalMatcher = MedicalMatcher || {};

MedicalMatcher.Board = function(state, rows, columns, howManyDifferentTypesOfBlocksAreThere){
  this.state = state;
  this.rows = rows;
  this.cols = columns;
  this.types = howManyDifferentTypesOfBlocksAreThere;
  
  this.grid = [];
  this.reserveGrid = [];
  
  var i, j;
  for (i=0; i<this.rows; i++){
    this.grid.push([]);
    this.reserveGrid.push([]);
    for (j=0; j<this.cols; j++){
      this.grid[i].push(0);
      this.reserveGrid[i].push(0);
    }
  }
  
  this.populateGrid();
  this.populateReserve();
};

MedicalMatcher.Board.prototype.consoleLog = function(){
  var i, j
  var overlySexualisedOutput = '\n';
  
  for(i=0; i<this.rows; i++){
    for(j=0; j<this.cols; j++){
      overlySexualisedOutput += this.reserveGrid[i][j] + ' '; 
    }
    overlySexualisedOutput += '\n';
  }
  
  for(i=0; i<this.cols; i++){
    overlySexualisedOutput += '- ';
  }
  
  for (i=0; i<this.rows; i++){
    overlySexualisedOutput += '\n';
    for(j=0; j<this.cols; j++){
      overlySexualisedOutput += this.grid[i][j] + ' '; 
    }
  }
  
  console.log(overlySexualisedOutput);
};

MedicalMatcher.Board.prototype.populateGrid = function(){
  var i, j;
  
  for(i=0; i<this.rows; i++){
    for(j=0; j<this.cols; j++){
      this.grid[i][j] = Math.floor(Math.random()*this.types + 1);
    }
  }
  
  // check for chains
  if(this.findAllChains().length > 0)
    this.populateGrid();
};

MedicalMatcher.Board.prototype.populateReserve = function(){
  var i, j;
  
  for(i=0; i<this.rows; i++){
    for(j=0; j<this.cols; j++){
      this.reserveGrid[i][j] = Math.floor(Math.random()*this.types + 1);
    }
  }
}

MedicalMatcher.Board.prototype.checkInChain = function(row, column){
  var inMatch = false;
  var type = this.grid[row][column];
  
  // to the left
  if ((type == this.grid[row][column - 1]) && (type == this.grid[row][column - 2]))
    return true;
  
  // to the right
  if ((type == this.grid[row][column + 1]) && (type == this.grid[row][column + 2]))
    return true;
  
  // central - horizontal
  if ((type == this.grid[row][column + 1]) && (type == this.grid[row][column - 1]))
    return true;
  
  
  // up above
  if (this.grid[row - 2])
    if ((type == this.grid[row - 1][column]) && (type == this.grid[row - 2][column]))
      return true;
    
  // down below
  if (this.grid[row + 2])
    if ((type == this.grid[row + 1][column]) && (type == this.grid[row + 2][column]))
      return true;
    
  // centre - vertical
  if (this.grid[row + 1] && this.grid[row - 1])
    if ((type == this.grid[row + 1][column]) && (type == this.grid[row - 1][column]))
      return true;
    
  return inMatch;
};

MedicalMatcher.Board.prototype.findChain = function(row, col){
  var k, direction, length;
  var chain;
  var horizontal = [];
  var vertical = [];
  var hasSomeoneDoneTheImpossibleAndMadeACombo = false;

  
  if (this.checkInChain(row, col)){
    vertical.push({row: row, col: col});
    horizontal.push({row: row, col: col});
    
    /*  WHORIZONTAL */
    /*  kinda like horizontal, just slutty  */
    // left
    for (k=col-1; k >= 0; k--){
      if (this.checkInChain(row, k))
        if (this.grid[row][k] === this.grid[row][col])
          horizontal.push({row: row, col: k});
      else
        break;
    }
    
    // right
    for (k=col+1; k < this.cols; k++){
      if (this.checkInChain(row, k))
        if (this.grid[row][k] === this.grid[row][col])
          horizontal.push({row: row, col: k});
      else
        break;
    }
    
    if (horizontal.length >= 3){
      direction = 'horizontal';
      length = horizontal.length;
    }
    
    
    /*  VERTICAL  */
    /*  that is up and down for the uninitiated */
    // check up
    for (k=row-1; k >= 0; k--){
      if (this.checkInChain(k, col))
        if (this.grid[k][col] === this.grid[row][col])
          vertical.push({row: k, col: col});
      else
        break;
    }  
    
    // check down
    for (k=row+1; k < this.rows; k++){
      if (this.checkInChain(k, col))
        if (this.grid[k][col] === this.grid[row][col])
          vertical.push({row: k, col: col});
      else
        break;
    }
    
    
    // checks for combo of the same pot type
    if (vertical.length >= 3){
      if (horizontal.length >= 3)
        // OMG THERE WAS A COMBO WHAT?!?!.>1?
        hasSomeoneDoneTheImpossibleAndMadeACombo = true;
      else {
        direction = 'vertical';
        length = vertical.length;
      }
    }
    
    chain = {
      horizontal: horizontal,
      vertical: vertical,
      direction: direction,
      isCombo: hasSomeoneDoneTheImpossibleAndMadeACombo,
      chainLength: length
    };
    
    hasSomeoneDoneTheImpossibleAndMadeACombo = false;
    vertical, horizontal = [];
    direction = '';
  } else {
    chain = {
      horizontal: [],
      vertical: [],
      direction: '',
      isCombo: false,
      chainLength: 0
    };
  }
  return chain;
};

MedicalMatcher.Board.prototype.findAllChains = function(){
  var i, j;
  var matches = [];
  
  for (i=0; i<this.rows; i++){
    for (j=0; j<this.cols; j++){
      if(this.checkInChain(i, j))
        matches.push({ x: j, y: i });
    }
  }
  
  return matches;
};

MedicalMatcher.Board.prototype.clearChains = function(){
  this.findAllChains().forEach(function(match){
    this.grid[match.y][match.x] = 0;
    
    // kill the pot object
    this.state.getPotByCoordinates(match.y, match.x).kill();
  }, this);
};

MedicalMatcher.Board.prototype.switch = function(target, source){
  var tempytemptomptemp = this.grid[source.row][source.col];
  this.grid[source.row][source.col] = this.grid[target.row][target.col];
  this.grid[target.row][target.col] = tempytemptomptemp;
  
  var temporaryryPooosition = { row: target.row, col: target.col };
  target.col = source.col;
  target.row = source.row;
  source.row = temporaryryPooosition.row;
  source.col = temporaryryPooosition.col;
};

MedicalMatcher.Board.prototype.dropReserveBlock = function(sourceRow, targetRow, col){
  this.grid[targetRow][col] = this.reserveGrid[sourceRow][col];
  this.reserveGrid[sourceRow][col] = 0;
  
  this.state.dropReservePot(sourceRow, targetRow, col);
};

MedicalMatcher.Board.prototype.dropBlock = function(sourceRow, targetRow, col){
  this.grid[targetRow][col] = this.grid[sourceRow][col];
  this.grid[sourceRow][col] = 0;

  this.state.dropPot(sourceRow, targetRow, col);
};

MedicalMatcher.Board.prototype.dropDown = function(){
  var i, j, k, hasAPotionBeenFoundOrNot;
  
  for(i=this.rows - 1; i >= 0;  i--){
    for(j=0; j < this.cols; j++){
      if(this.grid[i][j] === 0){
        hasAPotionBeenFoundOrNot = false;
        
        for(k = i - 1; k >= 0; k--){
          if(this.grid[k][j] > 0) {
            this.dropBlock(k, i, j);
            hasAPotionBeenFoundOrNot = true;
            break;
          }
        }

        // reserve grid
        if(!hasAPotionBeenFoundOrNot){
          for(k = this.rows - 1; k >= 0; k--){
            if(this.reserveGrid[k][j]){
              this.dropReserveBlock(k, i, j)
              break;
            }
          }
        }
      }
    }
  }
  this.populateReserve();
};

MedicalMatcher.Board.prototype.isAdjacent = function(pot1, pot2){
  if(((pot1.col + 1 === pot2.col) || (pot1.col - 1 === pot2.col)) && (pot1.row === pot2.row))
    return true;
  else if (((pot1.row + 1 === pot2.row) || (pot1.row - 1 === pot2.row)) && (pot1.col === pot2.col))
    return true;
  else
    return false;
};