import { source } from '../config';
import { task, watch, series, dest, parallel } from 'gulp';
import { createProject } from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import * as log from 'fancy-log';

// Has to be a hardcoded object due to build order
const packages = {
  helpers: createProject('packages/helpers/tsconfig.json'),
  core: createProject('packages/core/tsconfig.json'),
  config: createProject('packages/config/tsconfig.json'),
  logger: createProject('packages/logger/tsconfig.json'),
  fastify: createProject('packages/fastify/tsconfig.json'),
  // validation: createProject('packages/validation/tsconfig.json'),
  // http: createProject('packages/http/tsconfig.json'),
  // mongo: createProject('packages/mongo/tsconfig.json'),
  // server: createProject('packages/server/tsconfig.json'),
};

const modules = Object.keys(packages);

const distId = process.argv.indexOf('--dist');
const dist = distId < 0 ? source : process.argv[distId + 1];

/**
 * Watches the packages/* folder and
 * builds the package on file change
 */
function developmentTask(packageName: string) {
  log.info(`Watching "${packageName}" files...`);
  watch(
    [
      `${source}/${packageName}/**/*.ts`,
      `!${source}/${packageName}/**/*.d.ts`,
      `!${source}/${packageName}/node_modules/**`,
    ],
    {
      ignoreInitial: false,
      followSymlinks: false,
    },
    series(`${packageName}:dev`),
  );
}

/**
 * Builds the given package
 * @param packageName The name of the package
 */
function buildPackage(packageName: string) {
  return packages[packageName]
    .src()
    .pipe(packages[packageName]())
    .pipe(dest(`${dist}/${packageName}`));
}

/**
 * Builds the given package and adds sourcemaps
 * @param packageName The name of the package
 */
function buildPackageDev(packageName: string) {
  return packages[packageName]
    .src()
    .pipe(sourcemaps.init())
    .pipe(packages[packageName]())
    .pipe(
      sourcemaps.mapSources(
        (sourcePath: string) => './' + sourcePath.split('/').pop(),
      ),
    )
    .pipe(sourcemaps.write('.', {}))
    .pipe(dest(`${dist}/${packageName}`));
}

modules.forEach(packageName => {
  task(packageName, () => buildPackage(packageName));
  task(`${packageName}:dev`, () => buildPackageDev(packageName));
  task(`${packageName}:watch`, () => developmentTask(packageName));
});

task('common:dev', series(modules.map(packageName => `${packageName}:dev`)));
task('build', series(modules));
task('build:dev', series('common:dev'));
task('development', parallel(modules.map(packageName => `${packageName}:watch`)));
task('default', series('build'));
