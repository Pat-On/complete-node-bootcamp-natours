/* eslint-disable */

import { login } from './login';

//we will have all the imports plus all what is going to take data from the view
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
