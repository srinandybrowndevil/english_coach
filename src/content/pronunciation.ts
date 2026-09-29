// spec §11 sound lab + §12 IPA progression + §16 shadowing sets.

export type SoundContrast = {
  slug: string; title: string; ipa: string[];
  articulation: string; // guidance tuned for Tamil speakers
  minimalPairs: [string, string][];
  practiceWords: { word: string; ipa: string; syllables: number; stress: number }[]; // stress = 0-indexed syllable
  sentences: string[];
};

export const SOUND_CONTRASTS: SoundContrast[] = [
  {
    slug: 'th-voiced-voiceless', title: 'TH: θ / ð', ipa: ['θ', 'ð'],
    articulation: 'Place the tongue tip lightly between the teeth and blow (θ) or buzz (ð). Tamil speakers often substitute t/d — keep the tongue forward and let air pass.',
    minimalPairs: [['think', 'sink'], ['thick', 'tick'], ['bath', 'bat'], ['path', 'pat'], ['this', 'dis'], ['then', 'den'], ['breathe', 'breed'], ['mouth', 'mouse'], ['thumb', 'sum'], ['though', 'dough']],
    practiceWords: [
      { word: 'think', ipa: 'θɪŋk', syllables: 1, stress: 0 },
      { word: 'thirty', ipa: 'ˈθɜːrti', syllables: 2, stress: 0 },
      { word: 'through', ipa: 'θruː', syllables: 1, stress: 0 },
      { word: 'this', ipa: 'ðɪs', syllables: 1, stress: 0 },
      { word: 'mother', ipa: 'ˈmʌðər', syllables: 2, stress: 0 },
      { word: 'weather', ipa: 'ˈwɛðər', syllables: 2, stress: 0 },
    ],
    sentences: [
      'I think that this is the third one.',
      'My mother thanked them both.',
      'The weather this Thursday looks thorough.',
      'Nothing further to discuss this month.',
    ],
  },
  {
    slug: 'v-w-contrast', title: 'V / W', ipa: ['v', 'w'],
    articulation: 'V: upper teeth touch the lower lip and buzz. W: round both lips, no teeth. Indian English often merges these into a single soft v/w.',
    minimalPairs: [['vet', 'wet'], ['vine', 'wine'], ['veil', 'whale'], ['vest', 'west'], ['vend', 'wend'], ['veer', 'weir'], ['vary', 'wary'], ['vein', 'wane'], ['vile', 'while'], ['verse', 'worse']],
    practiceWords: [
      { word: 'very', ipa: 'ˈvɛri', syllables: 2, stress: 0 },
      { word: 'value', ipa: 'ˈvæljuː', syllables: 2, stress: 0 },
      { word: 'work', ipa: 'wɜːrk', syllables: 1, stress: 0 },
      { word: 'weekend', ipa: 'ˈwiːkɛnd', syllables: 2, stress: 0 },
      { word: 'every', ipa: 'ˈɛvri', syllables: 3, stress: 0 },
      { word: 'forward', ipa: 'ˈfɔːrwərd', syllables: 2, stress: 0 },
    ],
    sentences: [
      'We will review the vendor invoice every week.',
      'Vikram was very worried about the wait.',
      'The river valley widened westward.',
      'Every Wednesday we verify the workflow.',
    ],
  },
  {
    slug: 'f-p-contrast', title: 'F / P', ipa: ['f', 'p'],
    articulation: 'F: lower lip to upper teeth, continuous friction. P: both lips close then release. F does not exist in classical Tamil — resist turning it into p.',
    minimalPairs: [['feel', 'peel'], ['fast', 'past'], ['fine', 'pine'], ['copy', 'coffee'], ['fat', 'pat'], ['file', 'pile'], ['fear', 'peer'], ['half', 'hap'], ['fool', 'pool'], ['offer', 'upper']],
    practiceWords: [
      { word: 'focus', ipa: 'ˈfoʊkəs', syllables: 2, stress: 0 },
      { word: 'profit', ipa: 'ˈprɒfɪt', syllables: 2, stress: 0 },
      { word: 'profile', ipa: 'ˈproʊfaɪl', syllables: 2, stress: 0 },
      { word: 'perform', ipa: 'pərˈfɔːrm', syllables: 2, stress: 1 },
      { word: 'prefer', ipa: 'prɪˈfɜːr', syllables: 2, stress: 1 },
    ],
    sentences: [
      'Please confirm the payment for the profile.',
      'I prefer the practical offer.',
      'Proof of performance improves the pitch.',
      'Perfect the first paragraph of the proposal.',
    ],
  },
  {
    slug: 'z-s-contrast', title: 'Z / S (voicing)', ipa: ['z', 's'],
    articulation: 'Same tongue position; only the vocal cords differ. Put a finger on your throat: buzz for z, silent for s. Final -s after voiced sounds is /z/: goes, days.',
    minimalPairs: [['zoo', 'Sue'], ['zip', 'sip'], ['buzz', 'bus'], ['rise', 'rice'], ['prize', 'price'], ['loose', 'lose'], ['ice', 'eyes'], ['peace', 'peas'], ['race', 'raise'], ['sink', 'zinc']],
    practiceWords: [
      { word: 'zero', ipa: 'ˈzɪəroʊ', syllables: 2, stress: 0 },
      { word: 'busy', ipa: 'ˈbɪzi', syllables: 2, stress: 0 },
      { word: 'result', ipa: 'rɪˈzʌlt', syllables: 2, stress: 1 },
      { word: 'exactly', ipa: 'ɪɡˈzæktli', syllables: 3, stress: 1 },
      { word: 'design', ipa: 'dɪˈzaɪn', syllables: 2, stress: 1 },
    ],
    sentences: [
      'His eyes widened at the surprise results.',
      'The zero-defect design raised the price.',
      'These days the buzz is about resale.',
      'She realised the pieces were easy.',
    ],
  },
  {
    slug: 'zh-sh-contrast', title: 'ʒ / ʃ', ipa: ['ʒ', 'ʃ'],
    articulation: 'ʃ as in "ship" — familiar. ʒ is its voiced twin: measure, vision. Hold the ʃ position and add voice.',
    minimalPairs: [['Aleutian', 'allusion'], ['leisure', 'ledger'], ['mesher', 'measure'], ['Confucian', 'confusion'], ['ashen', 'Asian'], ['fissure', 'fisher'], ['seizure', 'Caesar'], ['vision', 'fission'], ['casual', 'bashful'], ['version', 'virgin']],
    practiceWords: [
      { word: 'measure', ipa: 'ˈmɛʒər', syllables: 2, stress: 0 },
      { word: 'vision', ipa: 'ˈvɪʒən', syllables: 2, stress: 0 },
      { word: 'usual', ipa: 'ˈjuːʒuəl', syllables: 3, stress: 0 },
      { word: 'decision', ipa: 'dɪˈsɪʒən', syllables: 3, stress: 1 },
      { word: 'occasion', ipa: 'əˈkeɪʒən', syllables: 3, stress: 1 },
    ],
    sentences: [
      'It was a pleasure to reach a decision.',
      'We measured the tension with precision.',
      'On this occasion the vision was unusual.',
      'A casual discussion about the division.',
    ],
  },
  {
    slug: 'r-l-contrast', title: 'R / L', ipa: ['r', 'l'],
    articulation: 'English r: tongue curls back slightly, no contact. l: tongue tip touches the ridge behind the teeth. Indian trilled r is acceptable but the two must never merge.',
    minimalPairs: [['right', 'light'], ['road', 'load'], ['correct', 'collect'], ['pray', 'play'], ['free', 'flee'], ['grass', 'glass'], ['crowd', 'cloud'], ['royal', 'loyal'], ['irate', 'elate'], ['arrive', 'alive']],
    practiceWords: [
      { word: 'really', ipa: 'ˈrɪəli', syllables: 2, stress: 0 },
      { word: 'clearly', ipa: 'ˈklɪərli', syllables: 2, stress: 0 },
      { word: 'correct', ipa: 'kəˈrɛkt', syllables: 2, stress: 1 },
      { word: 'delivery', ipa: 'dɪˈlɪvəri', syllables: 4, stress: 1 },
      { word: 'reliable', ipa: 'rɪˈlaɪəbəl', syllables: 4, stress: 1 },
    ],
    sentences: [
      'The report clearly lists all the errors.',
      'Reliable delivery is really valuable.',
      'Collect the correct files, please.',
      'Laura read the legal letter carefully.',
    ],
  },
  {
    slug: 'vowel-contrasts', title: 'Vowels: æ / ɑ / ʌ', ipa: ['æ', 'ɑ', 'ʌ'],
    articulation: 'æ (cat): jaw low, tongue front. ɑ (cart): jaw open, tongue back. ʌ (cut): relaxed central. Tamil lacks the æ/ʌ split — drill the jaw drop.',
    minimalPairs: [['cat', 'cut'], ['hat', 'hut'], ['bat', 'but'], ['ran', 'run'], ['cap', 'cup'], ['lack', 'luck'], ['badge', 'budge'], ['bad', 'bud'], ['pack', 'park'], ['back', 'bark']],
    practiceWords: [
      { word: 'actually', ipa: 'ˈæktʃuəli', syllables: 4, stress: 0 },
      { word: 'market', ipa: 'ˈmɑːrkɪt', syllables: 2, stress: 0 },
      { word: 'money', ipa: 'ˈmʌni', syllables: 2, stress: 0 },
      { word: 'package', ipa: 'ˈpækɪdʒ', syllables: 2, stress: 0 },
      { word: 'budget', ipa: 'ˈbʌdʒɪt', syllables: 2, stress: 0 },
    ],
    sentences: [
      'The package actually came under budget.',
      'Market money matters in March.',
      'Dad packed up the damaged cartons.',
      'The startup ran out of runway fast.',
    ],
  },
  {
    slug: 'word-final-consonants', title: 'Word-Final Consonants', ipa: ['-', 'C#'],
    articulation: 'Release final consonants audibly but do not add a vowel after them: "test" is /tɛst/, not "testu" and not "tes". Tamil phonotactics invite both errors.',
    minimalPairs: [['test', 'tes'], ['hold', 'hole'], ['build', 'bill'], ['send', 'sen'], ['last', 'lass'], ['mend', 'men'], ['post', 'pose'], ['card', 'car'], ['board', 'boar'], ['world', 'whirled']],
    practiceWords: [
      { word: 'project', ipa: 'ˈprɒdʒɛkt', syllables: 2, stress: 0 },
      { word: 'contract', ipa: 'ˈkɒntrækt', syllables: 2, stress: 0 },
      { word: 'world', ipa: 'wɜːrld', syllables: 1, stress: 0 },
      { word: 'first', ipa: 'fɜːrst', syllables: 1, stress: 0 },
      { word: 'build', ipa: 'bɪld', syllables: 1, stress: 0 },
    ],
    sentences: [
      'Send the contract to the board first.',
      'Hold the last draft until Friday.',
      'Build the test before the world launch.',
      'Post the final report on the portal.',
    ],
  },
  {
    slug: 'consonant-clusters', title: 'Consonant Clusters', ipa: ['str', 'sks'],
    articulation: 'No vowel inside clusters: "street" is /striːt/, not "istreet" or "sutreet". Practise clusters as one unit — tongue never leaves contact.',
    minimalPairs: [['street', 'sitter eat'], ['asks', 'axe'], ['sixths', 'sixes'], ['texts', 'texas'], ['grasped', 'grasped at'], ['risked', 'risk it'], ['prompts', 'promise'], ['sprints', 'sprints in'], ['strength', 'strength of'], ['twelfths', 'twelve'] ],
    practiceWords: [
      { word: 'strengths', ipa: 'strɛŋkθs', syllables: 1, stress: 0 },
      { word: 'constraints', ipa: 'kənˈstreɪnts', syllables: 2, stress: 1 },
      { word: 'next', ipa: 'nɛkst', syllables: 1, stress: 0 },
      { word: 'twelfths', ipa: 'twɛlfθs', syllables: 1, stress: 0 },
      { word: 'prompts', ipa: 'prɒmpts', syllables: 1, stress: 0 },
    ],
    sentences: [
      'The constraints stressed the project\'s strengths.',
      'Next spring\'s sprints start Monday.',
      'She fixed six strict text strings.',
      'Prompts and texts prompt quick acts.',
    ],
  },
];

