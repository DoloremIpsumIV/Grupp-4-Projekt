// Function for initiation of the map
function initMap(id) {
    map = L.map(id).setView([smaland.lat, smaland.lng], 9);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        minZoom: 8,
        maxZoom: 18,
        maxBoundsViscosity: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    bounds = L.latLngBounds(L.latLng(boundries.maxLatCorner, boundries.maxLngCorner),
        L.latLng(boundries.minLatCorner, boundries.minLngCorner));
    map.setMaxBounds(bounds);

    userMarker = L.marker();
}

// Function that sets a new marker on the map 
function newUserMarker(e) {
    if (currentWindow === "" || currentWindow.includes("index")) {
        userMarker.setLatLng(e.latlng);
        userMarker.addTo(map);

        latitude = e.latlng.lat;
        longitude = e.latlng.lng;
    }
    else if (currentWindow.includes("geo")) {
        if (userMarker) {
            userMarker.setLatLng(e.latlng);
            userMarker.addTo(miniMap);
        } else {
            userMarker = L.marker(e.latlng, {
                icon: L.icon({
                    iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
                    iconSize: [24, 44],
                    iconAnchor: [12, 44],
                    zIndexOffset: 1000
                })
            }).addTo(miniMap);
            
        }
        latitude = e.latlng.lat;
        longitude = e.latlng.lng;
    }
}

// Function that adds markers to the map of all restaurants
function newRestaurantMarker(lat, lng, urlType, id, location) {
    if (restaurantFlag == true) {
        for (let i = 0; i < restuarantMarkerArray.length; i++) {
            restuarantMarkerArray[i].remove();
        }
    }

    let restaurantMarker = new marker({ iconUrl: `/mapIconsSVG/map${urlType}.svg`, popupAnchor: [0, -35] });
    restuarantMarkerArray.push(L.marker([lat, lng], { icon: restaurantMarker }).addTo(map).on("click", () => scrollToRestaurant(id)).bindPopup(popupText(location)));
    restaurantFlag = false;
}

// Function that determines what is added to the popup dialogue box
function popupText(location) {
    let text = `${location.name}<br>`;
    text += `Stad: ${location.city}<br>`;
    text += `Länk: <a href="${location.website}"> ${location.website} </a><br>`;
    text += `Telefon nummer: ${location.phone_number}`;

    return text;
}

function popup(e){
   var popup = L.popup({offset: [0, -30]});
   popup
       .setLatLng([e.lat, e.lng])
       .setContent(`${e.name}<br>` +
        `Stad: ${e.city}<br>` +
        `Webbsida: <a href="${e.website}"> ${e.website} </a><br>` +
        `Telefon nummer: ${e.phone_number}`.toString())
       .openOn(map);
       map.setView([e.lat, e.lng], zoom = 15);
}

// Function that scrolls to the corresponding restaurant when a marker is clicked
function scrollToRestaurant(id) {
    const clickedRestaurant = document.getElementById(`#r${id}`);
    clickedRestaurant.scrollIntoView();
    let y;
    if (!currentWindow.includes("alla")) {
        y = document.querySelector("#restaurantInfo").getBoundingClientRect().top + window.scrollY - 50;
        clickedRestaurant.parentElement.style.backgroundColor = "#899e1d7a";
        clickedRestaurant.parentElement.style.border = "8px solid black";
        setTimeout(() => restaurantHighlightTimer(clickedRestaurant), 800);
    }
    else {
        y = 200;
    }
    window.scrollTo({ top: y, behavior: "instant" });
}

// Function that reverts the restaurant CSS after a timed amount
function restaurantHighlightTimer(restaurant) {
    restaurant.parentElement.style.backgroundColor = "rgb(253, 245, 235)";
    restaurant.parentElement.style.border = "4px solid black";
}

// Function for gathering data regarding users position, it handles errors by displaying a warning for the user
function getUserGeo() {
    if (currentWindow === "" || currentWindow.includes("index")) {
        const findBtn = document.getElementById("findBtn");
        findBtn.classList.add("activated");

        const mapBtn = document.getElementById("mapBtn");
        mapBtn.classList.remove("activated");

        let successFlag = true;

        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            updateMapLoc(successFlag);
        }, function (error) {
            if (error == "[object GeolocationPositionError]") {
                window.alert(`Om du inte godkänner att sidan använder din platsinformation kommer inte denna funktionen att fungera! Välj då istället plats via kartan 

För att använda hitta min plats måste du ladda om sidan och godkänna på nytt`);
            }
            else {
                window.alert(`Fel vid hämtning av geo position: ${error}`);
            }
            successFlag = false;
            updateMapLoc(successFlag);
        });
    }
    else if (currentWindow.includes("geo")) {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            overlay.style.display = "none";
            stopLoader();
            startGame();
        }, function (error) {
            if (error == "[object GeolocationPositionError]") {
                stopLoader();
                window.alert(`Om du inte godkänner att sidan använder din platsinformation kommer inte denna funktionen att fungera! Välj då istället plats via kartan 
    
    För att använda hitta min plats måste du ladda om sidan och godkänna på nytt`);
            }
            else {
                stopLoader();
                window.alert(`Fel vid hämtning av geo position: ${error}`);
            }
        });
    }
    else if (currentWindow.includes("alla")) {
        let successFlag = true;
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            updateMapLoc(successFlag);
        }, function (error) {
            if (error == "[object GeolocationPositionError]") {
                window.alert(`Om du inte godkänner att sidan använder din platsinformation kommer inte denna funktionen att fungera! Välj då istället plats via kartan 

För att använda hitta min plats måste du ladda om sidan och godkänna på nytt`);
            }
            else {
                window.alert(`Fel vid hämtning av geo position: ${error}`);
            }
            successFlag = false;
            updateMapLoc(successFlag);
        });
    }
}

