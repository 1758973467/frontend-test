import axios from 'axios';
import { useRouter } from 'vue-router';
const router = useRouter();
const instance = axios.create({
  baseURL: 'https://api.gateway.center/',
  timeout: 5000,
});

const REFRESHTOKENURL = '/api/token/refresh';
const Token = 'Token';
const RefreshToken = 'refresh_token';
instance.interceptors.request.use(
  config => {
    if (localStorage.getItem(Token)) {
      config.headers['Authorization'] = `Bearer ${localStorage.getItem(Token)}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let pendingTask: { config: any; resolve: Function }[] = [];
const gotoLogin = () => {
  localStorage.removeItem(Token);
  localStorage.removeItem(RefreshToken);

  router.push({
    name: '/login',
  });
};
instance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const { data, config } = error.response;
    if (isRefreshing) {
      return new Promise(resolve => {
        pendingTask.push({
          config,
          resolve,
        });
      });
    }
    if (data.statusCode === 401 && !config.url.includes(REFRESHTOKENURL)) {
      isRefreshing = true;
      try {
        const res = await refreshToken();
        isRefreshing = false;

        if (res.status === 200) {
          pendingTask.forEach(({ config, resolve }) => {
            resolve(instance(config));
          });
          pendingTask = [];
          return instance(config);
        } else {
          gotoLogin();
        }
      } catch (err) {
        gotoLogin();
      }
    } else {
      return error.response;
    }
  },
);

async function refreshToken() {
  const res = await axios.get(REFRESHTOKENURL, {
    params: {
      token: localStorage.getItem(RefreshToken),
    },
  });
  localStorage.setItem(Token, res.data.accessToken);
  localStorage.setItem(RefreshToken, res.data.refresh_token);
  return res;
}

export default instance;
