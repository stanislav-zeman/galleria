// Photo catalogue + helpers for the Galleria gallery.
// `gradient` renders a monochrome placeholder shown behind/under the real
// photo (see `imageUrl`) so tiles have something to show while the image
// loads, or if the bucket key 404s.

import { PUBLIC_IMAGE_BASE_URL } from '$env/static/public';

export interface Photo {
	id: number;
	name: string;
	desc?: string;
	location?: string;
	camera?: string;
	lens?: string;
	aperture?: string;
	shutter?: string;
	iso?: string; // digital sensitivity (e.g. "64") or a film stock (e.g. "Kodak Portra 400")
	date: string; // "Mon YYYY", e.g. "Feb 2024"
	aspect: number; // width / height
	ang: number; // gradient angle
	hx: number; // highlight x (%)
	hy: number; // highlight y (%)
	key: string; // object key of the full-size image in the image bucket
}

/** Shown in place of any metadata field that hasn't been filled in yet. */
export const PLACEHOLDER = 'N/A';

export const PHOTOS: Photo[] = [
	{
		id: 1,
		name: 'Drift',
		location: 'Nærøyfjord, Norway',
		camera: 'Hasselblad 907X',
		lens: 'XCD 45mm f/3.5',
		aperture: 'f/8',
		shutter: '4s',
		date: 'Feb 2026',
		aspect: 1.5,
		ang: 155,
		hx: 28,
		hy: 22,
		key: 'placeholder.jpg'
	},
	{
		id: 2,
		name: 'Concrete Choir',
		desc: 'The stair core of a brutalist concert hall, read as pure repetition. I waited for a cleaner between figures to keep the geometry unbroken.',
		lens: 'FE 24mm f/1.4 GM',
		aperture: 'f/5.6',
		iso: '400',
		date: 'Feb 2026',
		aspect: 0.75,
		ang: 135,
		hx: 70,
		hy: 18,
		key: 'placeholder.jpg'
	},
	{
		id: 3,
		name: 'Crossing, 08:11',
		desc: 'Commuters compress at a signal in the financial district. The frame is built around the one figure who broke stride to look up.',
		location: 'Tokyo, Japan',
		camera: 'Leica M11',
		lens: 'Summicron 35mm f/2',
		aperture: 'f/4',
		shutter: '1/250s',
		iso: '200',
		date: 'Feb 2026',
		aspect: 1.5,
		ang: 120,
		hx: 40,
		hy: 70,
		key: 'placeholder.jpg'
	},
	{
		id: 4,
		name: 'Nocturne No.4',
		desc: 'Sodium lamps on wet asphalt after the last train. Nothing was moved; the puddle did the composing.',
		location: 'Reykjavík, Iceland',
		camera: 'Sony A7R V',
		lens: 'FE 50mm f/1.2 GM',
		aperture: 'f/2',
		shutter: '1/30s',
		iso: '1600',
		date: 'Mar 2026',
		aspect: 1.33,
		ang: 200,
		hx: 60,
		hy: 80,
		key: 'placeholder.jpg'
	}
];

const MONTHS: Record<string, number> = {
	Jan: 0,
	Feb: 1,
	Mar: 2,
	Apr: 3,
	May: 4,
	Jun: 5,
	Jul: 6,
	Aug: 7,
	Sep: 8,
	Oct: 9,
	Nov: 10,
	Dec: 11
};
const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

const GREY: [string, string][] = [
	['#4a4a4a', '#c9c9c9'],
	['#3a3a3a', '#bdbdbd'],
	['#565656', '#d2d2d2'],
	['#2e2e2e', '#a8a8a8'],
	['#4f4f4f', '#cccccc'],
	['#606060', '#dcdcdc'],
	['#404040', '#c0c0c0'],
	['#5a5a5a', '#d6d6d6'],
	['#343434', '#b0b0b0'],
	['#4c4c4c', '#cfcfcf'],
	['#585858', '#d8d8d8'],
	['#2a2a2a', '#9e9e9e']
];

/** Monochrome placeholder gradient for a photo. */
export function gradient(p: Photo): string {
	const [a, b] = GREY[(p.id - 1) % GREY.length];
	return `radial-gradient(135% 95% at ${p.hx}% ${p.hy}%, rgba(255,255,255,.5), rgba(255,255,255,0) 55%), linear-gradient(${p.ang}deg, ${a}, ${b})`;
}

/** Public URL of a photo's full-size image in the image bucket. */
export function imageUrl(p: Photo): string {
	return `${PUBLIC_IMAGE_BASE_URL}/${p.key}`;
}

function sortKey(p: Photo): number {
	const [mon, yr] = p.date.split(' ');
	return Number(yr) * 12 + MONTHS[mon];
}

/** Photos newest-first. */
export function orderedPhotos(): Photo[] {
	return [...PHOTOS].sort((a, b) => sortKey(b) - sortKey(a));
}

export interface Section {
	label: string;
	countLabel: string;
	photos: Photo[];
}

/** Group an ordered list into month sections (preserving order). */
export function sectionsOf(photos: Photo[]): Section[] {
	const out: Section[] = [];
	for (const p of photos) {
		const [mon, yr] = p.date.split(' ');
		const label = `${MONTH_NAMES[MONTHS[mon]]} ${yr}`;
		let sec = out[out.length - 1];
		if (!sec || sec.label !== label) {
			sec = { label, countLabel: '', photos: [] };
			out.push(sec);
		}
		sec.photos.push(p);
	}
	for (const s of out)
		s.countLabel = `${s.photos.length} ${s.photos.length === 1 ? 'frame' : 'frames'}`;
	return out;
}

export interface Spec {
	k: string;
	v: string;
}

export function specsOf(p: Photo): Spec[] {
	return [
		{ k: 'Camera', v: p.camera ?? PLACEHOLDER },
		{ k: 'Lens', v: p.lens ?? PLACEHOLDER },
		{ k: 'Aperture', v: p.aperture ?? PLACEHOLDER },
		{ k: 'Shutter', v: p.shutter ?? PLACEHOLDER },
		{ k: 'Film / ISO', v: p.iso ?? PLACEHOLDER }
	];
}

export type GridStyle = 'justified' | 'uniform' | 'masonry';

export const GRID_CONTAINERS: Record<GridStyle, string> = {
	uniform: 'display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:16px;',
	masonry: 'column-width:250px; column-gap:16px;',
	justified: 'display:flex; flex-wrap:wrap; gap:14px;'
};

/** Per-tile layout style for the chosen grid mode. */
export function figStyle(p: Photo, grid: GridStyle): string {
	let s =
		'position:relative; cursor:pointer; margin:0; background:var(--g-surface); border-radius:8px; overflow:hidden;';
	if (grid === 'uniform') s += ' aspect-ratio:1;';
	else if (grid === 'masonry')
		s += ` aspect-ratio:${p.aspect}; margin:0 0 16px; break-inside:avoid; width:100%;`;
	else s += ` height:240px; flex:${p.aspect} 1 ${Math.round(p.aspect * 240)}px;`;
	return s;
}
