export class FetchError<T = any> extends Error {
  response?: T;
  status?: number;

  constructor(message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

export const fetcher = async <T = any>(
  resource: RequestInfo | URL,
  init?: RequestInit
): Promise<T> => {
  const res = await fetch(resource, {
    ...init,
    credentials: 'include',
  });

  // if (!res.ok) {
  // }

  return await res.json();
};

export const fetcherPost = async <T = any>(
  resource: RequestInfo | URL,
  payload: any,
  init?: RequestInit
): Promise<T> => {
  const res = await fetch(resource, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    ...init,
    credentials: 'include',
  });

  // if (!res.ok) {
  // }

  return await res.json();
};
