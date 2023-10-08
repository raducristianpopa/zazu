import { build } from 'vite';
import sveltePreprocess from 'svelte-preprocess';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const views = fs
	.readdirSync(path.join(dirname, '..', 'src/webviews', 'pages'))
	.map((input) => path.join(dirname, '..', 'src/webviews', 'pages', input));

async function run() {
	// "vite-plugin-svelte" CJS build was removed.
	// https://github.com/sveltejs/vite-plugin-svelte/issues/487#issuecomment-1322330832
	const { svelte } = await import('@sveltejs/vite-plugin-svelte');

	await build({
		plugins: [
			svelte({
				preprocess: sveltePreprocess(),
				emitCss: true,
				compilerOptions: {
					cssHash: ({ hash, css }) => `z${hash(css)}`
				}
			})
		],
		build: {
			outDir: './dist/webviews',
			watch: {
				include: 'src/webview/**/*'
			},
			rollupOptions: {
				input: views,
				output: {
					entryFileNames: `[name].js`,
					chunkFileNames: `[name].js`,
					assetFileNames: `[name].[ext]`
				}
			}
		},
		css: {
			postcss: {
				plugins: []
			}
		},
		server: {
			watch: {
				usePolling: true
			}
		}
	});
}

run();
