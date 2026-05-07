const TrackCollider = {
  // Check if world-space position is on the road
  isOnRoad(x, y, track) {
    const nearest = this.nearestSplineIndex(x, y, track);
    const sp = track.splinePoints[nearest];
    const dx = x - sp.x;
    const dy = y - sp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < track.roadWidth / 2 - 2;
  },

  nearestSplineIndex(x, y, track) {
    const pts = track.splinePoints;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const dx = x - pts[i].x;
      const dy = y - pts[i].y;
      const d  = dx * dx + dy * dy;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  },

  // Initialise per-car checkpoint state
  initCarState() {
    return {
      nextCheckpoint: 0,
      lap:            0,
      checkpointsHit: 0,
      totalProgress:  0,
      finished:       false,
      finishTime:     0,
      position:       1,
    };
  },

  // Called each frame per car — updates lap/checkpoint state
  updateCheckpoints(carState, x, y, track, elapsed) {
    if (carState.finished) return;

    const cpIdx = track.checkpointIndices[carState.nextCheckpoint];
    const cp    = track.splinePoints[cpIdx];
    const dx    = x - cp.x;
    const dy    = y - cp.y;
    const dist  = Math.sqrt(dx * dx + dy * dy);

    if (dist < track.roadWidth * 0.8) {
      if (carState.nextCheckpoint === 0 && carState.checkpointsHit > 0) {
        // Crossed start/finish — only count lap if all checkpoints passed
        if (carState.checkpointsHit >= TOTAL_CHECKPOINTS) {
          carState.lap++;
          carState.checkpointsHit = 0;
          if (carState.lap >= TOTAL_LAPS) {
            carState.finished   = true;
            carState.finishTime = elapsed;
          }
        }
      } else if (carState.nextCheckpoint > 0) {
        carState.checkpointsHit++;
      }
      carState.nextCheckpoint = (carState.nextCheckpoint + 1) % TOTAL_CHECKPOINTS;
    }

    carState.totalProgress =
      carState.lap + (carState.checkpointsHit / TOTAL_CHECKPOINTS);
  },

  // Push car back onto the road if it crosses the boundary
  constrainToTrack(car, track) {
    const nearestIdx = this.nearestSplineIndex(car.x, car.y, track);
    const sp   = track.splinePoints[nearestIdx];
    const dx   = car.x - sp.x;
    const dy   = car.y - sp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const limit = track.roadWidth / 2 - 6;

    if (dist > limit && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;
      // Snap position to road edge
      car.x = sp.x + nx * limit;
      car.y = sp.y + ny * limit;
      // Kill the outward velocity component (bounce off wall)
      const outward = car.vx * nx + car.vy * ny;
      if (outward > 0) {
        car.vx -= nx * outward;
        car.vy -= ny * outward;
      }
    }
  },

  // Rank array of car states by progress, set .position on each
  updatePositions(carStates) {
    const sorted = [...carStates].sort((a, b) => {
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;
      return b.totalProgress - a.totalProgress;
    });
    sorted.forEach((cs, i) => { cs.position = i + 1; });
  },
};
