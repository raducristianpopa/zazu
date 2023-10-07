import { context } from 'esbuild';
import { join } from 'path';

const extensionPath = join(__dirname, '..', 'src', 'extension.ts');

async function run() {
	let ctx = await context({
		entryPoints: [extensionPath],
		outdir: 'dist',
		bundle: true,
		external: ['vscode']
	});

	await ctx.watch();
	console.log('watching...');
}

run();
