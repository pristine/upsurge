import { fetcher } from '@/util/swr';

export async function deleteMainService(
  accessType: 'whop' | 'web',
  companyId: string
) {
  return await fetcher(`/${accessType}/api/company/${companyId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}
