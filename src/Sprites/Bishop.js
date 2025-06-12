import EnemyBase from './EnemyBase.js';

export default class Bishop extends EnemyBase {
  constructor(scene, boardManager, occupiedGrid) {
    const tileSize = 64;

    // Start near the top rows with random column
    const col = Phaser.Math.Between(0, 15);
    const row = Phaser.Math.Between(0, 3);

    const pos = boardManager.tileToWorld(col, row);

    super(scene, pos.x, pos.y, 'bishop', 1);

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

    this.direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // down-left or down-right
    this.moveCount = 0;
    this.scoreValue = 125;

    // Register initial tile as occupied
    this.grid.add(`${this.col},${this.row}`);

    this.moveTimer = this.sceneRef.time.addEvent({
      delay: 500,
      callback: this.moveDiagonal,
      callbackScope: this,
      loop: true
    });
  }

  moveDiagonal() {
    const newCol = this.col + this.direction;
    const newRow = this.row + 1;

    // Edge or occupied check
    const blocked = (
      newCol < 0 ||
      newCol > 15 ||
      newRow > 15 ||
      this.grid.has(`${newCol},${newRow}`)
    );

    if (blocked) {
      // Try bouncing to other diagonal direction
      const altDirection = -this.direction;
      const altCol = this.col + altDirection;
      const altRow = this.row + 1;

      if (
        altCol >= 0 &&
        altCol <= 15 &&
        altRow <= 15 &&
        !this.grid.has(`${altCol},${altRow}`)
      ) {
        this.direction = altDirection;
        this.executeMove(altCol, altRow);
      } else {
        // Can't move in either direction — skip turn
        return;
      }
    } else {
      this.executeMove(newCol, newRow);
    }
  }

  executeMove(newCol, newRow) {
    this.grid.delete(`${this.col},${this.row}`);
    this.col = newCol;
    this.row = newRow;
    this.grid.add(`${this.col},${this.row}`);

    const newPos = this.boardManager.tileToWorld(this.col, this.row);
    this.setPosition(newPos.x, newPos.y);

    this.moveCount++;
    if (this.moveCount % 3 === 0) {
      this.shoot();
    }

    if (this.row >= 15) {
      this.sceneRef.time.delayedCall(1000, () => this.respawn());
    }
  }

  shoot() {
    const pellet = this.sceneRef.enemyProjectiles.get();
    if (!pellet) return;
    pellet.fire(this.x, this.y + this.height / 2);
  }

  respawn() {
    this.grid.delete(`${this.col},${this.row}`);
    this.row = Phaser.Math.Between(0, 2);
    this.col = Phaser.Math.Between(0, 15);

    // Try to find a free space
    for (let i = 0; i < 16; i++) {
      const tryCol = (this.col + i) % 16;
      if (!this.grid.has(`${tryCol},${this.row}`)) {
        this.col = tryCol;
        break;
      }
    }

    this.grid.add(`${this.col},${this.row}`);
    const newPos = this.boardManager.tileToWorld(this.col, this.row);
    this.setPosition(newPos.x, newPos.y);
  }

  die() {
    if (this.moveTimer) this.moveTimer.remove();
    this.grid.delete(`${this.col},${this.row}`);
    if (this.boardManager) this.boardManager.addScore(this.scoreValue);
    super.die();
  }
}