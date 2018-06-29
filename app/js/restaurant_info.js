var auth2, googleUser, restaurant, map; 

(fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) {  return; }
  
  const id = DBHelper.getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      
      if (!restaurant) {
        console.error(error);
        return;
      }
      
      const name = document.getElementById('restaurant-name');
      if(name.innerHTML == "") { 
        fillRestaurantHTML();
        fillBreadcrumb();
        fillStaticMapHTML();
        fetchReviews();
      }
      
    });
  }
})();


fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  
  const sourceWebp = document.createElement('source');
  sourceWebp.type = "image/webp";
  sourceWebp.srcset = DBHelper.getImageUrlForRestaurant(restaurant.photograph, DBHelper.TYPE_WEBP);
  sourceWebp.media = "(min-width: 500px)";
  
  const source = document.createElement('source');
  source.media = "(min-width: 500px)";
  source.srcset = DBHelper.getImageUrlForRestaurant(restaurant.photograph, DBHelper.TYPE_IMG_NORMAL);
  
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.getImageUrlForRestaurant(restaurant.photograph, DBHelper.TYPE_IMG_500);
  image.alt = restaurant.name + ", " + restaurant.photo_description;
  
  const picture = document.getElementById('restaurant-pic');
  picture.append(sourceWebp);
  picture.append(source);
  picture.append(image);
  
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  
  if (restaurant.operating_hours) {fillRestaurantHoursHTML();}
  document.getElementById("input-fav").checked = (restaurant.is_favorite == 'true');
  document.querySelector('.contained_restaurant_name').style.border = "2px solid " + restaurant.color;
}

fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    
    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);
    
    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);
    
    hours.appendChild(row);
  }
}

fetchReviews = (restaurant = self.restaurant) => {
  DBHelper.fetchReviewsData(restaurant.id, (error, responseReviews) => {
    if (!responseReviews) {
      console.error(error);
      return;
    }
    fillReviewsHTML(responseReviews);
  });
}

fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  ul.innerHTML = '';  //reset
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);
  
  optionsDate = { year: 'numeric', month: 'short' };
  dateTimeString = new Date(review.updatedAt).toLocaleDateString("en-US", optionsDate);
  const date = document.createElement('p');
  date.innerHTML = dateTimeString;
  const divDate = document.createElement('div');
  divDate.align = "right";
  divDate.appendChild(date);
  li.appendChild(divDate);
  
  innerHTMLstars = ``;
  for (currentStarNo = 1; currentStarNo <= 5; currentStarNo++) {
    if (review.rating >= currentStarNo){
      innerHTMLstars += `<span class="fa fa-star checked"></span>`;
    } else{
      innerHTMLstars += `<span class="fa fa-star"></span>`;
    }
  }  
  const rating = document.createElement('p');
  rating.innerHTML = innerHTMLstars;
  li.appendChild(rating);
  
  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  
  // add a Delete button - trash
  const btnDel = document.createElement('button');
  btnDel.setAttribute('aria-label', 'Delete the review');
  const trashIcon = document.createElement('i');
  btnDel.className = 'btnDel ' + review.email;
  trashIcon.className = 'fa fa-trash';
  btnDel.addEventListener("click", () => {
    if (confirm("Want to delete?")) {
      DBHelper.deleteReview(review.id);
      
      li.parentNode.removeChild(li);
    }
  });
  btnDel.appendChild(trashIcon); 
  if(googleUser && googleUser.getBasicProfile() && googleUser.getBasicProfile().getEmail() === review.email){
    btnDel.style.display = "block";
  } else {
    btnDel.style.display = "none";
  }
  const divDel = document.createElement('div');
  divDel.align = "right";
  divDel.appendChild(btnDel);
  li.appendChild(divDel);
  
  return li;
}

// Add restaurant name to the breadcrumb navigation menu
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

addAndPostEvent = (e) => {
  // Notification.requestPermission();
  e.preventDefault();
  
  const reviewData = {
    restaurant_id: restaurant.id,
    name: capitalizeFirstLetter(googleUser.getBasicProfile().getGivenName()) ,
    email: googleUser.getBasicProfile().getEmail(),
    rating: document.getElementById("myForm").elements.namedItem("rating-input-1").value,
    comments: document.getElementById('comment').value,
    createdAt: Date.now(),  // this should have been done by server but will not be a timestamp but a date-time
    updatedAt: Date.now()
  };
  
  updateUI(reviewData);
  // DBHelper.addToDB([reviewData], DBHelper.OBJ_ST_REVIEWS); // need review_id
  const headers = new Headers({'Content-Type': 'application/json'});
  const body = JSON.stringify(reviewData);
  return fetch(DBHelper.URL_SERVER + '/reviews/', {method: 'POST', headers: headers, body: body});
}

updateUI = (review) => {
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
  document.getElementById("myForm").reset();
}

signOut = () => {
  auth2.signOut().then(() => {
  });
}

initGoogleUser = () => {
  gapi.load('auth2', initSigninV2);
  gapi.signin2.render('sign-in-google');
};

