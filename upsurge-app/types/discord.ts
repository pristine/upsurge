export interface Discord {
  userId: string;
  isValid: boolean;
  guilds: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  oauthUrl: string;
}

export interface Role {
  name: string;
  id: string;
  permissions: string;
}

export interface Overwrite {
  id: string;
  type: string;
  allow_new: string;
  deny_new: string;
  allow: number;
}

export interface RawChannel {
  id: string;
  name: string;
  type: number;
  permissions?: string;
  permission_overwrites: Overwrite[];
}

export interface Channel {
  id: string;
  name: string;
}

export interface Member {
  roles: string[];
  permissions?: number;
}
