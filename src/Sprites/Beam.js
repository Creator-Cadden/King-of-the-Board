export default class Beam {
  constructor(scene) {
    this.scene = scene;
    this.beamSprites = [];
    this.frameCycle = ['beam1', 'beam2', 'beam3', 'beam2', 'beam1'];
    this.damageHitbox = null;
  }

  fire(x, y) {
    const tileSize = 64;
    const bottomRow = 16;
    const queenRow = y / tileSize;
    const tileCount = bottomRow - queenRow;
    const startY = y + tileSize;

    const pulseSprites = [];

    for (let i = 0; i < tileCount; i++) {
      const pulseY = startY + i * tileSize;
      const pulse = this.scene.add.sprite(x + tileSize / 2, pulseY, 'pulse');
      pulse.setOrigin(0.5, 0);
      pulse.setAngle(90);
      pulse.setDisplaySize(tileSize, tileSize);
      pulse.setVisible(false);
      pulseSprites.push(pulse);
    }

    const flashPulse = (delay) => {
      this.scene.time.delayedCall(delay, () => pulseSprites.forEach(p => p.setVisible(true)));
      this.scene.time.delayedCall(delay + 200, () => pulseSprites.forEach(p => p.setVisible(false)));
    };

    flashPulse(0);
    flashPulse(400);
    flashPulse(800);

    this.scene.time.delayedCall(1500, () => {
      pulseSprites.forEach(p => p.destroy());

      const startY = y + tileSize;
      this.beamSprites = [];

      for (let i = 0; i < tileCount; i++) {
        const beamY = startY + i * tileSize;

        const beam = this.scene.add.sprite(x + tileSize / 2, beamY, 'beam1');
        beam.setOrigin(0.5, 0);
        beam.setAngle(90);
        beam.setDisplaySize(tileSize, tileSize);
        beam.setDepth(2);

        this.beamSprites.push({
          sprite: beam,
          baseX: beam.x,
          frameOffsets: {
            beam1: { width: tileSize * 1.0, height: tileSize / 4, offsetX: -20 },
            beam2: { width: tileSize * 1.1, height: tileSize / 2, offsetX: -16 },
            beam3: { width: tileSize * 1.1, height: tileSize / 2, offsetX: -16 }
          }
        });
      }

      // Create one collider at bottom of beam stack
      const lastBeamY = startY + (tileCount - 1) * tileSize;

      const collider = this.scene.add.rectangle(x + tileSize - 64, lastBeamY + tileSize / 2, tileSize, tileSize);
      this.scene.physics.add.existing(collider);
      collider.body.setAllowGravity(false);
      collider.body.setImmovable(true);
      collider.setVisible(false); // Set to true for debugging

      this.damageHitbox = collider;

      // mit so IntroQueen can add it to the damage group
      this.scene.events.emit('beam-ready', collider);

      this.animateBeams();
    });
  }

  animateBeams() {
    let frameIndex = 0;
    const totalFrames = this.frameCycle.length * 2;
    const frameDuration = 100;

    this.beamTimer = this.scene.time.addEvent({
      delay: frameDuration,
      repeat: totalFrames - 1,
      callback: () => {
        const frameKey = this.frameCycle[frameIndex % this.frameCycle.length];

        this.beamSprites.forEach(beamObj => {
          const beam = beamObj.sprite;
          const config = beamObj.frameOffsets[frameKey] || {
            width: 64,
            height: 64,
            offsetX: 0
          };

          beam.setTexture(frameKey);
          beam.setOrigin(0.5, 0);
          beam.setDisplaySize(config.width, config.height);
          beam.x = beamObj.baseX + config.offsetX;
        });

        frameIndex++;
      },
      callbackScope: this
    });

    this.scene.time.delayedCall(totalFrames * frameDuration, () => {
      this.deactivate();
    });
  }

  deactivate() {
    this.beamSprites.forEach(beamObj => beamObj.sprite.destroy());
    this.beamSprites = [];

    if (this.damageHitbox) {
      this.damageHitbox.destroy();
      this.damageHitbox = null;
    }
  }
}
