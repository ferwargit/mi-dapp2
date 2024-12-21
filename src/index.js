import { App } from './app/App.js';
import { MetamaskService } from './services/MetamaskService.js';
import { UIController } from './ui/UIController.js';

document.addEventListener('DOMContentLoaded', () => {
  const metamaskService = new MetamaskService();
  const uiController = new UIController();
  new App(metamaskService, uiController);
});