import * as childProcess from 'child_process';
import { createProject } from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import * as chalk from 'chalk';
import * as log from 'fancy-log';
import { task, dest } from 'gulp';
import { resolve } from 'path';
import { promisify } from 'util';
import { samplePath } from '../config';
import { getDirs } from '../util/task-helpers';

const exec = promisify(childProcess.exec);
const directories = getDirs(samplePath);

async function executeNpmScriptInSamples(
  script: string,
  appendScript?: string,
) {

  for await (const dir of directories) {
    const dirName = dir.replace(resolve(__dirname, '../../../'), '');
    log.info(`Running ${chalk.blue(script)} in ${chalk.magenta(dirName)}`);
    try {
      const result = await exec(
        `${script} --prefix ${dir} ${appendScript ? '-- ' + appendScript : ''}`,
      );
      log.info(
        `Finished running ${chalk.blue(script)} in ${chalk.magenta(dirName)}`,
      );
      if (result.stderr) {
        log.error(result.stderr);
      }
      if (result.stdout) {
        log.error(result.stdout);
      }
    } catch (err) {
      log.error(
        `Failed running ${chalk.blue(script)} in ${chalk.magenta(dirName)}`,
      );
      if (err.stderr) {
        log.error(err.stderr);
      }
      if (err.stdout) {
        log.error(err.stdout);
      }
      process.exit(1);
    }
  }
}

const samples = directories.reduce((acc, sampleProject) => {
  const sampleProjectName = sampleProject.split('/')[1];
  acc[sampleProjectName] = createProject(`sample/${sampleProjectName}/tsconfig.json`);
  return acc;
}, {});
const modules = Object.keys(samples);

function buildService(sampleName: string) {
  return samples[sampleName]
    .src()
    .pipe(sourcemaps.init())
    .pipe(samples[sampleName]())
    .pipe(sourcemaps.write('.', { sourceRoot: `./`, includeContent: false }))
    .pipe(dest(`sample/${sampleName}/build`));
}

modules.forEach((moduleName) => {
  task(`build:${moduleName}:sample`, () => buildService(moduleName));
});
task('install:samples', async () =>
  executeNpmScriptInSamples(
    'npm ci --no-audit --prefer-offline --no-shrinkwrap',
  ),
);
task('build:samples', async () => executeNpmScriptInSamples('npm run build'));
