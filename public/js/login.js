/* eslint-disable */

const login = (email, password) => {
  alert(email, password);
};
console.log(document.querySelector('.form'));
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('are you getting here?');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
