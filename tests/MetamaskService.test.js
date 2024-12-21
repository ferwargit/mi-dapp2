import { describe, test, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { MetamaskService } from '../src/services/MetamaskService.js';

describe('MetamaskService', () => {
  let metamaskService;
  let dom;

  beforeEach(() => {
    // Configurar un entorno DOM simulado
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    // Configurar el objeto global
    global.window = dom.window;
    global.window.ethereum = {
      isMetaMask: true,
      request: vi.fn()
    };

    // Crear una instancia de MetamaskService
    metamaskService = new MetamaskService();
  });

  afterEach(() => {
    // Limpiar el DOM simulado
    dom.window.close();
  });

  test('constructor inicializa correctamente ethereum', () => {
    expect(metamaskService.ethereum).toBe(window.ethereum);
  });

  test('isMetamaskInstalled devuelve true cuando ethereum está definido', () => {
    expect(metamaskService.isMetamaskInstalled()).toBe(true);
  });

  test('isMetamaskInstalled devuelve false cuando ethereum no está definido', () => {
    // Eliminar ethereum del objeto window
    delete global.window.ethereum;
    
    // Recrear la instancia de MetamaskService
    metamaskService = new MetamaskService();
    
    expect(metamaskService.isMetamaskInstalled()).toBe(false);
  });

  test('connect solicita cuentas cuando Metamask está instalado', async () => {
    // Simular una respuesta de cuentas
    const mockAccounts = ['0x1234567890123456789012345678901234567890'];
    global.window.ethereum.request.mockResolvedValue(mockAccounts);

    const account = await metamaskService.connect();

    expect(global.window.ethereum.request).toHaveBeenCalledWith({ method: 'eth_requestAccounts' });
    expect(account).toBe(mockAccounts[0]);
  });

  test('connect lanza un error cuando Metamask no está instalado', async () => {
    // Eliminar ethereum del objeto window
    delete global.window.ethereum;
    
    // Recrear la instancia de MetamaskService
    metamaskService = new MetamaskService();

    await expect(metamaskService.connect()).rejects.toThrow('Metamask no está instalado.');
  });

  test('disconnect no hace nada', async () => {
    // Simplemente verificamos que no lanza ningún error
    await expect(metamaskService.disconnect()).resolves.toBeUndefined();
  });
});