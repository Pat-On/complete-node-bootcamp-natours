/* eslint-disable */
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateData } from './updateSettings';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

// DELEGATION
console.log('I am here?!');
console.log(mapBox);
if (mapBox) {
  // we are reading the data what we before put into the html dom
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

//we will have all the imports plus all what is going to take data from the view
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // VALUES
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    updateData(name, email);
  });
