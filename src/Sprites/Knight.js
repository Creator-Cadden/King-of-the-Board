import EnemyBase from './EnemyBase.js';

export default class Knight extends EnemyBase {
  constructor(scene, boardManager, occupiedCols) {
    const tileSize = 64;
    const availableCols = [...Array(16).keys()].filter(c => !occupiedCols.has(c));
    const randomCol = Phaser.Utils.Array.GetRandom(availableCols);
    occupiedCols.add(randomCol);

    const pos = boardManager.tileToWorld(randomCol, 0);

    super(scene, pos.x, pos.y, 'knight', 1); 

    this.sceneRef = scene;
    this.boardManager = boardManager;
    this.tileSize = tileSize;
    this.col = randomCol;
    this.row = 0;
    this.occupiedCols = occupiedCols;

    this.setScale(0.5);
    this.setSize(128, 128);
    this.setImmovable(true);
    this.body.setAllowGravity(false);
    this.body.setGravityY(0);
    this.body.setCollideWorldBounds(true);

    this.scoreValue = 150;
    this.isMoving = false;

    this.startMovementLoop();
  }

  startMovementLoop() {
    this.sceneRef.time.addEvent({
      delay: 1000,
      callback: this.performLMove,
      callbackScope: this,
      loop: true
    });
  }

  performLMove() {
    if (this.isMoving || this.row >= 15) {
      if (this.row >= 15) {
        this.sceneRef.time.delayedCall(1000, () => this.spawn());
      }
      return;
    }

    this.isMoving = true;

    const verticalHeavy = Phaser.Math.Between(0, 1) === 0;
    const downSteps = verticalHeavy ? 2 : 1;
    const sideSteps = verticalHeavy ? 1 : 2;

    let possibleDirections = [];

    if (this.col - sideSteps >= 0 && !this.occupiedCols.has(this.col - sideSteps)) {
      possibleDirections.push(-1); // Left
    }

    if (this.col + sideSteps <= 15 && !this.occupiedCols.has(this.col + sideSteps)) {
      possibleDirections.push(1); // Right
    }

    if (possibleDirections.length === 0) {
      const fallbackRow = Math.min(this.row + downSteps, 15);
      const pos = this.boardManager.tileToWorld(this.col, fallbackRow);

      this.currentTween1 = this.sceneRef.tweens.add({
        targets: this,
        y: pos.y,
        duration: 300,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.row = fallbackRow;
          this.isMoving = false;
          this.currentTween1 = null;
        }
      });

      return;
    }

    const sideDirection = Phaser.Utils.Array.GetRandom(possibleDirections);
    const targetCol = this.col + sideDirection * sideSteps;
    const targetRow = this.row + downSteps;

    const intermediatePos = this.boardManager.tileToWorld(
      verticalHeavy ? this.col : targetCol,
      verticalHeavy ? targetRow : this.row
    );

    const finalPos = this.boardManager.tileToWorld(targetCol, targetRow);

    this.occupiedCols.add(targetCol);

    this.currentTween1 = this.sceneRef.tweens.add({
      targets: this,
      x: intermediatePos.x,
      y: intermediatePos.y,
      duration: 200,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (verticalHeavy) {
          this.row = targetRow;
        } else {
          this.occupiedCols.delete(this.col);
          this.col = targetCol;
        }

        this.currentTween2 = this.sceneRef.tweens.add({
          targets: this,
          x: finalPos.x,
          y: finalPos.y,
          duration: 200,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.occupiedCols.delete(this.col);
            this.col = targetCol;
            this.row = targetRow;
            this.isMoving = false;
            this.currentTween1 = null;
            this.currentTween2 = null;
          }
        });
      }
    });
  }

  spawn() {
    this.setActive(true);
    this.setVisible(true);

    this.occupiedCols.delete(this.col);

    const availableCols = [...Array(16).keys()].filter(c => !this.occupiedCols.has(c));
    this.col = Phaser.Utils.Array.GetRandom(availableCols);
    this.occupiedCols.add(this.col);
    this.row = 0;

    const pos = this.boardManager.tileToWorld(this.col, this.row);
    this.setPosition(pos.x, pos.y);
  }

  die() {
    if (this.occupiedCols) this.occupiedCols.delete(this.col);
    if (this.boardManager) this.boardManager.addScore(this.scoreValue);

    // Stop all tweens forcibly
    this.sceneRef.tweens.killTweensOf(this);
    if (this.currentTween1) this.currentTween1.stop();
    if (this.currentTween2) this.currentTween2.stop();
    this.currentTween1 = null;
    this.currentTween2 = null;

    // Prevent future moves from running
    this.isMoving = true;        // prevents logic loop
    this.performLMove = () => {}; // disables the method outright

    //  Re-enable physics, gravity, and launch
    this.body.setAllowGravity(true);
    this.body.setGravityY(1000);
    this.setImmovable(false);
    this.setVelocity(
      Phaser.Math.Between(-200, 200),
      Phaser.Math.Between(-400, -600)
    );

    super.die();
  }
}