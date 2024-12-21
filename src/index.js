// index.js
import { App } from './app/App.js';
import { MetamaskService } from './services/MetamaskService.js';
import { UIController } from './ui/UIController.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOMContentLoaded event listener triggered');
        const metamaskService = new MetamaskService();
        console.log('MetamaskService instance created');
        const uiController = new UIController();
        console.log('UIController instance created');
        new App(metamaskService, uiController);
        console.log('App instance created');
    } catch (error) {
        console.error('Error in DOMContentLoaded listener:', error);
    }
});