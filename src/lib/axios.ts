import { notFound } from '@tanstack/react-router';
import axios, { type AxiosError } from 'axios';

export const jsonPlaceholderApiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});

// Global response interceptor to handle common error cases
jsonPlaceholderApiClient.interceptors.response.use(
  // Success response - just return the response
  (response) => response,

  // Error response - handle common error cases
  (error: AxiosError) => {
    if (error.response?.status === 404) {
      // Throw notFound for 404 errors - this will be caught by TanStack Router
      throw notFound();
    }

    // Log other HTTP errors for debugging
    if (error.response) {
      console.error('HTTP Error:', {
        data: error.response.data,
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
      });

      // Throw a more descriptive error
      throw new Error(
        `HTTP ${error.response.status}: ${error.response.statusText ?? 'Unknown error'}`,
      );
    }

    // Handle network or other errors
    console.error('Network/Request Error:', error.message);
    throw new Error(`Network error: ${error.message}`);
  },
);
