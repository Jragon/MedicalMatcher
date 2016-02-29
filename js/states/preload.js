var MedicalMatcher = MedicalMatcher || {};

MedicalMatcher.PreloadState = {
  preload: function() {
    this.game.load.image('pot1', 'assets/pot1.png');
    this.game.load.image('pot2', 'assets/pot2.png');
    this.game.load.image('pot3', 'assets/pot3.png');
    this.game.load.image('pot4', 'assets/pot4.png');
    this.game.load.image('pot5', 'assets/pot5.png');
    this.game.load.image('greyPot', 'assets/greyPot.png');
  },
    
  create: function() {
    this.state.start('Game');
  }
}