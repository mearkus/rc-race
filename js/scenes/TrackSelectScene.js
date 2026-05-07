class TrackSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'TrackSelectScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;

    // Background
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x111122).setOrigin(0, 0);

    this.add.text(cx, 50, 'SELECT TRACK', {
      fontSize: '32px', color: '#ffffff',
      stroke: '#000', strokeThickness: 4, fontStyle: 'bold',
    }).setOrigin(0.5);

    const tracks = TrackData.getAllTracks().map(def => TrackData.getTrack(def.id));
    const cardH  = 180;
    const startY = 130;

    tracks.forEach((track, i) => {
      const cy = startY + i * (cardH + 18);

      // Card background
      const card = this.add.rectangle(cx, cy + cardH / 2, GAME_WIDTH - 40, cardH, 0x222233)
        .setInteractive({ useHandCursor: true });
      card.setStrokeStyle(2, 0x444466);

      // Track thumbnail
      TrackRenderer.renderThumbnail(this, track, cx - 70, cy + cardH / 2, 0.72);

      // Track name + info
      this.add.text(cx + 30, cy + 28, track.name, {
        fontSize: '22px', color: '#ffcc00',
        stroke: '#000', strokeThickness: 2, fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      const diffColors = { easy: '#22cc55', medium: '#ffaa00', hard: '#ff3333' };
      const diff = window.gameState.difficulty;
      this.add.text(cx + 30, cy + 65, `Difficulty: ${diff.toUpperCase()}`, {
        fontSize: '14px', color: diffColors[diff] || '#aaa',
      }).setOrigin(0);

      this.add.text(cx + 30, cy + 88, `Road width: ${track.roadWidth}px`, {
        fontSize: '12px', color: '#888888',
      }).setOrigin(0);

      this.add.text(cx + 30, cy + 108, `${TOTAL_LAPS} laps  ·  3 AI opponents`, {
        fontSize: '12px', color: '#888888',
      }).setOrigin(0);

      // SELECT button
      const selBg = this.add.rectangle(cx + 75, cy + cardH - 28, 100, 36, 0xff3333);
      this.add.text(cx + 75, cy + cardH - 28, 'SELECT', {
        fontSize: '15px', color: '#ffffff', fontStyle: 'bold', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);

      const launch = () => {
        window.gameState.trackId = track.id;
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => this.scene.start('RaceScene'));
      };

      card.on('pointerdown', launch);
      selBg.setInteractive({ useHandCursor: true }).on('pointerdown', launch);

      card.on('pointerover',  () => card.setFillStyle(0x333355));
      card.on('pointerout',   () => card.setFillStyle(0x222233));
    });

    // Back button
    const back = this.add.text(24, GAME_HEIGHT - 36, '← BACK', {
      fontSize: '16px', color: '#aaaaaa', stroke: '#000', strokeThickness: 2,
    }).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => {
      this.cameras.main.fade(200, 0, 0, 0);
      this.time.delayedCall(200, () => this.scene.start('MenuScene'));
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}
