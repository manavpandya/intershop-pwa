const { execSync, spawnSync } = require('child_process');
const { Project } = require('ts-morph');
const { Linter } = require('tslint');
const { readFileSync } = require('fs');
const glob = require('glob');

console.log('building lint rules');
execSync('npm run build:tslint-rules', { stdio: 'ignore' });
console.log('running sanity check');

const files = glob.sync('src/**/store/**/*.ts');

const linter = new Linter({
  fix: true,
  formatter: 'prose',
});
const lintConfig = {
  rules: new Map()
    .set('no-star-imports-in-store', true)
    .set('force-jsdoc-comments', true)
    .set('check-actions-for-creator-migration', true),
  rulesDirectory: ['node_modules/intershop-tslint-rules'],
  jsRules: new Map(),
  extends: [],
};
files.forEach(sourcePath => {
  linter.lint(sourcePath, readFileSync(sourcePath, { encoding: 'utf-8' }), lintConfig);
});

const result = linter.getResult();
if (result.errorCount) {
  console.warn(result.output);
  process.exit(1);
}

execSync('npx ts-node ' + process.argv[1] + '/store-migration.ts', { stdio: 'inherit' });

const changedFiles = spawnSync('git', ['--no-pager', 'diff', '--name-only'])
  .stdout.toString('utf-8')
  .split('\n')
  .filter(x => !!x)
  .sort();

const project = new Project({ tsConfigFilePath: 'tsconfig.all.json' });
changedFiles.forEach(path => {
  console.log('fixing imports in', path);
  const sf = project.getSourceFileOrThrow(path);
  sf.fixUnusedIdentifiers();
  sf.fixMissingImports();
  sf.formatText({
    baseIndentSize: 2,
    indentSize: 2,
    indentStyle: 2,
  });
  sf.saveSync();
  execSync('node scripts/fix-imports ' + path);
});

console.log('prettier -- some errors might turn up, just ignore them');
changedFiles.forEach(path => {
  try {
    execSync('npx prettier --write ' + path);
  } catch (err) {}
});

console.log('linting -- this will take some time');
execSync('npm run lint -- --fix --force');

execSync('npm run lint -- --fix', { stdio: 'inherit' });
