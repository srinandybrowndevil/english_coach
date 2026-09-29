import type { EmbeddingProvider, PronunciationAnalysisProvider } from '../types';

export class MockPronunciation implements PronunciationAnalysisProvider {
  async analyse() {
    return { notes: ['[mock] no phoneme evidence available'], confidence: 'low' as const, phonemeEvidence: false as const };
  }
}

export class MockEmbeddings implements EmbeddingProvider {
  async embed(texts: string[]) {
    // deterministic pseudo-embedding from char codes — fine for tests
    return texts.map((t) => {
      const v = new Array(8).fill(0);
      for (let i = 0; i < t.length; i++) v[i % 8] += t.charCodeAt(i) / 1000;
      return v;
    });
  }
}
