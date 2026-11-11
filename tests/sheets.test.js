import { describe, it, expect } from 'vitest';
import { parseMoney, rowsToPeople } from '../src/sheets.js';

describe('parseMoney', () => {
  it('parses formatted currency strings', () => {
    expect(parseMoney('$251,260.80')).toBe(251260.8);
    expect(parseMoney('$60,393.60')).toBe(60393.6);
  });

  it('accepts plain numbers and numeric strings', () => {
    expect(parseMoney(1500)).toBe(1500);
    expect(parseMoney('1500')).toBe(1500);
  });

  it('returns 0 for empty or invalid input', () => {
    expect(parseMoney('')).toBe(0);
    expect(parseMoney(undefined)).toBe(0);
    expect(parseMoney('abc')).toBe(0);
  });
});

describe('rowsToPeople', () => {
  const header = ['Name', 'Photo', 'Age', 'Country', 'Interest', ' Net Worth '];

  it('maps rows to typed person objects', () => {
    const rows = [header, ['Lee Siew Suan', 'https://x/019.jpg', '25', 'CN', 'Writing', '$251,260.80']];

    expect(rowsToPeople(rows)).toEqual([
      {
        name: 'Lee Siew Suan',
        photo: 'https://x/019.jpg',
        age: 25,
        country: 'CN',
        interest: 'Writing',
        netWorth: 251260.8,
      },
    ]);
  });

  it('finds columns by header name, regardless of order', () => {
    const reordered = [
      ['Net Worth', 'Country', 'Name', 'Interest', 'Age', 'Photo'],
      ['$90,000.00', 'MY', 'Farah', 'Cooking', '45', 'p.jpg'],
    ];

    const [person] = rowsToPeople(reordered);
    expect(person.name).toBe('Farah');
    expect(person.netWorth).toBe(90000);
    expect(person.age).toBe(45);
  });

  it('skips blank rows and tolerates short rows', () => {
    const rows = [header, ['', '', '', '', '', ''], ['Only Name']];
    const people = rowsToPeople(rows);

    expect(people).toHaveLength(1);
    expect(people[0]).toMatchObject({ name: 'Only Name', age: null, netWorth: 0 });
  });

  it('returns an empty list when there is no data', () => {
    expect(rowsToPeople([header])).toEqual([]);
  });

  it('throws a clear error when a required column is missing', () => {
    expect(() => rowsToPeople([['Name', 'Age']])).toThrow(/Column "Photo" not found/);
  });
});
