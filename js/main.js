window.gameState = {
  difficulty: 'medium',
  trackId:    'track1',
  results:    [],
};

const config = {
  type: Phaser.AUTO,
  width:  GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#2f6338',
  scale: {
    mode:       Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 4,
  },
  scene: [BootScene, MenuScene, TrackSelectScene, RaceScene, ResultsScene],
};

new Phaser.Game(config);
