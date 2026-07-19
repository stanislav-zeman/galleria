<script lang="ts">
	import './layout.css';
	import Footer from '$lib/navigation/Footer.svelte';

	let { children } = $props();
</script>

{@render children()}
<Footer />
