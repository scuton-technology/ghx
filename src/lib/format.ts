import chalk from 'chalk';
import { getThemeColors } from './config.js';

const theme = getThemeColors();

export function header(text: string): string {
  return chalk.hex(theme.header || '#FFFFFF').bold(text);
}

export function subheader(text: string): string {
  return chalk.hex(theme.subheader || '#00FFFF').bold(`  ${text}`);
}

export function item(text: string): string {
  return `    ${text}`;
}

export function dimItem(label: string, value: string): string {
  return `    ${chalk.hex(theme.muted || '#808080')(label)} ${value}`;
}

export function separator(): string {
  return chalk.hex(theme.muted || '#808080')('  ' + '─'.repeat(40));
}

export function scoreColor(score: number): typeof chalk {
  if (score >= 90) return chalk.hex(theme.success || '#00FF00');
  if (score >= 70) return chalk.hex(theme.warning || '#FFFF00');
  if (score >= 50) return chalk.hex('#FFA500');
  return chalk.hex(theme.error || '#FF0000');
}

export function scoreGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function check(ok: boolean, label: string): string {
  return ok 
    ? chalk.hex(theme.success || '#00FF00')(`  ✓ ${label}`) 
    : chalk.hex(theme.error || '#FF0000')(`  ✗ ${label}`);
}

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
