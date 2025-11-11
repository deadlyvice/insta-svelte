<script lang='ts'>
	import { api } from "$lib/api/posts"
	import { gridState } from "$lib/components/PostGrid/PostGrid.state"
	import TestGrid from "$lib/components/PostGrid/TestGrid.svelte"
	import { onMount } from "svelte"

    const grid = gridState()

    onMount(()=> {



        
        grid.initPosts(api.getPosts)
    })

</script>

<TestGrid posts={$grid} />