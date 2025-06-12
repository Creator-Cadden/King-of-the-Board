export default class Pellet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pellet');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(false);
    this.setVisible(false);

    this.body.setAllowGravity(false);
    this.setCollideWorldBounds(false);
    this.setDepth(1);
    this.setSize(16, 16);  // Hitbox
  }

  fire(x, y) {
    this.body.reset(x, y);

    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;  // <== crucial to re-enable body when reused

    this.setVelocity(0, 300);
    this.setScale(1);
    this.setSize(16, 16);
    this.setDepth(1);
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.body.stop();
    this.body.enable = false; // <-- Disable collider body
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    const tileSize = 64;
    const topBarBottomY = tileSize;
    const bottomBarTopY = (18 + 1) * tileSize; // rows = 18

    if (this.y < topBarBottomY || this.y > bottomBarTopY + 2 * tileSize) {
      this.setActive(false);
      this.setVisible(false);
      this.body.stop();
      this.body.enable = false; // <== disables collider completely
    }
  }
}