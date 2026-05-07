// Catmull-Rom spline expansion — returns array of {x, y, angle} in world coords
function expandCatmullRom(points, stepsPerSegment, scaleX, scaleY) {
  const result = [];
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    for (let t = 0; t < stepsPerSegment; t++) {
      const tt  = t / stepsPerSegment;
      const tt2 = tt * tt;
      const tt3 = tt2 * tt;
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * tt +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * tt3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * tt +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * tt3
      );
      result.push({ x: x * scaleX, y: y * scaleY, angle: 0 });
    }
  }
  // Compute tangent angles
  for (let i = 0; i < result.length; i++) {
    const next = result[(i + 1) % result.length];
    result[i].angle = Math.atan2(next.y - result[i].y, next.x - result[i].x);
  }
  return result;
}

const TRACK_DEFS = {
  track1: {
    id:        'track1',
    name:      'Desert Loop',
    roadWidth: 72,
    startAngle: Math.PI / 2,
    controlPoints: [
      { x: 0.50, y: 0.10 },
      { x: 0.78, y: 0.16 },
      { x: 0.88, y: 0.32 },
      { x: 0.88, y: 0.55 },
      { x: 0.72, y: 0.78 },
      { x: 0.50, y: 0.87 },
      { x: 0.28, y: 0.78 },
      { x: 0.12, y: 0.55 },
      { x: 0.12, y: 0.32 },
      { x: 0.22, y: 0.16 },
    ],
  },
  track2: {
    id:        'track2',
    name:      'City Circuit',
    roadWidth: 64,
    startAngle: 0,
    controlPoints: [
      { x: 0.50, y: 0.10 },
      { x: 0.80, y: 0.10 },
      { x: 0.88, y: 0.20 },
      { x: 0.88, y: 0.40 },
      { x: 0.70, y: 0.50 },
      { x: 0.88, y: 0.60 },
      { x: 0.88, y: 0.78 },
      { x: 0.75, y: 0.88 },
      { x: 0.50, y: 0.88 },
      { x: 0.25, y: 0.78 },
      { x: 0.12, y: 0.60 },
      { x: 0.25, y: 0.42 },
      { x: 0.12, y: 0.25 },
      { x: 0.20, y: 0.10 },
    ],
  },
  track3: {
    id:        'track3',
    name:      'Mountain Pass',
    roadWidth: 62,
    startAngle: 0,
    controlPoints: [
      { x: 0.50, y: 0.10 },
      { x: 0.80, y: 0.18 },
      { x: 0.88, y: 0.36 },
      { x: 0.72, y: 0.50 },
      { x: 0.55, y: 0.56 },
      { x: 0.50, y: 0.75 },
      { x: 0.35, y: 0.86 },
      { x: 0.18, y: 0.78 },
      { x: 0.14, y: 0.58 },
      { x: 0.28, y: 0.46 },
      { x: 0.44, y: 0.44 },
      { x: 0.12, y: 0.26 },
      { x: 0.20, y: 0.10 },
    ],
  },
};

const TrackData = {
  getTrack(id) {
    const def = TRACK_DEFS[id];
    if (!def) return null;
    const track = Object.assign({}, def);
    track.splinePoints = expandCatmullRom(
      track.controlPoints, SPLINE_STEPS, GAME_WIDTH, GAME_HEIGHT
    );
    // Compute checkpoint indices evenly spaced
    const total = track.splinePoints.length;
    track.checkpointIndices = [];
    for (let i = 0; i < TOTAL_CHECKPOINTS; i++) {
      track.checkpointIndices.push(Math.floor(i * total / TOTAL_CHECKPOINTS));
    }
    return track;
  },
  getAllTracks() {
    return Object.values(TRACK_DEFS);
  },
};
