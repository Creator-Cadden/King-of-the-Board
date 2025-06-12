import EnemyBase from './EnemyBase.js';
import Beam from './Beam.js';

export default class Queen extends EnemyBase {
  constructor(scene, boardManager, occupiedGrid, enemyProjectiles) {
    const tileSize = 64;

    // Start somewhere randomly in top 4 rows
    const col = Phaser.Math.Between(0, 15);
    const row = Phaser.Math.Between(0, 3);
    const pos = boardManager.tileToWorld(col, row);

    super(scene, pos.x, pos.y, 'queen', 2); // 2 HP

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
    this.body.setCollideWorldBounds(true);

    this.moveCount = 0;
    this.maxMovesBeforeBeam = 5;
    this.scoreValue = 300;
    this.grid.add(`${this.col},${this.row}`);

    this.isShooting = false;

    // Create Beam instance (no x, y passed anymore)
    this.beam = new Beam(scene);

    this.moveTimer = this.sceneRef.time.addEvent({
      delay: 700,
      callback: this.moveRandom,
      callbackScope: this,
      loop: true
    });
  }

  moveRandom() {
    if (this.isShooting) return;

    if (this.moveCount >= this.maxMovesBeforeBeam) {
      this.startBeamAttack();
      return;
    }

    const maxCol = 15;
    const maxRow = 3;
    const dx = Phaser.Math.RND.pick([-1, 1]);
    const dy = Phaser.Math.RND.pick([0, 1]);
    const moveDistance = Phaser.Math.Between(1, 3);

    let newCol = Phaser.Math.Clamp(this.col + dx * moveDistance, 0, maxCol);
    let newRow = Phaser.Math.Clamp(this.row + dy * moveDistance, 0, maxRow);

    const newKey = `${newCol},${newRow}`;
    if (this.grid.has(newKey)) return;

    this.grid.delete(`${this.col},${this.row}`);
    this.col = newCol;
    this.row = newRow;
    this.grid.add(newKey);

    const newPos = this.boardManager.tileToWorld(this.col, this.row);
    this.setPosition(newPos.x, newPos.y);

    this.moveCount++;
  }

  startBeamAttack() {
    this.isShooting = true;
    this.moveTimer.paused = true;

    // Correct usage of fire(x, y)
    this.beam.fire(this.x, this.y);

    this.sceneRef.time.delayedCall(2200, () => {
      this.isShooting = false;
      this.moveCount = 0;
      this.moveTimer.paused = false;
    });
  }

  takeDamage(amount) {
    this.hp -= amount;

    if (this.hp <= 0) {
      this.die();
    } else {
      this.flashOnHit();
    }
  }

  flashOnHit() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.setAlpha(1);
      }
    });
  }

  die() {
    if (this.moveTimer) this.moveTimer.remove();
    this.grid.delete(`${this.col},${this.row}`);
    if (this.boardManager) this.boardManager.addScore(this.scoreValue);
    super.die();
  }
}
