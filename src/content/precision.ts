// spec §35 — precision English: vague → precise mappings.
export type PrecisionMap = { slug: string; vague: string; precise: string[]; contexts: string[] };

const P = (slug: string, vague: string, precise: string[], contexts: string[]): PrecisionMap => ({ slug, vague, precise, contexts });

export const PRECISION_MAP: PrecisionMap[] = [
  P('good', 'good', ['effective', 'reliable', 'well-executed', 'strong', 'solid'], ['product', 'performance', 'work']),
  P('bad', 'bad', ['unreliable', 'incorrect', 'poorly timed', 'below standard', 'flawed'], ['work', 'decision', 'timing']),
  P('big', 'big', ['substantial', 'significant', 'large-scale', 'major'], ['problem', 'market', 'risk']),
  P('small', 'small', ['minor', 'marginal', 'negligible', 'modest'], ['change', 'risk', 'discount']),
  P('fast', 'fast', ['quick turnaround', 'low-latency', 'same-day', 'rapid'], ['delivery', 'response', 'load time']),
  P('slow', 'slow', ['delayed', 'sluggish', 'behind schedule', 'time-consuming'], ['progress', 'response', 'system']),
  P('a lot', 'a lot', ['significantly', 'substantially', 'considerably'], ['growth', 'cost', 'effort']),
  P('things', 'things', ['issues', 'tasks', 'factors', 'deliverables', 'items'], ['status update', 'planning']),
  P('stuff', 'stuff', ['materials', 'details', 'topics', 'work'], ['casual speech — flag in formal']),
  P('soon', 'soon', ['by Friday', 'within 48 hours', 'end of sprint', 'this week'], ['deadlines', 'commitments']),
  P('later', 'later', ['after the meeting', 'in the next sprint', 'by Thursday'], ['scheduling']),
  P('many', 'many', ['over forty', 'the majority of', 'a significant share'], ['metrics', 'reports']),
  P('few', 'few', ['fewer than five', 'a handful of', 'only two'], ['metrics', 'resources']),
  P('maybe', 'maybe', ['I\'d estimate 60% likely', 'possible, pending X', 'unlikely without Y'], ['commitments']),
  P('kind of', 'kind of', ['partially', 'in some respects', 'a simplified version of'], ['agreement', 'descriptions']),
  P('sort of', 'sort of', ['approximately', 'a loose form of', 'effectively'], ['descriptions']),
  P('very', 'very', ['delete it and use a stronger word: very tired → exhausted', 'very good → excellent', 'very big → substantial'], ['general intensifier']),
  P('really', 'really', ['genuinely', 'remarkably', 'measurably'], ['emphasis']),
  P('interesting', 'interesting', ['surprising', 'counter-intuitive', 'notable', 'promising'], ['feedback', 'analysis']),
  P('nice', 'nice', ['well-crafted', 'polished', 'clean', 'thoughtful'], ['design', 'work', 'writing']),
  P('hard', 'hard', ['complex', 'labour-intensive', 'technically challenging'], ['tasks', 'problems']),
  P('easy', 'easy', ['straightforward', 'low-effort', 'trivial', 'automatable'], ['tasks', 'processes']),
  P('help', 'help', ['assist with', 'unblock', 'accelerate', 'review'], ['asking for support']),
  P('problem', 'problem', ['issue', 'risk', 'blocker', 'constraint', 'defect'], ['incident reports', 'planning']),
  P('fix', 'fix', ['resolve', 'patch', 'correct', 'mitigate'], ['bugs', 'issues']),
  P('use', 'use', ['leverage', 'apply', 'employ', 'draw on'], ['tools', 'methods']),
  P('make', 'make', ['produce', 'generate', 'draft', 'build'], ['documents', 'outputs']),
  P('get', 'get', ['obtain', 'receive', 'secure', 'acquire'], ['information', 'resources']),
  P('start', 'start', ['initiate', 'kick off', 'commence', 'launch'], ['projects', 'processes']),
  P('end', 'end', ['conclude', 'wrap up', 'terminate', 'finalise'], ['projects', 'contracts']),
];
