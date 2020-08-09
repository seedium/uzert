export interface OnAppShutdown {
  onAppShutdown(err: Error | null, signal?: string): unknown;
}
