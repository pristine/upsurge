export interface Event {
  name: any;
  once: boolean;
  execute: (...args: any[]) => Promise<void>;
}
