/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? `http://localhost:3000/api/v1/users/updateMyPassword`
        : `http://localhost:3000/api/v1/users/updateMe`;

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    console.log(url);
    console.log(data);
    console.log(res.data.status);
    console.log(res);

    // console.log(res);
    if (res.data.status === 'success') {
      // we defined that status in our response
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    console.log(err.response.data.message);
    console.log(data);
    showAlert('error', err.response.data.message);
  }
};
