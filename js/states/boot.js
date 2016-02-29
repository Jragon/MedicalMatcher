var MedicalMatcher = MedicalMatcher || {};

MedicalMatcher.BootState = {
  init: function() {
    this.game.stage.backgroundcolor = '#fff';
        
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
  }, 
    
  preload: function() {
    // this.load.image('loadingBar', 'assets/images/preloader-bar.png');
  },
    
  create: function() {
    this.state.start('Preload');  
  }
}