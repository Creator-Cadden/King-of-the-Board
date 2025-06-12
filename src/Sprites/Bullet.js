export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;
    this.body.setAllowGravity(false);

    // Initial state: inactive
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;

    // Ensure bullets deactivate if they hit world bounds
    scene.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this) {
        this.deactivate();
      }
    });
  }

  fire(x, y) {
    this.body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.setVelocity(0, -300);
    this.setSize(16, 16); // optional: set hitbox size
  }

  deactivate() {
    if (!this.active) return;

    this.body.stop();            // Stop all movement
    this.setActive(false);       // Deactivate sprite
    this.setVisible(false);      // Hide sprite
    this.body.enable = false;    // Disable physics collider
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    const tileSize = 64;
    const topSafeY = tileSize * 1; // BELOW the top bar
    const bottomY = tileSize * 19;

    if (this.y < topSafeY || this.y > bottomY) {
      this.deactivate();
    }
  }
}