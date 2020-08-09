export interface OnBeforeAppShutdown {
  onBeforeAppShutdown(err: Error | null, signal?: string): unknown;
}
