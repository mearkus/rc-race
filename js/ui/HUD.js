class HUD {
  constructor(scene) {
    const style = (sz, clr) => ({
      fontSize: sz + 'px', color: clr || COLORS.hudText,
      stroke: COLORS.hudShadow, strokeThickness: 3,
      fontStyle: 'bold',
    });

    this._scene = scene;

    this._lap = scene.add.text(8, 8, 'LAP 1/3', style(20));
    this._lap.setScrollFactor(0).setDepth(10);

    this._pos = scene.add.text(GAME_WIDTH / 2, 8, '1st', style(26));
    this._pos.setOrigin(0.5, 0).setScrollFactor(0).setDepth(10);

    this._spd = scene.add.text(GAME_WIDTH - 8, 8, '0 km/h', style(16));
    this._spd.setOrigin(1, 0).setScrollFactor(0).setDepth(10);

    this._cd = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '', {
      fontSize: '96px', color: '#ffff00',
      stroke: '#000', strokeThickness: 6, fontStyle: 'bold',
    });
    this._cd.setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(12);

    this._msg = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '', {
      fontSize: '48px', color: '#ffffff',
      stroke: '#000', strokeThickness: 5, fontStyle: 'bold',
    });
    this._msg.setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(12);
  }

  update(lap, totalLaps, position, speedPx) {
    this._lap.setText(`LAP ${Math.min(lap + 1, totalLaps)}/${totalLaps}`);
    this._pos.setText(this._ordinal(position));
    this._spd.setText(`${Math.round(speedPx * 0.3)} km/h`);
  }

  setCountdown(text) {
    this._cd.setText(text);
    if (text) {
      this._cd.setScale(1.5);
      this._scene.tweens.add({
        targets: this._cd, scaleX: 1, scaleY: 1, duration: 600, ease: 'Back.Out',
      });
    }
  }

  showMessage(text, duration) {
    this._msg.setText(text);
    this._scene.time.delayedCall(duration || 2000, () => this._msg.setText(''));
  }

  _ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  destroy() {
    [this._lap, this._pos, this._spd, this._cd, this._msg].forEach(t => t.destroy());
  }
}
