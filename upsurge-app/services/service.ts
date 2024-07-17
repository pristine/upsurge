import { fetcher } from '@/util/swr';

export async function addDiscordService(
  accessType: 'whop' | 'web',
  companyId: string,
  guildId: string
) {
  return await fetcher(`/${accessType}/api/company/${companyId}/services`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      id: guildId,
      type: 'discord',
    }),
  });
}

export async function setUserRoles(
  accessType: 'whop' | 'web',
  companyId: string,
  serviceType: string,
  serviceId: string,
  roles: string[]
) {
  return await fetcher(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/roles`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        roles,
      }),
    }
  );
}

export async function setChannel(
  accessType: 'whop' | 'web',
  companyId: string,
  serviceType: string,
  serviceId: string,
  type: 'logChannel' | 'mainChannel',
  channel: string
) {
  return await fetcher(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/channel`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        type,
        channel,
      }),
    }
  );
}
