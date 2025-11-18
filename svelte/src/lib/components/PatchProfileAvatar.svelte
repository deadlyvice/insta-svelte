<script lang="ts">
	import { ky } from '$lib/api/client'
	import { api } from '$lib/api/profile'
	import { profile } from '$lib/store/userState.svelte'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let { isOpen, children } = $props()
    
	let fileInput: HTMLInputElement | null = $state(null)
	let selectedFiles: File | null = $state(null)
    // let filenames = $derived (selectedFiles && selectedFiles..map(f => f.name).join(', '))
    
	let submitting = $state(false)
	let error: string | null = $state(null)

	async function submit() {
		error = null
		dispatch('created', selectedFiles )
		dispatch('close')
	}


	function onFilesSelected(e: Event) {
		const input = e.target as HTMLInputElement
		selectedFiles = input.files ? input.files[0]: null
	}


    console.log(isOpen);
    
</script>
<!-- svelte-ignore event_directive_deprecated -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="hover:bg-transparent! flex justify-items-center" 
>

    {@render children()}

    {#if isOpen}
        <!-- svelte-ignore a11y_positive_tabindex -->
        <!-- svelte-ignore event_directive_deprecated -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
            class="overlay"
            role="dialog"
            tabindex="1"
            aria-modal="true"
            on:click={() => dispatch('close')}
        >
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="modal" on:click|stopPropagation>
                <header class="modal-header">
                    <h3>Create new post</h3>
                </header>

                <form on:submit|preventDefault={submit} class="modal-body ">
					<div class="relative">
						<button 
						hidden={!$profile?.img_url}
						type="button"
						on:click={async ()=> {
							await api.deleteAvatar()
							await profile.getProfile()
							dispatch('close')
						}}
						class="absolute right-4 i-mdi-delete hover:bg-red-400! z-10" title="delete avatar"></button>
						{@render children()}
					</div>
						
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

                    {#if error}
                        <div class="error">{error}</div>
                    {/if}

                    <div class="actions">
                        <!-- svelte-ignore node_invalid_placement_ssr -->
                        <button
                            type="button"
                            class="btn-secondary"
                            on:click={() => dispatch('close')}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <!-- svelte-ignore node_invalid_placement_ssr -->
                        <button type="submit" class="btn-primary" disabled={submitting || !selectedFiles}>
                            {#if submitting}Publishing…{:else}Publish{/if}
                        </button>
                    </div>
                    <!-- show selected filenames -->
                    <!-- {#if selectedFiles.length}
                        <p>Selected: {filenames}</p>
                    {/if} -->
                </form>
            </div>
        </div>
    {/if}
</div>

<style>
	/* overlay */
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: grid;
		place-items: center;
		z-index: 60;
	}

	/* modal */
	.modal {
		width: 100%;
		max-width: 720px;
		background: white;
		border-radius: 12px;
		padding: 18px;
		box-shadow: 0 10px 30px rgba(2, 6, 23, 0.4);
	}
	@media (prefers-color-scheme: dark) {
		.modal {
			background: #071021;
			color: #e6eef8;
		}
	}

	.modal-header h3 {
		margin: 0 0 8px 0;
		font-size: 1.125rem;
	}
	.modal-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 0.9rem;
	}
	input[type='text'],
	textarea {
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid #e6e6e6;
		background: transparent;
	}
	.actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
		margin-top: 6px;
	}

	.btn-primary {
		background: #06b6d4;
		color: white;
		border: none;
		padding: 8px 12px;
		border-radius: 8px;
	}
	.btn-secondary {
		background: transparent;
		color: #374151;
		border: 1px solid #e6e6e6;
		padding: 8px 12px;
		border-radius: 8px;
	}

	.error {
		color: #b91c1c;
		font-size: 0.9rem;
		padding-top: 4px;
	}
</style>
