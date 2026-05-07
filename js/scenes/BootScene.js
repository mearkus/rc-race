class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x111111).setOrigin(0, 0);
    this.add.text(cx, cy - 20, 'RC RACE', {
      fontSize: '52px', color: '#ff3333',
      stroke: '#000', strokeThickness: 5, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(cx, cy + 40, 'Loading...', {
      fontSize: '18px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.time.delayedCall(800, () => this.scene.start('MenuScene'));
  }
}
