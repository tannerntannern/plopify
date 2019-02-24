#!/usr/bin/env node
import * as program from 'commander';

import _meta from './_meta';
import metaSvc from './_meta-svc';
const meta = _meta.svc;

program
	.usage(meta.usage)
	.description(meta.description);

// Load subcommand descriptions from _meta-svc.ts
for (let name in metaSvc) {
	const command = metaSvc[name];
	program.command(`${name} ${command.usage}`, command.description);
}

program.parse(process.argv);

// Simply output help if no subcommand is specified
if (program.args.length === 0) {
	program.outputHelp();
}
