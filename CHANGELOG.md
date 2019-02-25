# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.0-alpha.0"></a>
# [1.0.0-alpha.0](https://github.com/tannerntannern/plopify/compare/v0.1.0-alpha.1...v1.0.0-alpha.0) (2019-02-25)


### Bug Fixes

* added a set-difference util function ([c7dcc11](https://github.com/tannerntannern/plopify/commit/c7dcc11))
* added a travisCiApiToken field to the global config ([b07dfc2](https://github.com/tannerntannern/plopify/commit/b07dfc2))
* added an emoji prompt type and fixed the update command from the schema changes ([eba3a92](https://github.com/tannerntannern/plopify/commit/eba3a92))
* continued work on `plopify update` ([2aac825](https://github.com/tannerntannern/plopify/commit/2aac825))
* corrected the default value for `patternFromFile` in the UpdatePolicy schema ([11ba344](https://github.com/tannerntannern/plopify/commit/11ba344))
* corrected the staging-cleanup issues caused by the new glob package ([a61ad51](https://github.com/tannerntannern/plopify/commit/a61ad51))
* extracted a few util functions ([b8fe2f8](https://github.com/tannerntannern/plopify/commit/b8fe2f8))
* got the `github-init` hook working properly ([8f5debb](https://github.com/tannerntannern/plopify/commit/8f5debb))
* made a little progress on the processing of hooks ([c670d1d](https://github.com/tannerntannern/plopify/commit/c670d1d))
* made the password prompts able to use a shared password cache ([bf74a06](https://github.com/tannerntannern/plopify/commit/bf74a06))
* made the set function display the property names in an unCamel'ed format ([84f8560](https://github.com/tannerntannern/plopify/commit/84f8560))
* restructured global-config a bit, but it still needs work ([8e98fd5](https://github.com/tannerntannern/plopify/commit/8e98fd5))
* revamped the main schema ([68894f5](https://github.com/tannerntannern/plopify/commit/68894f5))
* separated the GlobalConfigSchema into its visible and hidden parts ([ec0785f](https://github.com/tannerntannern/plopify/commit/ec0785f))
* started extracting templating functions into their own file ([c9a2b0d](https://github.com/tannerntannern/plopify/commit/c9a2b0d))
* stopped the config loader from decrypting unset values and improved default value display ([6e7a60d](https://github.com/tannerntannern/plopify/commit/6e7a60d))


### Features

* added `travis-enable` to `plopify svc` ([f2b13df](https://github.com/tannerntannern/plopify/commit/f2b13df))
* implemented a fully functional, secure, and flexible config manager ([7dba092](https://github.com/tannerntannern/plopify/commit/7dba092))
* made the config manager cache passwords for subsequent calls and respond better to missing data ([9801b16](https://github.com/tannerntannern/plopify/commit/9801b16))
* made the config set command first check for the existence of a config and default the set value to the current value ([73a1f02](https://github.com/tannerntannern/plopify/commit/73a1f02))
* restructured internally to better support subcommands and made the services accessible via cli ([8e5b168](https://github.com/tannerntannern/plopify/commit/8e5b168))
* started implementing hooks ([724a523](https://github.com/tannerntannern/plopify/commit/724a523))


### BREAKING CHANGES

* 



<a name="0.1.0-alpha.1"></a>
# [0.1.0-alpha.1](https://github.com/tannerntannern/plopify/compare/v0.1.0-alpha.0...v0.1.0-alpha.1) (2019-02-12)


### Bug Fixes

* added a plopify badge to the `project-template` template ([d3927f2](https://github.com/tannerntannern/plopify/commit/d3927f2))
* improved the rc schema ([9b5e3ef](https://github.com/tannerntannern/plopify/commit/9b5e3ef))
* rewrote project generation so that it no longer depends on `walk` ([3aa8697](https://github.com/tannerntannern/plopify/commit/3aa8697))
* started experimenting with rc.ts ([da8ea66](https://github.com/tannerntannern/plopify/commit/da8ea66))
* started locking down a schema ([e04c047](https://github.com/tannerntannern/plopify/commit/e04c047))
* subbed out rimraf and mkdirp in favor of fs-extra ([43fe0b1](https://github.com/tannerntannern/plopify/commit/43fe0b1))
* tweaked the rc schema ([54a9aa6](https://github.com/tannerntannern/plopify/commit/54a9aa6))


### Features

* added a generated files counter and success message ([53850b4](https://github.com/tannerntannern/plopify/commit/53850b4))
* added support for templates at git urls ([783a36b](https://github.com/tannerntannern/plopify/commit/783a36b))
* drafted initial spec for update policies ([cb8fda7](https://github.com/tannerntannern/plopify/commit/cb8fda7))
* drafted the full gamut of commands ([a304a3b](https://github.com/tannerntannern/plopify/commit/a304a3b))
* got basic project generation working ([6646eba](https://github.com/tannerntannern/plopify/commit/6646eba))
* got the plopify init command working and started the default template ([7e7bd55](https://github.com/tannerntannern/plopify/commit/7e7bd55))
* started implementing the update command ([8a7d199](https://github.com/tannerntannern/plopify/commit/8a7d199))



<a name="0.1.0-alpha.0"></a>
# 0.1.0-alpha.0 (2019-01-18)
