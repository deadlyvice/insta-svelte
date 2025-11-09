<script lang="ts">
  import { onMount } from 'svelte';
  import PostGrid from '$lib/components/PostGrid.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import CreatePostModal from '$lib/components/CreatePostModal.svelte';
  import { profile as profileService } from '$lib/store/userState.svelte';
  import { posts as postService } from '$lib/store/postsState.svelte';

  // reactive access
  const profile: IUser = $profileService!;

  let myPosts: IPost[] = $state([]);
  let isOpenCreatePost = $state(false);

  let loading = $state(false);
  let error: string | null = $state(null);

  async function loadMyPosts() {
    loading = true;
    error = null;
    try {
      const res = await postService.getPosts();
      if (!res.ok) {
        error = res.error || 'Failed to load';
        myPosts = [];
      } else {
        const all = res.data ?? [];
        myPosts = all.filter((p) => p.author_id === profile?.id);
      }
    } catch (err) {
      error = (err as Error).message ?? 'Unknown error';
      myPosts = [];
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    if (!profile?.id && typeof profileService.getProfile === 'function') {
      await profileService.getProfile();
    }
    await loadMyPosts();
  });

  function onCreated(event: CustomEvent) {
    // server returned created post; refresh server state
    // parent uses server truth, so reload list
    loadMyPosts();
  }

  function openCreate() {
    isOpenCreatePost = true;
  }
  function closeCreate() {
    isOpenCreatePost = false;
  }
</script>

<div class="w-full p-4 flex flex-col items-center">
  <h1 class="text-center text-2xl font-semibold mb-4">Welcome to <b>Profile</b> page</h1>

  <div class="flex flex-col gap-3 mb-6 max-w-2xl w-full">
    <div>
      <label for="name">Name</label>
      <input id="name" disabled type="text" bind:value={profile.name} class="w-full" />
    </div>

    <div>
      <label for="nickname">Nickname</label>
      <input id="nickname" disabled type="text" bind:value={profile.nickname} class="w-full" />
    </div>

    <div>
      <label for="email">Email</label>
      <input id="email" disabled type="email" bind:value={profile.email} class="w-full" />
    </div>

    <div class="mt-2 flex gap-2">
      <button class="btn-primary" onclick={openCreate}>Add new</button>
      <button class="btn-ghost" onclick={profileService.logout}>Log out</button>
    </div>
  </div>

  <section class="w-full max-w-4xl">
    <h2 class="text-lg font-semibold mb-2">Your posts</h2>

    {#if loading}
      <Loader />
    {:else}
      {#if error}
        <div class="text-red-600 dark:text-red-400">Error: {error}</div>
      {:else}
        <PostGrid posts={myPosts} />
      {/if}
    {/if}
  </section>
</div>

<CreatePostModal
  open={isOpenCreatePost}
  on:created={onCreated}
  on:close={closeCreate}
/>

<style>
  input[disabled] { opacity: 0.9; background: #f7fafc; padding: 8px; border-radius: 6px; }

  .btn-primary { background:#06b6d4; color:white; padding:8px 12px; border-radius:8px; border:none; }
  .btn-ghost { background:transparent; color:#374151; border:1px solid #e6e6e6; padding:8px 12px; border-radius:8px; }
</style>