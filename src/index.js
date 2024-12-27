// index.js
import { App } from './app/App.js';
import { MetamaskService } from './services/MetamaskService.js';
import { UIController } from './ui/UIController.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOMContentLoaded event listener triggered');
        
        // Verificaciones de seguridad adicionales
        if (!MetamaskService || !UIController || !App) {
            throw new Error('Uno o más servicios no están disponibles');
        }

        const metamaskService = new MetamaskService();
        console.log('MetamaskService instance created');
        
        const uiController = new UIController();
        console.log('UIController instance created');
        
        new App(metamaskService, uiController);
        console.log('App instance created');
    } catch (error) {
        console.error('Error in DOMContentLoaded listener:', error);
        
        // Opcional: mostrar un mensaje de error al usuario
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = `Error de inicialización: ${error.message}`;
            statusElement.style.color = 'red';
        }
    }
});