<script>
    let { children } = $props()
    import ProtectedRoute from '$lib/components/ProtectedRoute.svelte'; 
</script>

<ProtectedRoute>
    {@render children()}
</ProtectedRoute>

