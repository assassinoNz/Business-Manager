//@ts-check
const cacheName = "liveWallV1";

self.addEventListener("install", (event) => {
    console.log("ServiceWorker installation successful");
});

self.addEventListener("activate", async (event) => {
    const keys = await caches.keys();
    keys.map((key) => {
        if (key !== cacheName) {
            return caches.delete(key);
        }
    });
    console.log("ServiceWorker activation successful");
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.open(cacheName).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    //Case: A cached response already exists
                    // console.log("Serving: " + event.request.url);
                    return cachedResponse;
                } else {
                    //Case: A cached response doesn't exist
                    let isCachable = event.request.method.includes("/directories");
                    if (isCachable) {
                        //Case: A cached response doesn't exist and needs to be cached
                        //Request, cache and respond with required resource
                        return fetch(event.request).then((fetchedResponse) => {
                            // console.log("Caching: " + event.request.url);
                            cache.put(event.request, fetchedResponse.clone());
                            return fetchedResponse;
                        }).catch((error) => {
                            return new Response(JSON.stringify({
                                status: false,
                                error: { title: "Aw! snap", titleDescription: "Contact your system administrator", message: "We couldn't fetch some required data from the server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, technicalMessage: "Fetch failure from service worker" }
                            }));
                        });
                    } else {
                        //Case: A cached response doesn't exist and no need of caching
                        //Request and respond with required resource without caching
                        // console.log("Fetching: " + event.request.url);
                        return fetch(event.request).catch((error) => {
                            return new Response(JSON.stringify({
                                status: false,
                                error: { title: "Aw! snap", titleDescription: "Contact your system administrator", message: "We couldn't fetch some required data from the server. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, technicalMessage: "Fetch failure from service worker" }
                            }));
                        });
                    }
                }
            });
        })
    );
});