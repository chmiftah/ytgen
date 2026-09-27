/**
 * Smart English Phonetic Normalizer for Indonesian TTS
 * 
 * Maps popular English loanwords, phrases, psychology & creator terminology 
 * into natural phonetic Indonesian spellings so that Indonesian Edge TTS voices 
 * (Ardi, Gadis) pronounce them with a fluent English accent rather than rigid Indonesian spelling.
 * 
 * Subtitles on screen retain 100% original English spelling.
 */

// Multi-word idioms & phrases (matched first to prevent sub-word collisions)
const PHONETIC_PHRASES = [
	// Psychology & Mindset
	{ pattern: /\bcomfort\s+zone\b/gi, spoken: 'kamfert zon' },
	{ pattern: /\bfixed\s+mindset\b/gi, spoken: 'fiks main-set' },
	{ pattern: /\bgrowth\s+mindset\b/gi, spoken: 'grout main-set' },
	{ pattern: /\bdeep\s+work\b/gi, spoken: 'dip werk' },
	{ pattern: /\bshallow\s+work\b/gi, spoken: 'syelou werk' },
	{ pattern: /\bflow\s+state\b/gi, spoken: 'flou steit' },
	{ pattern: /\bdopamine\s+detox\b/gi, spoken: 'dopamin ditoks' },
	{ pattern: /\batomic\s+habits\b/gi, spoken: 'etomik hebits' },
	{ pattern: /\bdelayed?\s+gratification\b/gi, spoken: 'dileid gratifikeisyen' },
	{ pattern: /\bdelay\s+of\s+gratification\b/gi, spoken: 'dilei of gratifikeisyen' },
	{ pattern: /\bcircle\s+of\s+control\b/gi, spoken: 'serkel of kontrol' },
	{ pattern: /\bcoping\s+mechanism\b/gi, spoken: 'koping mekanizem' },
	{ pattern: /\bimposter\s+syndrome\b/gi, spoken: 'imposter sindrom' },
	{ pattern: /\bpanic\s+attack\b/gi, spoken: 'penik etek' },
	{ pattern: /\bmental\s+health\b/gi, spoken: 'mental helt' },
	{ pattern: /\bself[- ]improvement\b/gi, spoken: 'self-imprufment' },
	{ pattern: /\bself[- ]care\b/gi, spoken: 'self-ker' },
	{ pattern: /\bself[- ]worth\b/gi, spoken: 'self-wert' },
	{ pattern: /\bself[- ]esteem\b/gi, spoken: 'self-estim' },
	{ pattern: /\bwork[- ]life\s+balance\b/gi, spoken: 'werk-laif belens' },
	{ pattern: /\bmind[- ]blowing\b/gi, spoken: 'maind-blouing' },

	// Finance & Career
	{ pattern: /\bfinancial\s+freedom\b/gi, spoken: 'fainensyel fridom' },
	{ pattern: /\bpassive\s+income\b/gi, spoken: 'pesif inkam' },
	{ pattern: /\bactive\s+income\b/gi, spoken: 'ektif inkam' },
	{ pattern: /\bcash\s*flow\b/gi, spoken: 'kesh-flou' },
	{ pattern: /\brat\s+race\b/gi, spoken: 'ret reis' },
	{ pattern: /\bside\s+hustle\b/gi, spoken: 'said hasel' },
	{ pattern: /\bhustle\s+culture\b/gi, spoken: 'hasel kalcer' },
	{ pattern: /\blifestyle\s+inflation\b/gi, spoken: 'laifstail infleisyen' },
	{ pattern: /\blifestyle\s+creep\b/gi, spoken: 'laifstail krip' },
	{ pattern: /\bcompound\s+interest\b/gi, spoken: 'kompaund intrest' },
	{ pattern: /\bemergency\s+fund\b/gi, spoken: 'imerjensi fand' },
	{ pattern: /\bnet\s+worth\b/gi, spoken: 'net wert' },
	{ pattern: /\bsmart\s+money\b/gi, spoken: 'smart mani' },
	{ pattern: /\bhigh\s+leverage\b/gi, spoken: 'hai leverij' },
	{ pattern: /\blow\s+leverage\b/gi, spoken: 'lou leverij' },
	{ pattern: /\bstock\s+market\b/gi, spoken: 'stok market' },
	{ pattern: /\bmarket\s+cap\b/gi, spoken: 'market kep' },

	// Tech & Creator
	{ pattern: /\bcontent\s+creator\b/gi, spoken: 'konten krieitor' },
	{ pattern: /\bscreen\s+time\b/gi, spoken: 'skrin taim' },
	{ pattern: /\bdoom\s*scrolling\b/gi, spoken: 'dum-skroling' },
	{ pattern: /\bvideo\s+essay\b/gi, spoken: 'video esei' },
	{ pattern: /\bcheat\s*sheet\b/gi, spoken: 'cit-syit' },
	{ pattern: /\blife\s*hack\b/gi, spoken: 'laif hek' },
	{ pattern: /\bmachine\s+learning\b/gi, spoken: 'mesyin lerning' },
	{ pattern: /\bartificial\s+intelligence\b/gi, spoken: 'artifisyel intelijens' },
	{ pattern: /\bcase\s+study\b/gi, spoken: 'keis stadi' },
	{ pattern: /\bcuriosity\s+gap\b/gi, spoken: 'kyuriositi gep' },
	{ pattern: /\beye\s+opener\b/gi, spoken: 'ai opener' },
	{ pattern: /\bgame\s+changer\b/gi, spoken: 'geim cenjer' },
	{ pattern: /\bplot\s+twist\b/gi, spoken: 'plot tuis' },
	{ pattern: /\bwake[- ]up\s+call\b/gi, spoken: 'weik ap kol' },
	{ pattern: /\breality\s+check\b/gi, spoken: 'rialiti cek' },
	{ pattern: /\baction\s+plan\b/gi, spoken: 'eksyeon plen' },
	{ pattern: /\bstep\s+by\s+step\b/gi, spoken: 'step bai step' },
	{ pattern: /\bwin[- ]win\s+solution\b/gi, spoken: 'win win solusyen' },
	{ pattern: /\bmake\s+sense\b/gi, spoken: 'meik sens' },
	{ pattern: /\bnext\s+level\b/gi, spoken: 'neks level' },
	{ pattern: /\blevel\s+up\b/gi, spoken: 'level ap' },
	{ pattern: /\bred\s+flag\b/gi, spoken: 'red fleg' },
	{ pattern: /\bgreen\s+flag\b/gi, spoken: 'grin fleg' },
	{ pattern: /\bpositive\s+vibes?\b/gi, spoken: 'positif vaibs' },
	{ pattern: /\bquarter[- ]life\s+crisis\b/gi, spoken: 'kwerter-laif kraisis' },
	{ pattern: /\bmidlife\s+crisis\b/gi, spoken: 'midlaif kraisis' },
	{ pattern: /\bexistential\s+crisis\b/gi, spoken: 'eksistensyel kraisis' },
	{ pattern: /\binner\s+child\b/gi, spoken: 'iner caild' },
	{ pattern: /\binner\s+peace\b/gi, spoken: 'iner pis' },
	{ pattern: /\bpeople[- ]pleasers?\b/gi, spoken: 'pipel-pliser' },
	{ pattern: /\bpeople[- ]pleasing\b/gi, spoken: 'pipel-plising' },
	{ pattern: /\bsocial\s+anxiety\b/gi, spoken: 'sosyel engzayati' },
	{ pattern: /\btrauma\s+dumping\b/gi, spoken: 'trauma damping' },
	{ pattern: /\blove\s+bombing\b/gi, spoken: 'lav bombing' },
	{ pattern: /\bsilent\s+treatment\b/gi, spoken: 'sailent tritmen' },
	{ pattern: /\btoxic\s+positivity\b/gi, spoken: 'toksik positiviti' },
	{ pattern: /\bself[- ]love\b/gi, spoken: 'self-lav' },
	{ pattern: /\bself[- ]doubt\b/gi, spoken: 'self-daut' },
	{ pattern: /\bself[- ]sabotage\b/gi, spoken: 'self-sabotasye' },
	{ pattern: /\bnegative\s+vibes?\b/gi, spoken: 'negatif vaibs' }
];

