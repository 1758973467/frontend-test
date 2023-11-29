import instance from './client';
export function getUserData(data) {
  return instance.get('/api/user/list', data);
}

export function saveUserData(data) {
  return instance.put('/api/user', data);
}

export function updateUserData(id, data) {
  return instance.post(`/api/user/${id}`, data);
}
