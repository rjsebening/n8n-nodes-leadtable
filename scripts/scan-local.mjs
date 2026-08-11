#!/usr/bin/env node
/**
 * Runs the exact rule set used by `npx @n8n/scan-community-package` against the local
 * working tree, without publishing to npm.
 *
 * The scanner's CLI only accepts a published package name (it requires npm provenance and a
 * reachable GitHub checkout), so it can never be run pre-publish. Its `analyzePackage()`
 * export, however, takes a local directory. Importing it means we inherit the scanner's exact
 * rule wiring instead of duplicating it in a hand-written flat config that would drift.
 *
 * The scanner is installed into an isolated tools directory rather than as a devDependency.
 * Two reasons:
 *   - It pins typescript@7.0.2, which its own @typescript-eslint/parser refuses to load. As a
 *     devDependency npm nests both under the scanner, the parser resolves the pinned TS 7 and
 *     the scan dies. An isolated tree hoists typescript@6 (pinned below) to its root, which is
 *     what the parser actually finds under npx - and what makes the scan work.
 *   - It drags eslint 9 + a second TypeScript into the tree that `npm ci` builds and publishes.
 *
 * Two legs, mirroring the scanner:
 *   source - package.json + {nodes,credentials} sources
 *   dist   - dist/ JS + package.json, i.e. what actually ends up in the npm tarball
 */
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptDir, '..');
const toolsDir = path.join(scriptDir, '.scan-tools');

const TOOLS_MANIFEST = {
	name: 'leadtable-scan-tools',
	private: true,
	description: 'Isolated install of the n8n community-package scanner. Not part of the package.',
	dependencies: {
		'@n8n/scan-community-package': '0.32.0',
		// Pinned so it hoists ahead of the scanner's own typescript@7.0.2, which the parser rejects.
		typescript: '6.0.3',
	},
};

const scannerEntry = path.join(
	toolsDir,
	'node_modules/@n8n/scan-community-package/scanner/scanner.mjs',
);

if (!existsSync(scannerEntry)) {
	console.log('Installing the n8n community-package scanner into scripts/.scan-tools ...');
	execFileSync('mkdir', ['-p', toolsDir]);
	writeFileSync(path.join(toolsDir, 'package.json'), `${JSON.stringify(TOOLS_MANIFEST, null, 2)}\n`);
	execFileSync('npm', ['install', '--silent', '--no-audit', '--no-fund'], {
		cwd: toolsDir,
		stdio: 'inherit',
	});
}

const { analyzePackage, SOURCE_FILE_PATTERNS } = await import(pathToFileURL(scannerEntry).href);

/**
 * The published scanner lints a fresh GitHub checkout, so anything git ignores
 * (scratch dirs, archived nodes) is invisible to it. Mirror that by listing
 * tracked plus untracked-but-not-yet-ignored sources - otherwise local-only
 * cruft reports violations that can never fail the real gate, while genuinely
 * new files still get checked. Falls back to the scanner's own globs outside
 * a git checkout.
 */
function sourceLegFiles() {
	try {
		const listed = execFileSync(
			'git',
			[
				'ls-files',
				'--cached',
				'--others',
				'--exclude-standard',
				'-z',
				'--',
				'package.json',
				'nodes',
				'credentials',
			],
			{ cwd: packageDir, encoding: 'utf8' },
		);
		const files = listed.split('\0').filter((file) => /\.(js|ts|json)$/.test(file));
		if (files.length) return files;
	} catch {
		// not a git checkout - fall through
	}
	return SOURCE_FILE_PATTERNS;
}

const legs = [['source', sourceLegFiles()]];

if (existsSync(path.join(packageDir, 'dist'))) {
	legs.push(['dist', ['dist/**/*.js', 'package.json']]);
} else {
	console.log('! dist/ not found - run `npm run build` first to also check the tarball leg');
}

let failed = false;

for (const [leg, patterns] of legs) {
	const result = await analyzePackage(packageDir, patterns);
	console.log(`--- ${leg} leg: ${result.passed ? 'PASS' : 'FAIL'}`);
	if (!result.passed) {
		failed = true;
		console.log(result.details ?? result.message);
	}
}

process.exit(failed ? 1 : 0);
