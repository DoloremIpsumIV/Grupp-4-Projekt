// Global variables
const linne = {             // Start position for the map
    name: "LinnéUniversitetet",
    lat: 56.85462,
    lng: 14.83038,
    zoom: 16
}
const marker = L.icon({    // Definition of a marker with an image
    iconUrl: '/images/Marker.png',

    iconSize: [38, 45],
    iconAnchor: [45, 36]
});
let map;                    // Variable for the map
const ApiKey = "vxJzsf1d";  // Api key for SMAPI
let latitude = linne.lat;   // Latitude of user
let longitude = linne.lng;  // Longitude of user
var header;                 // Variable for header element
var position;               // Position data of user
let flag = false;           // Flag for checking stickyHeader

// Init function
function init() {
    initMap("mapViewer");
    getUserGeo();

    header = document.querySelector("#headerContainer");
    position = header.offsetTop;
    console.log(position)

    document.querySelector("#shareLocation").addEventListener("click", getUserGeo);
    document.querySelector("#test").addEventListener("click", fetchData);
}
window.addEventListener("load", init);
window.addEventListener("scroll", stickyHeader);

// Function for initiation of the map
function initMap(id) {
    map = L.map(id).setView([linne.lat, linne.lng], linne.zoom);
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
        console.log(position)
    });
}

// Function that updates the position of the map with the geo-data
function updateMapLoc(latitude, longitude) {
    map.setView([latitude, longitude], 16);
    L.marker([latitude, longitude], { icon: marker }).addTo(map);
}

// Async function that collects restaurant data
async function fetchData() {
    let response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + "&controller=food&method=getFromLatLng&lat=" + latitude + "&lng=" + longitude + "&radius=1")
    if (response.ok) {
        let dataResponse = await response.json();
        showData(dataResponse);
    }
    else console.log("Error during fetch: " + response.status);
}

// Function that displays data using a list 
function showData(json) {
    const jsonArray = json.payload;

    let htmlCode = " ";
    for (let i = 0; i < jsonArray.length; i++) {
        let restaurant = jsonArray[i];

        const rating = parseFloat(restaurant.rating);

        htmlCode +=
            "<div>" +
            "<h4>" + restaurant.name + "</h4>" +
            "<p>" + restaurant.description + "</p>" +
            "<p>" + rating.toFixed(1) + " Stjärnor</p>" +
            "<p>" + restaurant.avg_lunch_pricing + " kr</p>" + "</div>";

    }

    document.querySelector("#restaurantInfo").innerHTML = htmlCode;
    console.log(position)
}

// Function for changing sticky header
function stickyHeader() {
    if (window.scrollY > position && !flag) {
        header.classList.add("stickyHeader");
        flag = true;
    }
    else if (window.scrollY == position) {
        header.classList.remove("stickyHeader");
        flag = false;
    }
}