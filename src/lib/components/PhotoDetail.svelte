<script lang="ts">
	import { specsOf, PLACEHOLDER, type Photo } from '$lib/photos';

	interface Props {
		photo: Photo;
		counter: string;
	}
	let { photo, counter }: Props = $props();
</script>

<div class="lb-meta">
	<div class="lb-kicker">{counter}</div>
	<h3>{photo.name}</h3>
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
		{photo.location ?? PLACEHOLDER}
	</div>
	{#if photo.desc}
		<p class="lb-desc">{photo.desc}</p>
	{/if}
	<div class="lb-date">{photo.date}</div>
	<div class="lb-specs">
		{#each specsOf(photo) as s (s.k)}
			<div>
				<div class="spec-k">{s.k}</div>
				<div class="spec-v">{s.v}</div>
			</div>
		{/each}
	</div>
</div>

<style>
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
		margin: 0 0 8px;
		text-wrap: pretty;
	}
	.lb-date {
		font-size: 12px;
		color: color-mix(in srgb, var(--g-text) 50%, transparent);
		margin-bottom: 24px;
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

	/* Keep this breakpoint in sync with MOBILE_BREAKPOINT in +page.svelte,
	   where .lb-panel switches to a stacked (column) layout. */
	@media (max-width: 700px) {
		.lb-meta {
			flex: 1 1 auto;
			width: 100%;
			border-radius: 0 0 8px 8px;
		}
	}
</style>
