import EnemyBase from './EnemyBase.js';

export default class Rook extends EnemyBase {
  constructor(scene, boardManager, occupiedGrid) {
    const tileSize = 64;

    // Random column and row (1–4)
    const col = Phaser.Math.Between(0, 15);
    const row = Phaser.Math.Between(0, 3);

    const pos = boardManager.tileToWorld(col, row);

    super(scene, pos.x, pos.y, 'rook', 1); // Give it more HP if desired

    this.sceneRef = scene;
    this.boardManager = boardManager;
    this.tileSize = tileSize;

    this.col = col;
    this.row = row;
    this.grid = occupiedGrid;

    this.setScale(0.5);
    this.setSize(128, 128);
    this.setImmovable(true);
    this.body.setAllowGravity(false);
    this.body.setGravityY(0);
    this.body.setCollideWorldBounds(true);

    this.direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // left or right
    this.moveCount = 0;

    this.scoreValue = 100;

    this.moveTimer = this.sceneRef.time.addEvent({
      delay: 800,
      callback: this.moveSideways,
      callbackScope: this,
      loop: true
    });
  }

  moveSideways() {
    const newCol = this.col + this.direction;

    if (newCol < 0 || newCol > 15 || this.grid.has(`${newCol},${this.row}`)) {
      this.direction *= -1; // Bounce back
      return;
    }

    // Update occupied grid
    this.grid.delete(`${this.col},${this.row}`);
    this.col = newCol;
    this.grid.add(`${this.col},${this.row}`);

    const newPos = this.boardManager.tileToWorld(this.col, this.row);
    this.setPosition(newPos.x, newPos.y);

    this.moveCount++;
    if (this.moveCount % 3 === 0) {
      this.shoot();
    }
  }

  shoot() {
    const pellet = this.sceneRef.enemyProjectiles.get();

    if (!pellet) return;

    pellet.fire(this.x, this.y + this.height / 2);
  }

  die() {
    if (this.moveTimer) this.moveTimer.remove();
    this.grid.delete(`${this.col},${this.row}`);
    if (this.boardManager) this.boardManager.addScore(this.scoreValue);
    super.die();
  }
}
