class TouchControls {
  constructor(scene) {
    this.scene   = scene;
    this.state   = { left: false, right: false, gas: false, brake: false };
    this._active = {};

    this._g = scene.add.graphics();
    this._g.setScrollFactor(0).setDepth(10);

    const lblStyle = { fontSize: '28px', color: '#ffffff', stroke: '#000', strokeThickness: 3 };
    const icons = { left: '◀', right: '▶', gas: '⬆', brake: '⬇' };
    this._labels = {};
    for (const [name, icon] of Object.entries(icons)) {
      const t = scene.add.text(0, 0, icon, lblStyle);
      t.setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(11);
      this._labels[name] = t;
    }

    // Keyboard fallback
    this._keys = scene.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      gas:   Phaser.Input.Keyboard.KeyCodes.UP,
      brake: Phaser.Input.Keyboard.KeyCodes.DOWN,
      gasZ:  Phaser.Input.Keyboard.KeyCodes.Z,
      brk:   Phaser.Input.Keyboard.KeyCodes.X,
    });

    this._buildLayout();

    scene.scale.on('resize', () => {
      this._buildLayout();
      this._active = {};
      this._recalc();
    });

    scene.input.on('pointerdown', p => this._onDown(p));
    scene.input.on('pointermove', p => this._onMove(p));
    scene.input.on('pointerup',   p => this._onUp(p));
  }

  _buildLayout() {
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    const landscape = W > H;

    if (landscape) {
      // Controls on left and right sides
      const bw = Math.min(W * 0.14, 100);
      const bh = Math.min(H * 0.42, 120);
      const mid = H / 2;
      this.buttons = {
        left:  new Phaser.Geom.Rectangle(8,         mid - bh - 4, bw, bh),
        right: new Phaser.Geom.Rectangle(8,         mid + 4,      bw, bh),
        gas:   new Phaser.Geom.Rectangle(W - bw - 8, mid - bh - 4, bw, bh),
        brake: new Phaser.Geom.Rectangle(W - bw - 8, mid + 4,      bw, bh),
      };
    } else {
      // Controls at the bottom
      const ctrlH = Math.min(H * 0.23, 180);
      const half  = ctrlH / 2;
      const lrW   = W * 0.27;
      this.buttons = {
        left:  new Phaser.Geom.Rectangle(0,         H - ctrlH, lrW,       half),
        right: new Phaser.Geom.Rectangle(lrW,       H - ctrlH, lrW,       half),
        gas:   new Phaser.Geom.Rectangle(W - lrW,   H - ctrlH, lrW,       half),
        brake: new Phaser.Geom.Rectangle(W - lrW,   H - half,  lrW,       half),
      };
    }

    for (const [name, rect] of Object.entries(this.buttons)) {
      this._labels[name].setPosition(rect.centerX, rect.centerY);
    }
  }

  _hitButtons(px, py) {
    const hits = new Set();
    for (const [name, rect] of Object.entries(this.buttons)) {
      if (Phaser.Geom.Rectangle.Contains(rect, px, py)) hits.add(name);
    }
    return hits;
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
      left:  this.state.left  || k.left.isDown,
      right: this.state.right || k.right.isDown,
      gas:   this.state.gas   || k.gas.isDown  || k.gasZ.isDown,
      brake: this.state.brake || k.brake.isDown || k.brk.isDown,
    };
  }

  draw() {
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
    this._g.destroy();
  }
}
