import { MetamaskService } from '../services/MetamaskService.js';
import { UIController } from '../ui/UIController.js';

export class App {
    constructor() {
        this.metamaskService = new MetamaskService();
        this.ui = new UIController();
        this.account = null;
        this.initialize();
    }

    initialize() {
        if (this.metamaskService.isMetamaskInstalled()) {
            this.ui.setStatus('Metamask está instalado. Puedes conectarte.');
            this.ui.connectButton.addEventListener('click', () => this.toggleConnection());
            // Detectar cambios de cuenta
            window.ethereum.on('accountsChanged', (accounts) => this.handleAccountsChanged(accounts));
        } else {
            this.ui.setStatus('Por favor, instala Metamask para usar esta DApp.');
            this.ui.connectButton.disabled = true; // Desactiva el botón si Metamask no está instalado
        }
    }

    async toggleConnection() {
        if (this.account) {
            this.disconnect();
        } else {
            this.connect();
        }
    }

    async connect() {
        try {
            const account = await this.metamaskService.connect();
            this.account = account;
            this.ui.setConnectedState(account);
        } catch (error) {
            this.ui.setStatus(`Error al conectar: ${error.message}`);
        }
    }

    disconnect() {
        // Metamask no tiene una función para desconectar programáticamente,
        // así que simplemente actualizamos el estado de la UI.
        this.account = null;
        this.ui.setDisconnectedState();
    }

    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // El usuario ha desconectado su cuenta
            this.disconnect();
        } else {
            this.account = accounts[0];
            this.ui.setConnectedState(this.account);
        }
    }
}