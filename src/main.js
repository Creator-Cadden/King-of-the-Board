// main.js
import PlayerKing from './Sprites/PlayerKing.js';
import Pawn from './Sprites/Pawn.js';
import Rook from './Sprites/Rook.js';
import Knight from './Sprites/Knight.js';
import Bishop from './Sprites/Bishop.js';
import Queen from './Sprites/Queen.js';

import Bullet from './Sprites/Bullet.js';
import Pellet from './Sprites/Pellet.js';
import Beam from './Sprites/Beam.js';


import Menu from './Scenes/Menus/Menu.js';
import Levels from './Scenes/Menus/Levels.js';
import Customizations from './Scenes/Menus/Customizations.js';
import Settings from './Scenes/Menus/Settings.js';
import VictoryOverlay from './Scenes/Menus/VictoryOverlay.js';
import DefeatOverlay from './Scenes/Menus/DefeatOverlay.js';
import PauseOverlay from './Scenes/Menus/PauseOverlay.js';

import IntroPawn from './Scenes/Levels/IntroPawn.js';
import IntroRook from './Scenes/Levels/IntroRook.js';
import IntroBishop from './Scenes/Levels/IntroBishop.js';
import IntroKnight from './Scenes/Levels/IntroKnight.js';
import IntroQueen from './Scenes/Levels/IntroQueen.js';

const config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    fps: { forceSetTimeOut: true, target: 60 },
    width: 1030,
    height: 1200,

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },

    scale: {
    mode: Phaser.Scale.NONE,           // **do not scale the canvas**
    autoCenter: Phaser.Scale.CENTER_BOTH // center canvas in the window
    },

    scene: [
        Menu,
        Levels,
        Customizations,
        Settings,
        IntroPawn,
        IntroRook,
        IntroBishop,
        IntroKnight,
        IntroQueen,
        PauseOverlay,
        VictoryOverlay,
        DefeatOverlay
    ]
};

const game = new Phaser.Game(config);