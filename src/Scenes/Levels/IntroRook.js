import BoardManager from '../Levels/BoardManager.js';
import PlayerKing from '../../Sprites/PlayerKing.js';
import Rook from '../../Sprites/Rook.js';
import Pellet from '../../Sprites/Pellet.js';  // import your Pellet class

export default class IntroRook extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroRook' });
    this.gameplaySceneKey = 'IntroRook';
    this.pauseSceneKey = 'PauseOverlay';
  }

  init(data) {
    this.levelLabel = data.levelLabel || "Intro Rook";
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
    this.load.image('rook', 'assets/Images/e_rook.png');
  }

  create() {
    this.enemyGroup = this.physics.add.group(); // All enemies
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
    console.log('Player instance:', this.player);
    console.log('Player loseLife is function?', typeof this.player.loseLife);


    // === ENEMY PROJECTILES (Pellet pool!) ===
    this.enemyProjectiles = this.physics.add.group({
      classType: Pellet,       // Use your Pellet class here!
      runChildUpdate: true,
      maxSize: 20   ,           // limit number of pellets
      allowGravity: false
    });

    // === ROOKS ===
    this.occupiedGrid = new Set();
    this.rooksGroup = this.physics.add.group({
      classType: Rook,
      runChildUpdate: true,
      maxSize: 10
    });

    // Player bullets hit rooks (moved here after rooksGroup created)
    this.physics.add.overlap(
      this.player.bullets,
      this.rooksGroup,
      (bullet, rook) => {
        if (!bullet.active || !rook.active) return;

        bullet.deactivate();
        rook.takeDamage(1);
      }
    );

    console.log('player:', this.player);
    console.log('pellet:', this.enemyProjectiles);

    // Enemy pellets hit player
   this.physics.add.collider(this.player, this.enemyProjectiles, (player, pellet) => {
    if (!player.invincible) {
      player.loseLife();
      pellet.disableBody(true, true);
    }
  });

    for (let i = 0; i < 3; i++) {
      const delay = Phaser.Math.Between(1000, 5000);
      this.time.delayedCall(delay, () => {
        const rook = new Rook(this, this.boardManager, this.occupiedGrid);
        this.rooksGroup.add(rook);
        this.enemyGroup.add(rook);
        if (i === 2) {
          this.enemySpawningDone = true;
        }
      });
    }

    // === COLLISIONS ===

    // Player death handling
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
