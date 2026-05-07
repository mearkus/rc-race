class ResultsScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultsScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;
    const results = window.gameState.results || [];

    // Background
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x111122).setOrigin(0, 0);

    // Trophy / title
    const playerResult = results.find(r => r.name === 'YOU') || results[0];
    const pos          = playerResult ? playerResult.position : 1;
    const isWin        = pos === 1;

    this.add.text(cx, 60, isWin ? '🏆 WINNER!' : 'RACE OVER', {
      fontSize: isWin ? '48px' : '40px',
      color: isWin ? '#ffcc00' : '#ffffff',
      stroke: '#000', strokeThickness: 5, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 120, `You finished ${this._ordinal(pos)}!`, {
      fontSize: '22px', color: isWin ? '#ffcc00' : '#aaaaaa',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Results table
    const rowH  = 62;
    const startY = 185;
    const medalColors = ['#ffcc00', '#cccccc', '#cc8844', '#888888'];
    const carColors   = [COLORS.carPlayer, ...COLORS.carAI];

    results.forEach((r, i) => {
      const ry    = startY + i * rowH;
      const isYou = r.name === 'YOU';

      // Row bg
      this.add.rectangle(cx, ry + rowH / 2, GAME_WIDTH - 40, rowH - 4, isYou ? 0x223344 : 0x1a1a2e)
        .setStrokeStyle(isYou ? 2 : 1, isYou ? 0x44aaff : 0x333355);

      // Position medal
      this.add.text(cx - 165, ry + rowH / 2, this._ordinal(r.position), {
        fontSize: '20px', color: medalColors[i] || '#888',
        fontStyle: 'bold', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);

      // Car colour swatch
      const swatchColor = isYou ? COLORS.carPlayer : carColors[i];
      this.add.rectangle(cx - 105, ry + rowH / 2, 24, 14, swatchColor)
        .setStrokeStyle(1, 0xffffff);

      // Name
      this.add.text(cx - 80, ry + rowH / 2, r.name, {
        fontSize: '18px', color: isYou ? '#88ddff' : '#cccccc',
        fontStyle: isYou ? 'bold' : 'normal',
      }).setOrigin(0, 0.5);

      // Finish time
      if (r.time) {
        this.add.text(cx + 140, ry + rowH / 2, this._fmtTime(r.time), {
          fontSize: '15px', color: '#888888',
        }).setOrigin(0.5);
      } else {
        this.add.text(cx + 140, ry + rowH / 2, 'DNF', {
          fontSize: '15px', color: '#666666',
        }).setOrigin(0.5);
      }
    });

    // Track + difficulty info
    const diffStr  = (window.gameState.lastDiff  || 'medium').toUpperCase();
    const trackDef = TrackData.getAllTracks().find(t => t.id === window.gameState.lastTrack);
    const trackName = trackDef ? trackDef.name : 'Unknown';

    this.add.text(cx, startY + results.length * rowH + 20, `${trackName}  ·  ${diffStr}`, {
      fontSize: '13px', color: '#555566',
    }).setOrigin(0.5);

    // Buttons
    const btnY = GAME_HEIGHT - 110;
    this._makeButton(cx - 80, btnY, 'RETRY', 0xff3333, () => {
      window.gameState.trackId   = window.gameState.lastTrack;
      window.gameState.difficulty = window.gameState.lastDiff;
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('RaceScene'));
    });

    this._makeButton(cx + 80, btnY, 'MENU', 0x3366ff, () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('MenuScene'));
    });

    // Keyboard shortcut hint
    this.add.text(cx, GAME_HEIGHT - 28, 'R = Retry  ·  M = Menu', {
      fontSize: '12px', color: '#444455',
    }).setOrigin(0.5);

    // Keyboard shortcuts
    this.input.keyboard.once('keydown-R', () => {
      window.gameState.trackId    = window.gameState.lastTrack;
      window.gameState.difficulty = window.gameState.lastDiff;
      this.scene.start('RaceScene');
    });
    this.input.keyboard.once('keydown-M', () => this.scene.start('MenuScene'));

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _makeButton(x, y, label, color, cb) {
    const bg = this.add.rectangle(x, y, 140, 52, color)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontSize: '22px', color: '#ffffff',
      stroke: '#000', strokeThickness: 3, fontStyle: 'bold',
    }).setOrigin(0.5);
    bg.on('pointerover',  () => bg.setAlpha(0.8));
    bg.on('pointerout',   () => bg.setAlpha(1.0));
    bg.on('pointerdown',  cb);
    return bg;
  }

  _ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  _fmtTime(sec) {
    const m  = Math.floor(sec / 60);
    const s  = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }
}
