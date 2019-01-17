#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var packageJson = require('../package.json');
program
    .version(packageJson.version, '-v, --version');
// TODO: THIS COMMAND SHOULD TOTALLY UTILIZE ITSELF
program
    .command('init <name>')
    .description('Initializes a project scaffold')
    .action(function (name, options) {
    // TODO:
    console.log('Calling `init` with', name);
});
program
    .command('*');
program.parse(process.argv);
