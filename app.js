// src/app.js

class MetamaskService {
  constructor() {
    this.ethereum = window.ethereum;
  }

  isMetamaskInstalled() {
    return typeof this.ethereum !== 'undefined';
  }

  async connect() {
    if (!this.isMetamaskInstalled()) {
      throw new Error('Metamask no está instalado.');
    }
    const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  }

  async disconnect() {
    // Metamask no proporciona un método directo para desconectar,
    // pero podemos manejar el estado en la aplicación.
    return;
  }
}

class UIController {
  constructor() {
    this.connectButton = document.getElementById('connectButton');
    this.status = document.getElementById('status');
    this.pageTitle = document.getElementById('pageTitle'); // Referencia al título
  }

  setStatus(message) {
    this.status.textContent = message;
  }

  setConnectedState(account) {
    this.pageTitle.style.display = 'none'; // Oculta el título
    this.connectButton.textContent = 'Desconectar Metamask';
    this.connectButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    this.connectButton.classList.add('bg-red-500', 'hover:bg-red-600');
    this.setStatus(`Conectado: ${account}`);
  }

  setDisconnectedState() {
    this.pageTitle.style.display = 'block'; // Muestra el título
    this.connectButton.textContent = 'Conectar a Metamask';
    this.connectButton.classList.remove('bg-red-500', 'hover:bg-red-600');
    this.connectButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
    this.setStatus('Desconectado');
  }
}

class App {
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

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
