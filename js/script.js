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

var header; // The div container for the header
var headerImg; // The image inside the div header container
var position; // The position of the header

var loader; // Declaring variabel for the div containing loader

// Init function
function init() {
    initMap("mapViewer");
    getUserGeo();

    header = document.querySelector("#headerContainer");
    headerImg = document.querySelector("#headerContainer img");

    position = header.offsetTop;
    position = headerImg.offsetTop;
    stickyHeader();

    loader = document.querySelector("#loaderId");

    document.querySelector("#shareLocation").addEventListener("click", getUserGeo);
    document.querySelector("#test").addEventListener("click", fetchData);
}
window.addEventListener("load", init);

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
    });
}

// Function that updates the position of the map with the geo-data
function updateMapLoc(latitude, longitude) {
    map.setView([latitude, longitude], 16);
    L.marker([latitude, longitude], { icon: marker }).addTo(map);
}

// Async function that collects restaurant data
async function fetchData() {
    initLoader();
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
    window.location.hash = "#restaurantInfo";
    document.querySelector("#restaurantInfo").innerHTML = htmlCode;

}

// Function that adds and removes the class for stickyheader 
function stickyHeader() {
    if (window.pageYOffset > position) {
        header.classList.add("stickyHeader");
    } else {
        header.classList.remove("stickyHeader");
    }
}

// Function that adds CSS-class in order to show loader
function initLoader() {
    loader.classList.add("show");

    setTimeout(function () {
        stopLoader();
    }, 3000);
}

// Function that removes CSS-class in order to hide loader
function stopLoader() {
    loader.classList.remove("show");
}