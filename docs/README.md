# Plopify
> A Plop-inspired tool that takes project templating to the next level.

# What it Does
Plopify is a CLI-based project scaffolding tool, but is has several distinguishing features aside from generating project templates:

* An intelligent update mechanism, allowing projects to stay in sync with changes to their templates
* A global config for saving values (e.g., GitHub username, social media links, etc.) that are used again and again across different projects
* Persistent project-level data that makes it easy to change a value (e.g., project name) without forgetting the various places the value is used
* Built-in services for taking care of other chores, such as creating a remote GitHub repo, enabling Travis CI, etc.

Interested?  Check out the [quick start guide](/quick-start.md). Unsure?  Keep reading.

# Motivation
For some folks, consistency within a project is not enough; they want consistency _across_ projects.  So, Yeoman/Plop/Cookiecutter to the rescue right?  They only partially solve the problem.

> Other templating tools fall short because no one can create a perfect template -- people are bound to change their minds or learn new tricks.  Given enough time, your project will barely resemble the template on which it's based.

If you're like me, the "ideal project structure" is constantly evolving:  I used to use npm, but now I prefer yarn; I used to like Webpack, but then I switched to Rollup, and then I switched to Parcel; I used to structure my README in one fashion, but now I prefer it another way; I used to like all my config data inside the package.json, but now I prefer separate files when possible; The list goes on...

What's the point of defining a template for your projects when your preferences are bound to change in a few months?  You just wind up having a bunch of different projects that are out of sync with your ideal structure because keeping them up to date is too tedious.  When you go back to old projects, you're slowed down by the cognitive noise of "How did I structure this again? What's my deployment process again?"

These are the problems that this project was created to solve.  Plopify rejects the idea that templates should be set in stone: instead, it makes it easy to keep your projects in sync with an _evolving_ template.  Not only does it help you stay consistent, it allows you to experiment more with your project structure without the tedious work of converting old projects.

# Similar Tools
You may have heard of [Yeoman](https://yeoman.io/), [Cookiecutter](https://github.com/audreyr/cookiecutter), or [Plop.js](https://www.npmjs.com/package/plop) before.  These are all popular project scaffolding tools, but none of them handle template updates in the way that Plopify does, to my knowledge.

This project takes inspiration from all three, but particularly Plop (hence the name).  A big difference is that Plopify is designed for _inter-project_ templating, whereas Plop is primarily designed for _intra-project_ templating.  

This actually makes the two tools quite complementary because their use-cases don't overlap.  For example, you might use Plopify to keep the structure of your projects in sync, while you use Plop to generate individual files, like Components/Models/Controllers/etc.  Furthermore, both projects utilize [Inquirer](https://www.npmjs.com/package/inquirer) and [Handlebars](https://www.npmjs.com/package/handlebars), so working with one coming from the other should feel very familiar.

# Get Started
If you've read this far you must be interested.  Why not give Plopify a try?

Check out the [Quick Start Guide](/quick-start.md)
