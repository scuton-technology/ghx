import { describe, it, expect } from 'vitest';
import { truncate, pluralize, bar } from '../src/utils/helpers.js';

describe('helpers', () => {
  describe('truncate', () => {
    it('should return string as-is if shorter than max', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long strings with ellipsis', () => {
      expect(truncate('hello world', 8)).toBe('hello w…');
    });

    it('should handle exact length', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });
  });

  describe('pluralize', () => {
    it('should return singular for 1', () => {
      expect(pluralize(1, 'commit')).toBe('1 commit');
    });

    it('should return plural for 0', () => {
      expect(pluralize(0, 'commit')).toBe('0 commits');
    });

    it('should return plural for >1', () => {
      expect(pluralize(5, 'commit')).toBe('5 commits');
    });

    it('should use custom plural', () => {
      expect(pluralize(2, 'person', 'people')).toBe('2 people');
    });
  });

  describe('bar', () => {
    it('should return a bar string of correct length', () => {
      const result = bar(50, 100, 10);
      // Strip ANSI codes to check length
      const stripped = result.replace(/\x1b\[[0-9;]*m/g, '');
      expect(stripped).toHaveLength(10);
    });
  });
});

describe('format', () => {
  it('should export scoring functions', async () => {
    const { scoreGrade, scoreColor } = await import('../src/lib/format.js');
    expect(scoreGrade(95)).toBe('A');
    expect(scoreGrade(85)).toBe('B');
    expect(scoreGrade(75)).toBe('C');
    expect(scoreGrade(65)).toBe('D');
    expect(scoreGrade(45)).toBe('F');
    expect(typeof scoreColor(90)).toBe('function');
  });
});
