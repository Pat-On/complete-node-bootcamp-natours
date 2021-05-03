/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicGF0b24iLCJhIjoiY2tvOGNwMnZqMmwzcDJ3bXY3ZGVtZmJvdiJ9.57EU7u1-iAhK6QXzdvy-xg';
  var map = new mapboxgl.Map({
    container: 'map', //by ID
    style: 'mapbox://styles/paton/cko8daiu54zz417nw85896awv',
    //   center: [-118.113491, 34.111745], //without the zoom level it is going to give us the error
    //   zoom: 6,
    //   interactive: false, // it work then like "picture"
    scrollZoom: false,
  });

  // we have access to it because we included the code in tour.pug in header - html at the end
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // create  marker
    const el = document.createElement('div');
    el.className = 'marker';

    // add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    //add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    // manual padding pecification
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });
};
