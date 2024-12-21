// src/ui/UIController.js
export const UIController = (() => {
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
  
    return UIController; // Exportamos la clase como parte del módulo
  })();