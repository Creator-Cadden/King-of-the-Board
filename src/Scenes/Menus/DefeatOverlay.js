export default class DefeatOverlay extends Phaser.Scene {
  constructor() {
    super('DefeatOverlay');
  }

  init(data) {
    this.currentScene = data.currentScene || null;
    this.score = data.score || 0;        // Score from the level
    this.levelLabel = data.levelLabel || "Unknown Level";
  }

  preload() {
    if (!this.cache.bitmapFont.exists('kennyFont')) {
      this.load.bitmapFont('kennyFont', 'assets/UI/KennyRocketSquare_0.png', 'assets/UI/KennyRocketSquare.fnt');
    }
  }

  create() {
    const { width, height } = this.cameras.main;

    // Dark semi-transparent background
    this.bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0);

    const centerX = width / 2;
    let currentY = height / 2 - 280;
    const spacing = 70;

    // Defeat title
    this.add.bitmapText(centerX, currentY, 'kennyFont', 'DEFEAT', 80)
      .setOrigin(0.5)
      .setTint(0xff3333);
    
    currentY += spacing + 20;

    // Score text
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
    this.scene.start(this.currentScene || 'IntroPawn'); // fallback to IntroPawn if missing
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
}