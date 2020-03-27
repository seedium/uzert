# Contributing to Uzert

- [Submission Guidelines](#submit)
- [Development Setup](#development)
- [Coding Rules](#rules)
- [Commit Message Guidelines](#commit)

## <a name="submit"></a> Submission Guidelines

### <a name="submit-pr"></a> Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

1. Fork the seedium/uzert repo or if your already collaborator just miss this step.
1. Make your changes in a new git branch created from master. Git branch should be named in seedium convention (See our [Developer Guid](https://docs.google.com/document/d/11D7clgG8IYOsnreYiMQTmHpr7GJbjA9zKtf6tTojy50/edit?usp=sharing)):

   ```shell
   git checkout -b <prexix>/<task_number or feature_name> master
   ```

1. Create your patch, **including appropriate test cases**.
1. Follow our [Coding Rules](#rules).
1. Run the full Uzert test suite (see [common scripts](#common-scripts)),
   and ensure that all tests pass.
1. Commit your changes using a descriptive commit message that follows our
   [commit message conventions](#commit). Adherence to these conventions
   is necessary because release notes are automatically generated from these messages.

   ```shell
   git commit -a
   ```

   Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

1. Push your branch to GitHub:

   ```shell
   git push origin my-branch
   ```

1. In GitHub, send a pull request to `uzert:master`.

- If changes was suggested then:

  - Make the required updates.
  - Re-run the Uzert test suites to ensure tests are still passing.
  - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

That's it! Thank you for your contribution!

### <a name="common-scripts"></a>Commonly used NPM scripts

```bash
# build all packages and move to "sample" directories
$ npm run build

# run the full unit tests suite
$ npm run test

# run integration tests
# docker is required(!)
$ sh scripts/run-integration.sh

# run linter
$ npm run lint

# build all packages and put them near to their source .ts files
$ npm run build:prod
```

## <a name="development"></a> Development Setup

You will need Node.js version 10.0.0+.

1. After cloning the repo, run:

```bash
$ npm i # (or yarn install)
```

2. In order to prepare your environment run `prepare.sh` shell script:

```bash
$ sh scripts/prepare.sh
```

That will compile fresh packages and afterward, move them to all `sample` directories as well as integration tests.

## <a name="rules"></a> Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

- All features or bug fixes **must be tested** by one or more specs (unit-tests).
- We follow coding standards described in Seedium. An automated formatter is available (`npm run format`).

## <a name="commit"></a> Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted. This leads to **more
readable messages** that are easy to follow when looking through the **project history**. But also,
we use the git commit messages to **generate the Uzert change log**.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

Footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.
or contain link to the closed task in Jira

Samples: (even more [samples](https://github.com/seedium/uzert/commits/master))

```
docs(changelog): update change log to beta.5
bugfix(core): fix bootstrap injection
```

### Revert

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: updating grunt tasks etc; no production code change
- **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)

### Scope

The scope should be the name of the npm package affected (as perceived by person reading changelog generated from commit messages.

The following is the list of supported scopes:

- **app**
- **config**
- **core**
- **http**
- **logger**
- **mongo**
- **server**
- **validation**
- **helpers**

If changes affects many of scopes, the scope can be missed

There are currently a few exceptions to the "use package name" rule:

- **changelog**: used for updating the release notes in CHANGELOG.md

### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub or Jira issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

