import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';

import { jsonPlaceholderApiClient } from '@/lib/axios';

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
  address: {
    street: string;
    city: string;
  };
};

export const fetchUsers = createServerFn().handler(async () => {
  console.info('Fetching users...');

  // The axios interceptor will handle errors automatically
  const response = await jsonPlaceholderApiClient.get<User[]>('/users');
  return response.data;
});

export const usersQueryOptions = () =>
  queryOptions({
    queryFn: () => fetchUsers(),
    queryKey: ['users'],
  });

export const fetchUser = createServerFn()
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    console.info(`Fetching user with id ${data}...`);

    // The axios interceptor will handle 404s and other errors automatically
    const response = await jsonPlaceholderApiClient.get<User>(`/users/${data}`);
    return response.data;
  });

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryFn: () => fetchUser({ data: userId }),
    queryKey: ['user', userId],
  });
