/**
 * CENTRAL DIAGRAM THEMES REGISTRY
 * Aggregates all 20 Dan Koe Minimalist Kinetic Wireframe Themes (200 distinct items)
 * + Dual-Synthesis Special Diagram (mind_body)
 */

import { themeFinance } from './themes/themeFinance.js';
import { themeEconomy } from './themes/themeEconomy.js';
import { themeMindset } from './themes/themeMindset.js';
import { themePsychology } from './themes/themePsychology.js';
import { themeDarkPsychology } from './themes/themeDarkPsychology.js';
import { themeHealth } from './themes/themeHealth.js';
import { themeTechnology } from './themes/themeTechnology.js';
import { themePeople } from './themes/themePeople.js';
import { themeDailyActivity } from './themes/themeDailyActivity.js';
import { themeEarth } from './themes/themeEarth.js';
import { themeAnimals } from './themes/themeAnimals.js';
import { themeNature } from './themes/themeNature.js';
import { themePlants } from './themes/themePlants.js';
import { themeWork } from './themes/themeWork.js';
import { themeHistory } from './themes/themeHistory.js';
import { themeMilitary } from './themes/themeMilitary.js';
import { themeZen } from './themes/themeZen.js';
import { themeSpace } from './themes/themeSpace.js';
import { themeEmotions } from './themes/themeEmotions.js';
import { themeCreator } from './themes/themeCreator.js';

export const THEME_COLORS = {
	finance: '#10B981',
	economy: '#06B6D4',
	mindset: '#F59E0B',
	psychology: '#818CF8',
	dark_psychology: '#EF4444',
	health: '#F97316',
	technology: '#3B82F6',
	people: '#EC4899',
	daily_activity: '#EAB308',
	earth: '#0EA5E9',
	animals: '#D97706',
	nature: '#14B8A6',
	plants: '#84CC16',
	work: '#A1A1AA',
	history: '#D4AF37',
	military: '#DC2626',
	zen: '#34D399',
	space: '#A855F7',
	emotions: '#FB7185',
	creator: '#C084FC'
};

export const DIAGRAM_THEMES = [
	themeFinance,
	themeEconomy,
	themeMindset,
	themePsychology,
	themeDarkPsychology,
	themeHealth,
	themeTechnology,
	themePeople,
	themeDailyActivity,
	themeEarth,
	themeAnimals,
	themeNature,
	themePlants,
	themeWork,
	themeHistory,
	themeMilitary,
	themeZen,
	themeSpace,
	themeEmotions,
	themeCreator
];

// Ensure all themes have their signature themeColor
DIAGRAM_THEMES.forEach(theme => {
	if (!theme.themeColor && THEME_COLORS[theme.categoryName]) {
		theme.themeColor = THEME_COLORS[theme.categoryName];
	}
});

/**
 * Dual Synthesis Special Item: Mind & Body Synergy
 * (User Requested: "Olahraga rutin setiap pagi membangun ketahanan tubuh dan disiplin pikiran")
 */
