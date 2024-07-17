import { type User } from '@/types/users';
import { fetcher } from '@/util/swr';

export async function userSearch(
  accessType: 'whop' | 'web',
  companyId: string,
  serviceType: string,
  serviceId: string,
  searchTerm: string
): Promise<{
  success: boolean;
  data: User[];
}> {
  return await fetcher(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/users/quick-search`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        term: searchTerm,
      }),
    }
  );
}
