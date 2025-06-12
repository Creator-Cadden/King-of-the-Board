import BoardManager from '../Levels/BoardManager.js';
import PlayerKing from '../../Sprites/PlayerKing.js';
import Bishop from '../../Sprites/Bishop.js';
import Pellet from '../../Sprites/Pellet.js'; // Assuming you have a reusable Pellet class

export default class IntroBishop extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroBishop' });
    this.gameplaySceneKey = 'IntroBishop';
    this.pauseSceneKey = 'PauseOverlay';
  }

  init(data) {
    this.levelLabel = data.levelLabel || "Intro Bishop";
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
    this.load.image('bishop', 'assets/Images/e_bishop.png'); // Add bishop sprite
  }

  create() {
    this.enemyGroup = this.physics.add.group();
    this.enemySpawningDone = false;
    this.victoryTriggered = false;

    // === BOARD ===
    this.boardManager.create();

    const tileSize = 64;
    const boardWidth = 16;
    const boardHeight = 18;

    const spawnX = (boardWidth / 2) * tileSize;
    const spawnY = (boardHeight - 1) * tileSize;

    // === PLAYER ===
    this.player = new PlayerKing(this, spawnX, spawnY);

    // === ENEMY PROJECTILES ===
    this.enemyProjectiles = this.physics.add.group({
      classType: Pellet,
      runChildUpdate: true,
      maxSize: 20,
      allowGravity: false
    });

    // === BISHOPS ===
    this.occupiedGrid = new Set();
    this.bishopsGroup = this.physics.add.group({
      classType: Bishop,
      runChildUpdate: true,
      maxSize: 10
    });

    for (let i = 0; i < 3; i++) {
      const delay = Phaser.Math.Between(1000, 5000);
      this.time.delayedCall(delay, () => {
        const bishop = new Bishop(this, this.boardManager, this.occupiedGrid);
        this.bishopsGroup.add(bishop);
        this.enemyGroup.add(bishop);

        if (i === 2) {
          this.enemySpawningDone = true;
        }
      });
    }

    // === COLLISIONS ===

    // Player bullets hit bishops
    this.physics.add.overlap(
      this.player.bullets,
      this.bishopsGroup,
      (bullet, bishop) => {
        bullet.deactivate(); 
        bishop.takeDamage(1);
      }
    );

    // Enemy pellets hit player
    this.physics.add.collider(
      this.player,
      this.enemyProjectiles,
      (player, pellet) => {
        if (!player.invincible) {
          player.loseLife();
          pellet.disableBody(true, true);
        }
      }
    );

    // Bishop touches player
    this.physics.add.overlap(
      this.player,
      this.bishopsGroup,
      (player, bishop) => {
        bishop.die?.();
        player.loseLife?.();
      }
    );

    // === PLAYER DEATH ===
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