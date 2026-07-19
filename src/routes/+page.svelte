<script lang="ts">
	import {
		orderedPhotos,
		sectionsOf,
		gradient,
		imageUrl,
		figStyle,
		GRID_CONTAINERS,
		type GridStyle,
		type Photo
	} from '$lib/photos';
	import PhotoDetail from '$lib/components/PhotoDetail.svelte';

	const GRID_OPTS: { value: GridStyle; label: string }[] = [
		{ value: 'justified', label: 'Justified' },
		{ value: 'uniform', label: 'Uniform' },
		{ value: 'masonry', label: 'Masonry' }
	];

	// Keep LB_META_WIDTH in sync with the .lb-meta flex-basis CSS rule below.
	// The panel's own max-width is a generous fallback (see .lb-panel); the real
	// cap is computed from the viewport below so wide/landscape photos can use
	// most of the available screen instead of being boxed into a fixed width.
	const LB_META_WIDTH = 330;
	const LB_PANEL_MAX_WIDTH = 1800;
	const LB_BACKDROP_PADDING = 80; // matches .lb-backdrop's 40px padding, both sides
	const LB_HERO_HEIGHT_VH = 0.88;
	// Below this width the meta sidebar no longer fits next to the photo, so the
	// lightbox stacks image-above-meta instead (see the matching @media rule).
	// Keep MOBILE_BREAKPOINT in sync with that rule.
	const MOBILE_BREAKPOINT = 700;
	const LB_MOBILE_PADDING = 24; // matches .lb-backdrop's 12px padding on mobile, both sides
	const LB_MOBILE_HERO_HEIGHT_VH = 0.55;
	// On mobile, prev/next sit in a row below the panel (see the matching
	// @media rule) rather than beside it, so their height needs to be reserved
	// out of the hero's height budget. Gap matches .lb-close's mobile inset so
	// both floating controls sit the same distance from the panel.
	const LB_NAV_GAP_MOBILE = 12;
	const LB_NAV_BTN_SIZE = 38;
	const LB_NAV_ROW_RESERVE_MOBILE = LB_NAV_BTN_SIZE + LB_NAV_GAP_MOBILE;

	let grid = $state<GridStyle>('justified');
	let selectedId = $state<number | null>(null);
	let winHeight = $state(900);
	let winWidth = $state(1400);
	// Real aspect ratio of each photo's loaded image, keyed by id. Overrides the
	// hand-authored `aspect` field once known, so a stale/wrong value in the data
	// can't leave the hero box showing the wrong shape.
	let loadedAspect = $state<Record<number, number>>({});
	// Horizontal drag offset for the swipe-to-navigate carousel, in px. 'dragging'
	// is live finger/mouse tracking (no transition); 'settling' animates the
	// track to a fully-off or back-to-center position; 'idle' is at rest.
	let dragX = $state(0);
	let phase = $state<'idle' | 'dragging' | 'settling'>('idle');
	let dragStartX = 0;
	const SWIPE_THRESHOLD = 50;
	const SETTLE_MS = 240;
	// Visible breathing room between cards while the track is mid-drag.
	const LB_SWIPE_GAP = 24;

	const ordered = $derived(orderedPhotos());
	const sections = $derived(sectionsOf(ordered));
	const current = $derived(ordered.find((p) => p.id === selectedId) ?? null);
	const currentIndex = $derived(current ? ordered.findIndex((p) => p.id === current.id) : -1);
	const prevIndex = $derived(
		currentIndex >= 0 ? (currentIndex - 1 + ordered.length) % ordered.length : -1
	);
	const nextIndex = $derived(currentIndex >= 0 ? (currentIndex + 1) % ordered.length : -1);
	const prevPhoto = $derived(prevIndex >= 0 ? ordered[prevIndex] : null);
	const nextPhoto = $derived(nextIndex >= 0 ? ordered[nextIndex] : null);
	function counterFor(idx: number) {
		return `${String(idx + 1).padStart(2, '0')} / ${String(ordered.length).padStart(2, '0')}`;
	}
	const counter = $derived(currentIndex >= 0 ? counterFor(currentIndex) : '');
	const prevCounter = $derived(prevIndex >= 0 ? counterFor(prevIndex) : '');
	const nextCounter = $derived(nextIndex >= 0 ? counterFor(nextIndex) : '');
	const isMobile = $derived(winWidth < MOBILE_BREAKPOINT);

	function onHeroImageLoad(img: HTMLImageElement, id: number) {
		if (img.naturalWidth && img.naturalHeight) {
			loadedAspect[id] = img.naturalWidth / img.naturalHeight;
		}
	}
	function aspectOf(photo: Photo) {
		return loadedAspect[photo.id] ?? photo.aspect;
	}

	function fitBox(aspect: number, maxW: number, maxH: number, widthFirst: boolean) {
		if (widthFirst) {
			let w = maxW;
			let h = w / aspect;
			if (h > maxH) {
				h = maxH;
				w = h * aspect;
			}
			return { w, h };
		}
		let h = maxH;
		let w = h * aspect;
		if (w > maxW) {
			w = maxW;
			h = w / aspect;
		}
		return { w, h };
	}

	// Fits a photo's own image into the lightbox's available space, preserving
	// its true aspect ratio (never cropped, never stretched to another photo's
	// shape). Computed per-photo - rather than reusing `current`'s box for every
	// slide - so a landscape neighbor already looks correctly proportioned while
	// peeking in mid-swipe, instead of only rescaling once the swipe settles.
	// Mobile fits width-first (no sidebar to share space with, so claim full
	// screen width); desktop fits height-first so portraits use the full
	// vertical budget instead of being boxed into a fixed width.
	function boxFor(photo: Photo) {
		const aspect = aspectOf(photo);
		if (isMobile) {
			const maxW = winWidth - LB_MOBILE_PADDING;
			const maxH = winHeight * LB_MOBILE_HERO_HEIGHT_VH - LB_NAV_ROW_RESERVE_MOBILE;
			return fitBox(aspect, maxW, maxH, true);
		}
		const maxH = winHeight * LB_HERO_HEIGHT_VH;
		const maxPanelW = Math.min(LB_PANEL_MAX_WIDTH, winWidth - LB_BACKDROP_PADDING);
		const maxW = Math.max(200, maxPanelW - LB_META_WIDTH);
		return fitBox(aspect, maxW, maxH, false);
	}

	const heroBox = $derived(current ? boxFor(current) : { w: 0, h: 0 });
	const prevBox = $derived(prevPhoto ? boxFor(prevPhoto) : heroBox);
	const nextBox = $derived(nextPhoto ? boxFor(nextPhoto) : heroBox);

	function slideWidth(box: { w: number; h: number }) {
		return isMobile ? box.w : box.w + LB_META_WIDTH;
	}
	// The viewport is the fixed-size, overflow-hidden window the carousel track
	// slides within, sized to the CURRENT photo's own box - matching its true
	// proportions rather than a shared/averaged shape. Prev/next slides carry
	// their own (possibly different) widths; only after a swipe settles does the
	// viewport itself resize to the new current photo's box. On mobile the meta
	// text scrolls internally (see .lb-meta) if it doesn't fit the remaining
	// height budget below the hero image.
	const viewportW = $derived(slideWidth(heroBox));
	const prevSlideW = $derived(slideWidth(prevBox));
	const nextSlideW = $derived(slideWidth(nextBox));
	const viewportH = $derived(
		isMobile ? winHeight - LB_MOBILE_PADDING - LB_NAV_ROW_RESERVE_MOBILE : heroBox.h
	);
	// On desktop, each slide's own height matches that photo's own hero height
	// (not the viewport's, which is only sized to `current`) so the meta
	// sidebar - which stretches to fill its slide - matches the photo it
	// actually belongs to instead of whichever photo was viewed before it. On
	// mobile the slide height is a fixed budget shared by every photo already,
	// so it's unaffected.
	function slideHeight(box: { w: number; h: number }) {
		return isMobile ? viewportH : box.h;
	}
	const prevSlideH = $derived(slideHeight(prevBox));
	const nextSlideH = $derived(slideHeight(nextBox));
	const viewportStyle = $derived(`width:${viewportW}px; height:${viewportH}px;`);
	// Track position at rest (dragX = 0): shifted left by exactly the prev
	// slide's own width + gap, so the current slide's left edge sits at the
	// viewport's left edge.
	const trackBaseX = $derived(-(prevSlideW + LB_SWIPE_GAP));
	const trackX = $derived(trackBaseX + dragX);

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

	function onViewportPointerDown(e: PointerEvent) {
		if (phase !== 'idle') return;
		phase = 'dragging';
		dragStartX = e.clientX;
		dragX = 0;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onViewportPointerMove(e: PointerEvent) {
		if (phase !== 'dragging') return;
		const raw = e.clientX - dragStartX;
		// Bounds match the settle targets below: don't drag further than fully
		// hiding current (revealing next) or fully revealing prev.
		dragX = Math.max(-(viewportW + LB_SWIPE_GAP), Math.min(prevSlideW + LB_SWIPE_GAP, raw));
	}
	function onViewportPointerUp() {
		if (phase !== 'dragging') return;
		if (dragX <= -SWIPE_THRESHOLD) settleTo(1);
		else if (dragX >= SWIPE_THRESHOLD) settleTo(-1);
		else settleTo(0);
	}
	// Slides the track fully to one side (revealing prev/next) then swaps
	// `current` and snaps back to center with no transition, so the swap itself
	// is invisible - only the initial slide-away is animated. The two non-zero
	// targets use different magnitudes (current's own width vs prev's own
	// width) since slides aren't uniformly sized anymore.
	function settleTo(direction: -1 | 0 | 1) {
		phase = 'settling';
		dragX =
			direction === 0
				? 0
				: direction === 1
					? -(viewportW + LB_SWIPE_GAP)
					: prevSlideW + LB_SWIPE_GAP;
		setTimeout(() => {
			if (direction !== 0) step(direction);
			dragX = 0;
			phase = 'idle';
		}, SETTLE_MS);
	}

	function onKeydown(e: KeyboardEvent) {
		if (selectedId == null) return;
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowRight') {
			e.preventDefault();
			if (phase === 'idle') step(1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			if (phase === 'idle') step(-1);
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

<svelte:window onkeydown={onKeydown} bind:innerHeight={winHeight} bind:innerWidth={winWidth} />

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
								<div class="tile-zoom" style="background:{gradient(p)}">
									<img
										class="tile-img"
										src={imageUrl(p)}
										alt=""
										loading="lazy"
										decoding="async"
										onerror={(e) => e.currentTarget.remove()}
									/>
								</div>
							</div>
							<div class="tile-cap">
								<span class="tile-name">{p.name}</span>
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
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="lb-frame" onclick={(e) => e.stopPropagation()}>
			<div
				class="lb-viewport"
				style={viewportStyle}
				onpointerdown={onViewportPointerDown}
				onpointermove={onViewportPointerMove}
				onpointerup={onViewportPointerUp}
				onpointercancel={onViewportPointerUp}
			>
				<div
					class="lb-track"
					style="gap:{LB_SWIPE_GAP}px; transform: translateX({trackX}px); transition: {phase ===
					'settling'
						? `transform ${SETTLE_MS}ms ease`
						: 'none'};"
				>
					{#if prevPhoto && current && nextPhoto}
						<div
							class="lb-slide"
							data-slide-role="prev"
							style="width:{prevSlideW}px; height:{prevSlideH}px"
						>
							{@render slide(prevPhoto, prevCounter, prevBox)}
						</div>
						<div
							class="lb-slide"
							data-slide-role="current"
							style="width:{viewportW}px; height:{viewportH}px"
						>
							{@render slide(current, counter, heroBox)}
						</div>
						<div
							class="lb-slide"
							data-slide-role="next"
							style="width:{nextSlideW}px; height:{nextSlideH}px"
						>
							{@render slide(nextPhoto, nextCounter, nextBox)}
						</div>
					{/if}
				</div>
			</div>
			<div class="lb-nav-row">
				<button
					type="button"
					class="iconbtn lb-prev"
					aria-label="Previous"
					onclick={() => phase === 'idle' && step(-1)}
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
					onclick={() => phase === 'idle' && step(1)}
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
			</div>
		</div>
	</div>
{/if}

{#snippet slide(photo: Photo, cnt: string, box: { w: number; h: number })}
	<figure class="lb-hero" style="background:{gradient(photo)}; width:{box.w}px; height:{box.h}px;">
		<img
			class="lb-hero-img"
			src={imageUrl(photo)}
			alt={photo.name}
			decoding="async"
			draggable="false"
			onload={(e) => onHeroImageLoad(e.currentTarget as HTMLImageElement, photo.id)}
			onerror={(e) => {
				(e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
			}}
		/>
	</figure>
	<PhotoDetail {photo} counter={cnt} />
{/snippet}

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
	.tile-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
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
		z-index: 1;
	}
	.lb-frame {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.lb-nav-row {
		display: flex;
		gap: 12px;
	}
	/* Desktop/tablet: prev/next float at the sides, vertically centered, same
	   fixed-to-viewport pattern as .lb-close. Overridden below for mobile.
	   Explicit z-index (rather than relying on default paint order) because
	   Safari can otherwise let .lb-viewport's riseIn transform animation win the
	   stacking order and paint over these fixed buttons. */
	.lb-prev {
		position: fixed;
		left: 20px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 1;
	}
	.lb-next {
		position: fixed;
		right: 20px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 1;
	}
	/* The clipping window the carousel track slides within. Rounded corners +
	   overflow:hidden here (rather than on each slide) mean whichever slide is
	   centered gets clipped to the card shape; off-center slides are simply cut
	   off at the edges while peeking in. */
	.lb-viewport {
		position: relative;
		overflow: hidden;
		max-width: 1800px;
		box-shadow: var(--g-shadow-lg);
		border-radius: 8px;
		animation: riseIn 0.3s ease;
		touch-action: pan-y;
		cursor: grab;
	}
	.lb-track {
		display: flex;
		height: 100%;
		/* Slides carry their own (possibly shorter/taller) explicit height, so
		   center them vertically within the viewport's fixed clipping height
		   rather than stretching them to match it. */
		align-items: center;
	}
	.lb-slide {
		flex: 0 0 auto;
		display: flex;
		align-items: stretch;
	}
	.lb-hero {
		position: relative;
		flex: 0 0 auto;
		margin: 0;
		box-shadow: inset 0 0 160px rgba(0, 0, 0, 0.22);
		overflow: hidden;
	}
	.lb-hero-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
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

	/* Below this width the meta sidebar no longer fits next to the photo, so the
	   lightbox stacks image-above-meta instead. Keep this in sync with
	   MOBILE_BREAKPOINT in the script. */
	@media (max-width: 700px) {
		.lb-backdrop {
			padding: 12px;
		}
		.lb-close {
			top: 12px;
			right: 12px;
		}
		.lb-frame {
			gap: 12px;
		}
		.lb-prev,
		.lb-next {
			position: static;
			transform: none;
		}
		.lb-viewport {
			max-height: calc(100dvh - 24px);
		}
		.lb-slide {
			flex-direction: column;
		}
	}
</style>
