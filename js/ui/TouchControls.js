class TouchControls {
  constructor(scene) {
    this.scene   = scene;
    this.state   = { left: false, right: false, gas: false, brake: false };
    this._active = {}; // pointerId -> Set of button names pressed

    // Button layout (fixed to camera — screen coords)
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    this.buttons = {
      left:  new Phaser.Geom.Rectangle(0,       H - 200, 120, 100),
      right: new Phaser.Geom.Rectangle(120,     H - 200, 120, 100),
      gas:   new Phaser.Geom.Rectangle(W - 140, H - 200, 140, 110),
      brake: new Phaser.Geom.Rectangle(W - 140, H -  90, 140, 90),
    };

    this._g = scene.add.graphics();
    this._g.setScrollFactor(0);
    this._g.setDepth(10);

    this._labels = {};
    const lblStyle = { fontSize: '28px', color: '#ffffff', stroke: '#000', strokeThickness: 3 };
    const icons = { left: '◀', right: '▶', gas: '⬆', brake: '⬇' };
    for (const [name, icon] of Object.entries(icons)) {
      const r = this.buttons[name];
      const t = scene.add.text(r.centerX, r.centerY, icon, lblStyle);
      t.setOrigin(0.5, 0.5);
      t.setScrollFactor(0);
      t.setDepth(11);
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

    scene.input.on('pointerdown', p => this._onDown(p));
    scene.input.on('pointermove', p => this._onMove(p));
    scene.input.on('pointerup',   p => this._onUp(p));
  }

  _hitButtons(px, py) {
    const hits = new Set();
    for (const [name, rect] of Object.entries(this.buttons)) {
      if (Phaser.Geom.Rectangle.Contains(rect, px, py)) hits.add(name);
    }
    return hits;
  }

  _toCanvasCoords(pointer) {
    // Convert screen pointer to game canvas coords
    const scale = this.scene.scale;
    return {
      x: (pointer.x - scale.canvasBounds.left) / scale.displayScale.x,
      y: (pointer.y - scale.canvasBounds.top)  / scale.displayScale.y,
    };
  }

  _onDown(p) {
    const c = this._toCanvasCoords(p);
    this._active[p.id] = this._hitButtons(c.x, c.y);
    this._recalc();
  }

  _onMove(p) {
    if (!p.isDown) return;
    const c = this._toCanvasCoords(p);
    this._active[p.id] = this._hitButtons(c.x, c.y);
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
