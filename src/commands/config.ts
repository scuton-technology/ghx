import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig, GpulseConfig } from '../lib/config.js';

export const configCommand = new Command('config')
  .description('Get or set configuration values')
  .argument('[key]', 'Configuration key (e.g., theme, defaultUser)')
  .argument('[value]', 'Value to set (omit to get current value)')
  .option('--list', 'List all configuration')
  .action(async (key?: string, value?: string, options?: { list?: boolean }) => {
    const config = loadConfig();

    // List all config
    if (options?.list || (!key && !value)) {
      console.log('');
      console.log(chalk.bold('  Current Configuration'));
      console.log('');
      if (Object.keys(config).length === 0) {
        console.log(chalk.gray('    No configuration set'));
      } else {
        console.log(chalk.gray('    ' + JSON.stringify(config, null, 2).replace(/\n/g, '\n    ')));
      }
      console.log('');
      console.log(chalk.cyan.bold('  Available Theme Presets'));
      console.log(chalk.gray('    default, minimal, dracula, monokai, solarized'));
      console.log('');
      console.log(chalk.cyan.bold('  Examples'));
      console.log(chalk.gray('    gpulse config theme dracula'));
      console.log(chalk.gray('    gpulse config defaultUser octocat'));
      console.log('');
      return;
    }

    // Get value
    if (key && !value) {
      const val = (config as any)[key];
      if (val === undefined) {
        console.log(chalk.yellow(`  Key "${key}" not set`));
      } else {
        console.log('');
        console.log(chalk.bold(`  ${key}:`));
        console.log(chalk.gray('    ' + JSON.stringify(val, null, 2).replace(/\n/g, '\n    ')));
        console.log('');
      }
      return;
    }

    // Set value
    if (key && value) {
      // Parse JSON if it looks like JSON
      let parsedValue: any = value;
      if (value.startsWith('{') || value.startsWith('[')) {
        try {
          parsedValue = JSON.parse(value);
        } catch {
          console.log(chalk.red('  Invalid JSON value'));
          process.exit(1);
        }
      }

      (config as any)[key] = parsedValue;
      saveConfig(config);
      console.log('');
      console.log(chalk.green(`  ✓ Set ${key} = ${JSON.stringify(parsedValue)}`));
      console.log('');
    }
  });
