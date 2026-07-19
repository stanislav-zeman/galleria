<script lang="ts">
	import {
		gradient,
		imageUrl,
		figStyle,
		GRID_CONTAINERS,
		type GridStyle,
		type Section
	} from '$lib/photos';

	interface Props {
		sections: Section[];
		grid: GridStyle;
		onselect: (id: number) => void;
	}
	let { sections, grid, onselect }: Props = $props();

	function tileKeydown(e: KeyboardEvent, id: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onselect(id);
		}
	}
</script>

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
						onclick={() => onselect(p.id)}
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

<style>
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
</style>
