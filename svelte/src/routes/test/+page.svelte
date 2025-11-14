<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'
	import { profile } from '$lib/store/userState.svelte'
	import { api, type IPostPublicationPayload } from '$lib/api/posts'
	import TestGrid from '$lib/components/PostGrid/TestGrid.svelte'
	import { gridState } from '$lib/components/PostGrid/PostGrid.state'
	import CreatePostModal from '$lib/components/CreatePostModal.svelte'
	import { client, ky } from '$lib/api/client'

	const dispatch = createEventDispatcher()
    const grid = gridState()

    onMount(()=>{
        grid.initPosts(api.getPosts)
    })
    
    async function addPost() {
        const form = new FormData()
        form.append('title','test')
        form.append('content','lorem')
        form.append('file', )

        const res = await api.postPublication(form)
        
        console.log(res);
    }

</script>


<button onclick={addPost}>add</button>
<TestGrid {grid}/>