export const containsTamil = (t: string) => /[\u0B80-\u0BFF]/.test(t);

// §33 rapid naming — distinct content words produced (crude noun proxy).
export function distinctNouns(transcript: string, stopwords = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with',
  'is', 'are', 'was', 'were', 'i', 'we', 'it', 'this', 'that', 'there',
])) {
  const words = transcript.toLowerCase().replace(/[^a-z']/g, ' ')
    .split(/\s+/).filter((w) => w.length > 1 && !stopwords.has(w));
  return new Set(words).size;
}
