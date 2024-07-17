import { fetcher } from '@/util/swr';

export async function updatePoints(
  accessType: 'whop' | 'web',
  companyId: string,
  serviceType: string,
  serviceId: string,
  userId: string,
  points: number,
  mode: 'add' | 'subtract'
) {
  return await fetcher(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/points/update`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        userId,
        points,
        mode,
      }),
    }
  );
}
