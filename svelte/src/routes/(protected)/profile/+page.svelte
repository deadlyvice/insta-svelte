<script lang="ts">
  import { onMount } from 'svelte';
  import PostGrid from '$lib/components/PostGrid.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import { profile as profileService } from '$lib/store/userState.svelte';
  import { posts as postService } from '$lib/store/postsState.svelte';

  // Svelte reactive access to profile store
  const profile: IUser = $state($profileService!);
  let myPosts: IPost[] = $state([]);

  let loading = $state(false);
  let error: string | null = $state(null);

  onMount(async () => {
    if (!profile?.id && typeof profileService.getProfile === 'function') {
      await profileService.getProfile();
    }

    loading = true;
    try {
      const res = await postService.getPosts();
      if (!res.ok) {
        error = typeof res === 'object' && 'error' in res ? (res as any).error : 'Failed to load';
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
  });
</script>

<div class="w-full max-w-2xl mx-auto p-4">
  <h1 class="text-center text-2xl font-semibold mb-4">Welcome to <b>Profile</b> page</h1>

  <div class="flex flex-col gap-3 mb-6">
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

    <div class="mt-2">
      <span class="label">Want to log out?</span>
      <button class="text-pink-400 ml-3" onclick={profileService.logout}>log out</button>
    </div>
  </div>

  <section>
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

<style>
  input[disabled] { opacity: 0.9; background: #f7fafc; padding: 8px; border-radius: 6px; }
</style>
