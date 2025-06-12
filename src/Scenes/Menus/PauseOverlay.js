export default class PauseOverlay extends Phaser.Scene {
  constructor() {
    super('PauseOverlay');
  }

  init(data) {
    this.currentScene = data.currentScene || null;
  }

  preload() {
    if (!this.cache.bitmapFont.exists('kennyFont')) {
      this.load.bitmapFont('kennyFont', 'assets/UI/KennyRocketSquare_0.png', 'assets/UI/KennyRocketSquare.fnt');
    }
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent dark background
    this.bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    // Buttons position config
    const centerX = width / 2;
    const startY = height / 2 - 60;
    const spacing = 80;

    // Buttons
    this.resumeBtn = this.createButton(centerX, startY, 'RESUME', () => this.resumeGame());
    this.levelsBtn = this.createButton(centerX, startY + spacing, 'LEVELS', () => this.gotoLevels());
    this.menuBtn = this.createButton(centerX, startY + spacing * 2, 'MAIN MENU', () => this.gotoMenu());
   
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pauseKey.on('down', () => {
    this.resumeGame();
    });
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

  resumeGame() {
    if (this.currentScene) {
      this.scene.resume(this.currentScene);
    }
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