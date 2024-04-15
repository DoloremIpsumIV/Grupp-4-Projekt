// Startpositionen för kartan, får väl lägga in användarens longitude och latitude här
const place = {
    name: "Växjö",
    lat: 56.8795,
    lng: 14.8055,
    zoom: 16
}

let map; // Variabel för kartan
let markers; // Potentiell variabel för markörer
let marker;

// Init-funktion
function init() {
    initMap("mapViewer");
    document.querySelector("#test").addEventListener("click", getUserGeo);

}
window.addEventListener("load", init);

// Funktion för att initiera kartan
function initMap(id) {
    map = L.map(id).setView([place.lat, place.lng], place.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

// Funktion för att hämta data för användarens position
function getUserGeo() {
    navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        updateMapLoc(latitude, longitude);
    });
}

// Funktion som uppdaterar kartans position med användarens geo-data
function updateMapLoc(latitude, longitude) {
    console.log(latitude, longitude)
    map.setView([latitude, longitude], 16);
    L.marker([latitude, longitude]).addTo(map);
}