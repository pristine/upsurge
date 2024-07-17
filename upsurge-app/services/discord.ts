import { fetcher } from '@/util/swr';

export async function deleteDiscord(accessType: 'whop' | 'web') {
  return await fetcher(`${accessType}/api/discord`, {
    method: 'DELETE',
    credentials: 'include',
  });
}
