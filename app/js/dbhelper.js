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
    console.log('data to be added to the store: ' + data.length);
    DBHelper.getObjStore(objStore, 'readwrite')
    .then((store) => { 
      Promise.all(data.map(aData => { 
        store.put(aData);
      }
    )
  );
  // debugger;
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

static fetchRestaurantById(id, callback) {
  
  // DBHelper.fetchRestaurantData("", (error, restaurants) => {
  //   if (error) {
  //     callback(error, null);
  //   } else {
  
  //     const restaurant = restaurants.find(r => r.id == id);
  //     if (restaurant) { // Got the restaurant
  //       callback(null, restaurant);
  //     } else {
  //       callback('Restaurant does not exist in DB', null);
  //     }
  //   }
  // });
  
  var callbackDone = false;
  // get from DB
  DBHelper.getObjStore(DBHelper.OBJ_ST_RESTAURANTS, 'readonly')
  .then(store => store.get(parseInt(id)))
  .then (restaurant => {
      if (restaurant && !callbackDone) {
        callbackDone = true;
        callback(null, restaurant);
      }
  })
 
    
    //  fetch from network
    const url = `${DBHelper.URL_SERVER}/restaurants/${id}`;
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
  
  // unused
  static fetchRestaurantByCuisine(cuisine, callback) {
    // DBHelper.fetchRestaurantData("?cuisine_type=" + cuisine, (error, restaurants) => {
    //   if (error) {
    //     callback(error, null);
    //   } else {
    //     callback(null, restaurants);
    //   }
    // });



    var callbackDone = false;
    // get from DB
    DBHelper.getObjStore(DBHelper.OBJ_ST_RESTAURANTS, 'readonly').index('by-cuisine')
    .then(store => store.getAll(cuisine))
    .then (restaurant => {
        if (restaurant && !callbackDone) {
          callbackDone = true;
          callback(null, restaurant);
        }
    })
   
      
      //  fetch from network
      const url = `${DBHelper.URL_SERVER}/restaurants/?cuisine_type=${cuisine}`;
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
  
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    DBHelper.fetchRestaurantData("?neighborhood=" + neighborhood, (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, restaurants);
      }
    });
  }
  
  // http://localhost:1337/restaurants/?neighborhood=Brooklyn&&cuisine_type=Pizza
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    var queryQuisine, queryNeighborhood;
    var extra = "?";
    if(neighborhood != 'all') {
      extra += ("neighborhood=" + neighborhood);
      queryNeighborhood = neighborhood;
    }
    if(cuisine != 'all') {
      extra += ("&&cuisine_type=" + cuisine);
      queryQuisine = cuisine;
    } 

    var callbackDone = false;
    // get from DB
    DBHelper.getObjStore(DBHelper.OBJ_ST_RESTAURANTS, 'readonly')
    .then(store => {
      var index =  store.index('by-cuisine-and-neighborhood');
      // return index.openCursor(IDBKeyRange.only([queryQuisine, queryNeighborhood]));
      return index.openCursor(IDBKeyRange.bound(queryQuisine, queryNeighborhood));
    }). then (request => {
var cursor = request.result;
return cursor;
    })
    .then (restaurants => {
        if (restaurants && !callbackDone) {
          callbackDone = true;
          callback(null, restaurants);
        }
    })
   
      
      //  fetch from network
      const url = `${DBHelper.URL_SERVER}/restaurants/${extra}`;
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
  
  
  static fetchReviewsData(restaurantID, callback) {
    var callbackDone = false;
    
    // get from DB
    DBHelper.getObjStore(DBHelper.OBJ_ST_REVIEWS, 'readonly')
    .then(store => store.index('by-restaurant').getAllKeys(restaurantID))
    .then(data => {
      if (data && !callbackDone) {
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
  
  // we can request a max 640px map for the free Gmaps account
  // but we can ask scale = 2 ==> 1280px 
  static getUrlMapStatic(refW, urlStaticMap) {
    var scale = 1;
    var reqPictureWidth = refW;
    
    if (refW > 640) {
      reqPictureWidth = parseInt(refW/2);
      scale = 2;
    }
    
    const urlImgMap = urlStaticMap + "&size=" + reqPictureWidth + "x120&scale=" + scale;
    console.log("url static map: " + urlImgMap);
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
      // icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" 
      // + restaurant.color.replace("#","")
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