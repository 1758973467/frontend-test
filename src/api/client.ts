import axios from 'axios';
const instance = axios.create({
  baseURL: 'http://127.0.0.1:9000/',
  timeout: 5000,
});

export default instance;
