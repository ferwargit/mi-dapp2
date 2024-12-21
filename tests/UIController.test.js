import { describe, test, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { UIController } from '../src/ui/UIController.js';

describe('UIController', () => {
  let dom;
  let uiController;
  let mockDocument;

  beforeEach(() => {
    // Configurar un entorno DOM simulado
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="pageTitle">Título de la Página</div>
          <button id="connectButton">Conectar a Metamask</button>
          <div id="status"></div>
        </body>
      </html>
    `, {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    // Configurar el objeto global
    global.document = dom.window.document;
    global.window = dom.window;

    // Crear una instancia de UIController
    uiController = new UIController();
  });

  test('setConnectedState cambia el estado de la interfaz', () => {
    const testAccount = '0x1234567890123456789012345678901234567890';
    uiController.setConnectedState(testAccount);

    expect(uiController.pageTitle.style.display).toBe('none');
    expect(uiController.connectButton.textContent).toBe('Desconectar Metamask');
    expect(uiController.connectButton.classList.contains('bg-red-500')).toBe(true);

    // Modificar la prueba para reflejar el nuevo comportamiento
    expect(uiController.status.textContent).toBe('');
  });

  test('setDisconnectedState restaura el estado inicial', () => {
    uiController.setDisconnectedState();

    expect(uiController.pageTitle.style.display).toBe('block');
    expect(uiController.connectButton.textContent).toBe('Conectar a Metamask');
    expect(uiController.connectButton.classList.contains('bg-blue-500')).toBe(true);
    expect(uiController.status.textContent).toBe('Desconectado');
  });

  test('setConnectedState y setDisconnectedState alternan correctamente las clases CSS', () => {
    const testAccount = '0x1234567890123456789012345678901234567890';

    // Cambiar a estado conectado
    uiController.setConnectedState(testAccount);
    expect(uiController.connectButton.classList.contains('bg-red-500')).toBe(true);
    expect(uiController.connectButton.classList.contains('bg-blue-500')).toBe(false);

    // Cambiar a estado desconectado
    uiController.setDisconnectedState();
    expect(uiController.connectButton.classList.contains('bg-blue-500')).toBe(true);
    expect(uiController.connectButton.classList.contains('bg-red-500')).toBe(false);
  });
});