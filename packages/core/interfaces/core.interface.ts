export interface IProvider {
  boot(...args: any[]): void;
  dispose?(): void;
}
