// Photo catalogue + helpers for the Galleria gallery.
// Placeholder imagery is generated as monochrome gradients (see `gradient`);
// swap `gradient(p)` for a real `url(p.src)` once you have image files.

export interface Photo {
	id: number;
	name: string;
	category: string;
	desc: string;
	location: string;
	tags: string[];
	camera: string;
	lens: string;
	focal: string;
	aperture: string;
	shutter: string;
	iso: string;
	date: string; // "Mon YYYY", e.g. "Feb 2024"
	aspect: number; // width / height
	ang: number; // gradient angle
	hx: number; // highlight x (%)
	hy: number; // highlight y (%)
}

export const PHOTOS: Photo[] = [
	{
		id: 1,
		name: 'Drift',
		category: 'Landscape',
		desc: 'A single fishing skiff holds its line against the current where the fjord narrows. Shot forty minutes before the light left the water entirely.',
		location: 'Nærøyfjord, Norway',
		tags: ['Fjord', 'Blue hour', 'Long exposure'],
		camera: 'Hasselblad 907X',
		lens: 'XCD 45mm f/3.5',
		focal: '45mm',
		aperture: 'f/8',
		shutter: '4s',
		iso: 'ISO 64',
		date: 'Feb 2024',
		aspect: 1.5,
		ang: 155,
		hx: 28,
		hy: 22
	},
	{
		id: 2,
		name: 'Concrete Choir',
		category: 'Architecture',
		desc: 'The stair core of a brutalist concert hall, read as pure repetition. I waited for a cleaner between figures to keep the geometry unbroken.',
		location: 'Berlin, Germany',
		tags: ['Brutalism', 'Geometry', 'Interior'],
		camera: 'Sony A7R V',
		lens: 'FE 24mm f/1.4 GM',
		focal: '24mm',
		aperture: 'f/5.6',
		shutter: '1/60s',
		iso: 'ISO 400',
		date: 'Sep 2023',
		aspect: 0.75,
		ang: 135,
		hx: 70,
		hy: 18
	},
	{
		id: 3,
		name: 'Crossing, 08:11',
		category: 'Street',
		desc: 'Commuters compress at a signal in the financial district. The frame is built around the one figure who broke stride to look up.',
		location: 'Tokyo, Japan',
		tags: ['Rush hour', 'Monochrome', 'Candid'],
		camera: 'Leica M11',
		lens: 'Summicron 35mm f/2',
		focal: '35mm',
		aperture: 'f/4',
		shutter: '1/250s',
		iso: 'ISO 200',
		date: 'Nov 2023',
		aspect: 1.5,
		ang: 120,
		hx: 40,
		hy: 70
	},
	{
		id: 4,
		name: 'Nocturne No.4',
		category: 'Nocturne',
		desc: 'Sodium lamps on wet asphalt after the last train. Nothing was moved; the puddle did the composing.',
		location: 'Reykjavík, Iceland',
		tags: ['Night', 'Reflection', 'Rain'],
		camera: 'Sony A7R V',
		lens: 'FE 50mm f/1.2 GM',
		focal: '50mm',
		aperture: 'f/2',
		shutter: '1/30s',
		iso: 'ISO 1600',
		date: 'Jan 2025',
		aspect: 1.33,
		ang: 200,
		hx: 60,
		hy: 80
	},
	{
		id: 5,
		name: 'The Tenant',
		category: 'Portrait',
		desc: 'A dockworker at the end of a shift, framed against the hull he had spent eleven hours inside. Available light only.',
		location: 'Gothenburg, Sweden',
		tags: ['Environmental', 'Available light'],
		camera: 'Hasselblad 907X',
		lens: 'XCD 80mm f/1.9',
		focal: '80mm',
		aperture: 'f/2.8',
		shutter: '1/125s',
		iso: 'ISO 200',
		date: 'Apr 2024',
		aspect: 0.8,
		ang: 160,
		hx: 35,
		hy: 30
	},
	{
		id: 6,
		name: 'Ridgeline',
		category: 'Landscape',
		desc: 'First snow on a treeline, seen across a valley of low cloud. The exposure was metered for the brightest ridge and let everything else fall.',
		location: 'Dolomites, Italy',
		tags: ['Mountains', 'Minimal', 'Snow'],
		camera: 'Sony A7R V',
		lens: 'FE 100-400mm',
		focal: '280mm',
		aperture: 'f/11',
		shutter: '1/200s',
		iso: 'ISO 100',
		date: 'Dec 2024',
		aspect: 1.6,
		ang: 150,
		hx: 24,
		hy: 16
	},
	{
		id: 7,
		name: 'Atrium',
		category: 'Architecture',
		desc: 'Looking straight up the void of a library atrium. Perfectly symmetrical until you find the one open window on the fourth floor.',
		location: 'Vienna, Austria',
		tags: ['Symmetry', 'Look up', 'Modern'],
		camera: 'Sony A7R V',
		lens: 'FE 14mm f/1.8 GM',
		focal: '14mm',
		aperture: 'f/8',
		shutter: '1/50s',
		iso: 'ISO 800',
		date: 'Mar 2024',
		aspect: 1.0,
		ang: 180,
		hx: 50,
		hy: 50
	},
	{
		id: 8,
		name: 'Fishmonger',
		category: 'Street',
		desc: 'A vendor mid-gesture in the wet market, caught in the narrow shaft of light between two awnings.',
		location: 'Bergen, Norway',
		tags: ['Market', 'Gesture', 'Colour'],
		camera: 'Leica M11',
		lens: 'Summilux 50mm f/1.4',
		focal: '50mm',
		aperture: 'f/2.8',
		shutter: '1/320s',
		iso: 'ISO 400',
		date: 'Jun 2023',
		aspect: 1.33,
		ang: 110,
		hx: 66,
		hy: 40
	},
	{
		id: 9,
		name: 'Slack Water',
		category: 'Nocturne',
		desc: 'The harbour at the turn of the tide, when the surface goes to glass. A thirty-second frame that took three attempts to keep a boat from drifting.',
		location: 'Stavanger, Norway',
		tags: ['Harbour', 'Long exposure', 'Night'],
		camera: 'Hasselblad 907X',
		lens: 'XCD 38mm f/2.5',
		focal: '38mm',
		aperture: 'f/9',
		shutter: '30s',
		iso: 'ISO 64',
		date: 'Oct 2024',
		aspect: 1.78,
		ang: 170,
		hx: 80,
		hy: 60
	},
	{
		id: 10,
		name: 'Understudy',
		category: 'Portrait',
		desc: 'A dancer resting between takes, half in costume, entirely out of character. The stillness was the picture.',
		location: 'Copenhagen, Denmark',
		tags: ['Backstage', 'Quiet', 'Available light'],
		camera: 'Sony A7R V',
		lens: 'FE 85mm f/1.4 GM',
		focal: '85mm',
		aperture: 'f/1.8',
		shutter: '1/160s',
		iso: 'ISO 640',
		date: 'Apr 2024',
		aspect: 0.75,
		ang: 145,
		hx: 38,
		hy: 26
	},
	{
		id: 11,
		name: 'Causeway',
		category: 'Landscape',
		desc: 'A tidal road that only exists for four hours a day, photographed at the last safe moment before the water closed it.',
		location: 'Outer Hebrides, Scotland',
		tags: ['Coast', 'Leading line', 'Overcast'],
		camera: 'Sony A7R V',
		lens: 'FE 24-70mm f/2.8',
		focal: '32mm',
		aperture: 'f/11',
		shutter: '1/125s',
		iso: 'ISO 100',
		date: 'Sep 2023',
		aspect: 1.5,
		ang: 135,
		hx: 20,
		hy: 75
	},
	{
		id: 12,
		name: 'Grid Failure',
		category: 'Nocturne',
		desc: 'A block during a rolling blackout, lit only by the headlights of one passing car. Metered on instinct.',
		location: 'Oslo, Norway',
		tags: ['Blackout', 'Long exposure', 'Night'],
		camera: 'Sony A7R V',
		lens: 'FE 35mm f/1.4 GM',
		focal: '35mm',
		aperture: 'f/1.4',
		shutter: '1/15s',
		iso: 'ISO 3200',
		date: 'Jan 2025',
		aspect: 1.33,
		ang: 200,
		hx: 70,
		hy: 55
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
		{ k: 'Camera', v: p.camera },
		{ k: 'Lens', v: p.lens },
		{ k: 'Focal length', v: p.focal },
		{ k: 'Aperture', v: p.aperture },
		{ k: 'Shutter', v: p.shutter },
		{ k: 'ISO', v: p.iso },
		{ k: 'Captured', v: p.date }
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
