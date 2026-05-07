const CarRenderer = {
  // Create a Graphics object drawn as a top-down car. Returns the object.
  create(scene, bodyColor, label) {
    const g = scene.add.graphics();
    this._draw(g, bodyColor);
    g.setDepth(2);

    // Optional number label
    if (label !== undefined) {
      const txt = scene.add.text(0, 0, String(label), {
        fontSize: '9px', color: '#ffffff',
        stroke: '#000000', strokeThickness: 2,
      });
      txt.setOrigin(0.5, 0.5);
      txt.setDepth(3);
      g._label = txt;
    }

    return g;
  },

  _draw(g, bodyColor) {
    g.clear();
    // Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(-13, -8, 28, 18, 3);
    // Body
    g.fillStyle(bodyColor, 1);
    g.fillRoundedRect(-14, -8, 28, 16, 4);
    // Roof highlight
    g.fillStyle(0xffffff, 0.25);
    g.fillRoundedRect(-6, -5, 14, 10, 2);
    // Windscreen
    g.fillStyle(COLORS.carWindow, 0.8);
    g.fillRect(2, -4, 6, 8);
    // Rear window
    g.fillStyle(COLORS.carWindow, 0.5);
    g.fillRect(-8, -3, 4, 6);
    // Wheels (4 corners)
    g.fillStyle(COLORS.carWheel, 1);
    g.fillRect( 8,  6, 8, 4);   // front-right
    g.fillRect( 8, -10, 8, 4);  // front-left
    g.fillRect(-14,  6, 8, 4);  // rear-right
    g.fillRect(-14, -10, 8, 4); // rear-left
    // Headlights
    g.fillStyle(0xffffaa, 1);
    g.fillRect(14, -6, 3, 4);
    g.fillRect(14,  2, 3, 4);
  },

  // Sync Graphics position/rotation to car physics state
  update(g, carState) {
    g.x        = carState.x;
    g.y        = carState.y;
    g.rotation = carState.angle;
    if (g._label) {
      g._label.x = carState.x;
      g._label.y = carState.y;
    }
  },

  destroy(g) {
    if (g._label) g._label.destroy();
    g.destroy();
  },
};
