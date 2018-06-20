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