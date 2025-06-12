export default class Settings extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  create() {
    // Just go back to Menu immediately for now
    this.scene.start('Menu');
  }
}