// §12 IPA progression — teach progressively, never the whole chart at once.
export type IpaModule = {
  slug: string; title: string; order: number;
  symbols: { symbol: string; exampleWord: string; exampleIpa: string; note: string }[];
};

export const IPA_MODULES: IpaModule[] = [
  { slug: 'ipa-short-vowels', title: 'Short vowels', order: 1, symbols: [
    { symbol: 'ɪ', exampleWord: 'ship', exampleIpa: 'ʃɪp', note: 'relaxed, short' },
    { symbol: 'ɛ', exampleWord: 'bed', exampleIpa: 'bɛd', note: 'open-mid front' },
    { symbol: 'æ', exampleWord: 'cat', exampleIpa: 'kæt', note: 'jaw drops low' },
    { symbol: 'ʌ', exampleWord: 'cut', exampleIpa: 'kʌt', note: 'central, short' },
    { symbol: 'ɒ', exampleWord: 'lot', exampleIpa: 'lɒt', note: 'open back (BrE)' },
    { symbol: 'ʊ', exampleWord: 'put', exampleIpa: 'pʊt', note: 'short rounded' },
    { symbol: 'ə', exampleWord: 'about', exampleIpa: 'əˈbaʊt', note: 'the schwa — most common sound in English' } ] },
  { slug: 'ipa-long-vowels', title: 'Long vowels', order: 2, symbols: [
    { symbol: 'iː', exampleWord: 'sheep', exampleIpa: 'ʃiːp', note: 'vs ɪ: ship/sheep' },
    { symbol: 'ɑː', exampleWord: 'cart', exampleIpa: 'kɑːrt', note: 'open back, long' },
    { symbol: 'ɔː', exampleWord: 'thought', exampleIpa: 'θɔːt', note: 'rounded back' },
    { symbol: 'uː', exampleWord: 'food', exampleIpa: 'fuːd', note: 'long rounded' },
    { symbol: 'ɜː', exampleWord: 'bird', exampleIpa: 'bɜːrd', note: 'central r-coloured in AmE' } ] },
  { slug: 'ipa-diphthongs', title: 'Diphthongs', order: 3, symbols: [
    { symbol: 'eɪ', exampleWord: 'say', exampleIpa: 'seɪ', note: 'glides' },
    { symbol: 'aɪ', exampleWord: 'my', exampleIpa: 'maɪ', note: 'wide glide' },
    { symbol: 'ɔɪ', exampleWord: 'boy', exampleIpa: 'bɔɪ', note: 'rounded start' },
    { symbol: 'əʊ/oʊ', exampleWord: 'go', exampleIpa: 'ɡoʊ', note: 'BrE/AmE notation' },
    { symbol: 'aʊ', exampleWord: 'now', exampleIpa: 'naʊ', note: 'open glide' },
    { symbol: 'ɪə', exampleWord: 'near', exampleIpa: 'nɪə', note: 'centring (BrE)' } ] },
  { slug: 'ipa-consonants-pairs', title: 'Voiced/unvoiced consonant pairs', order: 4, symbols: [
    { symbol: 'p/b', exampleWord: 'pat/bat', exampleIpa: 'pæt/bæt', note: 'lips' },
    { symbol: 't/d', exampleWord: 'ten/den', exampleIpa: 'tɛn/dɛn', note: 'tongue ridge' },
    { symbol: 'k/ɡ', exampleWord: 'coat/goat', exampleIpa: 'koʊt/ɡoʊt', note: 'back of tongue' },
    { symbol: 'f/v', exampleWord: 'fine/vine', exampleIpa: 'faɪn/vaɪn', note: 'lip-teeth' },
    { symbol: 's/z', exampleWord: 'sip/zip', exampleIpa: 'sɪp/zɪp', note: 'hiss vs buzz' },
    { symbol: 'ʃ/ʒ', exampleWord: 'ship/measure', exampleIpa: 'ʃɪp/ˈmɛʒər', note: 'sh vs its voiced twin' },
    { symbol: 'θ/ð', exampleWord: 'think/this', exampleIpa: 'θɪŋk/ðɪs', note: 'tongue between teeth' },
    { symbol: 'tʃ/dʒ', exampleWord: 'church/judge', exampleIpa: 'tʃɜːrtʃ/dʒʌdʒ', note: 'affricates' } ] },
  { slug: 'ipa-nasals-liquids', title: 'Nasals, liquids, glides', order: 5, symbols: [
    { symbol: 'm', exampleWord: 'map', exampleIpa: 'mæp', note: 'lips closed' },
    { symbol: 'n', exampleWord: 'net', exampleIpa: 'nɛt', note: 'tongue ridge' },
    { symbol: 'ŋ', exampleWord: 'sing', exampleIpa: 'sɪŋ', note: 'never add a /ɡ/ after' },
    { symbol: 'l', exampleWord: 'light', exampleIpa: 'laɪt', note: 'tongue touches ridge' },
    { symbol: 'r', exampleWord: 'right', exampleIpa: 'raɪt', note: 'no contact, slight curl' },
    { symbol: 'w', exampleWord: 'we', exampleIpa: 'wiː', note: 'lips rounded' },
    { symbol: 'j', exampleWord: 'yes', exampleIpa: 'jɛs', note: '"y" sound' },
    { symbol: 'h', exampleWord: 'hat', exampleIpa: 'hæt', note: 'breath only' } ] },
  { slug: 'ipa-stress-schwa', title: 'Stress marks & the schwa', order: 6, symbols: [
    { symbol: 'ˈ', exampleWord: 'record (noun)', exampleIpa: 'ˈrɛkərd', note: 'primary stress before the syllable' },
    { symbol: 'ˌ', exampleWord: 'understand', exampleIpa: 'ˌʌndərˈstænd', note: 'secondary stress' },
    { symbol: 'ə', exampleWord: 'support', exampleIpa: 'səˈpɔːrt', note: 'unstressed syllables collapse to schwa' } ] },
  { slug: 'ipa-connected-speech', title: 'Connected speech phenomena', order: 7, symbols: [
    { symbol: 'linking', exampleWord: 'an apple', exampleIpa: 'əˈnæpəl', note: 'final consonant links to next vowel' },
    { symbol: 'elision', exampleWord: 'next day', exampleIpa: 'neks deɪ', note: '/t/ or /d/ drops between consonants' },
    { symbol: 'assimilation', exampleWord: 'good boy', exampleIpa: 'ɡʊb bɔɪ', note: 'd→b before b/p' },
    { symbol: 'weak forms', exampleWord: 'to / for', exampleIpa: 'tə / fər', note: 'function words reduce to schwa' },
    { symbol: 'intrusive r', exampleWord: 'law of', exampleIpa: 'lɔːr əv', note: 'r inserted between vowels (BrE)' },
    { symbol: 'flapping', exampleWord: 'water (AmE)', exampleIpa: 'ˈwɑːɾər', note: 't → soft d-flap' } ] },
];

