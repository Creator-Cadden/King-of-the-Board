export default class BoardManager {
  constructor(scene, levelLabel = "Unknown Level", gameplaySceneKey = null) {
    this.scene = scene;
    this.level = levelLabel;
    this.gameplaySceneKey = gameplaySceneKey;
    this.tileSize = 64;
    this.columns = 16;
    this.rows = 18; // Excluding black bars
    this.totalRows = this.rows + 3; // 1 on top, 2 on bottom
    this.occupancy = [];

    // score tracker
    this.score = 0;
    this.scoreText = null;

    // level display text
    this.levelText = null;
  }

  preload() {
    this.scene.load.tilemapTiledJSON('board', 'assets/Tilemaps/Board_Base.json');
    this.scene.load.image('square gray dark _png_128px', 'assets/Tilesets/square gray dark _png_128px.png');
    this.scene.load.image('square gray light _png_128px', 'assets/Tilesets/square gray light _png_128px.png');
    this.scene.load.image('pauseIcon', 'assets/UI/pause.png');

    if (!this.scene.cache.bitmapFont.exists('kennyFont') && !this.fontLoadingStarted) {
      this.fontLoadingStarted = true; 
      this.scene.load.bitmapFont('kennyFont', 'assets/UI/KennyRocketSquare_0.png', 'assets/UI/KennyRocketSquare.fnt');
    }
  }

  create() {
    const map = this.scene.make.tilemap({ key: 'board' });
    const darkTileset = map.addTilesetImage('square gray dark _png_128px', 'square gray dark _png_128px');
    const lightTileset = map.addTilesetImage('square gray light _png_128px', 'square gray light _png_128px');
    this.boardLayer = map.createLayer('Board_Base', [darkTileset, lightTileset], 0, this.tileSize);

    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x000000, 0);
    // Top bar (1 tile tall)
    graphics.fillRect(0, 0, this.columns * this.tileSize, this.tileSize);
    // Bottom bar (2 tiles tall)
    graphics.fillRect(0, (this.rows + 1) * this.tileSize, this.columns * this.tileSize, 2 * this.tileSize);

    this.occupancy = Array.from({ length: this.totalRows }, () =>
      Array(this.columns).fill(null)
    );

    // Font loading and UI setup
    if (this.scene.cache.bitmapFont.exists('kennyFont')) {
      this.fontLoaded = true;
      this.createPauseIcon();
      this.createScoreText();
    } else {
      this.scene.load.once('complete', () => {
        this.fontLoaded = true;
        this.createPauseIcon();
        this.createScoreText();
      });
      this.scene.load.start();
    }
    this.createLevelText();
    this.pauseKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.isPaused = false;
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.togglePause();
    }
  }
  createLevelText() {
    const centerX = (this.columns * this.tileSize) / 2;
    const y = this.tileSize / 2; // center vertically in top bar (1 tile tall)

    this.levelText = this.scene.add.bitmapText(
      centerX,
      y,
      'kennyFont',
      'LEVEL: ' + this.level,
      24
    )
    .setOrigin(0.5, 0.5)  // center origin horizontally and vertically
    .setTint(0xffffff);
  }

  createScoreText() {
    const margin = 20;
    const x = this.columns * this.tileSize - margin;
    // Clamp y to max game height - margin
    const maxY = 1200 - margin;
    const y = Math.min((this.rows + 1.5) * this.tileSize - margin, maxY);

    this.scoreText = this.scene.add.bitmapText(
      x,
      y,
      'kennyFont',
      'SCORE: 0',
      40
    )
    .setOrigin(1, 1)
    .setTint(0xffffff);
  }

  addScore(points) {
    this.score += points;
    if (this.scoreText) {
      this.scoreText.setText('SCORE: ' + this.score);
    }
  }

  resetScore() {
    this.score = 0;
    if (this.scoreText) {
      this.scoreText.setText('SCORE: 0');
    }
  }

  getScore() {
    return this.score;
  }

  togglePause() {
    const scenePlugin = this.scene.scene;
    const sceneManager = scenePlugin.manager;
    const key = this.gameplaySceneKey;

    console.log(`togglePause called for scene key: ${key}`);

    if (!sceneManager.isActive(key)) {
      console.warn(`Scene ${key} is not active, cannot toggle pause`);
      return;
    }

    const isPaused = sceneManager.isPaused(key);

    if (!isPaused) {
      scenePlugin.pause(key);
      scenePlugin.launch('PauseOverlay', { currentScene: key });
    } else {
      scenePlugin.resume(key);
      scenePlugin.stop('PauseOverlay');
    }
  }

  createPauseIcon() {
    this.pauseIcon = this.scene.add.image(40, 40, 'pauseIcon')
      .setOrigin(0.75)
      .setScale(0.10)
      .setTint(0xffffff)
      .setInteractive({ useHandCursor: true });

    this.pauseIcon.on('pointerdown', () => {
      this.togglePause();
    });
  }

  worldToTile(x, y) {
    return {
      col: Math.floor(x / this.tileSize),
      row: Math.floor(y / this.tileSize)
    };
  }

  tileToWorld(col, row) {
    return {
      x: col * this.tileSize + this.tileSize / 2,
      y: (row + 1) * this.tileSize + this.tileSize / 2  // shift row down 1
    };
  }

  getOccupant(col, row) {
    if (this.inBounds(col, row)) return this.occupancy[row][col];
    return null;
  }

  setOccupant(col, row, entity) {
    if (this.inBounds(col, row)) this.occupancy[row][col] = entity;
  }

  clearOccupant(col, row) {
    if (this.inBounds(col, row)) this.occupancy[row][col] = null;
  }

  inBounds(col, row) {
    return row >= 0 && row < this.totalRows && col >= 0 && col < this.columns;
  }
}