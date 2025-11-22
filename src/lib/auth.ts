import axios from '../lib/axios';

// Fetch the current authenticated user
export async function fetchCurrentUser() {
  const response = await axios.get('/api/user');
  return response.data;
}
