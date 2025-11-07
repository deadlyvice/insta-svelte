<script>
	import { profile } from '$lib/store/userState.svelte'
	import { onMount } from 'svelte'
    let { children } = $props()
    onMount(async ()=> {
        if (!$profile?.id) {
            await profile.getProfile()
        }
    })
</script>


{@render children()}
