import { describe, test, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { App } from '../src/app/App.js';

describe('App', () => {
  let mockMetamaskService;
  let mockUIController;
  let app;
  let dom;

  beforeEach(() => {
    // Configurar un entorno DOM simulado
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    // Configurar el objeto global
    global.document = dom.window.document;
    global.window = dom.window;
    global.Event = dom.window.Event;
    
    // Crear un mock de ethereum que simula la interfaz completa
    global.window.ethereum = {
      isMetaMask: true,
      on: vi.fn(),
      request: vi.fn().mockResolvedValue(['0x1234'])
    };

    // Crear mocks para los servicios
    mockMetamaskService = {
      isMetamaskInstalled: vi.fn().mockReturnValue(true),
      connect: vi.fn().mockResolvedValue('0x1234')
    };

    mockUIController = {
      setStatus: vi.fn(),
      connectButton: {
        addEventListener: vi.fn(),
        disabled: false
      },
      setConnectedState: vi.fn(),
      setDisconnectedState: vi.fn()
    };

    // Crear una instancia de App
    app = new App(mockMetamaskService, mockUIController);
  });

  afterEach(() => {
    // Limpiar el DOM simulado
    dom.window.close();
  });

  test('constructor inicializa correctamente los servicios', () => {
    expect(app.metamaskService).toBe(mockMetamaskService);
    expect(app.ui).toBe(mockUIController);
    expect(app.account).toBeNull();
  });

  test('initialize cuando Metamask está instalado', () => {
    // Simular que Metamask está instalado
    mockMetamaskService.isMetamaskInstalled.mockReturnValue(true);

    // Llamar a initialize
    app.initialize();

    // Verificar llamadas a métodos
    expect(mockUIController.setStatus).toHaveBeenCalledWith('Metamask está instalado. Puedes conectarte.');
    expect(mockUIController.connectButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(global.window.ethereum.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
  });

  test('initialize cuando Metamask no está instalado', () => {
    // Simular que Metamask no está instalado
    mockMetamaskService.isMetamaskInstalled.mockReturnValue(false);

    // Llamar a initialize
    app.initialize();

    // Verificar llamadas a métodos
    expect(mockUIController.setStatus).toHaveBeenCalledWith('Por favor, instala Metamask para usar esta DApp.');
    expect(mockUIController.connectButton.disabled).toBe(true);
  });

  test('connect - conexión exitosa', async () => {
    // Simular una conexión exitosa
    const mockAccount = '0x1234567890123456789012345678901234567890';
    mockMetamaskService.connect.mockResolvedValue(mockAccount);

    // Llamar a connect
    await app.connect();

    // Verificar resultados
    expect(app.account).toBe(mockAccount);
    expect(mockUIController.setConnectedState).toHaveBeenCalledWith(mockAccount);
  });

  test('connect - conexión fallida', async () => {
    // Simular un error de conexión
    const mockError = new Error('Error de conexión');
    mockMetamaskService.connect.mockRejectedValue(mockError);

    // Llamar a connect
    await app.connect();

    // Verificar resultados
    expect(app.account).toBeNull();
    expect(mockUIController.setStatus).toHaveBeenCalledWith(`Error al conectar: ${mockError.message}`);
  });

  test('disconnect', () => {
    // Establecer una cuenta antes de desconectar
    app.account = '0x1234567890123456789012345678901234567890';

    // Llamar a disconnect
    app.disconnect();

    // Verificar resultados
    expect(app.account).toBeNull();
    expect(mockUIController.setDisconnectedState).toHaveBeenCalled();
  });

  test('handleAccountsChanged - sin cuentas', () => {
    // Establecer una cuenta antes de cambiar
    app.account = '0x1234567890123456789012345678901234567890';

    // Simular cambio de cuentas sin cuentas
    app.handleAccountsChanged([]);

    // Verificar resultados
    expect(app.account).toBeNull();
    expect(mockUIController.setDisconnectedState).toHaveBeenCalled();
  });

  test('handleAccountsChanged - con cuentas', () => {
    const mockAccount = '0x1234567890123456789012345678901234567890';

    // Simular cambio de cuentas con una cuenta
    app.handleAccountsChanged([mockAccount]);

    // Verificar resultados
    expect(app.account).toBe(mockAccount);
    expect(mockUIController.setConnectedState).toHaveBeenCalledWith(mockAccount);
  });
});