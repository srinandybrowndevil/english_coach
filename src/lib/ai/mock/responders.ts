import type { ChatMessage } from '../types';

export class MockResponderMissing extends Error {
  constructor(name: string) {
    super(`No mock responder registered for structured output "${name}". Add one in src/lib/ai/mock/responders.ts.`);
    this.name = 'MockResponderMissing';
  }
}

export type MockResponder = (messages: ChatMessage[]) => unknown;

const responders: Record<string, MockResponder> = {
  default: () => ({ notes: ['mock note: nothing to check'] }),
};

export function registerMockResponder(name: string, fn: MockResponder): void {
  responders[name] = fn;
}

export function getMockResponder(name: string): MockResponder {
  const fn = responders[name];
  if (!fn) throw new MockResponderMissing(name);
  return fn;
}
