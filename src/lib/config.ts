import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_PATH = join(homedir(), '.gpulse.json');

export interface ThemeColors {
  header?: string;
  subheader?: string;
  success?: string;
  warning?: string;
  error?: string;
  muted?: string;
}

export type ThemePreset = 'default' | 'minimal' | 'dracula' | 'monokai' | 'solarized';

export interface GpulseConfig {
  defaultUser?: string;
  defaultOrg?: string;
  theme?: ThemePreset | ThemeColors;
}

const THEME_PRESETS: Record<ThemePreset, ThemeColors> = {
  default: {
    header: '#FFFFFF',
    subheader: '#00FFFF',
    success: '#00FF00',
    warning: '#FFFF00',
    error: '#FF0000',
    muted: '#808080',
  },
  minimal: {
    header: '#FFFFFF',
    subheader: '#CCCCCC',
    success: '#AAAAAA',
    warning: '#999999',
    error: '#888888',
    muted: '#666666',
  },
  dracula: {
    header: '#F8F8F2',
    subheader: '#8BE9FD',
    success: '#50FA7B',
    warning: '#F1FA8C',
    error: '#FF5555',
    muted: '#6272A4',
  },
  monokai: {
    header: '#F8F8F2',
    subheader: '#66D9EF',
    success: '#A6E22E',
    warning: '#E6DB74',
    error: '#F92672',
    muted: '#75715E',
  },
  solarized: {
    header: '#FDF6E3',
    subheader: '#268BD2',
    success: '#859900',
    warning: '#B58900',
    error: '#DC322F',
    muted: '#93A1A1',
  },
};

export function loadConfig(): GpulseConfig {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveConfig(config: GpulseConfig): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getThemeColors(): ThemeColors {
  const config = loadConfig();
  
  if (!config.theme) {
    return THEME_PRESETS.default;
  }
  
  if (typeof config.theme === 'string') {
    return THEME_PRESETS[config.theme] || THEME_PRESETS.default;
  }
  
  return { ...THEME_PRESETS.default, ...config.theme };
}
