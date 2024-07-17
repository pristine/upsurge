export interface AutomationsBody {
  type: AutomationsType;
  enabled?: boolean;
  lowerBounds?: number;
  upperBounds?: number;
  amountLowerBounds?: number;
  amountUpperBounds?: number;
  reset?: boolean;
  spamDelay?: number;
}

export type AutomationsType = 'messageCount' | 'messageDrop' | 'timedDrop';

export function isAutomation(value: string = ''): value is AutomationsType {
  switch (value) {
    case 'messageCount':
    case 'messageDrop':
    case 'timedDrop':
      return true;
    default:
      return false;
  }
}

export interface MessageCountAutomation {
  id: string;
  enabled: boolean;
  lowerBounds: number;
  upperBounds: number;
}

export interface MessageDropAutomation {
  id: string;
  enabled: boolean;
  lowerBounds: number;
  upperBounds: number;
  amountLowerBounds: number;
  amountUpperBounds: number;
  goal: number;
  currentCount: number;
}
