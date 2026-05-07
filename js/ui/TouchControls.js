class TouchControls {
  constructor(scene) {
    this.scene   = scene;
    this.state   = { left: false, right: false, gas: false, brake: false };
    this._active = {};
    this._g      = null;
    this.buttons = {};
    this._labels = {};

    // Keyboard always works
    this._keys = scene.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      gas:   Phaser.Input.Keyboard.KeyCodes.UP,
      brake: Phaser.Input.Keyboard.KeyCodes.DOWN,
      gasZ:  Phaser.Input.Keyboard.KeyCodes.Z,
      gasW:  Phaser.Input.Keyboard.KeyCodes.W,
      brkX:  Phaser.Input.Keyboard.KeyCodes.X,
      brkS:  Phaser.Input.Keyboard.KeyCodes.S,
      lftA:  Phaser.Input.Keyboard.KeyCodes.A,
      rgtD:  Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Desktop = mouse/trackpad device — show key hints, skip touch overlay
    this._isDesktop = window.matchMedia('(pointer: fine)').matches;

    if (this._isDesktop) {
      this._createKeyboardHint(scene);
    } else {
      this._createTouchButtons(scene);
      scene.input.on('pointerdown', p => this._onDown(p));
      scene.input.on('pointermove', p => this._onMove(p));
      scene.input.on('pointerup',   p => this._onUp(p));
    }
  }

  _createTouchButtons(scene) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    // Buttons raised slightly from the absolute bottom for browser-chrome safety
    this.buttons = {
      left:  new Phaser.Geom.Rectangle(0,       H - 170, 130, 85),
      right: new Phaser.Geom.Rectangle(130,     H - 170, 130, 85),
      gas:   new Phaser.Geom.Rectangle(W - 140, H - 170, 140, 95),
      brake: new Phaser.Geom.Rectangle(W - 140, H -  75, 140, 75),
    };

    this._g = scene.add.graphics();
    this._g.setScrollFactor(0).setDepth(10);

    const style = { fontSize: '26px', color: '#ffffff', stroke: '#000', strokeThickness: 3 };
    const icons = { left: '◀', right: '▶', gas: '⬆', brake: '⬇' };
    for (const [name, icon] of Object.entries(icons)) {
      const r = this.buttons[name];
      const t = scene.add.text(r.centerX, r.centerY, icon, style);
      t.setOrigin(0.5).setScrollFactor(0).setDepth(11);
      this._labels[name] = t;
    }
  }

  _createKeyboardHint(scene) {
    const hints = [
      { key: '↑ / W',   action: 'Accelerate' },
      { key: '↓ / S',   action: 'Brake' },
      { key: '← / A',   action: 'Left' },
      { key: '→ / D',   action: 'Right' },
    ];
    const style     = { fontSize: '13px', color: '#ffffffbb', stroke: '#000', strokeThickness: 2 };
    const keyStyle  = { fontSize: '13px', color: '#ffff88',   stroke: '#000', strokeThickness: 2, fontStyle: 'bold' };
    const startY    = GAME_HEIGHT - 14 - hints.length * 18;

    hints.forEach((h, i) => {
      const y = startY + i * 18;
      scene.add.text(GAME_WIDTH - 10, y, h.action, style).setOrigin(1, 0).setScrollFactor(0).setDepth(10);
      scene.add.text(GAME_WIDTH - 80, y, h.key,    keyStyle).setOrigin(1, 0).setScrollFactor(0).setDepth(10);
    });
  }

  _onDown(p) {
    this._active[p.id] = this._hitButtons(p.x, p.y);
    this._recalc();
  }
  _onMove(p) {
    if (!p.isDown) return;
    this._active[p.id] = this._hitButtons(p.x, p.y);
    this._recalc();
  }
  _onUp(p) {
    delete this._active[p.id];
    this._recalc();
  }

  _hitButtons(px, py) {
    const hits = new Set();
    for (const [name, rect] of Object.entries(this.buttons)) {
      if (Phaser.Geom.Rectangle.Contains(rect, px, py)) hits.add(name);
    }
    return hits;
  }

  _recalc() {
    const merged = new Set();
    for (const s of Object.values(this._active)) s.forEach(b => merged.add(b));
    this.state.left  = merged.has('left');
    this.state.right = merged.has('right');
    this.state.gas   = merged.has('gas');
    this.state.brake = merged.has('brake');
  }

  getInput() {
    const k = this._keys;
    return {
      left:  this.state.left  || k.left.isDown  || k.lftA.isDown,
      right: this.state.right || k.right.isDown || k.rgtD.isDown,
      gas:   this.state.gas   || k.gas.isDown   || k.gasZ.isDown || k.gasW.isDown,
      brake: this.state.brake || k.brake.isDown || k.brkX.isDown || k.brkS.isDown,
    };
  }

  draw() {
    if (!this._g) return;
    const g = this._g;
    g.clear();
    for (const [name, rect] of Object.entries(this.buttons)) {
      const active = this.state[name];
      g.fillStyle(COLORS.btnFill, active ? 0.65 : 0.35);
      g.fillRoundedRect(rect.x + 4, rect.y + 4, rect.width - 8, rect.height - 8, 12);
      g.lineStyle(2, active ? COLORS.btnActive : COLORS.btnBorder, active ? 1 : 0.5);
      g.strokeRoundedRect(rect.x + 4, rect.y + 4, rect.width - 8, rect.height - 8, 12);
    }
  }

  destroy() {
    for (const t of Object.values(this._labels)) t.destroy();
    if (this._g) this._g.destroy();
  }
}
