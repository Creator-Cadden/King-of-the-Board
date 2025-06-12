import BoardManager from '../Levels/BoardManager.js';
import PlayerKing from '../../Sprites/PlayerKing.js';
import Queen from '../../Sprites/Queen.js';
import Pellet from '../../Sprites/Pellet.js';
import Beam from '../../Sprites/Beam.js'; // ✅ NEW: Beam class

export default class IntroQueen extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroQueen' });
    this.gameplaySceneKey = 'IntroQueen';
    this.pauseSceneKey = 'PauseOverlay';
  }

  init(data) {
    this.levelLabel = data.levelLabel || "Intro Queen";
  }

  preload() {
    this.boardManager = new BoardManager(this, this.levelLabel, this.gameplaySceneKey);
    this.boardManager.resetScore();
    this.boardManager.preload();

    this.load.image('p_king', 'assets/Images/p_king.png');
    this.load.image('queen', 'assets/Images/e_queen.png');
    this.load.image('bullet', 'assets/Images/bullet.png');
    this.load.image('pellet', 'assets/Images/pellets.png');
    this.load.image('pulse', 'assets/Images/pulse.png');
    this.load.image('beam1', 'assets/Images/beam1.png');
    this.load.image('beam2', 'assets/Images/beam2.png');
    this.load.image('beam3', 'assets/Images/beam3.png');
  }

  create() {
    this.enemyGroup = this.physics.add.group();
    this.enemySpawningDone = false;
    this.victoryTriggered = false;

    this.boardManager.create();

    const tileSize = 64;
    const spawnX = (16 / 2) * tileSize;
    const spawnY = (18 - 1) * tileSize;

    // === PLAYER ===
    this.player = new PlayerKing(this, spawnX, spawnY);

    // === PROJECTILES ===
    this.enemyProjectiles = this.physics.add.group({
      classType: Pellet,
      runChildUpdate: true,
      maxSize: 20,
      allowGravity: false
    });

    this.occupiedGrid = new Set();

    // === ENEMIES ===
    this.queensGroup = this.physics.add.group({
      classType: Queen,
      runChildUpdate: true,
      maxSize: 10
    });

    // === BEAM HITBOXES GROUP ===
    this.beamDamageGroup = this.physics.add.group();

    // ✅ Player takes damage from beam hitboxes
    this.physics.add.collider(this.player, this.beamDamageGroup, (player, hitbox) => {
      if (!player.invincible && player.active) {
        player.loseLife();
        // Optional: hitbox.destroy(); // Only hurt once
      }
    });

    // ✅ Register hitboxes when beams are fired
    this.events.on('beam-ready', (hitbox) => {
      this.beamDamageGroup.add(hitbox);
    });

    // === QUEEN SPAWN ===
    for (let i = 0; i < 3; i++) {
      const delay = Phaser.Math.Between(1000, 4000);
      this.time.delayedCall(delay, () => {
        const queen = new Queen(this, this.boardManager, this.occupiedGrid, this.enemyProjectiles, this.events);
        this.queensGroup.add(queen);
        this.enemyGroup.add(queen);
      });
    }

    // === PLAYER BULLET COLLISIONS ===
    this.physics.add.overlap(
      this.player.bullets,
      this.queensGroup,
      (bullet, queen) => {
        if (!bullet.active || !queen.active) return;
        bullet.deactivate();
        queen.takeDamage(1);
      }
    );

    // === PLAYER DEFEAT ===
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

    if (!this.victoryTriggered && this.enemySpawningDone && this.enemyGroup.countActive(true) === 0) {
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
