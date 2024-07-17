export interface Service {
  id: string;
  type: 'discord';
  nickname: string;
  connected: boolean;
  setRoles: boolean;
  setMainChannel: boolean;
  setLogChannel: boolean;
}
