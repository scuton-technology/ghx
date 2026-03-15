#!/usr/bin/env node

import { Command } from 'commander';
import { standupCommand } from './commands/standup.js';
import { statsCommand } from './commands/stats.js';
import { changelogCommand } from './commands/changelog.js';
import { healthCommand } from './commands/health.js';
import { reviewCommand } from './commands/review.js';
import { digestCommand } from './commands/digest.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('gpulse')
  .description('The Missing GitHub CLI Toolkit')
  .version('1.0.0');

program.addCommand(standupCommand);
program.addCommand(statsCommand);
program.addCommand(changelogCommand);
program.addCommand(healthCommand);
program.addCommand(reviewCommand);
program.addCommand(digestCommand);
program.addCommand(configCommand);

program.parse();