// Single popular words
const PHONETIC_WORDS = [
	// Insecurity & Emotions
	{ pattern: /\binsecurities\b/gi, spoken: 'insekyuritis' },
	{ pattern: /\binsecurity(-nya|-mu|-ku)?\b/gi, spoken: 'insekyuriti$1' },
	{ pattern: /\binsecurity(nya|mu|ku)\b/gi, spoken: 'insekyuriti$1' },
	{ pattern: /\binsecure(-nya|-mu|-ku)?\b/gi, spoken: 'insekyur$1' },
	{ pattern: /\binsecure(nya|mu|ku)\b/gi, spoken: 'insekyur$1' },
	{ pattern: /\bintroverts?\b/gi, spoken: 'introfert' },
	{ pattern: /\bextroverts?\b/gi, spoken: 'ekstrofert' },
	{ pattern: /\bambiverts?\b/gi, spoken: 'embifert' },
	{ pattern: /\banxious\b/gi, spoken: 'engsyes' },
	{ pattern: /\banxiety(-nya|-mu|-ku)?\b/gi, spoken: 'engzayati$1' },
	{ pattern: /\banxiety(nya|mu|ku)\b/gi, spoken: 'engzayati$1' },
	{ pattern: /\btrigger(-nya|-mu|-ku)?\b/gi, spoken: 'triger$1' },
	{ pattern: /\btrigger(nya|mu|ku)\b/gi, spoken: 'triger$1' },
	{ pattern: /\btriggered\b/gi, spoken: 'trigerd' },
	{ pattern: /\bmindfulness\b/gi, spoken: 'maindfulnes' },
	{ pattern: /\bmindful\b/gi, spoken: 'maindful' },
	{ pattern: /\bgratitude\b/gi, spoken: 'gretityud' },
	{ pattern: /\bworthless\b/gi, spoken: 'wertles' },
	{ pattern: /\bhopeless\b/gi, spoken: 'houples' },
	{ pattern: /\bloneliness\b/gi, spoken: 'lounlines' },
	{ pattern: /\blonely\b/gi, spoken: 'lounli' },
	{ pattern: /\bfomo\b/gi, spoken: 'fou-mou' },
	{ pattern: /\bjomo\b/gi, spoken: 'jou-mou' },

	// Mindset & Psychology
	{ pattern: /\bmindset(-nya|-mu|-ku)?\b/gi, spoken: 'main-set$1' },
	{ pattern: /\bmindset(nya|mu|ku)\b/gi, spoken: 'main-set$1' },
	{ pattern: /\boverthinking(-nya|-mu|-ku)?\b/gi, spoken: 'ouvertinking$1' },
	{ pattern: /\boverthinking(nya|mu|ku)\b/gi, spoken: 'ouvertinking$1' },
	{ pattern: /\boverthink\b/gi, spoken: 'oufertink' },
	{ pattern: /\boverthinkers?\b/gi, spoken: 'ouvertinker' },
	{ pattern: /\bdopamine(-nya)?\b/gi, spoken: 'dopamin$1' },
	{ pattern: /\bdopamine(nya)\b/gi, spoken: 'dopamin$1' },
	{ pattern: /\bhabits?\b/gi, spoken: 'hebits' },
	{ pattern: /\bburnout(-nya)?\b/gi, spoken: 'bernaut$1' },
	{ pattern: /\bburnout(nya)\b/gi, spoken: 'bernaut$1' },
	{ pattern: /\bburn\s+out\b/gi, spoken: 'bern aut' },
	{ pattern: /\bsubconscious\b/gi, spoken: 'sabkonsyes' },
	{ pattern: /\bunconscious\b/gi, spoken: 'ankonsyes' },
	{ pattern: /\bprocrastination\b/gi, spoken: 'prokrastineisyen' },
	{ pattern: /\bprocrastinate\b/gi, spoken: 'prokrastineit' },
	{ pattern: /\bleverage\b/gi, spoken: 'leverij' },
	{ pattern: /\bhustle\b/gi, spoken: 'hasel' },
	{ pattern: /\bcompounding\b/gi, spoken: 'kompaunding' },
	{ pattern: /\bbudgeting\b/gi, spoken: 'bajeting' },
	{ pattern: /\bbudget\b/gi, spoken: 'bajet' },
	{ pattern: /\bliabilities\b/gi, spoken: 'layabilitis' },
	{ pattern: /\bliability\b/gi, spoken: 'layabiliti' },
	{ pattern: /\bassets?\b/gi, spoken: 'esets' },
	{ pattern: /\bentrepreneurs?\b/gi, spoken: 'ontrepreneuer' },
	{ pattern: /\bstartup\b/gi, spoken: 'start-ap' },
	{ pattern: /\bstartups\b/gi, spoken: 'start-aps' },
	{ pattern: /\bunicorn\b/gi, spoken: 'yunikorn' },
	{ pattern: /\bbearish\b/gi, spoken: 'berisy' },
	{ pattern: /\bbullish\b/gi, spoken: 'bulisy' },
	{ pattern: /\brecession\b/gi, spoken: 'risesyen' },
	{ pattern: /\binflation\b/gi, spoken: 'infleisyen' },

	// Creator & Internet
	{ pattern: /\bcreators?\b/gi, spoken: 'krieitor' },
	{ pattern: /\balgorithms?\b/gi, spoken: 'algoritem' },
	{ pattern: /\byoutube\b/gi, spoken: 'yutub' },
	{ pattern: /\byoutubers?\b/gi, spoken: 'yutuber' },
	{ pattern: /\btiktok\b/gi, spoken: 'tiktok' },
	{ pattern: /\binstagram\b/gi, spoken: 'instagram' },
	{ pattern: /\bpodcasts?\b/gi, spoken: 'podkes' },
	{ pattern: /\bpodcasters?\b/gi, spoken: 'podkester' },
	{ pattern: /\bclickbait\b/gi, spoken: 'klikbeit' },
	{ pattern: /\bretention\b/gi, spoken: 'ritensyen' },
	{ pattern: /\baudiences?\b/gi, spoken: 'odiens' },
	{ pattern: /\bengagements?\b/gi, spoken: 'engeijmen' },
	{ pattern: /\btraffic\b/gi, spoken: 'trefik' },
	{ pattern: /\bsubscribers?\b/gi, spoken: 'sabskraiber' },
	{ pattern: /\bfeedback\b/gi, spoken: 'fidbek' },
	{ pattern: /\binsights?\b/gi, spoken: 'insait' },
	{ pattern: /\bframeworks?\b/gi, spoken: 'freimwerk' },
	{ pattern: /\bworkflows?\b/gi, spoken: 'werkflou' },
	{ pattern: /\bblueprints?\b/gi, spoken: 'bluprint' },
	{ pattern: /\broadmaps?\b/gi, spoken: 'roudmep' },
	{ pattern: /\bsoftwares?\b/gi, spoken: 'softwer' },
	{ pattern: /\bhardwares?\b/gi, spoken: 'hardwer' },
	{ pattern: /\bgadgets?\b/gi, spoken: 'gejet' },
	{ pattern: /\bsmartphones?\b/gi, spoken: 'smartfoun' },
	{ pattern: /\bscrolling\b/gi, spoken: 'skroling' },
	{ pattern: /\bscroll\b/gi, spoken: 'skrol' },
	{ pattern: /\bshortcuts?\b/gi, spoken: 'syortkat' },
	{ pattern: /\btemplates?\b/gi, spoken: 'templeit' },
	{ pattern: /\bprompts?\b/gi, spoken: 'promt' },
	{ pattern: /\bdatabases?\b/gi, spoken: 'deitabeis' },
	{ pattern: /\bclouds?\b/gi, spoken: 'klaud' },
	{ pattern: /\bdownload\b/gi, spoken: 'daunloud' },
	{ pattern: /\bupload\b/gi, spoken: 'aploud' },
	{ pattern: /\bstreaming\b/gi, spoken: 'striming' },
	{ pattern: /\bstreamers?\b/gi, spoken: 'strimer' },
	{ pattern: /\blivestreams?\b/gi, spoken: 'laifstrim' },
	{ pattern: /\bstorytelling\b/gi, spoken: 'storiteling' },
	{ pattern: /\bbreakthrough\b/gi, spoken: 'breiktru' },
	{ pattern: /\bcomeback\b/gi, spoken: 'kambek' },
	{ pattern: /\bpunchlines?\b/gi, spoken: 'panc-lain' },
	{ pattern: /\bdeadlines?\b/gi, spoken: 'dedlain' },
	{ pattern: /\bchallenges?\b/gi, spoken: 'celenj' },
	{ pattern: /\bprivileges?\b/gi, spoken: 'privilij' },
	{ pattern: /\brelatables?\b/gi, spoken: 'riletebel' },
	{ pattern: /\brelationships?\b/gi, spoken: 'rileisyensyip' },
	{ pattern: /\bhealing\b/gi, spoken: 'hiling' },
	{ pattern: /\bgaslighting\b/gi, spoken: 'geslaiting' },
	{ pattern: /\bghosting\b/gi, spoken: 'gousting' },
	{ pattern: /\boverrated\b/gi, spoken: 'ouferreited' },
	{ pattern: /\bunderrated\b/gi, spoken: 'anderreited' },
	{ pattern: /\bhighlights?\b/gi, spoken: 'hailait' },
	{ pattern: /\bvibes?\b/gi, spoken: 'vaibs' },
	{ pattern: /\bcringe\b/gi, spoken: 'krinj' },
	{ pattern: /\bworth\s+it\b/gi, spoken: 'wert it' }
];

