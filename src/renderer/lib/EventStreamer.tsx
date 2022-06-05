import { EventEmitter } from 'events';

enum EVENTS_ENUM {
  // TASK AND FLOW EVENTS
  'SETTINGS_CHANGED',
  'SETTINGS_REMOVED',
  'NAVIGATE_TO',
  'DEEPLINK:SSO_CALLBACK',
}
export type EventStreamerTypes = keyof typeof EVENTS_ENUM;

class EventStreamer {
  private static emitter = new EventEmitter();

  on(event: EventStreamerTypes | symbol, listener: (...args: any[]) => void) {
    EventStreamer.emitter.on(event, listener);
  }

  off(event: EventStreamerTypes | symbol, listener: (...args: any[]) => void) {
    EventStreamer.emitter.off(event, listener);
  }

  emit(event: EventStreamerTypes | symbol, ...args: any[]): boolean {
    return EventStreamer.emitter.emit(event, ...args);
  }
}

export default new EventStreamer();