initSigninV2 = () => {
  auth2 = gapi.auth2.init({client_id: '29591533980-14in74ar87hkluve0u87d4b0pjsqc403.apps.googleusercontent.com'});
  auth2.isSignedIn.listen(signinChanged);
  auth2.currentUser.listen(userChanged);
  if (auth2.isSignedIn.get() == true) {
    auth2.signIn();
  }
  refreshUserValues();
};

signinChanged = (val) => {  // true/false
  
  if(val) { // UI for Signed In user
    var postButton = document.getElementById('add-review-button');
    postButton.style.display = 'block';
    postButton.addEventListener('click', addAndPostEvent);
    
    document.getElementById('sign-out-button').style.display = 'block';
    document.getElementById('sign-in-google').style.display = 'none';
  } 
  else { // UI for Signed Out user
    document.getElementById('new-review-title').innerText = 'Add review';  
    document.getElementById('add-review-button').style.display = 'none';
    document.getElementById('sign-out-button').style.display = 'none';
    document.getElementById('sign-in-google').style.display = 'block';
    
    // hide Delete buttons (trash bin)
    btnsDel = document.getElementsByClassName('btnDel');
    for (i = 0; i < btnsDel.length; i++) {
      if (btnsDel[i].style.display === "block") {
        btnsDel[i].style.display = "none";
      }
    }
  }
};

userChanged = (user) => {
  // console.log('User now: ', user);
  refreshUserValues();
};

updateGoogleUser = () => {
  // update UI with user name 
  if (googleUser && googleUser.getBasicProfile()) {
    var userName = googleUser.getBasicProfile().getGivenName();
    userName = capitalizeFirstLetter(userName);
    document.getElementById('new-review-title').innerText =  "Hi " + userName + ". Your review here";
    var btnsDel = document.getElementsByClassName('btnDel');
    for (i = 0; i < btnsDel.length; i++) {
      if(btnsDel[i].className === 'btnDel ' + googleUser.getBasicProfile().getEmail()) {
        btnsDel[i].style.display = "block";
      } else {
        btnsDel[i].style.display = "none";
      }
    } 
  }
};

refreshUserValues = () => {
  if (auth2){
    // console.log('Refreshing values...');
    googleUser = auth2.currentUser.get(); 
    updateGoogleUser();
  } 
}

capitalizeFirstLetter = (targetString) => {
  return targetString.charAt(0).toUpperCase() + targetString.slice(1);
}

setFavorite = () => {
  const checkBox = document.getElementById("input-fav");
  const url = DBHelper.URL_SERVER + "/restaurants/" + restaurant.id + "/?is_favorite=" + checkBox.checked;
  return fetch(url, {method: 'PUT'})
  // TODO create user_data in server rather than saving in restaurants
}

toggleMapStyle = () => {
  var staticMap = document.querySelector('.static-map');
  if (staticMap.style.display === "none") {
    document.querySelector('.interactive-map').style.display = "none";
    staticMap.style.display = "block";
  } 
  else {
    if(!self.map) {
      // TODO add a loading animation
      loadMapInteractive();
    } else {
      staticMap.style.display = "none";
      document.querySelector('.interactive-map').style.display = "block";  
    } 
  }
}

loadMapInteractive = () => {
  var script = document.createElement('script');
  script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDPj14nPSzVtCcHwwW-sU-DYPiJSrNZyH4&callback=initInteractiveMap";
  document.body.appendChild(script);
}

initInteractiveMap = () => {              
  self.map = new google.maps.Map(document.querySelector('.interactive-map'), {
    zoom: 14,
    center: self.restaurant.latlng,
    scrollwheel: false
  });   
  DBHelper.getMapMarkerForRestaurant(restaurant, self.map);
  document.querySelector('.static-map').style.display = "none";
  document.querySelector('.interactive-map').style.display = "block";  
}

fillStaticMapHTML = (restaurant = self.restaurant) => {
  var urlStaticMap = "https://maps.googleapis.com/maps/api/staticmap?&zoom=14&key=AIzaSyDPj14nPSzVtCcHwwW-sU-DYPiJSrNZyH4&markers=" 
  + restaurant.latlng.lat + "," + restaurant.latlng.lng;
  
  const widthDevice = (window.innerWidth > 0) ? window.innerWidth : screen.width; 
  
  const src = document.createElement('source');
  src.media = "(min-width: 800px)"; 
  src.setAttribute("data-srcset", DBHelper.getUrlMapStatic(1280, urlStaticMap));
  
  const imgDefault = document.createElement('img');
  imgDefault.setAttribute("data-src", DBHelper.getUrlMapStatic(widthDevice, urlStaticMap) );
  imgDefault.setAttribute("width", "100%");
  // imgDefault.setAttribute("height", "auto");
  imgDefault.alt = "map with restaurants";
  imgDefault.className = 'lazyload';
  
  const picture = document.createElement('picture');
  picture.append(src);
  picture.append(imgDefault);
  document.querySelector('.static-map').append(picture);
  document.getElementById('btn-toggle-map').style.display = "block";
}