// Function that updates the position of the map with the geo-data
function updateMapLoc(success) {
    if (success) {
        if (userMarker) {
            userMarker.remove();
        }
        userMarker = new L.marker([latitude, longitude], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(map);
        map.setView([latitude, longitude], zoom = 16);
        if (miniMap) {
            miniMap.setView([latitude, longitude], zoom = 16);
        }
    }
    else {
        if (!olandButtonElem.classList.value) {
            map.setView([latitude, longitude], smaland.zoom);
            if (miniMap) {
                miniMap.setView([latitude, longitude], smaland.zoom);
                return "smaland";
            }
        }
        else {
            map.setView([latitude, longitude], oland.zoom);
            if (miniMap) {
                miniMap.setView([latitude, longitude], oland.zoom);
                return "oland";
            }
            if (success === undefined) {
                map.setView([latitude, longitude], 13);
            }
        }
    }
}

// Opens the small popup map
function openMapDialog() {
    if (currentWindow === "" || currentWindow.includes("index")) {
        if (markerOnMiniMap != undefined) {
            markerOnMiniMap.remove();
        }
        if (userMarker != undefined) {
            userMarker.remove();
        }

        const mapBtn = document.getElementById("mapBtn");
        mapBtn.classList.add("activated");

        const findBtn = document.getElementById("findBtn");
        findBtn.classList.remove("activated");

        const mapBox = document.querySelector("#map");
        const overlay = document.querySelector("#overlay");

        mapBox.style.display = "block";
        mapBox.style.height = "80%";
        mapBox.style.width = "60%";

        overlay.style.display = "block";

        // Creates a mini popup map for the chosen lat and lng
        if (miniMap === undefined) {
            miniMap = L.map("map", {
                center: [smaland.lat, smaland.lng],
                zoom: smaland.zoom,
                minZoom: 8.5,
                maxZoom: 18,
                maxBoundsViscosity: 1,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(miniMap);
            miniMap.on("click", function (event) {
                const markerPosition = event.latlng;
                markerOnMiniMap.setLatLng(markerPosition);
                userMarker.setLatLng(markerPosition);

            });
            miniMap.on("click", newUserMarker);
        }
        const ownPositionMarker = L.icon({
            iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
            iconSize: [20, 40],
            iconAnchor: [10, 40],
            zIndexOffset: 1000
        });

        if (smalandRadioBtn.checked) {
            const miniBounds = L.latLngBounds(
                L.latLng(smalandBoundries.minLatCorner, smalandBoundries.minLngCorner),
                L.latLng(smalandBoundries.maxLatCorner, smalandBoundries.maxLngCorner)
            );
            miniMap.setMaxBounds(miniBounds);
        }
        else if (olandRadioBtn.checked) {
            const miniBounds = L.latLngBounds(
                L.latLng(olandBoundries.minLatCorner, olandBoundries.minLngCorner),
                L.latLng(olandBoundries.maxLatCorner, olandBoundries.maxLngCorner)
            );
            miniMap.setMaxBounds(miniBounds);
        }
        if (updateMapLoc(false) == "smaland") {
            markerOnMiniMap = L.marker([smaland.lat, smaland.lng], { icon: ownPositionMarker }).addTo(miniMap);
            userMarker = new L.marker([smaland.lat, smaland.lng], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(map);
        }
        else {
            markerOnMiniMap = L.marker([oland.lat, oland.lng], { icon: ownPositionMarker }).addTo(miniMap);
            userMarker = new L.marker([oland.lat, oland.lng], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(map);
        }
    }
    else if (currentWindow.includes("geo")) {
        if (userMarker !== undefined) {
            userMarker.remove();
        }
        const mapBox = document.querySelector("#map");
        const overlay = document.querySelector("#overlay");

        mapBox.style.display = "block";
        mapBox.style.height = "60%";
        mapBox.style.width = "60%";

        overlay.style.display = "block";

        if (miniMap === undefined) {
            const mapBounds = L.latLngBounds(
                [boundries.minLatCorner, boundries.minLngCorner],
                [boundries.maxLatCorner, boundries.maxLngCorner]
            );

            
            miniMap = L.map("map", {
                center: [latitude, longitude],
                zoom: 13,
                minZoom: 8,
                maxZoom: 20,
                maxBounds: mapBounds,
                maxBoundsViscosity: 1,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(miniMap);
            miniMap.on("click", function (event) {
                const markerPosition = event.latlng;
                userMarker.setLatLng(markerPosition);
            });
            miniMap.on("click", newUserMarker);
        }
        if (smalandRadioBtn.checked) {
            latitude = smaland.lat;
            longitude = smaland.lng;
            miniMap.setView([latitude, longitude], smaland.zoom);
        }
        else {
            latitude = oland.lat;
            longitude = oland.lng;
            miniMap.setView([latitude, longitude], oland.zoom);
        }

        const ownPositionMarker = L.icon({
            iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
            iconSize: [24, 44],
            iconAnchor: [12, 44],
            zIndexOffset: 1000
        });

        // Sätter Växjö som default
        userMarker = new L.marker([latitude, longitude], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(miniMap);

        const closeButton = document.querySelector("#closeButton");
        closeButton.addEventListener("click", function () {
            overlay.style.display = "none";
        });
    }
}

// Closes the small popup map
function closeMapDialog() {
    latitude = userMarker._latlng.lat
    longitude = userMarker._latlng.lng;
    map.setView([latitude, longitude], zoom = 16);
    const mapBox = document.querySelector("#map");
    const overlay = document.querySelector("#overlay");

    mapBox.style.display = "none";
    overlay.style.display = "none";
}