export const SPECIAL_DIAGRAMS = [
	{
		id: 'mind_body',
		name: 'Mind-Body Dual Synthesis',
		title: 'THE MIND-BODY CONNECTION',
		tag: '[ SINERGI TUBUH & PIKIRAN ]',
		categoryName: 'health',
		themeColor: '#F97316',
		regex: /(tubuh.*pikiran|pikiran.*tubuh|olahraga.*disiplin|fisik.*mental|mind.*body|body.*mind)/i,
		nodes: ['01. PHYSICAL RESISTANCE (TUBUH)', '02. NEURAL DISCIPLINE (PIKIRAN)', '03. VAGUS HARMONY', '04. INTEGRATED MASTERY'],
		renderSVG: (acc, title, nodes) => `
  <style>
    @keyframes synapTravel {
      0% { stroke-dashoffset: 60; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px ${acc}44); }
      50% { transform: scale(1.06); filter: drop-shadow(0 0 16px ${acc}); }
    }
    .anim-synapse { stroke-dasharray: 6,6; animation: synapTravel 2s linear infinite; }
    .anim-nexus { animation: pulseGlow 2.5s ease-in-out infinite; transform-origin: 350px 185px; }
  </style>

  <!-- Left: Physical Realm (Barbell Archetype) -->
  <g transform="translate(130, 110)">
    <line x1="20" y1="75" x2="160" y2="75" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
    <rect x="35" y="45" width="12" height="60" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <rect x="49" y="35" width="14" height="80" rx="4" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <rect x="117" y="35" width="14" height="80" rx="4" fill="#18181b" stroke="${acc}" stroke-width="2.5" />
    <rect x="133" y="45" width="12" height="60" rx="3" fill="#18181b" stroke="#FFFFFF" stroke-width="2" />
    <text x="90" y="140" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="900" fill="#71717A" text-anchor="middle">BODY // RESISTANCE</text>
  </g>

  <!-- Central Kinetic Synapse Bridge -->
  <path d="M 280,185 C 315,145 315,225 350,185 C 385,145 385,225 420,185" fill="none" stroke="${acc}" stroke-width="2.5" class="anim-synapse" />
  
  <!-- Central Nexus Core -->
  <g class="anim-nexus">
    <circle cx="350" cy="185" r="24" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="350" cy="185" r="14" fill="#18181b" stroke="${acc}" stroke-width="2" stroke-dasharray="3,3" />
    <circle cx="350" cy="185" r="5" fill="${acc}" />
  </g>

  <!-- Right: Cognitive Realm (Brain Synapse Archetype) -->
  <g transform="translate(410, 110)">
    <ellipse cx="80" cy="75" rx="55" ry="40" fill="#18181b" stroke="#FFFFFF" stroke-width="2.5" stroke-dasharray="6,4" />
    <path d="M 50,75 Q 80,50 110,75 T 80,95" fill="none" stroke="${acc}" stroke-width="2" />
    <circle cx="50" cy="75" r="4" fill="${acc}" />
    <circle cx="80" cy="55" r="4" fill="#FFFFFF" />
    <circle cx="110" cy="75" r="4" fill="${acc}" />
    <text x="80" y="140" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="900" fill="#71717A" text-anchor="middle">MIND // DISCIPLINE</text>
  </g>

  <text x="350" y="360" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${title}</text>
`
	}
];

/**
 * Flat Registry Map of ID -> Diagram Item
 */
export const DIAGRAM_REGISTRY = {};

// Register all theme items
DIAGRAM_THEMES.forEach(theme => {
	theme.items.forEach(item => {
		DIAGRAM_REGISTRY[item.id] = {
			...item,
			categoryName: theme.categoryName,
			categoryLabel: theme.categoryLabel,
			themeColor: theme.themeColor
		};
	});
});

// Register special items
SPECIAL_DIAGRAMS.forEach(item => {
	DIAGRAM_REGISTRY[item.id] = item;
});

// Aliases for backward compatibility with previously saved or referenced types
const ALIASES = {
	'target': 'deep_work_sprint',
	'book': 'journal_pen',
	'loop': 'habit_flywheel',
	'flywheel': 'habit_flywheel',
	'matrix': 'first_principles',
	'curve': 'growth_mindset',
	'comparison': 'crowd_divergence',
	'pipeline': 'code_terminal',
	'fire': 'tribe_fire',
	'compass': 'stoic_control',
	'sword': 'sword_excalibur',
	'anchor': 'stoic_control',
	'pyramid': 'maslow_pyramid',
	'bridge': 'empathy_hug',
	'shield': 'shield_boundaries',
	'lock_key': 'cyber_firewall',
	'eye': 'paradigm_lens',
	'atom': 'first_principles',
	'sprout': 'growth_mindset',
	'sun': 'dawn_alarm',
	'gear': 'synergy_gears',
	'dna': 'cell_mitochondria',
	'rocket': 'rocket_propulsion'
};

Object.entries(ALIASES).forEach(([alias, targetId]) => {
	if (DIAGRAM_REGISTRY[targetId] && !DIAGRAM_REGISTRY[alias]) {
		DIAGRAM_REGISTRY[alias] = DIAGRAM_REGISTRY[targetId];
	}
});
