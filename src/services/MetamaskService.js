export const MetamaskService = (() => {
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
  
    return MetamaskService; // Exportamos la clase como parte del módulo
  })();