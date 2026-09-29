// spec §13 — ≥4 per category, difficulty 1–5.
export type Twister = { slug: string; text: string; category: string; difficulty: number; targetSounds: string[] };

const T = (slug: string, text: string, category: string, difficulty: number, targetSounds: string[]): Twister =>
  ({ slug, text, category, difficulty, targetSounds });

export const TONGUE_TWISTERS: Twister[] = [
  // R/L
  T('rl-1', 'Red lorry, yellow lorry, red lorry, yellow lorry.', 'rl', 2, ['r', 'l']),
  T('rl-2', 'Larry\'s really loyal lorry rolled over the hill.', 'rl', 3, ['r', 'l']),
  T('rl-3', 'Rural delivery relies on reliable lorries.', 'rl', 4, ['r', 'l']),
  T('rl-4', 'Lorelai rarely rallies late, Roland rarely rules lately.', 'rl', 4, ['r', 'l']),
  // V/W
  T('vw-1', 'Vivian wears a very warm vest.', 'vw', 1, ['v', 'w']),
  T('vw-2', 'We were worried the vendor would waive the warranty.', 'vw', 3, ['v', 'w']),
  T('vw-3', 'Whenever we visit Venice, we wear velvet.', 'vw', 3, ['v', 'w']),
  T('vw-4', 'The vet was very wary of the wily wolf.', 'vw', 3, ['v', 'w']),
  T('vw-5', 'Woven vests were waved at the vivacious widow.', 'vw', 4, ['v', 'w']),
  // TH
  T('th-1', 'They think this thing is theirs.', 'th', 2, ['θ', 'ð']),
  T('th-2', 'Thirty-three thousand feathers on a thrush\'s throat.', 'th', 4, ['θ']),
  T('th-3', 'The thirty-three thieves thought that they thrilled the throne.', 'th', 4, ['θ', 'ð']),
  T('th-4', 'Neither father nor mother bothered another brother.', 'th', 3, ['ð']),
  // S/SH
  T('ssh-1', 'She sells seashells by the seashore.', 'ssh', 3, ['s', 'ʃ']),
  T('ssh-2', 'Surely Sylvia swims in the shining sun.', 'ssh', 3, ['s', 'ʃ']),
  T('ssh-3', 'Six slippery snails slid slowly seaward.', 'ssh', 3, ['s']),
  T('ssh-4', 'A shy sheep should shift its sheltered station.', 'ssh', 4, ['ʃ', 's']),
  // F/P
  T('fp-1', 'Peter Piper picked a peck of pickled peppers.', 'fp', 2, ['p']),
  T('fp-2', 'Five fine frogs flip flapjacks for fun.', 'fp', 3, ['f']),
  T('fp-3', 'A proper copper coffee pot pours perfectly.', 'fp', 4, ['p']),
  T('fp-4', 'Fifty-five perfumed parrots perched on Peter\'s porch.', 'fp', 4, ['f', 'p']),
  // T/D
  T('td-1', 'Tiny toddling tiger talked to a tired dad.', 'td', 2, ['t', 'd']),
  T('td-2', 'Two tried-and-true tins trotted to town.', 'td', 3, ['t']),
  T('td-3', 'Dad\'s dark den didn\'t dim the dawn.', 'td', 3, ['d']),
  T('td-4', 'The dotted doublet doubled doubly down.', 'td', 4, ['d', 't']),
  // Consonant clusters
  T('cl-1', 'Six stick shifts stuck shut.', 'clusters', 3, ['st', 'ks', 'sts']),
  T('cl-2', 'String strength strangles stressed streamers.', 'clusters', 4, ['str', 'ŋθ']),
  T('cl-3', 'Twelve twins twirled twelve twigs.', 'clusters', 4, ['tw', 'twɛl']),
  T('cl-4', 'The sixth sick sheikh\'s sixth sheep\'s sick.', 'clusters', 5, ['sks', 'sɪkθs', 'ʃ']),
  T('cl-5', 'He thrusts his fists against the posts and still insists he sees the ghosts.', 'clusters', 5, ['sts', 'sts/ɡoʊsts']),
  // Breath control
  T('br-1', 'Betty bought butter but the butter was bitter, so Betty bought better butter to make the bitter butter better.', 'breath', 4, ['b', 't']),
  T('br-2', 'How much wood would a woodchuck chuck if a woodchuck could chuck wood? He would chuck as much wood as a woodchuck would if a woodchuck could chuck wood.', 'breath', 4, ['w', 'tʃ']),
  T('br-3', 'I thought a thought, but the thought I thought wasn\'t the thought I thought I thought.', 'breath', 4, ['θ', 't']),
  T('br-4', 'If two witches watched two watches, which witch would watch which watch?', 'breath', 3, ['w', 'tʃ']),
  // Articulation
  T('ar-1', 'A proper cup of coffee from a proper copper coffee pot.', 'articulation', 4, ['p', 'k', 'f']),
  T('ar-2', 'Sheep should sleep in a shed.', 'articulation', 2, ['ʃ', 's']),
  T('ar-3', 'Round and round the rugged rock the ragged rascal ran.', 'articulation', 4, ['r']),
  T('ar-4', 'Unique New York, unique New York, you know you need unique New York.', 'articulation', 3, ['j', 'n']),
  // Speed
  T('sp-1', 'Toy boat, toy boat, toy boat.', 'speed', 2, ['t', 'b', 'ɔɪ']),
  T('sp-2', 'Red leather, yellow leather, red leather, yellow leather.', 'speed', 3, ['r', 'l']),
  T('sp-3', 'Fresh fried fish, fish fried fresh.', 'speed', 3, ['f', 'r']),
  T('sp-4', 'Eleven benevolent elephants.', 'speed', 3, ['ɛ', 'l', 'v']),
  // Mixed advanced
  T('mx-1', 'Can you can a can as a canner can can a can?', 'mixed', 4, ['kæn']),
  T('mx-2', 'I slit the sheet, the sheet I slit, and on the slitted sheet I sit.', 'mixed', 4, ['s', 'ʃ', 'sl']),
  T('mx-3', 'Something in a thirty-acre thermal thicket of thorns and thistles thumped and thundered.', 'mixed', 5, ['θ', 's']),
  T('mx-4', 'I wish to wish the wish you wish to wish, but if you wish the wish the witch wishes, I won\'t wish the wish you wish to wish.', 'mixed', 5, ['w', 'ʃ']),
  T('mx-5', 'Amidst the mists and coldest frosts, with stoutest wrists and loudest boasts, he thrusts his fists against the posts.', 'mixed', 5, ['sts', 'st']),
  T('mx-6', 'The great Greek grape growers grow great Greek grapes.', 'mixed', 3, ['ɡr', 'r']),
  T('mx-7', 'Whether the weather be cold or whether the weather be hot, we\'ll weather the weather whatever the weather.', 'mixed', 5, ['w', 'ð']),
  T('mx-8', 'Fred fed Ted bread and Ted fed Fred bread.', 'mixed', 3, ['f', 'r', 'd', 't']),
];
