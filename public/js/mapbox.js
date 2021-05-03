/* eslint-disable */

// we are reading the data what we before put into the html dom
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoicGF0b24iLCJhIjoiY2tvOGNwMnZqMmwzcDJ3bXY3ZGVtZmJvdiJ9.57EU7u1-iAhK6QXzdvy-xg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});
