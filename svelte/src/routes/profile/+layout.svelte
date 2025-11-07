<script>
	import { goto } from '$app/navigation'
	import { profile } from '$lib/store/userState.svelte'
	import { onMount } from 'svelte'
    // import name from '$/';
    let { children } = $props()

    //protected layout
    onMount(async ()=> {
        
        if (!$profile?.id) {
            await profile.getProfile()
        }
    })
</script>

{@render children()}
