export default class Levels extends Phaser.Scene {
    constructor() {
        super('Levels');
    }

    preload() {
        // Load the button images (the sprites)
        this.load.image('pawn', 'assets/Images/e_pawn.png');
        this.load.image('rook', 'assets/Images/e_rook.png');
        this.load.image('bishop', 'assets/Images/e_bishop.png');
        this.load.image('knight', 'assets/Images/e_knight.png');
        this.load.image('queen', 'assets/Images/e_queen.png');
        
        // Load the KennyRocketSquare bitmap font
        this.load.bitmapFont('kennyFont', 'assets/UI/KennyRocketSquare_0.png', 'assets/UI/KennyRocketSquare.fnt');
    }

    create() {
        // Level keys and their corresponding sprite keys
        const levels = [
            { key: 'IntroPawn', sprite: 'pawn', label: 'Intro Pawn' },
            { key: 'IntroRook', sprite: 'rook', label: 'Intro Rook' },
            { key: 'IntroKnight', sprite: 'knight', label: 'Intro Knight' },
            { key: 'IntroBishop', sprite: 'bishop', label: 'Intro Bishop' },
            { key: 'IntroQueen', sprite: 'queen', label: 'Intro Queen' },
        ];

        const spacing = 160;
        const startX = this.cameras.main.centerX - ((levels.length - 1) * spacing) / 2;
        const y = 100;

        levels.forEach((level, index) => {
            const x = startX + index * spacing;

            // Add sprite as button
            const button = this.add.image(x, y, level.sprite)
                .setInteractive({ useHandCursor: true })
                .setScale(0.5); // change scale of the icon

            button.on('pointerover', () => button.setTint(0xffff88));
            button.on('pointerout', () => button.clearTint());
            button.on('pointerdown', () => {
                this.scene.start(level.key, { levelLabel: level.label });
            });

            // Add bitmap font label below the sprite button
            this.add.bitmapText(x, y + button.height / 2 + 10, 'kennyFont', level.label.toUpperCase(), 16).setOrigin(0.5);
        });

        // Back to Menu Button with bitmap font and border
        const backBtnX = this.cameras.main.centerX;
        const backBtnY = 300;
        const buttonWidth = 220;
        const buttonHeight = 50;

        // Create border graphics object
        const border = this.add.graphics();
        const drawBorder = (color = 0xffffff) => {
            border.clear();
            border.lineStyle(4, color);
            border.strokeRect(backBtnX - buttonWidth / 2, backBtnY - buttonHeight / 2, buttonWidth, buttonHeight);
        };

        drawBorder(); // initial white border

        const backBtn = this.add.bitmapText(backBtnX, backBtnY, 'kennyFont', 'BACK TO MENU', 24)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => {
            backBtn.setTint(0xffff88);
            drawBorder(0xffff88);
        });

        backBtn.on('pointerout', () => {
            backBtn.clearTint();
            drawBorder(0xffffff);
        });

        backBtn.on('pointerdown', () => {
            this.scene.start('Menu');
        });
    }
}