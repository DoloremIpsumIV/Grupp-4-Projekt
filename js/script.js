const place = {
    name: "Växjö",
    lat: 56.8795,
    lng: 14.8055,
    zoom: 16
}                   // Start position for the map
let map;            // Variable for the map

// Init function
function init() {
    initMap("mapViewer");
    document.querySelector("#shareLocation").addEventListener("click", getUserGeo);
}
window.addEventListener("load", init);

// Function for initiation of the map
function initMap(id) {
    map = L.map(id).setView([place.lat, place.lng], place.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

// Function for gathering data regarding users position
function getUserGeo() {
    navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        updateMapLoc(latitude, longitude);
    });
}

// Function that updates the position of the map with the geo-data
function updateMapLoc(latitude, longitude) {
    console.log(latitude, longitude)
    map.setView([latitude, longitude], 16);
    L.marker([latitude, longitude]).addTo(map);
}