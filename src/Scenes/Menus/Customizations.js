export default class Customizations extends Phaser.Scene {
  constructor() {
    super('Customizations');
  }

  create() {
    // Just go back to Menu immediately for now
    this.scene.start('Menu');
  }
}