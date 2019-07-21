const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

/**
 * Executes the given shell command in the given package (within <PROJECT_ROOT>/packages)
 */
const execInPackage = (cmd, pkg) => {
	const fullDir = path.resolve('packages', pkg);

	console.log(chalk.blueBright(fullDir) + ': ' + chalk.green(cmd));
	execSync(cmd, { cwd: fullDir, stdio: 'inherit' });
	console.log();
};

const command = process.argv[2];
fs
	.readdirSync(path.resolve('packages'))
	.forEach(pkg => execInPackage(command, pkg));
