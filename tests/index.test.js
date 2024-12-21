import { describe, test, expect, vi, beforeAll, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Importaciones de módulos a mockear
import { MetamaskService } from '../src/services/MetamaskService.js';
import { UIController } from '../src/ui/UIController.js';
import { App } from '../src/app/App.js';

// Mock de los servicios y controladores
vi.mock('../src/services/MetamaskService.js', () => ({
  MetamaskService: vi.fn().mockImplementation(() => ({}))
}));
vi.mock('../src/ui/UIController.js', () => ({
  UIController: vi.fn().mockImplementation(() => ({}))
}));
vi.mock('../src/app/App.js', () => ({
  App: vi.fn().mockImplementation(() => {})
}));

describe('Inicialización de la aplicación', () => {
  let dom;
  let originalConsoleError;

  beforeAll(() => {
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

    // Guardar el console.error original
    originalConsoleError = console.error;
  });

  afterAll(() => {
    // Restaurar el console.error original
    console.error = originalConsoleError;
    
    // Limpiar el DOM simulado
    dom.window.close();
  });

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    vi.clearAllMocks();
  });

  test('DOMContentLoaded listener se registra correctamente', async () => {
    // Espiar addEventListener
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    // Importar index.js para disparar el event listener
    await import('../src/index.js');

    // Verificar que se registró el event listener para DOMContentLoaded
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'DOMContentLoaded', 
      expect.any(Function)
    );

    // Simular el evento DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);

    // Verificar que los constructores se llamaron
    expect(MetamaskService).toHaveBeenCalledTimes(1);
    expect(UIController).toHaveBeenCalledTimes(1);
    expect(App).toHaveBeenCalledTimes(1);
  });

  test('Servicios se inicializan correctamente en DOMContentLoaded', async () => {
    // Importar index.js para disparar el event listener
    await import('../src/index.js');

    // Simular el evento DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);

    // Verificar que los constructores se llamaron correctamente
    expect(MetamaskService).toHaveBeenCalledTimes(1);
    expect(UIController).toHaveBeenCalledTimes(1);
    expect(App).toHaveBeenCalledTimes(1);
    expect(App).toHaveBeenCalledWith(
      expect.any(Object), 
      expect.any(Object)
    );
  });

  test('Manejo de errores en la inicialización', async () => {
    // Espiar console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

    // Simular un error en la inicialización de MetamaskService
    MetamaskService.mockImplementationOnce(() => {
      throw new Error('Error de inicialización');
    });

    // Importar index.js para disparar el event listener
    await import('../src/index.js');

    // Simular el evento DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);

    // Verificar que se registró el error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in DOMContentLoaded listener:', 
      expect.any(Error)
    );

    // Verificar que el mensaje de error sea correcto
    const errorCall = consoleErrorSpy.mock.calls[0];
    expect(errorCall[1].message).toBe('Error de inicialización');

    // Restaurar console.error
    consoleErrorSpy.mockRestore();
  });
});