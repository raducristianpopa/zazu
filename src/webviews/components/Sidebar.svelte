<script lang="ts">
	export const x = 3;
	import {
		provideVSCodeDesignSystem,
		vsCodeBadge,
		vsCodeButton,
		vsCodeTextArea,
		vsCodeTextField
	} from '@vscode/webview-ui-toolkit';
	import { vscode } from '../vscode';
	function handleHowdyClick() {
		vscode.postMessage({
			command: 'test'
		});
	}
	provideVSCodeDesignSystem().register(
		vsCodeButton(),
		vsCodeTextField(),
		vsCodeTextArea()
	);
	window.addEventListener('message', (m) => console.log(m));
</script>

<div>Zazu</div>
<form on:submit|preventDefault={handleHowdyClick}>
	<label for="paymentPointer">Payment pointer</label>
	<vscode-text-field name="paymentPointer" id="paymentPointer" />
	<label for="keyId">Key ID</label>
	<vscode-text-field name="keyId" id="keyId" />
	<label for="privateKey">Key ID</label>
	<vscode-text-area name="privateKey" id="privateKey" />
	<vscode-button aria-label="test" on:click={handleHowdyClick}
		>Howdy!</vscode-button
	>
</form>

<style>
</style>
