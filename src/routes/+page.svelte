<script lang="ts">
	import {
		orderedPhotos,
		sectionsOf,
		specsOf,
		gradient,
		figStyle,
		GRID_CONTAINERS,
		type GridStyle
	} from '$lib/photos';

	const GRID_OPTS: { value: GridStyle; label: string }[] = [
		{ value: 'justified', label: 'Justified' },
		{ value: 'uniform', label: 'Uniform' },
		{ value: 'masonry', label: 'Masonry' }
	];

	let grid = $state<GridStyle>('justified');
	let selectedId = $state<number | null>(null);

	const ordered = $derived(orderedPhotos());
	const sections = $derived(sectionsOf(ordered));
	const current = $derived(ordered.find((p) => p.id === selectedId) ?? null);
	const currentIndex = $derived(current ? ordered.findIndex((p) => p.id === current.id) : -1);
	const counter = $derived(
		current
			? `${String(currentIndex + 1).padStart(2, '0')} / ${String(ordered.length).padStart(2, '0')}`
			: ''
	);

	function open(id: number) {
		selectedId = id;
	}
	function close() {
		selectedId = null;
	}
	function step(d: number) {
		if (currentIndex < 0) return;
		const n = (currentIndex + d + ordered.length) % ordered.length;
		selectedId = ordered[n].id;
	}

	function onKeydown(e: KeyboardEvent) {
		if (selectedId == null) return;
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowRight') {
			e.preventDefault();
			step(1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			step(-1);
		}
	}

	function tileKeydown(e: KeyboardEvent, id: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			open(id);
		}
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

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

	<main>
		{#each sections as sec (sec.label)}
			<section class="month">
				<div class="month-head">
					<h2>{sec.label}</h2>
					<span class="count">{sec.countLabel}</span>
					<span class="rule-fade"></span>
				</div>
				<div style={GRID_CONTAINERS[grid]}>
					{#each sec.photos as p (p.id)}
						<div
							class="tile"
							tabindex="0"
							role="button"
							aria-label={p.name}
							style={figStyle(p, grid)}
							onclick={() => open(p.id)}
							onkeydown={(e) => tileKeydown(e, p.id)}
						>
							<div class="tile-clip">
								<div class="tile-zoom" style="background:{gradient(p)}"></div>
							</div>
							<div class="tile-cap">
								<span class="tile-name">{p.name}</span>
								<span class="tile-cat">{p.category}</span>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</main>
</div>

{#if current}
	<div
		class="lb-backdrop"
		role="button"
		tabindex="-1"
		aria-label="Close"
		onclick={close}
		onkeydown={() => {}}
	>
		<button type="button" class="iconbtn lb-close" aria-label="Close" onclick={close}>
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
			>
		</button>
		<button
			type="button"
			class="iconbtn lb-prev"
			aria-label="Previous"
			onclick={(e) => {
				e.stopPropagation();
				step(-1);
			}}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
			>
		</button>
		<button
			type="button"
			class="iconbtn lb-next"
			aria-label="Next"
			onclick={(e) => {
				e.stopPropagation();
				step(1);
			}}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
			>
		</button>

		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="lb-panel" onclick={(e) => e.stopPropagation()}>
			<figure
				class="lb-hero"
				style="background:{gradient(current)}; aspect-ratio:{current.aspect};"
			></figure>
			<div class="lb-meta">
				<div class="lb-kicker">{counter} · {current.category}</div>
				<h3>{current.name}</h3>
				<div class="lb-loc">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle
							cx="12"
							cy="10"
							r="3"
						/></svg
					>
					{current.location}
				</div>
				<p class="lb-desc">{current.desc}</p>
				<div class="lb-specs">
					{#each specsOf(current) as s (s.k)}
						<div>
							<div class="spec-k">{s.k}</div>
							<div class="spec-v">{s.v}</div>
						</div>
					{/each}
				</div>
				<div class="lb-tags">
					{#each current.tags as t (t)}
						<span class="tag">{t}</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

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

	main {
		flex: 1;
		overflow: auto;
		padding: 22px;
	}

	.month {
		margin-bottom: 44px;
	}
	.month-head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 20px;
	}
	.month-head h2 {
		margin: 0;
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--g-text);
	}
	.count {
		font-size: 12px;
		color: color-mix(in srgb, var(--g-text) 45%, transparent);
	}
	.rule-fade {
		flex: 1;
		height: 1px;
		background: linear-gradient(to right, var(--g-divider), transparent 90%);
	}

	.tile:focus-visible {
		outline: 2px solid var(--g-accent);
		outline-offset: 3px;
	}
	.tile-clip {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	.tile-zoom {
		position: absolute;
		inset: 0;
		transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
	}
	.tile:hover .tile-zoom {
		transform: scale(1.05);
	}
	.tile-cap {
		opacity: 0;
		transition: opacity 0.25s;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 16px 13px 11px;
		background: linear-gradient(to top, rgba(10, 11, 18, 0.88), rgba(10, 11, 18, 0));
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 8px;
	}
	.tile:hover .tile-cap {
		opacity: 1;
	}
	.tile-name {
		font-size: 15px;
		font-weight: 500;
		line-height: 1.1;
		color: #fff;
	}
	.tile-cat {
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
		white-space: nowrap;
	}

	.iconbtn {
		width: 38px;
		height: 38px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--g-divider);
		background: var(--g-surface);
		cursor: pointer;
		color: var(--g-text);
		border-radius: 8px;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.iconbtn:hover {
		color: var(--g-accent);
		background: color-mix(in srgb, var(--g-accent) 14%, transparent);
	}

	.lb-backdrop {
		position: fixed;
		inset: 0;
		z-index: 20;
		background: color-mix(in srgb, var(--g-text) 76%, transparent);
		display: grid;
		place-items: center;
		padding: 40px;
		animation: ovIn 0.25s ease;
	}
	.lb-close {
		position: fixed;
		top: 20px;
		right: 20px;
	}
	.lb-prev {
		position: fixed;
		left: 20px;
		top: 50%;
		transform: translateY(-50%);
	}
	.lb-next {
		position: fixed;
		right: 20px;
		top: 50%;
		transform: translateY(-50%);
	}
	.lb-panel {
		display: flex;
		align-items: stretch;
		max-width: 1120px;
		width: 100%;
		max-height: 82vh;
		box-shadow: var(--g-shadow-lg);
		border-radius: 8px;
		animation: riseIn 0.3s ease;
	}
	.lb-hero {
		flex: 1 1 auto;
		margin: 0;
		max-height: 82vh;
		min-width: 0;
		border-radius: 8px 0 0 8px;
		box-shadow: inset 0 0 160px rgba(0, 0, 0, 0.22);
	}
	.lb-meta {
		flex: 0 0 330px;
		background: var(--g-surface);
		padding: 22px;
		overflow: auto;
		border-radius: 0 8px 8px 0;
	}
	.lb-kicker {
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--g-text) 50%, transparent);
		margin-bottom: 8px;
	}
	.lb-meta h3 {
		font-size: 28px;
		font-weight: 500;
		line-height: 1.04;
		letter-spacing: -0.02em;
		margin: 0 0 8px;
	}
	.lb-loc {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: color-mix(in srgb, var(--g-text) 55%, transparent);
		margin-bottom: 20px;
	}
	.lb-desc {
		font-size: 14px;
		line-height: 1.65;
		color: color-mix(in srgb, var(--g-text) 82%, transparent);
		margin: 0 0 24px;
		text-wrap: pretty;
	}
	.lb-specs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		border-top: 1px solid var(--g-divider);
		padding-top: 20px;
	}
	.spec-k {
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--g-text) 45%, transparent);
		margin-bottom: 3px;
	}
	.spec-v {
		font-size: 15px;
		color: var(--g-text);
	}
	.lb-tags {
		display: flex;
		gap: 7px;
		flex-wrap: wrap;
		margin-top: 24px;
	}
	.tag {
		display: inline-flex;
		align-items: center;
		font-size: 11px;
		letter-spacing: 0.02em;
		padding: 3px 10px;
		border-radius: 6px;
		border: 1px solid var(--g-accent);
		color: var(--g-accent);
	}

	@keyframes ovIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes riseIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
