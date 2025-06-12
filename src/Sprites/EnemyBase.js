export default class EnemyBase extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, hp = 1) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(true);
    this.setVisible(true);
    this.body.setAllowGravity(false);
    this.setImmovable(true);

    this.hp = hp;
    this.scene = scene;

    this.isDying = false; // flag to prevent multiple death triggers
  }

  takeDamage(amount = 1) {
    if (this.isDying) return; // ignore damage while dying

    this.hp -= amount;
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
  if (this.isDying) return;
  this.isDying = true;

  this.body.setAllowGravity(true);
  this.setImmovable(false);

  // Increase launch speeds — harder and faster launch
  const velocityX = Phaser.Math.Between(-500, 500);   // stronger sideways push
  const velocityY = Phaser.Math.Between(-800, -600);  // stronger upward launch

  this.body.setVelocity(velocityX, velocityY);

  // Faster spin
  const angularVel = Phaser.Math.Between(-1000, 1000);
  this.setAngularVelocity(angularVel);

  // Disable collisions so it flies freely
  this.body.checkCollision.none = true;

  // Increase gravity to pull down faster for snappier arc
  this.body.setGravityY(1200);

  // Remove any timers if you have them
  if (this.moveTimer) {
    this.moveTimer.remove();
  }

  this.scene.events.on('update', this.checkOffScreen, this);
}
  checkOffScreen() {
    if (!this.scene) return;

    const cam = this.scene.cameras.main;
    if (
        this.x < cam.worldView.x - this.width ||
        this.x > cam.worldView.x + cam.worldView.width + this.width ||
        this.y < cam.worldView.y - this.height ||
        this.y > cam.worldView.y + cam.worldView.height + this.height
    ) {
        this.scene.events.off('update', this.checkOffScreen, this);  // Remove event listener first
        this.destroy();  // Then destroy
    }
    }
}