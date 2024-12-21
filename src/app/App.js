export const App = (() => {
  // /src/app/App.js
  class App {
    constructor(metamaskService, uiController) {
      this.metamaskService = metamaskService;
      this.ui = uiController;
      this.account = null;
      this.networkInfo = null;
      this.initialize();
    }

    initialize() {
      if (this.metamaskService.isMetamaskInstalled()) {
        this.ui.setStatus('Metamask está instalado. Puedes conectarte.');
        this.ui.connectButton.addEventListener('click', () => this.toggleConnection());
        
        // Detectar cambios de cuenta
        window.ethereum.on('accountsChanged', (accounts) => this.handleAccountsChanged(accounts));
        
        // Detectar cambios de red
        window.ethereum.on('chainChanged', (chainId) => this.handleNetworkChanged(chainId));
      } else {
        this.ui.setStatus('Por favor, instala Metamask para usar esta DApp.');
        this.ui.connectButton.disabled = true; // Desactiva el botón si Metamask no está instalado
      }
    }

    async toggleConnection() {
      if (this.account) {
        this.disconnect();
      } else {
        await this.connect();
      }
    }

    async connect() {
      try {
        const account = await this.metamaskService.connect();
        this.account = account;
        this.ui.setConnectedState(account);
        
        // Obtener información de red y balance después de conectar
        await this.fetchNetworkInfo();
        await this.fetchAccountBalance();
      } catch (error) {
        this.ui.setStatus(`Error al conectar: ${error.message}`);
      }
    }

    disconnect() {
      this.account = null;
      this.networkInfo = null;
      this.ui.setDisconnectedState();
      this.hideNetworkAndAccountInfo();
    }

    handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.account = accounts[0];
        this.ui.setConnectedState(this.account);
        this.fetchAccountBalance(); // Actualizar balance cuando cambia la cuenta
      }
    }

    handleNetworkChanged(chainId) {
      this.fetchNetworkInfo();
      
      // Si hay una cuenta conectada, actualizar su balance cuando cambia la red
      if (this.account) {
        this.fetchAccountBalance();
      }
    }

    async fetchNetworkInfo() {
      if (!this.metamaskService.isMetamaskInstalled()) return;

      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkName = this.getNetworkName(chainId);
        
        this.networkInfo = { chainId, networkName };
        this.updateNetworkInfoUI();
      } catch (error) {
        console.error('Error al obtener información de red:', error);
      }
    }

    async fetchAccountBalance() {
      if (!this.account) return;

      try {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [this.account, 'latest']
        });
        
        // Convertir balance de hexadecimal a decimal
        const balanceInEther = parseInt(balance, 16) / Math.pow(10, 18);
        this.updateAccountBalanceUI(balanceInEther.toFixed(4));
      } catch (error) {
        console.error('Error al obtener balance:', error);
      }
    }

    getNetworkName(chainId) {
      const networks = {
        // Ethereum
        '0x1': 'Ethereum Mainnet',
        '0x3': 'Ropsten Testnet',
        '0x4': 'Rinkeby Testnet',
        '0x5': 'Goerli Testnet',
        '0x2a': 'Kovan Testnet',

        // Binance Smart Chain
        '0x38': 'Binance Smart Chain Mainnet',
        '0x61': 'Binance Smart Chain Testnet',

        // Polygon
        '0x89': 'Polygon Mainnet (Matic)',
        '0x13881': 'Polygon Mumbai Testnet',

        // Avalanche
        '0xa86a': 'Avalanche C-Chain Mainnet',
        '0xa869': 'Avalanche Fuji Testnet',

        // Optimism
        '0xa': 'Optimism Mainnet',
        '0x1a4': 'Optimism Goerli Testnet',

        // Arbitrum
        '0xa4b1': 'Arbitrum One Mainnet',
        '0x66eed': 'Arbitrum Goerli Testnet',

        // Harmony
        '0x63564c40': 'Harmony Mainnet Shard 0',
        '0x6357d2e0': 'Harmony Testnet Shard 0',

        // Fantom
        '0xfa': 'Fantom Opera Mainnet',
        '0xfa2': 'Fantom Testnet',

        // Celo
        '0xa4ec': 'Celo Mainnet',
        '0xaef3': 'Celo Alfajores Testnet',

        // Sepolia
        '0xaa36a7': 'Sepolia',

        // Scroll Sepolia
        '0x8274f': 'Scroll Sepolia',

      };
      
      return networks[chainId] || `Red Desconocida (${chainId})`;
    }

    updateNetworkInfoUI() {
      if (!this.networkInfo) return;

      const networkNameEl = document.getElementById('networkName');
      const networkIdEl = document.getElementById('networkId');
      const networkInfoContainer = document.getElementById('networkInfo');

      // Verificar si los elementos existen antes de modificarlos
      if (networkNameEl && networkIdEl && networkInfoContainer) {
        networkNameEl.textContent = this.networkInfo.networkName;
        
        // Convertir el ID de red de hexadecimal a decimal
        const networkIdDecimal = parseInt(this.networkInfo.chainId, 16);
        networkIdEl.textContent = `${networkIdDecimal} (${this.networkInfo.chainId})`;
        
        networkInfoContainer.classList.remove('hidden');
      }
    }

    updateAccountBalanceUI(balance) {
      const accountAddressEl = document.getElementById('accountAddress');
      const accountBalanceEl = document.getElementById('accountBalance');
      const accountInfoContainer = document.getElementById('accountInfo');

      // Verificar si los elementos existen antes de modificarlos
      if (accountAddressEl && accountBalanceEl && accountInfoContainer) {
        accountAddressEl.textContent = this.account;
        accountBalanceEl.textContent = `${balance} ETH`;
        accountInfoContainer.classList.remove('hidden');
      }
    }

    hideNetworkAndAccountInfo() {
      const networkInfoContainer = document.getElementById('networkInfo');
      const accountInfoContainer = document.getElementById('accountInfo');

      // Verificar si los elementos existen antes de modificar
      if (networkInfoContainer) {
        networkInfoContainer.classList.add('hidden');
      }
      
      if (accountInfoContainer) {
        accountInfoContainer.classList.add('hidden');
      }
    }
  }

  return App; // Exportamos la clase como parte del módulo
})();