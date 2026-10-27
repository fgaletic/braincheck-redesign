import { Key, dictionaries, makeT } from '../i18n';

function placeholders(text: string): string[] {
  return (text.match(/\{\w+\}/g) ?? []).sort();
}

describe('translations', () => {
  const keys = Object.keys(dictionaries.en) as Key[];

  it('has the same keys in English and Spanish', () => {
    expect(Object.keys(dictionaries.es).sort()).toEqual([...keys].sort());
  });

  it('uses identical placeholders in both languages', () => {
    for (const key of keys) {
      expect({ key, p: placeholders(dictionaries.es[key]) }).toEqual({ key, p: placeholders(dictionaries.en[key]) });
    }
  });

  it('has no empty strings', () => {
    for (const key of keys) {
      expect(dictionaries.en[key].trim()).not.toBe('');
      expect(dictionaries.es[key].trim()).not.toBe('');
    }
  });

  it('fills placeholders', () => {
    expect(makeT('en')('stepOf', { n: 2, total: 5 })).toBe('Step 2 of 5');
    expect(makeT('es')('stepOf', { n: 2, total: 5 })).toBe('Paso 2 de 5');
  });
});
