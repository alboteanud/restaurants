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
  
  workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "a707d37055e916cc578b5910e81a425b"
  },
  {
    "url": "css/common.css",
    "revision": "a2ac8444ca492b864328c25ca45c70e9"
  },
  {
    "url": "css/detail.css",
    "revision": "5713fd44d58910dfab5052bca281f7cb"
  },
  {
    "url": "css/main_620.css",
    "revision": "5bd818b4fcbbfc3d0b82eaf156d5bd41"
  },
  {
    "url": "css/main.css",
    "revision": "58e175026ce67696253db6bc2c1bb090"
  },
  {
    "url": "Gruntfile.js",
    "revision": "2880d0798a94b3222174f422fc56a2bd"
  },
  {
    "url": "index.html",
    "revision": "99f910c77cbde666a3d51811d74578b6"
  },
  {
    "url": "js/dbhelper.js",
    "revision": "2ac5493bef9d9baae77880e9c0c1a0c8"
  },
  {
    "url": "js/idb-promised.js",
    "revision": "59df18a7433f090282337136440403f7"
  },
  {
    "url": "js/initSW.js",
    "revision": "75d55ee206c005ed3bbdc575a1b577c7"
  },
  {
    "url": "js/lazysizes.min.js",
    "revision": "d7333140b08bfe3546117d5ac5424a2f"
  },
  {
    "url": "js/main.js",
    "revision": "fc9231b8d6e49a32cd3d68401afb4dff"
  },
  {
    "url": "js/restaurant_info.js",
    "revision": "d295389b1851d06d23e0b347f1179f8d"
  },
  {
    "url": "manifest.json",
    "revision": "bd7ecdff48774d4335afe7039c565d67"
  },
  {
    "url": "offline.html",
    "revision": "052805fbf4d1f9eda4e9cbceef836a47"
  },
  {
    "url": "restaurant.html",
    "revision": "3710a001780dbfda60d89773187361e1"
  },
  {
    "url": "img/1-500.jpg",
    "revision": "22e331e5e9e330c6fb2828af0c4c7ae7"
  },
  {
    "url": "img/1.jpg",
    "revision": "cc074688becddd2725114187fba9471c"
  },
  {
    "url": "img/1.webp",
    "revision": "8558e632eb668259986a3bd7fa58bcb7"
  },
  {
    "url": "img/10-500.jpg",
    "revision": "281815844f825b2b6596de24c1db1d61"
  },
  {
    "url": "img/10.jpg",
    "revision": "2bd68efbe70c926de6609946e359faa2"
  },
  {
    "url": "img/10.webp",
    "revision": "859dfeb93a66392b58b3d49bd1de08a3"
  },
  {
    "url": "img/2-500.jpg",
    "revision": "78b6ea4dd26fd6625218e118cbfc0f0d"
  },
  {
    "url": "img/2.jpg",
    "revision": "759b34e9a95647fbea0933207f8fc401"
  },
  {
    "url": "img/2.webp",
    "revision": "938706abcf5838f7530282beb4bf55c0"
  },
  {
    "url": "img/3-500.jpg",
    "revision": "da0b9e05c1f5829f3186fd6605657b64"
  },
  {
    "url": "img/3.jpg",
    "revision": "81ee36a32bcfeea00db09f9e08d56cd8"
  },
  {
    "url": "img/3.webp",
    "revision": "96ed15d2915ef256cfffe2a7d1c65253"
  },
  {
    "url": "img/4-500.jpg",
    "revision": "2bcc52403b0444aba48cb19a5d9af506"
  },
  {
    "url": "img/4.jpg",
    "revision": "23f21d5c53cbd8b0fb2a37af79d0d37f"
  },
  {
    "url": "img/4.webp",
    "revision": "52893730cac6efb3d9d383dca261e4be"
  },
  {
    "url": "img/5-500.jpg",
    "revision": "4bfc05e3abd68bace8d6a4c958602f01"
  },
  {
    "url": "img/5.jpg",
    "revision": "0a166f0f4e10c36882f97327b3835aec"
  },
  {
    "url": "img/5.webp",
    "revision": "1543c5378b346acb8f7f62c2fc475e0c"
  },
  {
    "url": "img/6-500.jpg",
    "revision": "cb5026090685546c45ba86ebf5695184"
  },
  {
    "url": "img/6.jpg",
    "revision": "eaf1fec4ee66e121cadc608435fec72f"
  },
  {
    "url": "img/6.webp",
    "revision": "da06b8606f2ced288062ac36f9e3e452"
  },
  {
    "url": "img/7-500.jpg",
    "revision": "6706166583c08064d630bd5bc68b5972"
  },
  {
    "url": "img/7.jpg",
    "revision": "bd0ac197c58cf9853dc49b6d1d7581cd"
  },
  {
    "url": "img/7.webp",
    "revision": "67b0618911593b66afc9085faa8bdf53"
  },
  {
    "url": "img/8-500.jpg",
    "revision": "3f9b2dda2ded730c89d41d817ad17a99"
  },
  {
    "url": "img/8.jpg",
    "revision": "6e0e6fb335ba49a4a732591f79000bb4"
  },
  {
    "url": "img/8.webp",
    "revision": "73332999d6f592bcfa8b042b21da9d5b"
  },
  {
    "url": "img/9-500.jpg",
    "revision": "60fc4b58c390cb631cedcdba4a404fe1"
  },
  {
    "url": "img/9.jpg",
    "revision": "ba4260dee2806745957f4ac41a20fa72"
  },
  {
    "url": "img/9.webp",
    "revision": "326891ff5cf0a3a3ecad09b8069ea09b"
  },
  {
    "url": "img/restaurant-192.png",
    "revision": "d10b7720df9b5e307683092ef86b776d"
  },
  {
    "url": "img/restaurant-48.png",
    "revision": "5323cb47aa08516b9b27aa15ab3f8961"
  },
  {
    "url": "img/restaurant-513.png",
    "revision": "e80d54ac6cb6ba375a2eb30e1dac7036"
  },
  {
    "url": "img/restaurant-96.png",
    "revision": "ad87b13d0bfcb335d27e3c14a735b208"
  }
]);
  
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



