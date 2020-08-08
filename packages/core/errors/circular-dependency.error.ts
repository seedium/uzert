export class CircularDependencyError extends Error {
  constructor(context?: string) {
    const ctx = context ? ` inside ${context}` : ``;
    super(
      `A circular dependency has been detected${ctx}. Please, avoid a bidirectional relationships`,
    );
  }
}
