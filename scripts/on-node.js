const chalk = require('chalk');
const { execSync } = require('child_process');

/**
 * Executes the given command if the given node version matches.
 */
const version = process.argv[2];
const command = process.argv[3];

console.log(chalk.blueBright('Version') + ': ' + chalk.green(process.version));
console.log(chalk.blueBright('Required') + ': ' + chalk.green(version));

const match = /(\d+)/.exec(process.version)[0] === version;
if (match) {
	console.log(chalk.green('Version match, running command:'), chalk.greenBright(command));
	execSync(command, { stdio: 'inherit' });
} else {
	console.log(chalk.red('Version mismatch, skipping command'));
}
