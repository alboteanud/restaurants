class DBHelper {
  
  static get DATABASE_NAME() {
    return 'my-database';
  }
  
  static get DATABASE_OBJECT_STORE_RESTAURANTS() {
    return 'restaurants';
  }
  
  static get DATABASE_OBJECT_STORE_REVIEWS() {
    return 'reviews';
  }
  
  static get URL_CREATE_REVIEWS() {
    return 'http://localhost:1337/reviews/';
  }
  
  static loadRestaurantsNetworkFirst(callback) {
    var callBackDone = false;
    
    DBHelper.getServerData()
    .then(restaurantDataFromNetwork => {
      if(!callBackDone){
        callBackDone = true;
        callback(null, restaurantDataFromNetwork);
      }
      console.log('network data arrived and will be added to IDB');
      DBHelper.addToDB(restaurantDataFromNetwork, DBHelper.DATABASE_OBJECT_STORE_RESTAURANTS)
      .then(() => {
      }).catch(err => {
        console.warn(err);
      });
    }).catch(err => {
      console.log('Network requests have failed, this is expected if offline');
      DBHelper.getObjStore(DBHelper.DATABASE_OBJECT_STORE_RESTAURANTS, 'readonly')
      .then(store => store.getAll())
      .then(offlineData => {
        if (!offlineData.length) {
          console.log('no data to show');
        } else {
          console.log('showing offline data');
          if(!callBackDone){
            callBackDone = true;
            callback(null, offlineData);  
          }   
        }
      });
    });
  }
  
  static getServerData() {
    return fetch('http://localhost:1337/restaurants').then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  });
}

static getLocalEventData() {
  if (!('indexedDB' in window)) {return null;}
  return DBHelper.getDB().then(db => {
    const store = DBHelper.getObjStore(DBHelper.DATABASE_OBJECT_STORE_RESTAURANTS, 'readonly')
    return store.getAll();
  });
}

static addToDB(data, objStore) {
  if (!('indexedDB' in window)) {return null;}
  console.log('data to be added to the store: ' + data.length);
  DBHelper.getObjStore(objStore, 'readwrite')
  .then(store => Promise.all(data.map(aData => store.put(aData)))
  )
  .catch(e => console.log(e))
}

static getDB() {
  if (!('indexedDB' in window)) { return null;}
  return idb.open(DBHelper.DATABASE_NAME, 1, function (upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains(DBHelper.DATABASE_OBJECT_STORE_RESTAURANTS)) {
      const eventsOS = upgradeDb.createObjectStore(DBHelper.DATABASE_OBJECT_STORE_RESTAURANTS, { keyPath: 'id'});
      const store = upgradeDb.transaction.objectStore(DBHelper.DATABASE_OBJECT_STORE_RESTAURANTS);
      store.createIndex('by-cuisine', 'cuisine_type');
      store.createIndex('by-neighborhood', 'neighborhood');
    }
    if (!upgradeDb.objectStoreNames.contains(DBHelper.DATABASE_OBJECT_STORE_REVIEWS)) {
      const eventsOS = upgradeDb.createObjectStore(DBHelper.DATABASE_OBJECT_STORE_REVIEWS, {keyPath: 'id'});
    }
  });
}

static getObjStore(objName, mode) {
  return DBHelper.getDB().then(db => {
    var tx = db.transaction(objName, mode);
    var store = tx.objectStore(objName);
    return store;
  });
}


static fetchRestaurantById(id, callback) {
  // fetch all restaurants with proper error handling.
  DBHelper.loadRestaurantsNetworkFirst((error, restaurants) => {
    if (error) {
      callback(error, null);
    } else {
      const restaurant = restaurants.find(r => r.id == id);
      if (restaurant) { // Got the restaurant
        callback(null, restaurant);
      } else {
        callback('Restaurant does not exist in DB', null);
      }
    }
  });
}

static fetchRestaurantByCuisine(cuisine, callback) {
  // Fetch all restaurants  with proper error handling
  DBHelper.loadRestaurantsNetworkFirst((error, restaurants) => {
    if (error) {
      callback(error, null);
    } else {
      // Filter restaurants to have only given cuisine type
      const results = restaurants.filter(r => r.cuisine_type == cuisine);
      callback(null, results);
    }
  });
}

static fetchRestaurantByNeighborhood(neighborhood, callback) {
  // Fetch all restaurants
  DBHelper.loadRestaurantsNetworkFirst((error, restaurants) => {
    if (error) {
      callback(error, null);
    } else {
      // Filter restaurants to have only given neighborhood
      const results = restaurants.filter(r => r.neighborhood == neighborhood);
      callback(null, results);
    }
  });
}

static fetchRestaurantByCuisineAndNeighborhood_old(cuisine, neighborhood, callback) {
  
  // Fetch all restaurants
  DBHelper.loadRestaurantsNetworkFirst((error, restaurants) => {
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

static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
  
  // Fetch all restaurants
  DBHelper.loadRestaurantsNetworkFirst((error, restaurants) => {
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


static fetchNeighborhoods(callback) {
  // Fetch all restaurants
  DBHelper.loadRestaurantsNetworkFirst((error, restaurants) => {
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

static fetchCuisines(callback) {
  // Fetch all restaurants
  DBHelper.loadRestaurantsNetworkFirst((error, restaurants) => {
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

static imageUrlForRestaurant(restaurant, type) {
  if (type === "500") {
    return (`/img/${restaurant.photograph}-500.jpg`);
  }
  if (type === "webp") {
    return (`/img/${restaurant.photograph}.webp`);
  }
  return (`/img/${restaurant.photograph}.jpg`);
}

static mapMarkerForRestaurant(restaurant, map) {
  const marker = new google.maps.Marker({
    position: restaurant.latlng,
    title: restaurant.name,
    url: DBHelper.urlForRestaurant(restaurant),
    map: map,
    animation: google.maps.Animation.DROP
  }, );
  return marker;
}

static fetchReviewsByRestaurantId(id, callback) {
  var networkDataReceived = false;
  
  // try the DB
  DBHelper.getObjStore(DBHelper.DATABASE_OBJECT_STORE_REVIEWS, 'readonly')
  .then(store => store.getAll())
  .then(reviews => {
    if (reviews && !networkDataReceived) {
      console.log('callback from IDB');
      callback(null, reviews)
    }
  });
  
  //  fetch from network
  fetch(`http://localhost:1337/reviews/?restaurant_id=` + id)
  .then(function (response) {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
      response.status);
      return;
    }
    response.json().then(jsonReview => {
      networkDataReceived = true;
      callback(null, jsonReview);
      DBHelper.addToDB(jsonReview, DBHelper.DATABASE_OBJECT_STORE_REVIEWS);
    })
  })
  .catch(error => callback(error, null));
  
}






}