/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/updateMe`,
      data: {
        name: name,
        email: email,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      // we defined that status in our response
      showAlert('success', 'Data updated successfully!');
    }
  } catch (err) {
    console.log(res);
    console.log(data);
    showAlert('error', err.response.data.message);
  }
};