/**
 * Check if the target voice is an Indonesian / regional voice
 */
export function isIndonesianVoice(voiceId = '') {
	if (!voiceId) return true; // default voice is id-ID-ArdiNeural
	const vid = String(voiceId).toLowerCase();
	return (
		vid.startsWith('id-id') || 
		vid.startsWith('jv-id') || 
		vid.startsWith('su-id') || 
		vid.startsWith('f5-') ||
		vid.includes('ardi') || 
		vid.includes('gadis')
	);
}

/**
 * Apply English phonetic pronunciation transliteration for Indonesian TTS
 * 
 * @param {string} text - Raw input narration
 * @param {string} voiceId - Target TTS Voice ID
 * @returns {string} - Phonetically optimized text for natural accent pronunciation
 */
export function applyEnglishPhonetics(text, voiceId = 'id-ID-ArdiNeural') {
	if (!text || typeof text !== 'string') return '';

	// If using native English voices (e.g. Christopher, Jenny, Guy, Aria), do NOT alter English text
	if (!isIndonesianVoice(voiceId)) {
		return text;
	}

	let result = text;

	// 1. Process multi-word phrases first
	for (const item of PHONETIC_PHRASES) {
		result = result.replace(item.pattern, item.spoken);
	}

	// 2. Process single words
	for (const item of PHONETIC_WORDS) {
		result = result.replace(item.pattern, item.spoken);
	}

	return result;
}
