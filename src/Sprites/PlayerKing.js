import Bullet from '../Sprites/Bullet.js';

export default class PlayerKing extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'p_king');

    // === ADD TO SCENE + PHYSICS ===
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.setCollideWorldBounds(true);
    this.setScale(0.5);

    // === STORE SCENE REF ===
    this.scene = scene;

    // === GRID CONFIG ===
    this.tileSize = 64;
    this.boardCols = 16;
    this.boardRows = 18;
    this.minCol = 0;
    this.maxCol = this.boardCols - 1;
    this.bottomPlayableRow = 16;

    // === START POSITION ===
    this.col = Phaser.Math.RND.pick([7, 8]);
    this.row = this.bottomPlayableRow;
    this.setPositionFromTile();

    // === MOVEMENT FLAGS ===
    this.isMoving = false;
    this.canMove = true;

    // === INPUT SETUP ===
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
      RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // === SHOOTING ===
    this.bullets = scene.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
      maxSize: 20,
      allowGravity: false
    });
    this.lastFired = 0;
    this.fireRate = 300;

    // === LIFE SYSTEM ===
    this.maxLives = 3;
    this.lives = this.maxLives;
    this.lifeIcons = [];

    for (let i = 0; i < this.maxLives; i++) {
      const icon = scene.add.image(40 + i * 40, scene.scale.height - 40, 'p_king')
        .setScrollFactor(0)
        .setScale(0.5)
        .setDepth(10);
      this.lifeIcons.push(icon);
    }

    // === INVINCIBILITY FLAG ===
    this.invincible = false;
    this.body.setImmovable(true);
  }

  setPositionFromTile() {
    const x = this.col * this.tileSize + this.tileSize / 2;
    const y = this.row * this.tileSize + this.tileSize / 2;
    this.setPosition(x, y);
  }

  update(time, delta) {
    if (this.canMove && !this.isMoving) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.A) || Phaser.Input.Keyboard.JustDown(this.keys.LEFT)) {
        this.tryMove(-1);
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.D) || Phaser.Input.Keyboard.JustDown(this.keys.RIGHT)) {
        this.tryMove(1);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
      if (time > this.lastFired + this.fireRate) {
        const bullet = this.bullets.get(this.x, this.y - this.height * 0.5);
        if (bullet) {
          bullet.fire(this.x, this.y - this.height * 0.5);
          this.lastFired = time;
        }
      }
    }
  }

  tryMove(dir) {
    const newCol = this.col + dir;
    if (newCol >= this.minCol && newCol <= this.maxCol) {
      this.col = newCol;
      this.isMoving = true;

      this.scene.tweens.add({
        targets: this,
        x: (this.col + 0.5) * this.tileSize,
        duration: 150,
        onComplete: () => {
          this.isMoving = false;
        }
      });
    }
  }

  loseLife() {
    if (this.invincible || this.lives <= 0) return;

    this.lives--;

    if (this.lives >= 0 && this.lifeIcons[this.lives]) {
      this.lifeIcons[this.lives].setVisible(false);
    }

    if (this.lives <= 0) {
      this.setActive(false);
      this.setVisible(false);
      this.body.enable = false;
      this.emit('playerDead');
      return;
    }

    // Enter invincible state immediately
    this.invincible = true;

    // Flashing tween: alpha toggles between 1 and 0.3 (not fully invisible)
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 10,
      onComplete: () => {
        this.setAlpha(1);
        this.invincible = false;
      }
    });
  }


  resetLives() {
    this.lives = this.maxLives;
    this.lifeIcons.forEach(icon => icon.setVisible(true));
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.invincible = false;
    this.canMove = true;
  }
}
