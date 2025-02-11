import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import axios from 'redaxios';

import { type User } from '~/utils/users';

export const APIRoute = createAPIFileRoute('/api/users/$id')({
  GET: async ({ request, params }) => {
    console.info(`Fetching users by id=${params.id}... @`, request.url);
    try {
      const res = await axios.get<User>(
        'https://jsonplaceholder.typicode.com/users/' + params.id,
      );

      return json({
        email: res.data.email,
        id: res.data.id,
        name: res.data.name,
      });
    } catch (error) {
      console.error(error);
      return json({ error: 'User not found' }, { status: 404 });
    }
  },
});
