class RaceScene extends Phaser.Scene {
  constructor() { super({ key: 'RaceScene' }); }

  create() {
    this._countdownActive = true;
    this._elapsed         = 0;
    this._raceOver        = false;

    const diff    = window.gameState.difficulty;
    const trackId = window.gameState.trackId;
    this._track   = TrackData.getTrack(trackId);

    // World bounds based on game size (tracks fill the canvas)
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw track (static — only once)
    TrackRenderer.render(this, this._track);

    // Grid start positions
    const grid = this._buildGrid();

    // Player car
    const pGrid = grid[0];
    this._playerState = CarPhysics.createState(pGrid.x, pGrid.y, this._track.startAngle, 1.0);
    this._playerState._cpState = TrackCollider.initCarState();
    this._playerGfx = CarRenderer.create(this, COLORS.carPlayer);

    // AI cars
    this._aiStates      = [];
    this._aiControllers = [];
    this._aiGfx         = [];
    for (let i = 0; i < 3; i++) {
      const g    = grid[i + 1];
      const sm   = DIFFICULTY[diff].speedMult;
      const cs   = CarPhysics.createState(g.x, g.y, this._track.startAngle, sm);
      cs._cpState = TrackCollider.initCarState();
      this._aiStates.push(cs);
      const ctrl = new AIController(cs, this._track, diff);
      ctrl.syncToTrack();
      this._aiControllers.push(ctrl);
      const gfx = CarRenderer.create(this, COLORS.carAI[i], i + 1);
      this._aiGfx.push(gfx);
    }

    // Camera follows player
    this.cameras.main.startFollow(this._playerGfx, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.4);

    // UI
    this._controls = new TouchControls(this);
    this._hud      = new HUD(this);

    // Countdown
    this._startCountdown();

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _buildGrid() {
    const sp    = this._track.splinePoints;
    const start = sp[0];
    const angle = this._track.startAngle;
    const cos   = Math.cos(angle);
    const sin   = Math.sin(angle);
    // Perpendicular
    const px = -sin, py = cos;
    const bx = start.x, by = start.y;
    // 2×2 grid: [player-front-right, ai1-front-left, ai2-rear-right, ai3-rear-left]
    return [
      { x: bx + px * 22,  y: by + py * 22  },
      { x: bx - px * 22,  y: by - py * 22  },
      { x: bx + px * 22  - cos * 55, y: by + py * 22  - sin * 55 },
      { x: bx - px * 22  - cos * 55, y: by - py * 22  - sin * 55 },
    ];
  }

  _startCountdown() {
    const steps = ['3', '2', '1', 'GO!'];
    let i = 0;
    this._hud.setCountdown(steps[i++]);
    this.time.addEvent({
      delay: 1000,
      repeat: steps.length - 1,
      callback: () => {
        if (i < steps.length) {
          this._hud.setCountdown(steps[i++]);
        } else {
          this._hud.setCountdown('');
          this._countdownActive = false;
        }
      },
    });
  }

  update(time, delta) {
    const dt = delta / 1000;
    if (!this._countdownActive) this._elapsed += dt;

    // Player input
    const inp = this._controls.getInput();
    if (this._countdownActive) {
      this._playerState.input = { gas: false, brake: false, left: false, right: false };
    } else {
      this._playerState.input = inp;
    }

    // Update player physics
    this._playerState.isOnRoad = TrackCollider.isOnRoad(
      this._playerState.x, this._playerState.y, this._track
    );
    CarPhysics.update(this._playerState, dt);
    TrackCollider.constrainToTrack(this._playerState, this._track);

    // Update AI
    for (let i = 0; i < 3; i++) {
      const cs = this._aiStates[i];
      if (!this._countdownActive) {
        this._aiControllers[i].update(dt, this._playerState);
      }
      cs.isOnRoad = TrackCollider.isOnRoad(cs.x, cs.y, this._track);
      CarPhysics.update(cs, dt);
      TrackCollider.constrainToTrack(cs, this._track);
    }

    // Repulsion between AI cars
    applyAIRepulsion(this._aiStates, dt);

    // Checkpoint / lap updates
    if (!this._countdownActive) {
      TrackCollider.updateCheckpoints(
        this._playerState._cpState, this._playerState.x, this._playerState.y,
        this._track, this._elapsed
      );
      for (const cs of this._aiStates) {
        TrackCollider.updateCheckpoints(
          cs._cpState, cs.x, cs.y, this._track, this._elapsed
        );
      }
    }

    // Position ranking
    const allCpStates = [
      this._playerState._cpState,
      ...this._aiStates.map(s => s._cpState),
    ];
    TrackCollider.updatePositions(allCpStates);

    // Sync renderers
    CarRenderer.update(this._playerGfx, this._playerState);
    for (let i = 0; i < 3; i++) {
      CarRenderer.update(this._aiGfx[i], this._aiStates[i]);
    }

    // Draw touch controls
    this._controls.draw();

    // HUD
    const pcs = this._playerState._cpState;
    this._hud.update(pcs.lap, TOTAL_LAPS, pcs.position, this._playerState.speed);

    // Race over check
    if (!this._raceOver && pcs.finished) {
      this._raceOver = true;
      this._hud.showMessage('RACE OVER!', 2500);
      this._buildResults();
      this.time.delayedCall(2800, () => {
        this.cameras.main.fade(400, 0, 0, 0);
        this.time.delayedCall(400, () => this.scene.start('ResultsScene'));
      });
    }

    // If player hasn't finished but all AI have, wait 10s then end
    if (!this._raceOver) {
      const allAiDone = this._aiStates.every(cs => cs._cpState.finished);
      if (allAiDone && this._elapsed > 5) {
        // Give player a 10s grace period after first AI finishes
        if (!this._graceStart) this._graceStart = this._elapsed;
        if (this._elapsed - this._graceStart > 10) {
          this._raceOver = true;
          this._buildResults();
          this.cameras.main.fade(400, 0, 0, 0);
          this.time.delayedCall(400, () => this.scene.start('ResultsScene'));
        }
      }
    }
  }

  _buildResults() {
    const names = ['YOU', 'CPU 1', 'CPU 2', 'CPU 3'];
    const allStates = [
      this._playerState._cpState,
      ...this._aiStates.map(s => s._cpState),
    ];
    const sorted = allStates
      .map((cs, i) => ({ name: names[i], position: cs.position, time: cs.finishTime }))
      .sort((a, b) => a.position - b.position);
    window.gameState.results = sorted;
    window.gameState.lastTrack = window.gameState.trackId;
    window.gameState.lastDiff  = window.gameState.difficulty;
  }

  shutdown() {
    if (this._controls) this._controls.destroy();
    if (this._hud)      this._hud.destroy();
    CarRenderer.destroy(this._playerGfx);
    this._aiGfx.forEach(g => CarRenderer.destroy(g));
  }
}
