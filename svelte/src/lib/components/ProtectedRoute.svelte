<script>
	import { profile } from '$lib/store/userState.svelte'
	import { onMount } from 'svelte'
	import Loader from './Loader.svelte'
    let { children } = $props()
    onMount(async ()=> {
        if (!$profile?.id) {
            await profile.getProfile()
        }
    })
</script>


{#if $profile}
    {@render children()}
{:else}

    <Loader />
{/if}
