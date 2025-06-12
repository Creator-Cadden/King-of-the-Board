export default class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    preload() {
        // Load KennyRocketSquare bitmap font
        this.load.bitmapFont('kennyFont', 'assets/UI/KennyRocketSquare_0.png', 'assets/UI/KennyRocketSquare.fnt');
    }

    create() {
        const centerX = this.cameras.main.width / 2;

        // Title
        this.add.bitmapText(centerX, 350, 'kennyFont', 'KING OF THE BOARD', 64).setOrigin(0.5);

        // Button layout
        const spacing = 100;
        let startY = 500;

        this.addMenuButton(centerX, startY, 'PLAY GAME', 'Levels');
        this.addMenuButton(centerX, startY + spacing, 'CUSTOMIZATION', 'Customizations');
        this.addMenuButton(centerX, startY + spacing * 2, 'SETTINGS', 'Settings');
        this.addMenuButton(centerX, startY + spacing * 3, 'QUIT GAME', null, () => window.close());

        const footerText = this.add.bitmapText(
            this.cameras.main.width / 2,
            this.cameras.main.height - 40,
            'kennyFont',
            'Cadden Wu - 2025',
            24
        ).setOrigin(0.5, 1) // Centered horizontally, aligned to bottom
        .setTint(0xaaaaaa); 
    }

    addMenuButton(x, y, label, sceneKey, callback) {
    const buttonWidth = 400;
    const buttonHeight = 60;

    // Create border graphics object
    const border = this.add.graphics();
    const drawBorder = (color = 0xffffff) => {
        border.clear();
        border.lineStyle(4, color);
        border.strokeRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight);
    };

    drawBorder(); // Initial white border

    // Create the interactive text
    const buttonText = this.add.bitmapText(x, y, 'kennyFont', label, 32)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    // Hover effects
    buttonText.on('pointerover', () => {
        buttonText.setTint(0xffff88);
        drawBorder(0xffff88); // yellow border on hover
    });

    buttonText.on('pointerout', () => {
        buttonText.clearTint();
        drawBorder(0xffffff); // restore white border
    });

    buttonText.on('pointerdown', () => {
        if (callback) {
            callback();
        } else if (sceneKey) {
            this.scene.start(sceneKey);
        }
    });
    }
}