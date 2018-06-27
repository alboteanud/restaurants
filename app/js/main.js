var restaurants, neighborhoods, cuisines, map, markers = [], deferredPrompt;

// Fetch neighborhoods and cuisines as soon as the page is loaded.
document.addEventListener('DOMContentLoaded', (event) => {
  
  fetchNeighborhoods();
  fetchCuisines();
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

fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

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

fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');
  
  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;
  
  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  
  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) {  // Got an error!
      console.error(error);
    } 
    else {        // restaurans ok
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
      setLazyLoading();
    }
  })
}      

updateRestaurants();


resetRestaurants = (restaurants) => {
  console.log('resetRestaurants() in main.js');
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';
  
  self.restaurants = restaurants;
  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  const staticMap = document.querySelector('.static-map');
  staticMap.innerHTML = '';
}

fillRestaurantsHTML = (restaurants = self.restaurants) => {
  
  const ul = document.getElementById('restaurants-list');
  var urlStaticMap = "https://maps.googleapis.com/maps/api/staticmap?&zoom=10&key=AIzaSyDPj14nPSzVtCcHwwW-sU-DYPiJSrNZyH4";
  
  for (var i = 0; i < restaurants.length; i++) {
    ul.append(createRestaurantHTML(restaurants[i]));  
    const extraUrlStaticMap = "&markers=color:" + restaurants[i].color.replace("#", "0x")
    + "%7C" + "label:" + restaurants[i].name.charAt(0) 
    + "%7C" + restaurants[i].latlng.lat + "," + restaurants[i].latlng.lng;
    
    urlStaticMap += extraUrlStaticMap;     
  }
  fillStaticMapHTML(urlStaticMap); 
  addMarkersToInteractiveMap(); 
  
}


createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  
  const sourceWebp = document.createElement('source');
  sourceWebp.type = "image/webp";
  sourceWebp.setAttribute("data-srcset", DBHelper.getImageUrlForRestaurant(restaurant.photograph, DBHelper.TYPE_WEBP));
  
  const source = document.createElement('source');
  source.media = "(min-width: 500px)";
  source.setAttribute("data-srcset", DBHelper.getImageUrlForRestaurant(restaurant.photograph, DBHelper.TYPE_IMG_NORMAL));
  
  const image_low = document.createElement('img');
  image_low.setAttribute("data-src", DBHelper.getImageUrlForRestaurant(restaurant.photograph, DBHelper.TYPE_IMG_500));
  image_low.alt = restaurant.name + ", " + restaurant.photo_description
  // image_low.className = 'lazyload';
  image_low.className = 'js-lazy-image centered';
  image_low.src = DBHelper.getImageUrlForRestaurant(restaurant.photograph, DBHelper.TYPE_THUMBNAIL)
  
  const picture = document.createElement('picture');
  picture.className = 'restaurant-img';
  picture.append(sourceWebp);
  picture.append(source);
  picture.append(image_low);
  
  const a = document.createElement('a');
  a.href = DBHelper.buildUrlForRestaurant(restaurant);  
  
  a.append(picture);
  li.append(a);
  
  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);
  
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);
  
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);
  li.style.border = ("2px solid " + restaurant.color);
  return li;
};

