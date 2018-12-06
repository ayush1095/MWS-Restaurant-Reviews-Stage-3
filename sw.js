
const Cache = 'restaurant-review';

let filesToCache = [
    '/',
    'index.html',
    'js/main.js',
    'js/idb.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    'data/restaurants.json',
    'sw.js',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/10.jpg',
    'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1206/1540.jpg70?access_token=pk.eyJ1IjoiYXl1c2gxMDk1IiwiYSI6ImNqbXFxZGszazFzdmIzcG83OGR6dGdqM3MifQ.LAJ_8RrgJJQetmg6zz69lg'


  ];
  

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(Cache).then( cache => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // for mapbox
    if (event.request.url.indexOf('https://api.tiles.mapbox.com') == 0) {
        fetch(event.request);
    }
    if (event.request.url.indexOf('http://localhost:1337/reviews/') == 0) {
        fetch(event.request);
    }if (event.request.url.indexOf('http://localhost:1337/restaurants/2/?is_favorite=false') == 0) {
        fetch(event.request);
    }if (event.request.url.indexOf('http://localhost:1337/restaurants/2/?is_favorite=true') == 0) {
        fetch(event.request);
    }


    //cloning response
    event.respondWith(
      caches.open(Cache).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  });