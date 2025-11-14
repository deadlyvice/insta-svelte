<script lang="ts">
	import {  onMount } from 'svelte'
	import { api } from '$lib/api/posts'
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'

	const grid = gridState()

	onMount(() => {
		grid.initPosts(api.getPosts)
	})

	// references / state
	let fileInput: HTMLInputElement | null = null
	let selectedFiles: File[] = []

	function onFilesSelected(e: Event) {
		const input = e.target as HTMLInputElement
		selectedFiles = input.files ? Array.from(input.files) : []
	}

	// helper to show filenames (optional)
	$: filenames = selectedFiles.map(f => f.name).join(', ')

	async function addPost() {
		const form = new FormData()
		form.append('title', 'test')
		form.append('content', 'lorem')

		// If server expects single field named "file":
		// if (selectedFiles[0]) form.append('file', selectedFiles[0])

		// If server expects multiple files under the same field name (recommended):
		for (const file of selectedFiles) {
			form.append('files', file) // server will receive multiple "files" fields
		}

		// Or if server expects an array-like name:
		// selectedFiles.forEach(f => form.append('imgs[]', f))

		try {
			// don't set headers manually inside api.postPublication — let ky/fetch handle it
			const res = await api.postPublication(form)
			console.log('server response', res)
			// optionally clear selection
			selectedFiles = []
			if (fileInput) fileInput.value = ''
		} catch (err) {
			console.error('upload error', err)
		}
	}
</script>

<div class="create-post">
	<!-- file input -->
	<label>
		Upload images
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			on:change={onFilesSelected}
			multiple
		/>
	</label>

	<!-- show selected filenames -->
	{#if selectedFiles.length}
		<p>Selected: {filenames}</p>
	{/if}

	<button on:click={addPost}>add</button>
</div>

<TestGrid {grid}/>
