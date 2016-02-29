var MedicalMatcher = MedicalMatcher || {};

MedicalMatcher.GameState = {
  create: function(){
    this.BLOCK_SIZE = 53;
    this.NUM_ROWS = 9;
    this.NUM_COLS = 6;
    this.BLOCK_TYPES = 5;
    this.ANIMATION_TIME = 300;
    
    this.game.stage.backgroundColor = '#fff';
    this.board = new MedicalMatcher.Board(this, this.NUM_ROWS, this.NUM_COLS, this.BLOCK_TYPES);
    
    this.boardSprites = this.game.add.group();
    this.squares = this.game.add.group();
    this.boardSprites.add(this.squares);
    this.pots = this.game.add.group();
    this.boardSprites.add(this.pots);
    
    this.drawBoard();
    this.game.time.events.add(2000, function(){
      this.board.clearChains();
      this.board.dropDown();
    }, this);
    
    this.moves = 0;
    this.movesSinceLastCombo = 0;
    this.movesText = this.game.add.text(this.boardSprites.x - (this.BLOCK_SIZE + 4)/2 + 195, 10, "Moves: " + this.moves, {font: "32px Arial", fill: "#0000"});
    
    this.numberOfChainsThatHaveFallenFromTheHeavensIdkWhatToCallThem = 0;
    
    this.score = 0;
    this.scoreText = this.game.add.text(this.boardSprites.x - (this.BLOCK_SIZE + 4)/2, 10, "Score: " + this.score, {font: "32px Arial", fill: "#0000"});
    
    var comboTextBackground = this.add.bitmapData(this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);
    comboTextBackground.ctx.fillStyle = '#111';
    comboTextBackground.ctx.fillRect(0, 0, this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);
    this.comboTextBackground = this.game.add.sprite(0, 0, comboTextBackground);
    this.comboTextBackground.anchor.setTo(0.5);
    this.comboTextBackground.alpha = 0.5;
    
    this.comboText = this.game.add.text(0, 0, "", {font: "50px Arial", fill: "#f0f"});
    // this.comboText.alpha = 0;
    this.comboText.anchor.setTo(0.5);
 
    
    this.comboTextGroup = this.game.add.group();
    this.comboTextGroup.add(this.comboTextBackground);
    this.comboTextGroup.add(this.comboText);
    this.comboTextGroup.alpha = 0;
    
  },
  
  createPot: function(x, y, data){
    var pot = this.pots.getFirstExists(false);
    
    if(!pot){
      pot = new MedicalMatcher.Pot(this, x, y, data, this.BLOCK_SIZE);
      this.pots.add(pot);
    } else {
       pot.reset(x, y, data);
    }
    
    return pot;
  },
  
  drawBoard: function(){
    var i, j, x, y;
    var square = []
    
    var squareBitmap = this.add.bitmapData(this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);
    squareBitmap.ctx.fillStyle = '#000';
    squareBitmap.ctx.fillRect(0, 0, this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);
    
    for(i=0; i<this.board.rows; i++){
      for(j=0; j<this.board.cols; j++){
        x = j*(this.BLOCK_SIZE + 6);
        y = i*(this.BLOCK_SIZE + 6);
        this.createPot(x, y, {row: i, col: j, asset: 'pot' + this.board.grid[i][j]});
        
        square.push(this.add.sprite(x, y, squareBitmap));
        square[square.length - 1].anchor.setTo(0.5);
        square[square.length - 1].alpha = 0.075;
        this.squares.add(square[square.length - 1]);
      }
    }
    this.boardSprites.x = (this.game.world.width - (this.BLOCK_SIZE + 6)*(this.NUM_COLS - 1))/2;
    this.boardSprites.y = (this.game.world.height - (this.BLOCK_SIZE + 6)*(this.NUM_ROWS - 1))/2;
  },
  
  getPotByCoordinates: function(row, col){
    var theBlockThatWasFoundInThisMethodOfSearching;
    
    this.pots.forEachAlive(function(pot){
      if(pot.row === row && pot.col === col)
        theBlockThatWasFoundInThisMethodOfSearching = pot;
    }, this);
    
    return theBlockThatWasFoundInThisMethodOfSearching;
  },
  
  dropPot: function(sourceRow, targetRow, col){
    var pot = this.getPotByCoordinates(sourceRow, col);
    var targetY = targetRow * (this.BLOCK_SIZE + 6);
    
    pot.row = targetRow;
    
    var potTween = this.game.add.tween(pot);
    potTween.to({y: targetY}, this.ANIMATION_TIME); 
    potTween.start();
  },
  
  dropReservePot: function(sourceRow, targetRow, col){
    // mega dodgey - need to get some otherway of finding the appropriate x coordinate
    var x = this.getPotByCoordinates(7, col).x;
    var y = sourceRow * (this.BLOCK_SIZE + 6) - (this.BLOCK_SIZE + 6) * (1 + this.board.rows);
    
    var pot = this.createPot(x, y, { asset: 'pot' + this.board.grid[targetRow][col], row: targetRow, col: col });
    var targetY = targetRow * (this.BLOCK_SIZE + 6);
 
    var potTween = this.game.add.tween(pot);
    potTween.to({y: targetY}, this.ANIMATION_TIME); 
    potTween.start();
  },
  
  swapPots: function(pot1, pot2){
    var pot1Chain, pot2Chain, comboTween, comboText;
    this.pots.setAll('width', this.BLOCK_SIZE);
    this.pots.setAll('height', this.BLOCK_SIZE);  
  
    var pot1Tween = this.game.add.tween(pot2).to({ x: pot1.x, y: pot1.y }, this.ANIMATION_TIME);
    var pot2Tween = this.game.add.tween(pot1).to({ x: pot2.x, y: pot2.y }, this.ANIMATION_TIME);
    
    pot1Tween.onComplete.add(function(){
      this.moves++;
      this.movesSinceLastCombo++;
      this.movesText.text = 'Moves: ' + this.moves;
      this.board.switch(pot1, pot2);
      if(this.board.findAllChains().length > 0){
        this.whatCombo(pot1, pot2);
        this.updateBoard();
      } else {
        this.clearSelection();
      }
    }, this);
    
    pot1Tween.start();
    pot2Tween.start();
  },
  
  whatCombo: function(pot1, pot2){
    var pot1Chain = this.board.findChain(pot1.row, pot1.col);
    var pot2Chain = this.board.findChain(pot2.row, pot2.col);
    var comboName = '';
    var score;
    
    if (pot1Chain.isCombo && pot2Chain.isCombo){
      // this is the BEST EVER combo possible!!! 4 chains!
      comboName = 'WICKED COOL \n' + pot1Chain.vertical.length + ' x ' + pot1Chain.horizontal.length + ' x ' + pot2Chain.vertical.length + ' x ' + pot2Chain.horizontal.length;
      score = pot1Chain.vertical.length * pot1Chain.horizontal.length * pot2Chain.vertical.length * pot2Chain.horizontal.length;
      console.log(comboName);
    } else if ((pot1Chain.isCombo && (pot2Chain.chainLength >= 3)) || (pot2Chain.isCombo && (pot1Chain.chainLength >= 3))){
      // this is a pretty good combo ... 3 chains
      comboName = 'OKAY COOL \n' + pot1Chain.vertical.length + ' x ' + pot1Chain.horizontal.length + ' x ' + pot2Chain.chainLength;
      
      if (pot1Chain.isCombo)
        score = pot1Chain.vertical.length * pot1Chain.horizontal.length * pot2Chain.chainLength;
      else
        score = pot2Chain.vertical.length * pot2Chain.horizontal.length * pot2Chain.chainLength;
      
      console.log(comboName);
    } else if (pot1Chain.isCombo){
      comboName = pot1Chain.horizontal.length + ' x ' + pot1Chain.vertical.length;
      score = pot1Chain.horizontal.length * pot1Chain.vertical.length;
      console.log(comboName);
    } else if (pot2Chain.isCombo){
      comboName = pot2Chain.horizontal.length + ' x ' + pot2Chain.vertical.length;
      score = pot2Chain.horizontal.length * pot2Chain.vertical.length;
      console.log(comboName);
    } else if (pot1Chain.chainLength >= 3 && pot2Chain.chainLength >= 3){
      comboName = pot2Chain.chainLength + ' x ' + pot1Chain.chainLength;
      score = pot2Chain.chainLength * pot1Chain.chainLength;
      console.log(comboName);
    } else if (pot1Chain.chainLength >= 3){
      comboName = '';
      score = pot1Chain.chainLength;
      console.log('single');
    } else if (pot2Chain.chainLength >= 3){
      comboName = '';
      score = pot2Chain.chainLength;
      console.log('single');
    } else {
      var theUserDidNotEvenFindAChainWhatALoser = true;
    }
    
    if(!theUserDidNotEvenFindAChainWhatALoser){
      score = Math.floor(3*(score / this.movesSinceLastCombo) + 1);
      console.log(this.movesSinceLastCombo);
      console.log(score);
      this.score += score;
      // this.scoreText.text = 'Score: ' + score;
      this.movesSinceLastCombo = 0;
      
      this.comboText.text = comboName;      

      this.comboTextBackground.height = this.comboText.height;
      this.comboTextBackground.width = this.comboText.width;

      this.comboTextGroup.scale.x = 0.5;
      this.comboTextGroup.scale.y = 0.5;
      
      this.comboTextGroup.x = this.game.world.centerX;
      this.comboTextGroup.y = this.game.world.centerY - 100;
      
      // combo tween
      this.game.add.tween(this.comboTextGroup).to({ alpha: 1 }, this.ANIMATION_TIME*2).yoyo(true).start();
      this.game.add.tween(this.comboTextGroup.scale).to({ x: 1.5, y: 1.5 }, this.ANIMATION_TIME*2).yoyo(true).start();

      theUserDidNotEvenFindAChainWhatALoser = false;
    }
  },
  
  pickPot: function(pot){
    if(this.boardLocked)
      return;
    
    if(!this.selectedPot){
      this.selectedPot = pot;
      pot.width = this.BLOCK_SIZE * 1.25;
      pot.height = this.BLOCK_SIZE * 1.25;
    } else {
      // only adjacent blocks
      if (this.board.isAdjacent(this.selectedPot, pot)){
        this.boardLocked = true;
        this.swapPots(pot, this.selectedPot);
      } else {
        this.clearSelection();
      }
    }
  }, 
  
  clearSelection: function(){
    this.boardLocked = false;
    this.selectedPot = null;
    
    this.pots.setAll('width', this.BLOCK_SIZE);
    this.pots.setAll('height', this.BLOCK_SIZE);
  },
  
  updateBoard: function(){
    this.score += Math.floor(0.75*this.board.findAllChains().length*this.numberOfChainsThatHaveFallenFromTheHeavensIdkWhatToCallThem);
    this.scoreText.text = 'Score: ' + this.score;
    
    // useful output testy thing
    // console.log('score: ' + this.score + ', no conseq: ' + this.numberOfChainsThatHaveFallenFromTheHeavensIdkWhatToCallThem + ', increase: ' + Math.floor(this.board.findAllChains().length*this.numberOfChainsThatHaveFallenFromTheHeavensIdkWhatToCallThem) + ', no chains: ' + this.board.findAllChains().length);
    
    this.board.clearChains();
    this.board.dropDown();
    
    this.game.time.events.add(this.ANIMATION_TIME + 100, function() {
      if(this.board.findAllChains().length > 0){
        this.numberOfChainsThatHaveFallenFromTheHeavensIdkWhatToCallThem++;
        this.updateBoard();
      }else{
        this.clearSelection(); 
        this.numberOfChainsThatHaveFallenFromTheHeavensIdkWhatToCallThem = 0;
      }
    }, this);
  }
};