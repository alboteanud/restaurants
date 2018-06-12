window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
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
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  
  const sourceWebp = document.createElement('source');
  sourceWebp.type = "image/webp";
  sourceWebp.srcset = DBHelper.getImageUrlForRestaurant(restaurant, "webp");
  sourceWebp.media = "(min-width: 500px)";
  sourceWebp.setAttribute("alt", "restaurant " + restaurant.name);
  
  const source = document.createElement('source');
  source.media = "(min-width: 500px)";
  source.srcset = DBHelper.getImageUrlForRestaurant(restaurant, "full");
  
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.getImageUrlForRestaurant(restaurant, "500");
  image.alt = "restaurant " + restaurant.name;
  
  const picture = document.getElementById('restaurant-pic');
  picture.append(sourceWebp);
  picture.append(source);
  picture.append(image);
  
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;



  if (restaurant.operating_hours) {fillRestaurantHoursHTML();}
  document.getElementById("input-fav").checked = (restaurant.is_favorite == 'true')
  fetchReviews(restaurant.id);
  
  
  
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

// http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
fetchReviews = (id) => {
  // DBHelper.fetchAndStore(DBHelper.OBJ_ST_REVIEWS, `/reviews/?restaurant_id=` + id, (error, jsonResponse) => {
  DBHelper.fetchReviewsData(id, (error, jsonResponse) => {
    if (!jsonResponse) {
      console.error(error);
      return;
    }
    // DBHelper.addToDB(reviews, DBHelper.DATABASE_OBJECT_STORE_REVIEWS);
    fillReviewsHTML(jsonResponse);
  });
}

/**
* Create all reviews HTML and add them to the webpage.
*/
fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
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
  
  // adding the Delete button (trash bin)
  const btnDel = document.createElement('button');
  btnDel.setAttribute('aria-label', 'Delete the review');
  const trashIcon = document.createElement('i');
  btnDel.className = 'btnDel ' + review.email;
  trashIcon.className = 'fa fa-trash';
  btnDel.addEventListener("click", () => {
    if (confirm("Want to delete?")) {
      fetch(DBHelper.URL_SERVER + '/reviews/' + review.id, {method: 'DELETE'});
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
var restaurant;
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

// Get a parameter by name from page URL
getParameterByName = (name, url) => {
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


addAndPostEvent = (e) => {
  // Notification.requestPermission();
  e.preventDefault();
  
  const reviewData = {
    restaurant_id: restaurant.id,
    name: capitalizeFirstLetter(googleUser.getBasicProfile().getGivenName()) ,
    email: googleUser.getBasicProfile().getEmail(),
    rating: document.getElementById("myForm").elements.namedItem("rating-input-1").value,
    comments: document.getElementById('comment').value, 
    updatedAt: Date.now()
  };
  
  updateUI(reviewData);
  DBHelper.addToDB(reviewData, DBHelper.DATABASE_OBJECT_STORE_REVIEWS);
  const headers = new Headers({'Content-Type': 'application/json'});
  const body = JSON.stringify(reviewData);
  return fetch(DBHelper.URL_SERVER + '/reviews/', {method: 'POST', headers: headers, body: body});
}

updateUI = (review) => {
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
  document.getElementById("myForm").reset();
}


var auth2; 
var googleUser; 

signOut = () => {
  auth2.signOut().then(() => {
  });
}

init = () => {
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
  refreshValues();
};

signinChanged = (val) => {  // val = true/false
  
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
  console.log('User now: ', user);
  refreshValues();
};

updateGoogleUser = () => {
  
  // update UI with user name 
  if (googleUser && googleUser.getBasicProfile()) {
    var userName = googleUser.getBasicProfile().getGivenName();
    userName = capitalizeFirstLetter(userName);
    document.getElementById('new-review-title').innerText =  "Hi " + userName + ". How was at " + self.restaurant.name + "?";
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

refreshValues = () => {
  if (auth2){
    console.log('Refreshing values...');
    googleUser = auth2.currentUser.get(); 
    updateGoogleUser();
  } 
}

capitalizeFirstLetter = (targetString) => {
  return targetString.charAt(0).toUpperCase() + targetString.slice(1);
}


// PUT http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true
setFavorite = () => {
  const checkBox = document.getElementById("input-fav");
  const url = DBHelper.URL_SERVER + "/restaurants/" + restaurant.id + "/?is_favorite=" + checkBox.checked;
  return fetch(url, {method: 'PUT'})
  // TODO create user_data in server rather than saving in restaurants
}