var restaurants,
neighborhoods,
cuisines,
map;
var markers = [];


// Fetch neighborhoods and cuisines as soon as the page is loaded.
document.addEventListener('DOMContentLoaded', (event) => {
  
  fetchNeighborhoods();
  fetchCuisines();
  // updateRestaurants();
});

// Fetch all neighborhoods and set their HTML.
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

// Set neighborhoods HTML.
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
* Fetch all cuisines and set their HTML.
*/
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
* Set cuisines HTML.
*/
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

window.initMap = () => {
  const loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

updateRestaurants = () => {
  // console.log('updateRestaurants() in main.js');
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');
  
  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;
  
  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  
  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

resetRestaurants = (restaurants) => {
  console.log('resetRestaurants() in main.js');
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';
  
  self.markers = [];
  self.restaurants = restaurants;
  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
}

fillRestaurantsHTML = (restaurants = self.restaurants) => {
  console.log('fillRestaurantsHTML() in main.js');
  const ul = document.getElementById('restaurants-list');
  for (var i = 0; i < restaurants.length; i++) {
    ul.append(createRestaurantHTML(restaurants[i]));
    addMarkersToMap();
  }
}

createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  
  const sourceWebp = document.createElement('source');
  sourceWebp.type = "image/webp";
  sourceWebp.setAttribute("data-srcset", DBHelper.imageUrlForRestaurant(restaurant, "webp"));
  sourceWebp.setAttribute('class', 'lazyload');
  // sourceWebp.className = 'restaurant-img';
  sourceWebp.setAttribute("width", "100%");
  sourceWebp.setAttribute("alt", "restaurant " + restaurant.name);
  // className = 'restaurant-img';
  
  const source = document.createElement('source');
  source.media = "(min-width: 500px)";
  source.setAttribute("data-srcset", DBHelper.imageUrlForRestaurant(restaurant, "full"));
  source.setAttribute("alt", "restaurant " + restaurant.name);
  source.className = 'lazyload';
  source.setAttribute("width", "100%");
  
  const image_low = document.createElement('img');
  image_low.setAttribute("data-src", DBHelper.imageUrlForRestaurant(restaurant, "500"));
  image_low.alt = "restaurant " + restaurant.name;
  image_low.className = 'lazyload';
  image_low.setAttribute("width", "100%");
  
  const picture = document.createElement('picture');
  picture.className = 'restaurant-img';
  picture.append(sourceWebp);
  picture.append(source);
  picture.append(image_low);
  li.append(picture);
  
  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);
  
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);
  
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);
  
  const more = document.createElement('a');
  more.innerHTML = 'More about ' + restaurant.name;
  // more.label = restaurant.name;
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);
  
  return li;
};

addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

let deferredPrompt ;
// add to home button
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Update UI notify the user they can add to home screen
  let btnAdd = document.getElementById('btn-add-to-home');
  btnAdd.style.display = 'block';
  
  btnAdd.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    btnAdd.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
    .then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
  
});

// var btn = document.getElementById('btn-test');
// var event = new Event(null);
// event.initEvent('beforeinstallprompt', true, true);
// btn.addEventListener('beforeinstallprompt', null, false);
// btn.dispatchEvent(event);

