class DBHelper {
  
  static get DATABASE_NAME() {
    return 'my-database';
  }
  
  static get OBJ_ST_RESTAURANTS() {
    return 'restaurants';
  }
  
  static get INDEX_CUISINE() {
    return 'cuisine_type';
  }
  
  static get INDEX_NEIGHBORHOOD() {
    return 'neighborhood';
  }
  
  static get OBJ_ST_REVIEWS() {
    return 'reviews';
  }
  
  static get URL_SERVER() {
    return 'http://localhost:1337';
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
    if (!upgradeDb.objectStoreNames.contains(DBHelper.OBJ_ST_RESTAURANTS)) {
      const eventsOS = upgradeDb.createObjectStore(DBHelper.OBJ_ST_RESTAURANTS, { keyPath: 'id'});
      const store = upgradeDb.transaction.objectStore(DBHelper.OBJ_ST_RESTAURANTS);
      store.createIndex('by-cuisine', DBHelper.INDEX_CUISINE);
      store.createIndex('by-neighborhood', DBHelper.INDEX_NEIGHBORHOOD);
    }
    if (!upgradeDb.objectStoreNames.contains(DBHelper.OBJ_ST_REVIEWS)) {
      const eventsOS = upgradeDb.createObjectStore(DBHelper.OBJ_ST_REVIEWS, {keyPath: 'id'});
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

// http://localhost:1337/restaurants/<restaurant_id>
// TODO fetch by restaurantID rather than all restaurants.
static fetchRestaurantById(id, callback) {
  DBHelper.fetchRestaurantData("", (error, restaurants) => {
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
  DBHelper.fetchRestaurantData("?cuisine_type=" + cuisine, (error, restaurants) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

static fetchRestaurantByNeighborhood(neighborhood, callback) {
  DBHelper.fetchRestaurantData("?neighborhood=" + neighborhood, (error, restaurants) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

// http://localhost:1337/restaurants/?neighborhood=Brooklyn&&cuisine_type=Pizza
static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
  var extra = "?";
  if(neighborhood != 'all') {
    extra += ("neighborhood=" + neighborhood);
  }
  if(cuisine != 'all') {
    extra += ("&&cuisine_type=" + cuisine);
  }
  
  DBHelper.fetchRestaurantData(extra, (error, restaurants) => {
    if (error) {
      callback(error, null); 
    } else {
      callback(null, restaurants);
    }
  });
}

static fetchNeighborhoods(callback) {
  DBHelper.fetchRestaurantData("", (error, restaurants) => {
    if (error) {
      callback(error, null);
    } else {
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
      callback(null, uniqueNeighborhoods);
    }
  });
}

static fetchCuisines(callback) {
  DBHelper.fetchRestaurantData("", (error, restaurants) => {
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

static buildUrlForRestaurant(restaurant) {
  return (`./restaurant.html?id=${restaurant.id}`);
}

static getImageUrlForRestaurant(restaurant, type) {
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
    url: DBHelper.buildUrlForRestaurant(restaurant),
    map: map,
    animation: google.maps.Animation.DROP
  }, );
  return marker;
}

static fetchRestaurantData(extraUrl, callback) {
  var callbackDone = false;
  
  // get from DB
  DBHelper.getObjStore(DBHelper.OBJ_ST_RESTAURANTS, 'readonly')
  .then(store => store.getAll())
  .then(data => {
    if (data && !callbackDone) {
      console.log('callback from IDB');
      callbackDone = true;
      callback(null, data);
    }
  });
  
  //  fetch from network
  const url = DBHelper.URL_SERVER + "/restaurants/" + extraUrl;
  fetch(url).then(function (response) {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
      response.status);
      return;
    }
    response.json().then(jsonResult => {
      if(!callbackDone){
        callbackDone = true;
        callback(null, jsonResult);
      }
      
      DBHelper.addToDB(jsonResult, DBHelper.OBJ_ST_RESTAURANTS);
    })
  })
  .catch(error => callback(error, null));
}


static fetchReviewsData(restaurantID, callback) {
  var callbackDone = false;
  
  // get from DB
  DBHelper.getObjStore(DBHelper.OBJ_ST_REVIEWS, 'readonly')
  .then(store => store.getAll())
  .then(data => {
    if (data && !callbackDone) {
      console.log('callback from IDB');
      callbackDone = true;
      callback(null, data)
    }
  });
  
  //  fetch from network
  const url = this.URL_SERVER + "/reviews/?restaurant_id=" + restaurantID;
  fetch(url).then(function (response) {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
      response.status);
      return;
    }
    response.json().then(jsonResult => {
      if(!callbackDone){
        callbackDone = true;
        callback(null, jsonResult);
      }
      
      DBHelper.addToDB(jsonResult, DBHelper.OBJ_ST_REVIEWS);
    })
  })
  .catch(error => callback(error, null));
}






}