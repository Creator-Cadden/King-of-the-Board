export default class VictoryOverlay extends Phaser.Scene {
  constructor() {
    super('VictoryOverlay');
  }

  init(data) {
    this.currentScene = data.currentScene || null;
    this.score = data.score || 0;
    this.levelLabel = data.levelLabel || "Unknown Level";

    // Define next level here (basic logic; you can use a map or array to expand this)
    this.nextLevel = this.getNextLevel(this.currentScene);
  }

  preload() {
    if (!this.cache.bitmapFont.exists('kennyFont')) {
      this.load.bitmapFont('kennyFont', 'assets/UI/KennyRocketSquare_0.png', 'assets/UI/KennyRocketSquare.fnt');
    }
  }

  create() {
    const { width, height } = this.cameras.main;

    this.bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    const centerX = width / 2;
    let currentY = height / 2 - 280;
    const spacing = 70;

    // Victory title
    this.add.bitmapText(centerX, currentY, 'kennyFont', 'VICTORY', 80)
      .setOrigin(0.5)
      .setTint(0x33ff33);

    currentY += spacing + 20;

    // Score and level info
    this.add.bitmapText(centerX, currentY, 'kennyFont', `LEVEL: ${this.levelLabel}`, 36)
      .setOrigin(0.5)
      .setTint(0xffffff);

    currentY += spacing;

    this.add.bitmapText(centerX, currentY, 'kennyFont', `SCORE: ${this.score}`, 36)
      .setOrigin(0.5)
      .setTint(0xffffff);

    currentY += spacing + 40;

    // Buttons
    this.replayBtn = this.createButton(centerX, currentY, 'REPLAY', () => this.replayLevel());
    currentY += spacing;

    // Next level button (only if nextLevel is defined)
    if (this.nextLevel) {
      this.nextBtn = this.createButton(centerX, currentY, 'NEXT LEVEL', () => this.goToNextLevel());
      currentY += spacing;
    }

    this.levelsBtn = this.createButton(centerX, currentY, 'LEVELS', () => this.gotoLevels());
    currentY += spacing;

    this.menuBtn = this.createButton(centerX, currentY, 'MAIN MENU', () => this.gotoMenu());
  }

  createButton(x, y, label, callback) {
    const btn = this.add.bitmapText(x, y, 'kennyFont', label, 40)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setTint(0xffff88));
    btn.on('pointerout', () => btn.clearTint());
    btn.on('pointerdown', callback);

    return btn;
  }

  replayLevel() {
    if (this.currentScene) {
      this.scene.stop(this.currentScene);
    }
    this.scene.start(this.currentScene || 'IntroPawn');
    this.scene.stop();
  }

  goToNextLevel() {
    if (this.currentScene) {
      this.scene.stop(this.currentScene);
    }
    this.scene.start(this.nextLevel);
    this.scene.stop();
  }

  gotoLevels() {
    if (this.currentScene) {
      this.scene.stop(this.currentScene);
    }
    this.scene.start('Levels');
  }

  gotoMenu() {
    if (this.currentScene) {
      this.scene.stop(this.currentScene);
    }
    this.scene.start('Menu');
  }

  getNextLevel(current) {
    // Expand this map as you add more levels
    const levelSequence = {
      'IntroPawn': 'IntroRook',
      'IntroRook': 'IntroKnight',
      'IntroKnight': 'IntroBishop',
      'IntroBishop': 'IntroQueen'
    };

    return levelSequence[current] || null;
  }
}