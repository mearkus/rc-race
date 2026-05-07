const GAME_WIDTH  = 480;
const GAME_HEIGHT = 800;

const PHYSICS = {
  accel:            400,
  brakeDecel:       600,
  naturalDecel:     120,
  maxSpeedRoad:     320,
  maxSpeedOffRoad:  160,
  offRoadAccel:     180,
  steerRate:        2.8,
  driftFactor:      0.82,
  offRoadDrift:     0.70,
  minSpeedForSteer: 20,
};

const DIFFICULTY = {
  easy:   { speedMult: 0.72, lookahead: 15, cornerThresh: 0.28, rubberband: false },
  medium: { speedMult: 0.88, lookahead: 30, cornerThresh: 0.38, rubberband: false },
  hard:   { speedMult: 1.00, lookahead: 45, cornerThresh: 0.50, rubberband: true  },
};

const COLORS = {
  grass:        0x3a7d44,
  grassDark:    0x2f6338,
  road:         0x4a4a4a,
  roadBorder:   0xdddddd,
  roadDash:     0xffffff,
  startLine:    0xffffff,
  startLineAlt: 0x222222,
  carPlayer:    0xff3333,
  carAI:        [0x3366ff, 0x22cc55, 0xffaa00],
  carRoof:      0xffffff,
  carWindow:    0x88ccff,
  carWheel:     0x222222,
  hudText:      '#ffffff',
  hudShadow:    '#000000',
  btnFill:      0x000000,
  btnBorder:    0xffffff,
  btnActive:    0xffff00,
  overlay:      0x000000,
};

const TOTAL_LAPS        = 3;
const TOTAL_CHECKPOINTS = 8;
const SPLINE_STEPS      = 20;
