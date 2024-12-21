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
        dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="networkInfo" class="hidden"></div>
          <div id="accountInfo" class="hidden"></div>
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

    // Pruebas adicionales para los nuevos métodos y comportamientos

    

    test('updateNetworkInfoUI no modifica elementos si no existen', () => {
        // Simular información de red
        app.networkInfo = {
            chainId: '0x1',
            networkName: 'Ethereum Mainnet'
        };

        // No añadir elementos al DOM
        // Llamar al método no debería lanzar errores
        expect(() => app.updateNetworkInfoUI()).not.toThrow();
    });

    

    test('updateAccountBalanceUI no modifica elementos si no existen', () => {
        // Simular cuenta
        app.account = '0x1234567890123456789012345678901234567890';

        // No añadir elementos al DOM
        // Llamar al método no debería lanzar errores
        expect(() => app.updateAccountBalanceUI('0.5')).not.toThrow();
    });

    

    test('hideNetworkAndAccountInfo no lanza errores si elementos no existen', () => {
        // No añadir elementos al DOM
        // Llamar al método no debería lanzar errores
        expect(() => app.hideNetworkAndAccountInfo()).not.toThrow();
    });

    test('getNetworkName devuelve nombres de red correctos', () => {
        const testCases = [
            { chainId: '0x1', expectedName: 'Ethereum Mainnet' },
            { chainId: '0x38', expectedName: 'Binance Smart Chain Mainnet' },
            { chainId: '0x89', expectedName: 'Polygon Mainnet (Matic)' },
            { chainId: '0xABC', expectedName: 'Red Desconocida (0xABC)' }
        ];

        testCases.forEach(({ chainId, expectedName }) => {
            expect(app.getNetworkName(chainId)).toBe(expectedName);
        });
    });

    test('fetchNetworkInfo maneja errores de manera segura', async () => {
        // Mockear window.ethereum.request para que lance un error
        global.window.ethereum.request = vi.fn().mockRejectedValue(new Error('Network error'));

        // Espiar console.error
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

        // Llamar al método
        await app.fetchNetworkInfo();

        // Verificar que se registró el error
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error al obtener información de red:',
            expect.any(Error)
        );

        // Restaurar console.error
        consoleErrorSpy.mockRestore();
    });

    test('fetchAccountBalance maneja errores de manera segura', async () => {
        // Establecer una cuenta para que el método continúe
        app.account = '0x1234567890123456789012345678901234567890';

        // Mockear window.ethereum.request para que lance un error
        global.window.ethereum.request = vi.fn().mockRejectedValue(new Error('Balance error'));

        // Espiar console.error
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

        // Llamar al método
        await app.fetchAccountBalance();

        // Verificar que se registró el error
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error al obtener balance:',
            expect.any(Error)
        );

        // Restaurar console.error
        consoleErrorSpy.mockRestore();
    });

    test('updateNetworkInfoUI actualiza la información de red correctamente', () => {
        // Simular información de red
        app.networkInfo = {
            chainId: '0x1',
            networkName: 'Ethereum Mainnet'
        };

        // Crear elementos en el DOM
        const networkNameEl = document.createElement('div');
        networkNameEl.id = 'networkName';
        document.body.appendChild(networkNameEl);

        const networkIdEl = document.createElement('div');
        networkIdEl.id = 'networkId';
        document.body.appendChild(networkIdEl);


        const networkInfoContainer = document.getElementById('networkInfo');


        // Llamar al método
        app.updateNetworkInfoUI();

        // Verificar actualizaciones
        expect(networkNameEl.textContent).toBe('Ethereum Mainnet');
        expect(networkIdEl.textContent).toBe('1 (0x1)');
        
        // Verificar que la clase 'hidden' se elimina
        expect(networkInfoContainer.classList.contains('hidden')).toBe(false);
    });

    test('updateAccountBalanceUI actualiza la información de cuenta correctamente', () => {
        // Simular cuenta
        app.account = '0x1234567890123456789012345678901234567890';

        // Crear elementos en el DOM
        const accountAddressEl = document.createElement('div');
        accountAddressEl.id = 'accountAddress';
        document.body.appendChild(accountAddressEl);

        const accountBalanceEl = document.createElement('div');
        accountBalanceEl.id = 'accountBalance';
        document.body.appendChild(accountBalanceEl);

        const accountInfoContainer = document.getElementById('accountInfo');

        // Llamar al método
        app.updateAccountBalanceUI('0.5');

        // Verificar actualizaciones
        expect(accountAddressEl.textContent).toBe(app.account);
        expect(accountBalanceEl.textContent).toBe('0.5 ETH');
        
        // Verificar que la clase 'hidden' se elimina
        expect(accountInfoContainer.classList.contains('hidden')).toBe(false);
    });

    test('hideNetworkAndAccountInfo oculta contenedores de información', () => {
        const networkInfoContainer = document.getElementById('networkInfo');
        const accountInfoContainer = document.getElementById('accountInfo');

        //  Asegurar que no tienen hidden antes de la prueba
        networkInfoContainer.classList.remove('hidden');
        accountInfoContainer.classList.remove('hidden');

        // Llamar al método
        app.hideNetworkAndAccountInfo();

        // Verificar que la clase 'hidden' se añade
        expect(networkInfoContainer.classList.contains('hidden')).toBe(true);
        expect(accountInfoContainer.classList.contains('hidden')).toBe(true);
    });
});