import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Habilita el uso de variables globales como "describe", "it", y "expect"
    environment: 'jsdom', // Utiliza el entorno de JS DOM para los tests
  },
});