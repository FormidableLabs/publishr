[![Travis Status][trav_img]][trav_site]
[![Coverage Status][cov_img]][cov_site]
[![NPM Package][npm_img]][npm_site]

# Publishr

A tool for harmonious publishing of git and npm packages.

Publishr allows you to consistently publish different files in git and npm using an **npm version workflow**,
which enables efficient installation from both types of repository.

## Motivation

It can be troublesome to enable package installation from both npm and git repositories,
especially when a project includes build steps. One inefficient publishing solution entails
saving both source and compiled files to git and npm. Another less than ideal solution requires
installing heavy build dependencies in production. Depending on the size of your 
repository, these solutions can be a burden for both development and production. 
Ideally, the git repository only contains source code and the npm repository contains
compiled code. Furthermore, the npm repository should not contain any large build dependencies.
Publishr solves these problems by tapping into [npm's version/publish lifecycle scripts][npm_scripts_docs].

## Installation

```sh
$ npm install publishr
```

## Setup

1. Save all build dependencies to `package.json` as `dependencies`.
2. Save placeholder (ex. `.someconfig.publishr`) files that should be replaced in the npm repo.
3. Add a `publishr` config to `package.json`.
4. Use `publishr.dependencies` to describe which build dependencies to replace in the npm repo.
5. Use `publishr.files` to describe files to replace/create in the npm repo.
6. Use `publishr.scripts` to describe scripts to add/replace/remove in the npm repo.
7. Add `publishr postversion` to [npm's postversion script][npm_scripts_docs].
8. Add `publishr postpublish` to [npm's postpublish script][npm_scripts_docs].

## Configuration

1. `publishr.dependencies` - Describes build dependencies to replace in the npm repo.
  * Takes an array of **regular expression strings**
    * `["^babel$"]` matches only `babel` 
    * `["^babel"]` matches `babel`, `babel-core`
    * `["babel"]` matches `babel`, `babel-core`, `is-babel`
2. `publishr.files` - Describes files to replace/create in the npm repo.
  * Takes an object of oldFile keys to newFile values
    * `{".npmignore": ".npmignore.publishr"}` replaces/creates `.npmignore` with `.npmignore.publishr`
3. `publishr.scripts` - Describes files to add/replace/remove in the npm repo.
  * Takes an object of script name keys to command values.
    * `{"hello": "echo hello"}` adds/replaces the test script `hello` with the command `echo hello`
    * `{"postinstall": ""}` removes the `postinstall` script.

## Publishing

1. Run `publishr dry-run` to test your configuration.
2. If the dry run fails, fix all errors and go back to `1`.
3. Run your [version][npm_version_docs] command.
4. Run your [publish][npm_publish_docs] command.

## Example

An example `package.json` file will look something like this:

```json
  {
    "name": "some-neat-project",
    "version": "0.0.1",
    "dependencies": {
      "lodash": "^4.0.0",
      "babel-core": "^6.0.0"
    },
    "devDependencies": {
      "eslint": "^1.0.0"
    },
    "scripts": {
      "build": "gulp build",
      "postinstall": "npm run build",
      "postpublish": "publishr postpublish",
      "postversion": "publishr postversion"
    },
    "publishr": {
      "dependencies": ["^babel"],
      "files": {
        ".npmignore": ".npmignore.publishr",
        ".someconfig": ".someconfig.publishr"
      },
      "scripts": {
        "build": "echo 'No Build Needed'",
        "extra": "echo 'Extra Script'",
        "postinstall": ""
      }
    }
  }
```

The above configuration tells publishr to do a few things:

1. Move all `dependencies` matching the regular expression `^babel` to `devDependencies` before publishing to npm.
2. Replace `.npmignore` with the contents of `.npmignore.publishr` before publishing to npm.
3. Replace `.someconfig` with the contents of `.someconfig.publishr` before publishing to npm.
4. Replace the `build` script with `echo 'No Build Needed'` before publishing to npm.
5. Add the `extra` script before publishing to npm.
6. Remove the `postinstall` script before publishing to npm.

The version command will look something like this:

```shell
$ npm version patch
```

Result:

```
v0.0.2

> some-neat-project@0.0.2 postversion /some/path
> publishr postversion
```

The publish command will look something like this:

```shell
$ npm publish
```

Result:

```
+ some-neat-project@0.0.2

> some-neat-project@0.0.2 postpublish /some/path
> publishr postpublish

```

When all is said and done, the git and npm repo will have different versions of `package.json`, `.npmignore`, and `.someconfig`. Your npm package will install as quickly as possible and you still support installing from a git repo.

## Usage 

```
Usage: publishr <command> [options]

Commands:
  dry-run      Perform a dry run of postversion and postpublish
  postpublish  Clean up any actions taken by postversion
  postversion  Create and overwrite files for publishing

Options:
  -h, --help     Show help                                             [boolean]
  -V, --verbose  Log each step during postversion/postpublish          [boolean]
  -v, --version  Show version number                                   [boolean]
```

[trav_img]: https://img.shields.io/travis/FormidableLabs/publishr.svg
[trav_site]: https://travis-ci.org/FormidableLabs/publishr
[cov_img]: https://img.shields.io/coveralls/FormidableLabs/publishr.svg
[cov_site]: https://coveralls.io/r/FormidableLabs/publishr
[npm_img]: https://img.shields.io/npm/v/publishr.svg
[npm_site]: https://www.npmjs.org/package/publishr
[npm_publish_docs]: https://docs.npmjs.com/cli/publish
[npm_version_docs]: https://docs.npmjs.com/cli/version
[npm_scripts_docs]: https://docs.npmjs.com/misc/scripts

