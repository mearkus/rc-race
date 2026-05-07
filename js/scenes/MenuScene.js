class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;

    // Background — draw track1 thumbnail at low scale
    const t1 = TrackData.getTrack('track1');
    TrackRenderer.renderThumbnail(this, t1, cx, GAME_HEIGHT / 2, 1.8);

    // Dark overlay
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setOrigin(0, 0);

    // Title
    const title = this.add.text(cx, 110, 'RC RACE', {
      fontSize: '72px', color: '#ff3333',
      stroke: '#000000', strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title, y: 120, duration: 1200,
      ease: 'Sine.InOut', yoyo: true, repeat: -1,
    });

    // Subtitle
    this.add.text(cx, 185, 'MOBILE RC RACER', {
      fontSize: '16px', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Difficulty label
    this.add.text(cx, 300, 'DIFFICULTY', {
      fontSize: '18px', color: '#aaaaaa', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Difficulty buttons
    this._diffBtns = {};
    const diffs = ['easy', 'medium', 'hard'];
    const lbls  = ['EASY', 'MEDIUM', 'HARD'];
    const clrs  = [0x22cc55, 0xffaa00, 0xff3333];
    diffs.forEach((d, i) => {
      const bx = cx - 110 + i * 110;
      const bg = this.add.rectangle(bx, 345, 95, 44, clrs[i], 0.5)
        .setInteractive({ useHandCursor: true });
      const lbl = this.add.text(bx, 345, lbls[i], {
        fontSize: '15px', color: '#ffffff', stroke: '#000', strokeThickness: 2, fontStyle: 'bold',
      }).setOrigin(0.5);
      bg.on('pointerdown', () => {
        window.gameState.difficulty = d;
        this._highlightDiff();
      });
      this._diffBtns[d] = { bg, lbl };
    });
    this._highlightDiff();

    // Best lap note
    this.add.text(cx, 390, 'SELECT TRACK TO BEGIN', {
      fontSize: '13px', color: '#888888',
    }).setOrigin(0.5);

    // Play button
    const playBg = this.add.rectangle(cx, 500, 220, 64, 0xff3333)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, 500, 'RACE!', {
      fontSize: '32px', color: '#ffffff',
      stroke: '#000', strokeThickness: 3, fontStyle: 'bold',
    }).setOrigin(0.5);

    playBg.on('pointerover',  () => playBg.setFillStyle(0xff6666));
    playBg.on('pointerout',   () => playBg.setFillStyle(0xff3333));
    playBg.on('pointerdown',  () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('TrackSelectScene'));
    });

    // Version
    this.add.text(cx, GAME_HEIGHT - 20, 'v1.0  |  3 Laps  |  4 Drivers', {
      fontSize: '11px', color: '#555555',
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _highlightDiff() {
    const sel = window.gameState.difficulty;
    for (const [key, { bg }] of Object.entries(this._diffBtns)) {
      bg.setAlpha(key === sel ? 1.0 : 0.4);
      bg.setStrokeStyle(key === sel ? 3 : 0, 0xffffff);
    }
  }
}
