class DBHelper {
  
  static get DATABASE_NAME() { return 'my-database'; }
  static get OBJ_ST_RESTAURANTS() {  return 'restaurants'; }
  static get OBJ_ST_REVIEWS() { return 'reviews'; }
  static get URL_STATIC_SERVER() { return 'http://localhost:8000'; }
  static get URL_SERVER() { return 'http://localhost:1337'; }
  static get TYPE_THUMBNAIL() {return 0;} 
  static get TYPE_WEBP() {return 1;} 
  static get TYPE_IMG_500() {return 2;} 
  static get TYPE_IMG_NORMAL() {return 3;} 
  
  static addToDB(data, objStore) {
    if (!('indexedDB' in window)) {return null;}
    DBHelper.getObjStore(objStore, 'readwrite')
    .then((store) => { 
      Promise.all(data.map(aData => { 
        store.put(aData);
      }
    )
  );
}
)
.catch(e => console.log(e))
}

static getDB() {
  if (!('indexedDB' in window)) { return null;}
  return idb.open(DBHelper.DATABASE_NAME, 1, function (upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains(DBHelper.OBJ_ST_RESTAURANTS)) {
      const eventsOS = upgradeDb.createObjectStore(DBHelper.OBJ_ST_RESTAURANTS, { keyPath: 'id'});
      const store = upgradeDb.transaction.objectStore(DBHelper.OBJ_ST_RESTAURANTS);
      store.createIndex('by-cuisine', 'cuisine_type');
      store.createIndex('by-neighborhood', 'neighborhood');
      store.createIndex('by-cuisine-and-neighborhood', ['cuisine_type', 'neighborhood']);
    }
    if (!upgradeDb.objectStoreNames.contains(DBHelper.OBJ_ST_REVIEWS)) {
      const eventsOS = upgradeDb.createObjectStore(DBHelper.OBJ_ST_REVIEWS, {keyPath: 'id'});
      const store = upgradeDb.transaction.objectStore(DBHelper.OBJ_ST_REVIEWS);
      store.createIndex('by-restaurant', 'restaurant_id');
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
  
  // get from DB
  DBHelper.getObjStore(DBHelper.OBJ_ST_RESTAURANTS, 'readonly')
  .then(store => store.get(parseInt(id)))
  .then (restaurant => {
    if(restaurant) callback(null, restaurant);
  });
  
  //  fetch from network
  const url = `${DBHelper.URL_SERVER}/restaurants/${id}`;
  fetch(url).then(function (response) {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
      response.status);
      return;
    }
    response.json().then(restaurant =>  callback(null, restaurant))    
    // DBHelper.addToDB(jsonResult, DBHelper.OBJ_ST_RESTAURANTS);
  })
  .catch(error => callback(error, null));
}


static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
  var extraUrl = "?", searchCase = 0, callbackDone = false;
  
  if(neighborhood && neighborhood != 'all') {
    extraUrl += ("neighborhood=" + neighborhood);
    searchCase += 1;
  }
  if(cuisine && cuisine != 'all') {
    extraUrl += ("&&cuisine_type=" + cuisine);
    searchCase += 2;
  } 
  
  // get from DB
  DBHelper.getObjStore(DBHelper.OBJ_ST_RESTAURANTS, 'readonly')
  .then(store => {
    switch(searchCase){
      case 0: return store.getAll();
      case 1: return store.index('by-neighborhood').getAll(neighborhood);
      case 2: return store.index('by-cuisine').getAll(cuisine);
      case 3: return store.index('by-cuisine-and-neighborhood').getAll([cuisine, neighborhood]);
    } 
  })
  .then (restaurants => {
    if (restaurants && !callbackDone) {
      callbackDone = true;
      callback(null, restaurants);
    }
  })
  
  //  try the network 
  const url = `${DBHelper.URL_SERVER}/restaurants/${extraUrl}`;
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

static fetchRestaurantData(extraUrl, callback) { 
  
  // get from DB
  DBHelper.getObjStore(DBHelper.OBJ_ST_RESTAURANTS, 'readonly')
  .then(store => store.getAll())
  .then(restaurants => callback(null, restaurants));
  
  //  fetch from network
  const url = DBHelper.URL_SERVER + "/restaurants/" + extraUrl;
  fetch(url).then(function (response) {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
      response.status);
      return;
    }
    response.json().then(restaurants => {
      callback(null, restaurants);
      DBHelper.addToDB(restaurants, DBHelper.OBJ_ST_RESTAURANTS);
    })
  })
  .catch(error => callback(error, null));
}

static fetchReviewsData(restaurantID, callback) {
  
  // get from DB
  DBHelper.getObjStore(DBHelper.OBJ_ST_REVIEWS, 'readonly')
  .then(store => store.index('by-restaurant').getAll(restaurantID))
  .then(reviews => {
    if(reviews) {
      callback(null, reviews);
    }
  })
  
  //  fetch from network
  const url = this.URL_SERVER + "/reviews/?restaurant_id=" + restaurantID;
  fetch(url).then(function (response) {
    if (response.status !== 200) {
      console.log('Looks like there was a problem. Status Code: ' +
      response.status);
      return;
    }
    response.json().then(reviews => {
      if(reviews){
        callback(null, reviews);
        DBHelper.addToDB(reviews, DBHelper.OBJ_ST_REVIEWS);
       
      }
    })
  })
  .catch(error => callback(error, null));
}

static deleteReview(id){
  fetch(DBHelper.URL_SERVER + '/reviews/' + id, {method: 'DELETE'});
  DBHelper.getObjStore(DBHelper.OBJ_ST_REVIEWS, 'readwrite')
  .then(store => store.delete(id))
}


// Get a parameter by name from page URL
static getParameterByName(name, url) {
  if (!url)
  url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
  results = regex.exec(url);
  if (!results)
  return null;
  if (!results[2])
  return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// we can request a max 1280px map for the free Gmaps account (using scale=2) 
static getUrlMapStatic(refW, urlStaticMap) {
  var scale = 1;
  var reqPictureWidth = refW;
  
  if (refW > 640) {
    reqPictureWidth = parseInt(refW/2);
    scale = 2;
  }
  
  const urlImgMap = urlStaticMap + "&size=" + reqPictureWidth + "x120&scale=" + scale;
  // console.log("url static map: " + urlImgMap);
  return urlImgMap;
}


static getImageUrlForRestaurant(id, type) {
  switch(type){
    case DBHelper.TYPE_THUMBNAIL: return `/img/${id}_tn.jpg`;
    case DBHelper.TYPE_IMG_500: return `/img/${id}-500.jpg`;
    case DBHelper.TYPE_WEBP: return `/img/${id}.webp`;
    default: return `/img/${id}.jpg`;
  }
}

static getMapMarkerForRestaurant(restaurant, map) {
  const marker = new google.maps.Marker({
    position: restaurant.latlng,
    title: restaurant.name,
    url: `./restaurant.html?id=${restaurant.id}`,
    map: map,
    animation: google.maps.Animation.DROP,
    icon: DBHelper.getPinSymbol(restaurant.color),
  }, );
  return marker;
}

static getPinSymbol(color) {
  return {
    path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z', // pin
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#000',
    strokeWeight: 2,
    scale: 1,
  };
}


}