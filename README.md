# plopify
[![npm version](https://badgen.net/npm/v/plopify)](https://npmjs.com/package/plopify)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

A Plop-inspired tool that takes project templating to the next level.

## Motivation
For some folks, consistency within a project is not enough; they want consistency _across_ projects.  So, Yeoman/Plop/Cookiecutter to the rescue right?  They only partially solve the problem.

If you're like me, the "ideal project structure" is constantly evolving:  I used to use npm, but now I prefer yarn; I used to like Webpack, but then I switched to Rollup, and then I switched to Parcel; I used to structure my README in one fashion, but now I prefer it another way; I used to like all my config data inside the package.json, but now I prefer separate files when possible; The list goes on...

What's the point of defining a template for your projects when your preferences are bound to change in a few months?  You just wind up having a bunch of different projects that are out of sync with your ideal structure because keeping them up to date is too tedious.  When you go back to old projects, you're slowed down by the cognitive noise of "How did I structure this again? What's my deployment process again?"

These are the problems that this project was created to solve.  `plopify` makes it easy to keep your projects in sync with a template, without tedious work.  Not only does it help you stay consistent, but it allows you to experiment more with your project structure without the dread of converting old projects.

## A Note on Plop.js
You may have heard of [Plop.js](https://www.npmjs.com/package/plop) before.  This project takes inspiration from Plop but doesn't use it internally, despite the name.  `plopify` differs in that it is designed for _inter-project_ templating, while Plop is primarily designed for _intra-project_ templating.  

This actually makes the two tools quite complementary because their use-cases don't overlap.  Furthermore, both projects utilize [Inquirer](https://www.npmjs.com/package/inquirer) and [Handlebars](https://www.npmjs.com/package/handlebars), so working with one coming from the other should feel very familiar. 

## Getting Started
### Installation
`plopify` is a CLI application that should be installed globally:
```
$ npm i -g plopify
```
or
```
$ yarn global add plopify
```

(more coming soon)

## 📑 CLI Reference
All commands begin with `plopify`.  To display help for any command, simply add `--help`; e.g., `plopify gen --help`

### `plopify init`
...

### `plopify gen <template> <outdir>`
...

### `plopify update [project]`
...

### `plopify config <action>`
...

### `plopify svc <service>`
...

## Author
Tanner Nielsen <tannerntannern@gmail.com>

[Website](https://tannernielsen.com) | [GitHub](https://github.com/tannerntannern) 
