importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');


if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);


  restaurantHandler = workbox.strategies.cacheFirst({
    cacheName: 'restaurant-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      })
    ]
  });
  
  showNotification = (text) => {
    self.registration.showNotification(text,{
      body: '🎉`🎉`🎉`'
    });
  };
  
  bgSyncPlugin = new workbox.backgroundSync.Plugin(
    'dashboardr-queue',
    {
      callbacks: {queueDidReplay: console.log("Review posted") }
    }
  );
  
  bgSyncPluginDelete = new workbox.backgroundSync.Plugin(
    'dashboardr-queue-delete',
    {
      callbacks: { queueDidReplay: console.log("Review deleted") }
    }
  );
  
  workbox.precaching.precacheAndRoute([]);
  
  workbox.routing.registerRoute(/restaurant\.html(.*)/, args => {
    return restaurantHandler.handle(args);
  });
  
  workbox.routing.registerRoute(
    'http://localhost:1337/reviews/',
    new workbox.strategies.NetworkOnly({ plugins: [bgSyncPlugin]}),
    'POST'
  );
  
  workbox.routing.registerRoute(
    'http://localhost:1337/reviews/',
    new workbox.strategies.NetworkOnly({ plugins: [bgSyncPluginDelete]}),
    'DELETE'
  );
  

  
}

else { console.log(`Boo! Workbox didn't load 😬`); }



