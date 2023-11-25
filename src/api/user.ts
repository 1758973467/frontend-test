import instance from './client';
import { generateMockData } from '../mock/mock';
export function getUserData(data) {
  return instance.get('/api/user/list', data).catch(err => {
    return generateMockData();
  });
}

export function saveOrUpdateUserData(data) {
  return instance.post('/api/user', data);
}
