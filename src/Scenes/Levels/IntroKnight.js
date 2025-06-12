import BoardManager from '../Levels/BoardManager.js';
import PlayerKing from '../../Sprites/PlayerKing.js';
import Knight from '../../Sprites/Knight.js';

export default class IntroKnight extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroKnight' });
    this.gameplaySceneKey = 'IntroKnight';
    this.pauseSceneKey = 'PauseOverlay';
  }

  init(data) {
    this.levelLabel = data.levelLabel || "Intro Knight";
  }

  preload() {
    // === TILEMAP/GRID ===
    this.boardManager = new BoardManager(this, this.levelLabel, this.gameplaySceneKey);
    this.boardManager.resetScore();
    this.boardManager.preload();

    // === SPRITES ===
    this.load.image('p_king', 'assets/Images/p_king.png');
    this.load.image('bullet', 'assets/Images/bullet.png');
    this.load.image('knight', 'assets/Images/e_knight.png');
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

    // === KNIGHTS ===
    this.occupiedGrid = new Set();
    this.knightsGroup = this.physics.add.group({
      classType: Knight,
      runChildUpdate: true,
      maxSize: 10
    });

    // Bullets hit knights
    this.physics.add.overlap(
      this.player.bullets,
      this.knightsGroup,
      (bullet, knight) => {
        bullet.disableBody(true, true);
        knight.takeDamage?.(1);
      }
    );

    // Knight touches player
    this.physics.add.overlap(
      this.player,
      this.knightsGroup,
      (player, knight) => {
        knight.die?.();
        player.loseLife?.();
      }
    );

    // Spawn 3 knights
    for (let i = 0; i < 3; i++) {
      const delay = Phaser.Math.Between(1000, 5000);
      this.time.delayedCall(delay, () => {
        const knight = new Knight(this, this.boardManager, this.occupiedGrid);
        this.knightsGroup.add(knight);
        this.enemyGroup.add(knight);
        knight.spawn();

        if (i === 2) {
          this.enemySpawningDone = true;
        }
      });
    }

    // Player death
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