// §16 shadowing sentence sets
export type ShadowingSet = { slug: string; level: string; sentences: string[] };

export const SHADOWING_SETS: ShadowingSet[] = [
  { slug: 'shadow-short', level: 'short sentences', sentences: [
    'Let me get back to you on that.', 'The numbers look solid this quarter.',
    'I completely understand your concern.', 'We shipped ahead of schedule.',
    'That depends on the timeline.', 'Could you walk me through it?',
    'I see exactly what you mean.', 'Let\'s take this offline.' ] },
  { slug: 'shadow-business', level: 'business sentences', sentences: [
    'We need to align on scope before we commit to a date.',
    'The proposal reflects everything we discussed on the call.',
    'I\'d like to flag a dependency that could affect the timeline.',
    'Let me walk you through the pricing model step by step.',
    'We appreciate the flexibility you\'ve shown on this.',
    'Based on the usage data, we recommend the higher tier.' ] },
  { slug: 'shadow-paragraph', level: 'paragraph', sentences: [
    'When we reviewed the incident, two things became clear. First, the alert fired later than it should have. Second, nobody owned the follow-up. This week I want to fix both.',
    'I\'ve been thinking about the pricing conversation we had. The gap isn\'t really about the number — it\'s about what the number includes. Let me show you what I mean.' ] },
  { slug: 'shadow-presentation', level: 'presentation lines', sentences: [
    'Good morning everyone — thanks for being here. Today I want to show you three things.',
    'Before I get into the details, let me give you the headline: we grew forty percent.',
    'Now, you might be wondering why this matters. Here\'s why.',
    'To wrap up: we hit the goal, we learned what worked, and we\'re doubling down.' ] },
];