addMarkersToInteractiveMap = (restaurants = self.restaurants) => {
  if(self.map == null) return;
  
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.getMapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

fillStaticMapHTML = (urlStaticMap) => {
  const widthDevice = (window.innerWidth > 0) ? window.innerWidth : screen.width; 
  
  const src = document.createElement('source');
  src.media = "(min-width: 800px)"; 
  src.setAttribute("data-srcset", getUrlMapStatic(1000, urlStaticMap));
  
  const img = document.createElement('img');
  img.setAttribute("data-srcset", getUrlMapStatic(widthDevice, urlStaticMap));
  img.style.width = "100%";
  img.style.height = "auto";
  img.className = 'lazyload';
  img.alt = "map with restaurants";
  
  const pictureStaticMap = document.createElement('picture');
  pictureStaticMap.append(src);
  pictureStaticMap.append(img);
  document.querySelector('.static-map').append(pictureStaticMap);
}

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


getMapBound = () => {
  if(!restaurants) return;
  
  var bound = new google.maps.LatLngBounds();
  
  for (i = 0; i < restaurants.length; i++) {
    bound.extend( new google.maps.LatLng(restaurants[i].latlng.lat, restaurants[i].latlng.lng) );
  }
  // 
  console.log( "map center " + bound.getCenter() );
  return bound;
}

toggleMapStyle = () => {
  var staticMap = document.querySelector('.static-map');
  if (staticMap.style.display === "none") {
    document.querySelector('.interactive-map').style.display = "none";
    staticMap.style.display = "block";
  } 
  else {
    if(!self.map) {
      // TODO add a loading element 
      loadMapInteractive();
    } else {
      staticMap.style.display = "none";
      document.querySelector('.interactive-map').style.display = "block";  
      addMarkersToInteractiveMap();
    } 
  }
}

initInteractiveMap = () => {      
  const mapBound = getMapBound();            
  self.map = new google.maps.Map(document.querySelector('.interactive-map'), {
    zoom: 10,
    center: mapBound.getCenter(),
    scrollwheel: false
  });
  // self.map.fitBounds(mapBound);
  // updateRestaurants();
  addMarkersToInteractiveMap();   
  document.querySelector('.static-map').style.display = "none";
  document.querySelector('.interactive-map').style.display = "block";  
}


loadMapInteractive = () => {
  var script = document.createElement('script');
  script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDPj14nPSzVtCcHwwW-sU-DYPiJSrNZyH4&libraries=places&callback=initInteractiveMap";
  document.body.appendChild(script);
}


// the following code help with lazy loading images 
// Credit to https://github.com/deanhume/lazy-observer-load/blob/master/lazy-load.js
// TODO reduce boilerplate or move in new file this code

var images, imageCount, observer;

setLazyLoading = () => {
  // Get all of the images that are marked up to lazy load
  images = document.querySelectorAll('.js-lazy-image');
  imageCount = images.length;
  
  // If we don't have support for intersection observer, loads the images immediately
  if (!('IntersectionObserver' in window)) {
    loadImagesImmediately(images);
  } else {
    // It is supported, load the images
    if (!observer) {
      const config = {
        // If the image gets within 50px in the Y axis, start the download.
        rootMargin: '50px 0px',
        threshold: 0.01
      };
      observer = new IntersectionObserver(onIntersection, config);
    } else {
      disconnect();
    }
    
    
    // foreach() is not supported in IE
    for (let i = 0; i < images.length; i++) { 
      let image = images[i];
      if (image.classList.contains('js-lazy-image--handled')) {
        continue;
      }
      
      observer.observe(image);
    }
  }
}


/**
* Fetchs the image for the given URL
* @param {string} url 
*/
function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = resolve;
    image.onerror = reject;
  });
}

/**
* Preloads the image
* @param {object} image 
*/
function preloadImage(image) {
  const src = image.dataset.src;
  if (!src) {
    return;
  }
  
  return fetchImage(src).then(() => { applyImage(image, src); });
}

/**
* Load all of the images immediately
* @param {NodeListOf<Element>} images 
*/
function loadImagesImmediately(images) {
  // foreach() is not supported in IE
  for (let i = 0; i < images.length; i++) { 
    let image = images[i];
    preloadImage(image);
  }
}

/**
* Disconnect the observer
*/
function disconnect() {
  if (!observer) {
    return;
  }
  
  observer.disconnect();
}

/**
* On intersection
* @param {array} entries 
*/
function onIntersection(entries) {
  // Disconnect if we've already loaded all of the images
  if (imageCount === 0) {
    observer.disconnect();
  }
  
  // Loop through the entries
  for (let i = 0; i < entries.length; i++) { 
    let entry = entries[i];
    // Are we in viewport?
    if (entry.intersectionRatio > 0) {
      imageCount--;
      
      // Stop watching and load the image
      observer.unobserve(entry.target);
      preloadImage(entry.target);
    }
  }
}

/**
* Apply the image
* @param {object} img 
* @param {string} src 
*/
function applyImage(img, src) {
  // Prevent this from being lazy loaded a second time.
  img.classList.add('js-lazy-image--handled');
  img.src = src;
  img.classList.add('fade-in');
}

