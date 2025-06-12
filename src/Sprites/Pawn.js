import EnemyBase from './EnemyBase.js';

export default class Pawn extends EnemyBase {
  constructor(scene, boardManager, occupiedCols) {
    const tileSize = 64;
    const availableCols = [...Array(16).keys()].filter(c => !occupiedCols.has(c));
    const randomCol = Phaser.Utils.Array.GetRandom(availableCols);
    occupiedCols.add(randomCol);

    const pos = boardManager.tileToWorld(randomCol, 1);

    super(scene, pos.x, pos.y, 'pawn', 1);

    this.sceneRef = scene;

    this.occupiedCols = occupiedCols;
    this.tileSize = tileSize;
    this.col = randomCol;
    this.row = 1;
    this.boardManager = boardManager;

    this.setScale(0.4);
    this.setSize(128, 128);
    this.setImmovable(true);
    this.body.setAllowGravity(false);
    this.body.setGravityY(0);
    this.body.setCollideWorldBounds(true);

    this.moveTimer = null;

    this.scoreValue = 50;
  }

  spawn() {
    this.setActive(true);
    this.setVisible(true);

    // If it's a respawn (row > 1), pick a new column
    if (this.row !== 1) {
      this.pickNewColumn();
      this.row = 1;
    }

    this.setPosition(
      this.boardManager.tileToWorld(this.col, this.row).x,
      this.boardManager.tileToWorld(this.col, this.row).y
    );

    this.moveTimer = this.sceneRef.time.addEvent({
      delay: 800,
      callback: this.moveDown,
      callbackScope: this,
      loop: true
    });
  }

  moveDown() {
  if (!this.scene) {
    console.warn('moveDown called but scene is undefined');
    return;
  }

  if (this.row >= 15) {
    if (this.moveTimer) this.moveTimer.remove();

    this.scene.time.delayedCall(1000, () => {
      this.spawn(); // Respawn at top
    });
    return;
  }

  this.row++;
  const pos = this.boardManager.tileToWorld(this.col, this.row);
  this.setPosition(pos.x, pos.y);
}

  pickNewColumn() {
    this.occupiedCols.delete(this.col);

    const availableCols = [...Array(16).keys()].filter(c => !this.occupiedCols.has(c));
    this.col = Phaser.Utils.Array.GetRandom(availableCols);
    this.occupiedCols.add(this.col);
  }

  die() {
    // Stop movement
    if (this.moveTimer) this.moveTimer.remove();

    this.occupiedCols.delete(this.col);

    // Add score on death
    if (this.boardManager) {
      this.boardManager.addScore(this.scoreValue);
    }

    super.die(); // Calls destroy()
  }
}