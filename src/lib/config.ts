import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_PATH = join(homedir(), '.gpulse.json');

export interface GpulseConfig {
  defaultUser?: string;
  defaultOrg?: string;
  theme?: 'default' | 'minimal';
}

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
