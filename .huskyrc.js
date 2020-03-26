const tasks = arr => arr.join(' && ');

module.exports = {
  hooks: {
    'pre-commit': tasks([
      'lint-staged',
    ]),
    'commit-msg': 'commitlint -c .commitlintrc.json -E HUSKY_GIT_PARAMS',
  },
};
