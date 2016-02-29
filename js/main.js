/* global Phaser */
var MedicalMatcher = MedicalMatcher || {};

MedicalMatcher.game = new Phaser.Game(360, 640, Phaser.AUTO);

MedicalMatcher.game.state.add('Boot', MedicalMatcher.BootState);
MedicalMatcher.game.state.add('Preload', MedicalMatcher.PreloadState);
MedicalMatcher.game.state.add('Game', MedicalMatcher.GameState);

MedicalMatcher.game.state.start('Boot');