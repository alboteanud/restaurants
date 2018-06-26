if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log(`Service Worker registed! Scope: ${registration.scope}`);
        })
        .catch(err => {
            console.log(`Service Worker registration failed: ${err}`);
        });
      });
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

// we can request a max 640px map for the free Gmaps account
// but we can ask scale = 2 ==> 1280px
getUrlMapStatic = (refW, urlStaticMap) => {

    if (refW > 1280) {
        scale = 2;
        reqPictureWidth = 640;
        reqPictureHeight = 100;
    }
    else if (refW > 640) {
        scale = 2;
        reqPictureWidth = refW/2;
        reqPictureHeight = 100;
    }
    else {
        scale = 1;
        reqPictureWidth = refW;
        reqPictureHeight = 200;
    }

    const urlImgMap = urlStaticMap + "&size=" + reqPictureWidth + "x" + reqPictureHeight +"&scale=" + scale;
    console.log("url img map " + urlImgMap);
    return urlImgMap;
}