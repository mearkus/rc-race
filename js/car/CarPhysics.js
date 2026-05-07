const CarPhysics = {
  createState(x, y, angle, speedMult) {
    return {
      x, y,
      vx:         0,
      vy:         0,
      angle,
      speed:      0,
      isOnRoad:   true,
      speedMult:  speedMult || 1.0,
      input: { gas: false, brake: false, left: false, right: false },
    };
  },

  update(car, delta) {
    const onRoad   = car.isOnRoad;
    const maxSpeed = (onRoad ? PHYSICS.maxSpeedRoad : PHYSICS.maxSpeedOffRoad) * car.speedMult;
    const accel    = onRoad ? PHYSICS.accel : PHYSICS.offRoadAccel;
    const drift    = onRoad ? PHYSICS.driftFactor : PHYSICS.offRoadDrift;

    // Steering (less effective at high speed)
    if (car.speed > PHYSICS.minSpeedForSteer) {
      const dir = (car.input.left ? -1 : 0) + (car.input.right ? 1 : 0);
      const steerAmt = PHYSICS.steerRate * dir * delta *
                       (1 - car.speed / (maxSpeed * 1.8));
      car.angle += steerAmt;
    }

    const fx = Math.cos(car.angle);
    const fy = Math.sin(car.angle);

    // Acceleration / braking
    if (car.input.gas) {
      car.vx += fx * accel * delta;
      car.vy += fy * accel * delta;
    } else if (car.input.brake) {
      const curSpeed = Math.sqrt(car.vx * car.vx + car.vy * car.vy);
      if (curSpeed > 1) {
        const scale = Math.min(PHYSICS.brakeDecel * delta, curSpeed) / curSpeed;
        car.vx -= car.vx * scale;
        car.vy -= car.vy * scale;
      }
    }

    // Natural drag when coasting
    if (!car.input.gas && !car.input.brake) {
      const spd = Math.sqrt(car.vx * car.vx + car.vy * car.vy);
      if (spd > 0) {
        const drag = Math.min(PHYSICS.naturalDecel * delta, spd);
        car.vx -= (car.vx / spd) * drag;
        car.vy -= (car.vy / spd) * drag;
      }
    }

    // Lateral friction (drift feel)
    const dot  = car.vx * fx + car.vy * fy;
    const latX = car.vx - dot * fx;
    const latY = car.vy - dot * fy;
    car.vx -= latX * (1 - drift);
    car.vy -= latY * (1 - drift);

    // Clamp to max speed
    car.speed = Math.sqrt(car.vx * car.vx + car.vy * car.vy);
    if (car.speed > maxSpeed) {
      car.vx = (car.vx / car.speed) * maxSpeed;
      car.vy = (car.vy / car.speed) * maxSpeed;
      car.speed = maxSpeed;
    }

    car.x += car.vx * delta;
    car.y += car.vy * delta;
  },
};
