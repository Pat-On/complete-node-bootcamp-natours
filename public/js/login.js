/* eslint-disable */
import axios from 'axios';

import { showAlert } from './alerts';
import '@babel/polyfill';

export const login = async (email, password) => {
  console.log(password);
  console.log(email);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    // if (res.data.status === 'success') location.reload(); // old
    // console.log(document.URL);
    if (res.data.status === 'success') window.location.href = '/'; // IS it good solution?
  } catch (err) {
    showAlert('error', 'Error logging out! Try again');
  }
};
