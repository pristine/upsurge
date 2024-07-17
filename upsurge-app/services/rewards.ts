import { type UpdateReward } from '@/types/rewards';
import { fetcher } from '@/util/swr';

export async function addReward(
  accessType: 'whop' | 'web',
  companyId: string,
  serviceType: string,
  serviceId: string,
  nickname: string,
  description: string,
  pointsRequired: number
) {
  return await fetcher(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/rewards/add`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        nickname,
        description,
        pointsRequired,
      }),
    }
  );
}

export async function updateRedeemedReward(
  accessType: 'whop' | 'web',
  companyId: string,
  serviceType: string,
  serviceId: string,
  id: string,
  data: any
) {
  return await fetcher(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/redeemed-rewards/${id}`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(data),
    }
  );
}

export async function updateReward(
  accessType: 'whop' | 'web',
  companyId: string,
  serviceType: string,
  serviceId: string,
  id: string,
  data: UpdateReward
) {
  return await fetcher(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/rewards/${id}`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(data),
    }
  );
}
