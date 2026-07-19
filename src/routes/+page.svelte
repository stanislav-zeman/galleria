<script lang="ts">
	import { orderedPhotos, sectionsOf, type GridStyle } from '$lib/photos';
	import PhotoGrid from '$lib/components/PhotoGrid.svelte';
	import PhotoLightbox from '$lib/components/PhotoLightbox.svelte';

	const GRID_OPTS: { value: GridStyle; label: string }[] = [
		{ value: 'justified', label: 'Justified' },
		{ value: 'uniform', label: 'Uniform' },
		{ value: 'masonry', label: 'Masonry' }
	];

	let grid = $state<GridStyle>('justified');
	let selectedId = $state<number | null>(null);

	const ordered = $derived(orderedPhotos());
	const sections = $derived(sectionsOf(ordered));
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app">
	<header class="header">
		<h1>Galleria</h1>
		<div class="grid-ctrl">
			<span class="ctrl-label">Grid</span>
			<div class="seg">
				{#each GRID_OPTS as opt (opt.value)}
					<button
						type="button"
						class="segbtn"
						class:active={grid === opt.value}
						onclick={() => (grid = opt.value)}
					>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>
	</header>
	<div class="rule-top"></div>

	<PhotoGrid {sections} {grid} onselect={(id) => (selectedId = id)} />
</div>

<PhotoLightbox photos={ordered} bind:selectedId />

<style>
	:global(:root) {
		--g-bg: #ffffff;
		--g-surface: #f5f5f6;
		--g-text: #161616;
		--g-accent: #2f2f2f;
		--g-divider: rgba(20, 20, 20, 0.12);
		--g-shadow-lg: 0 0 0 1px rgba(20, 20, 20, 0.08), 0 16px 40px rgba(20, 20, 20, 0.18);
	}
	:global(body) {
		margin: 0;
		background: var(--g-bg);
		color: var(--g-text);
		font-family: 'Inter', system-ui, sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--g-bg);
	}

	.header {
		padding: 22px 22px 17px;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 17px;
		flex-wrap: wrap;
	}
	.header h1 {
		font-size: 46px;
		font-weight: 500;
		letter-spacing: -0.03em;
		margin: 0;
		line-height: 1;
	}

	.grid-ctrl {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.ctrl-label {
		font-size: 10px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--g-text) 45%, transparent);
	}
	.seg {
		display: flex;
		gap: 6px;
	}
	.segbtn {
		font-family: inherit;
		font-weight: 500;
		cursor: pointer;
		padding: 6px 13px;
		font-size: 12px;
		letter-spacing: 0.02em;
		border: 1px solid var(--g-divider);
		background: transparent;
		color: color-mix(in srgb, var(--g-text) 52%, transparent);
		border-radius: 4px;
		transition:
			color 0.15s,
			box-shadow 0.15s;
	}
	.segbtn:hover {
		color: var(--g-text);
	}
	.segbtn.active {
		color: var(--g-accent);
		border-color: var(--g-accent);
		box-shadow: inset 0 0 0 1px var(--g-accent);
	}

	.rule-top {
		height: 1px;
		margin: 0 22px;
		background: linear-gradient(
			to right,
			transparent,
			var(--g-divider) 48px,
			var(--g-divider) calc(100% - 48px),
			transparent
		);
	}
</style>
