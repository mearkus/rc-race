class AIController {
  constructor(carState, track, difficultyKey) {
    this.car        = carState;
    this.track      = track;
    this.diff       = DIFFICULTY[difficultyKey] || DIFFICULTY.medium;
    this.wpIdx      = 0;     // current waypoint index in splinePoints
    this.boostTimer = 0;     // rubber-band boost remaining seconds
  }

  update(delta, playerState) {
    const pts  = this.track.splinePoints;
    const total = pts.length;
    const car  = this.car;

    // Rubber-band: if Hard and falling behind, boost
    if (this.diff.rubberband && playerState) {
      const gap = playerState._cpState.totalProgress - car._cpState.totalProgress;
      if (gap > 0.3 && this.boostTimer <= 0) this.boostTimer = 3;
    }
    if (this.boostTimer > 0) {
      this.boostTimer -= delta;
      car.speedMult = this.diff.speedMult * 1.10;
    } else {
      car.speedMult = this.diff.speedMult;
    }

    // Advance waypoint when close enough
    const wp   = pts[this.wpIdx];
    const dxWp = car.x - wp.x;
    const dyWp = car.y - wp.y;
    if (Math.sqrt(dxWp * dxWp + dyWp * dyWp) < this.track.roadWidth * 0.5) {
      this.wpIdx = (this.wpIdx + 1) % total;
    }

    // Target = lookahead points ahead
    const targetIdx = (this.wpIdx + this.diff.lookahead) % total;
    const target    = pts[targetIdx];

    // Steer toward target
    const desired = Math.atan2(target.y - car.y, target.x - car.x);
    let angleDiff  = desired - car.angle;
    // Normalise to [-PI, PI]
    while (angleDiff >  Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    car.input.left  = angleDiff < -0.05;
    car.input.right = angleDiff >  0.05;

    // Corner braking: check curvature ahead
    const braking = this._shouldBrake();
    car.input.gas   = !braking;
    car.input.brake = false;
  }

  _shouldBrake() {
    const pts   = this.track.splinePoints;
    const total = pts.length;
    const ahead = 10;
    let   maxDelta = 0;
    for (let i = 0; i < ahead; i++) {
      const a1 = pts[(this.wpIdx + i) % total].angle;
      const a2 = pts[(this.wpIdx + i + 1) % total].angle;
      let diff = Math.abs(a2 - a1);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff > maxDelta) maxDelta = diff;
    }
    return maxDelta > this.diff.cornerThresh;
  }

  // Align AI car waypoint to nearest spline point at race start
  syncToTrack() {
    this.wpIdx = TrackCollider.nearestSplineIndex(
      this.car.x, this.car.y, this.track
    );
  }
}

// Gentle repulsion between AI cars to prevent stacking
function applyAIRepulsion(cars, delta) {
  for (let i = 0; i < cars.length; i++) {
    for (let j = i + 1; j < cars.length; j++) {
      const a = cars[i];
      const b = cars[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 30 && d > 0) {
        const force = (30 - d) / 30 * 80 * delta;
        a.vx -= (dx / d) * force;
        a.vy -= (dy / d) * force;
        b.vx += (dx / d) * force;
        b.vy += (dy / d) * force;
      }
    }
  }
}
