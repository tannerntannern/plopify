# Contributing
First off, thank you for considering to contribute to Plopify!  Please note that the project is currently in the early stages of development, so the project structure and build/deployment processes are still solidifying.

## General Guidelines
Regardless of how you contribute, you need to keep the following in mind:

### Commit format
All commit messages must adhere to the [Conventional Commits Specification](https://conventionalcommits.org).  (e.g., `feat: added a sick new feature that does all the things` or `fix: resolved #3`)  Commit messages that don't adhere to this convention will automatically be rejected via git hooks.  You can view (or suggest additional rules) in `.commitlintrc.json`.

### Testing and Linting
Before submitting any pull requests, please make sure that the following commands both pass on your local copy:

```
$ yarn lint
$ yarn test
```

Changes that break tests or fail to meet linting standards may be rejected without further consideration.

## Contribution Types
There are many ways to contribute, with different conventions for each:

### README and Documentation
**Changes:** Typo corrections, rewordings, and other additions/subtractions to/from the `README.md`, `docs/*`, or inline code docs.

**Commit:** Start with `docs:`, or optionally specify the scope of the change: `docs(cli):` or `docs(api):` for example.

**Other notes:**  If you are considering adding substantial chunks of documentation, you may want to open a discussion on GitHub first.

### General Bug Fixes
**Changes:** Any code changes within the `src` directory.

**Commit:** Start with `fix:`, or optionally specify the scope of the fix: `fix(generation):` or `fix(security)` for example.

**Other Notes:** Keep bug fixes small and focused.  Unless the fix is especially trivial, please add a test case to ensure that the bug doesn't resurface in the future.

### General Features
**Changes:** Substantial additions to the code that provide new functionality.  PLEASE NOTE that these may not be accepted unless there is prior discussion on GitHub.

**Commit:** Start with `feat:`, or optionally specify the scope of the feature: `feat(generation):` or `feat(service):` for example.

**Other Notes:** All new features MUST have proper documentation and test coverage.  Furthermore, features must be warranted and within the scope of the project.  As previously mentioned, opening a discussion on GitHub is strongly recommended before developing a new feature.
