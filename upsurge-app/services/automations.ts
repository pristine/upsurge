import { type AutomationsBody } from '@/types/automations';
import { fetcher } from '@/util/swr';

export async function updateAutomation(
  accessType: 'whop' | 'web',
  companyId: string,
  serviceType: string,
  serviceId: string,
  data: AutomationsBody
) {
  return await fetcher(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/automations`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(data),
    }
  );
}
