export const App = (() => {
  // /src/app/App.js
  class App {
    constructor(metamaskService, uiController) {
      this.metamaskService = metamaskService;
      this.ui = uiController;
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
      this.account = null;
      this.ui.setDisconnectedState();
    }

    handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.account = accounts[0];
        this.ui.setConnectedState(this.account);
      }
    }
  }

  return App; // Exportamos la clase como parte del módulo
})();