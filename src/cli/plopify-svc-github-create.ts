#!/usr/bin/env node
import * as program from 'commander';

import _meta from './_meta-svc';
const meta = _meta['github-create'];

program
	.usage(meta.usage)
	.description(meta.description)
	.option('-p --private', 'Whether or not to make the repo private')
	.parse(process.argv);

// TODO: ...
