const TrackRenderer = {
  // Render full-res track into a static Graphics object. Call once in create().
  render(scene, track) {
    const g = scene.add.graphics();
    this._drawBackground(g, scene);
    this._drawRoad(g, track);
    this._drawStartLine(g, track);
    g.setDepth(0);
    return g;
  },

  // Render a small thumbnail for track select screen
  renderThumbnail(scene, track, cx, cy, scale) {
    const g = scene.add.graphics();
    const pts = track.controlPoints;
    // Background box
    const bw = 200 * scale, bh = 140 * scale;
    g.fillStyle(COLORS.grass);
    g.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
    // Road path scaled down
    const scaledPts = track.controlPoints.map(p => ({
      x: cx - bw / 2 + p.x * bw,
      y: cy - bh / 2 + p.y * bh,
    }));
    g.lineStyle(Math.max(4, track.roadWidth * scale * 0.35), COLORS.roadBorder);
    g.strokePoints(scaledPts, true);
    g.lineStyle(Math.max(3, track.roadWidth * scale * 0.25), COLORS.road);
    g.strokePoints(scaledPts, true);
    // Start dot
    const sp = scaledPts[0];
    g.fillStyle(0xff3333);
    g.fillCircle(sp.x, sp.y, 4 * scale);
    return g;
  },

  _drawBackground(g, scene) {
    const w = scene.sys.game.config.width;
    const h = scene.sys.game.config.height;
    // Alternating grass stripes
    for (let y = 0; y < h; y += 60) {
      g.fillStyle((Math.floor(y / 60) % 2 === 0) ? COLORS.grass : COLORS.grassDark);
      g.fillRect(0, y, w, 60);
    }
  },

  _drawRoad(g, track) {
    const pts = track.splinePoints;
    const rw  = track.roadWidth;
    // White border
    g.lineStyle(rw + 8, COLORS.roadBorder, 1);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
    g.strokePath();
    // Road surface
    g.lineStyle(rw, COLORS.road, 1);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
    g.strokePath();
    // Center dashes
    this._drawDashes(g, pts);
  },

  _drawDashes(g, pts) {
    const dashLen  = 12;
    const gapLen   = 14;
    let   accum    = 0;
    let   drawing  = true;
    g.lineStyle(2, COLORS.roadDash, 0.7);
    g.beginPath();
    for (let i = 1; i < pts.length; i++) {
      const dx   = pts[i].x - pts[i - 1].x;
      const dy   = pts[i].y - pts[i - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let   rem  = dist;
      let   fx   = pts[i - 1].x;
      let   fy   = pts[i - 1].y;
      while (rem > 0) {
        const seg = Math.min(rem, drawing ? dashLen - accum : gapLen - accum);
        const nx  = fx + (dx / dist) * seg;
        const ny  = fy + (dy / dist) * seg;
        if (drawing) {
          if (accum === 0) g.moveTo(fx, fy);
          g.lineTo(nx, ny);
        }
        accum += seg;
        rem   -= seg;
        fx = nx; fy = ny;
        const limit = drawing ? dashLen : gapLen;
        if (accum >= limit) { accum = 0; drawing = !drawing; }
      }
    }
    g.strokePath();
  },

  _drawStartLine(g, track) {
    const pt    = track.splinePoints[0];
    const angle = pt.angle + Math.PI / 2; // perpendicular
    const rw    = track.roadWidth / 2;
    const cos   = Math.cos(angle);
    const sin   = Math.sin(angle);
    const sqW   = 8;
    const sqH   = rw / 4;
    // Checker pattern — 4 pairs across road width
    for (let i = -4; i < 4; i++) {
      const cx = pt.x + cos * (i * sqH + sqH / 2);
      const cy = pt.y + sin * (i * sqH + sqH / 2);
      const even = Math.abs(i) % 2 === 0;
      g.fillStyle(even ? COLORS.startLine : COLORS.startLineAlt);
      // Rotated rect approximation via polygon
      const hw = sqW / 2, hh = sqH / 2;
      const tang = pt.angle;
      const tc = Math.cos(tang), ts = Math.sin(tang);
      const corners = [
        { x: cx - tc * hw - (-ts) * hh, y: cy - ts * hw - tc * hh },
        { x: cx + tc * hw - (-ts) * hh, y: cy + ts * hw - tc * hh },
        { x: cx + tc * hw + (-ts) * hh, y: cy + ts * hw + tc * hh },
        { x: cx - tc * hw + (-ts) * hh, y: cy - ts * hw + tc * hh },
      ];
      g.fillPoints(corners, true);
    }
  },
};
