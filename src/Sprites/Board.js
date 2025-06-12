export default class BoardManager {
  constructor(scene) {
    this.scene = scene;
  }

  preload() {
    this.scene.load.tilemapTiledJSON('board', 'assets/Board_Base.tmx');
    this.scene.load.image('tiles', 'assets/tileset.png');
  }

  create() {
    this.map = this.scene.make.tilemap({ key: 'board' });
    const tileset = this.map.addTilesetImage('TilesetNameInTiled', 'tiles');
    this.groundLayer = this.map.createLayer('GroundLayer', tileset);

    // Additional setup like grid logic, occupancy, collision etc.
  }
}