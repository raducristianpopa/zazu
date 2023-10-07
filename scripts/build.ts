import { build } from 'esbuild';
import { join } from 'path';

const extensionPath = join(__dirname, '..', 'src', 'extension.ts');

async function buildExtension() {
	const prompt = 'Building extension';

	console.time(prompt);

	await build({
		entryPoints: [extensionPath],
		bundle: true,
		outdir: 'dist',
		minify: true,
		platform: 'node',
		format: 'cjs',
		external: ['vscode', '@interledger/open-payments']
	});

	console.timeEnd(prompt);
}

buildExtension();
