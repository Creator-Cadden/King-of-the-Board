import BoardManager from '../Levels/BoardManager.js';
import PlayerKing from '../../Sprites/PlayerKing.js';
import Pawn from '../../Sprites/Pawn.js';

export default class IntroPawn extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroPawn' });
    this.gameplaySceneKey = 'IntroPawn';
    this.pauseSceneKey = 'PauseOverlay';
  }

  init(data) {
    this.levelLabel = data.levelLabel || "Unknown Level";
  }

  preload() {
    // === TILEMAP/GRID ===
    this.boardManager = new BoardManager(this, this.levelLabel, this.gameplaySceneKey);
    this.boardManager.resetScore();
    this.boardManager.preload();

    // === SPRITES ===
    this.load.image('p_king', 'assets/Images/p_king.png');
    this.load.image('bullet', 'assets/Images/bullet.png');
    this.load.image('pellet', 'assets/Images/pellets.png');
    this.load.image('pawn', 'assets/Images/e_pawn.png');
  }

  create() {
    // Victory Setup
    this.enemyGroup = this.physics.add.group(); // all enemies will go here
    this.enemySpawningDone = false;
    this.victoryTriggered = false;

    // === BOARD SETUP ===
    this.boardManager.create();

    const tileSize = 64;
    const boardWidth = 16;
    const boardHeight = 18;

    const spawnX = (boardWidth / 2) * tileSize;
    const spawnY = (boardHeight - 1) * tileSize;

    // === PLAYER ===
    this.player = new PlayerKing(this, spawnX, spawnY);

    // === PAWNS ===
    this.occupiedCols = new Set();
    this.pawnsGroup = this.physics.add.group({
      classType: Pawn,
      runChildUpdate: true,
      maxSize: 10
    });

    // Spawn initial pawns with delay
    for (let i = 0; i < 3; i++) {
    const delay = Phaser.Math.Between(1000, 5000);
    this.time.delayedCall(delay, () => {
      const pawn = new Pawn(this, this.boardManager, this.occupiedCols);
      this.pawnsGroup.add(pawn);
      this.enemyGroup.add(pawn); // <--- NEW LINE
      pawn.spawn();

      if (i === 2) {
        this.enemySpawningDone = true; // <--- NEW LINE
      }
    });
  }

    // === COLLISIONS ===

    // Bullets hit pawns
    this.physics.add.overlap(
    this.player.bullets,
    this.enemyGroup,
    (bullet, enemy) => {
      bullet.disableBody(true, true);
      enemy.takeDamage?.(1);
    }
  );

    // Player touches a pawn
    this.physics.add.overlap(
      this.player,
      this.pawnsGroup,
      (player, pawn) => {
        pawn.die?.();            // Optional method to kill or recycle pawn
        player.loseLife?.();     // Player takes damage
      }
    );
  
    this.player.on('playerDead', () => {
      this.scene.pause();
      this.scene.launch('DefeatOverlay', {
        currentScene: this.gameplaySceneKey,
        score: this.boardManager.getScore(),
        levelLabel: this.levelLabel
      });
    });
  }


  update(time, delta) {
    this.player.update(time, delta);
    this.boardManager.update();

    // Check for victory condition
    if (
      !this.victoryTriggered &&
      this.enemySpawningDone &&
      this.enemyGroup.countActive(true) === 0
    ) {
      this.victoryTriggered = true;

      this.time.delayedCall(1000, () => {
        this.scene.pause();
        this.scene.launch('VictoryOverlay', {
          currentScene: this.gameplaySceneKey,
          score: this.boardManager.getScore(),
          levelLabel: this.levelLabel
        });
      });
    }
  }
}
