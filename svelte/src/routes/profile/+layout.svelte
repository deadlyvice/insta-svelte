<script>
	import { goto } from '$app/navigation'
	import { api } from '$lib/api/profile'
	import { profile } from '$lib/store/userState.svelte'
	import { onMount } from 'svelte'
    // import name from '$/';
    let { children } = $props()

    //protected layout
    onMount(async ()=>{
        console.log($profile);
        
        if (!$profile?.id){
            const profile = await api.getProfile().catch(console.log)
            console.log({profile})
            
            if (!profile) return goto('/auth/login')
        }
    })
</script>

{@render children()}
