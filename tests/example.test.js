import { describe, it, expect } from 'vitest';

describe('Ejemplo de prueba', () => {
  it('debería sumar correctamente', () => {
    expect(1 + 1).toBe(2);
  });

  it('debería restar correctamente', () => {
    expect(5 - 3).toBe(2);
  });
});