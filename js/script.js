const vaxjo = {
    name: "Växjö",
    lat: 56.8795,
    lng: 14.8055,
    zoom: 16
}                           // Start position for the map
let map;                    // Variable for the map
const ApiKey = "vxJzsf1d";  // Api key for SMAPI
let latitude;               // Latitude of user
let longitude;              // Longitude of user

// Init function
function init() {
    initMap("mapViewer");
    getUserGeo();
    document.querySelector("#shareLocation").addEventListener("click", getUserGeo);
    document.querySelector("#test").addEventListener("click", fetchData);
}
window.addEventListener("load", init);

// Function for initiation of the map
function initMap(id) {
    map = L.map(id).setView([vaxjo.lat, vaxjo.lng], vaxjo.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

// Function for gathering data regarding users position
function getUserGeo() {
    navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        updateMapLoc(latitude, longitude);
    });
}

// Function that updates the position of the map with the geo-data
function updateMapLoc(latitude, longitude) {
    map.setView([latitude, longitude], 16);
    L.marker([latitude, longitude]).addTo(map);
}

// Async function that collects restaurant data
async function fetchData(){
    let response = await fetch("https://smapi.lnu.se/api/?api_key=vxJzsf1d&debug=true&controller=food&method=getFromLatLng&lat=" + latitude + "&lng=" + longitude + "&radius=1")
    if (response.ok){
        let dataResponse = await response.json();
        console.log (dataResponse.payload);
    }
    else console.log = "Error during fetch: " + response.status;
}