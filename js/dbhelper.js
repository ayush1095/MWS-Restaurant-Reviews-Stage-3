/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  
  // Opens the IndexedDB
   
  static newIDB() {
    const dbPromise = idb.open('restaurantsDB', 1, upgradeDb => {
      const store = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
      store.createIndex('by-id', 'id');
    });
    return dbPromise;
  }

  // Convert to JSON and check fetched status.
  
  static convertToJson(response) {
    if (response.status === 200) {
      Promise.resolve(response);
      return response.json()
    } else {
      return Promise.reject(new Error(`Request failed.${response.statusText}`))
    }
  }

  // data from IDB

  static dataFromIDB() {
    const IDBrestaurants = DBHelper.newIDB()
    .then( idb => {
      if(!idb) return;
      let data = idb.transaction('restaurants').objectStore('restaurants');
              console.log("data1", data.getAll());

      return data.getAll();
    });
    return IDBrestaurants;
  }

  // fetch data from API using fetch

  static dataFromAPI(){
    const dataAPI = fetch(DBHelper.DATABASE_URL)
    .then(DBHelper.convertToJson)
    .then(restaurants => {
      DBHelper.saveData(restaurants);
      return restaurants;
    });
    return dataAPI;
  }

  // save data to IDB

  static saveData(data){
    return DBHelper.newIDB().then(db => {
      if(!db) return;
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');
      // saving each element in database restaurant
      data.forEach((restaurant) => {
        store.put(restaurant);
      });
      return tx.complete;
    }).then(() => {
      console.log('Data Saved to IDB');
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    return DBHelper.dataFromIDB().then(restaurants => {
      if(restaurants.length) {
        return Promise.resolve(restaurants);
      } else {
        return DBHelper.dataFromAPI();
      }
    }).then(restaurants => {
      callback(null, restaurants);
    }).catch(error => {
      callback(error, null);
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 

  static opennewDatabase() {

    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
    const dbReview = idb.open('db_name', 1, upgradeDb => {
      const store = upgradeDb.createObjectStore('reviewsDB', {keyPath: 'id', autoIncrement: true});
      // store.createIndex('by-id', 'id');
    });
    return dbReview;
  }

  static reviewsIdb () {
     const dbPromise2 = idb.open('db_name', 1).then(function(dbb){
        if (!dbb) return;
        // var txx = dbb.transaction('reviewsDB', 'readonly');
        // var store1 = txx.objectStore('reviewsDB');
        let data = dbb.transaction('reviewsDB').objectStore('reviewsDB');
        console.log("data2",data.getAll());
        return data.getAll();
      }).catch((error) => {
          console.log("got error while offline",error);
      });

      return dbPromise2;
  }

  static saveRevWhenOffline (reviews) {
     const dbPromise3 = idb.open('db_name', 2).then(function(dbb){
        if (!dbb) return;
        let data = dbb.transaction('reviewsDB','readwrite').objectStore('reviewsDB');
        data.put(reviews);
        return data;
      }).catch((error) => {
          console.log("got error while offline",error);
      });

      return dbPromise3;
  }

  static fetchReviews(id,callback){
    if(navigator.onLine){
      let fetchUrl =  `http://localhost:1337/reviews/?restaurant_id=${id}`;
      console.log("fetch url : "+fetchUrl);

    fetch(fetchUrl)
    .then(response => response.json())
    .then(reviews =>{
      callback(null,reviews);
      console.log("afer", reviews);
      var dbPromise1 = DBHelper.opennewDatabase();
      dbPromise1.then(function(db) {
      if (!db) return;
      var tx = db.transaction('reviewsDB', 'readwrite');
      var store = tx.objectStore('reviewsDB');
      if(Array.isArray(reviews)){
        reviews.forEach(function(review) {
        store.put(review);
      });
    }else{
      store.put(reviews);
    }
     });
    }).catch((error) => {
        console.log(error);
     });
    }
    else{
      console.log("network offline tring to get from idb");
      return DBHelper.reviewsIdb().then(res=>{
        if(res){
          console.log("aaa",Promise.resolve(res));
          return Promise.resolve(res);
        }else{
          console.log("errrroor");
        }
      }).then(reviews => {
      callback(null, reviews);
    }).catch(error => {
      callback(error, null);
    })
      
    }
  }

  
  static submitReview(review){

    console.log('data to be saved online',review);
    const url = "http://localhost:1337/reviews/";
    fetch(url, {
      body: review,
      method: 'POST',
    }).then(reviews => {
      console.log('data saved ', reviews)
    }).catch(error => {
      console.log('Went into an error', error);
    })
   }

  static sendReviewWhenOnline(offlineRev){

    console.log("storing this in localstorage ",JSON.stringify(offlineRev));
    localStorage.setItem("data",JSON.stringify(offlineRev));
    window.addEventListener('online', function(){
        console.log("status is online now");
        let review = localStorage.getItem('data');
        if(review!== null){
        DBHelper.submitReview(review);
        localStorage.removeItem('data');
        console.log("removed local storage");
      }
    });

  }

}

