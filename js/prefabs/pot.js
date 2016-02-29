/* global Phaser */

var MedicalMatcher = MedicalMatcher || {};

MedicalMatcher.Pot = function (state, x, y, data, size){
  Phaser.Sprite.call(this, state.game, x, y, data.asset);
  this.game = state.game;
  this.state = state;
  this.row = data.row;
  this.col = data.col;
  this.width = size;
  this.height = size;
  this.anchor.setTo(0.5);

  this.inputEnabled = true;
  this.events.onInputDown.add(state.pickPot, this.state);
};

MedicalMatcher.Pot.prototype = Object.create(Phaser.Sprite.prototype);
MedicalMatcher.Pot.prototype.constructor = MedicalMatcher.Pot;

MedicalMatcher.Pot.prototype.reset = function(x, y, data){
  Phaser.Sprite.prototype.reset.call(this, x, y);
  
  this.loadTexture(data.asset);
  this.row = data.row;
  this.col = data.col;
};

MedicalMatcher.Pot.prototype.kill = function(){
  this.loadTexture('greyPot');
  this.col = null;
  this.row = null;
  
  this.game.time.events.add(this.state.ANIMATION_TIME/5, function(){
    Phaser.Sprite.prototype.kill.call(this);
  }, this);
};