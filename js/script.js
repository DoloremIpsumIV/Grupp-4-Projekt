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
    iconAnchor: [45, 36]    // The location of the anchor is based on the top left of the image, and changes with scale, needs tweeking for correct placement
});
const ApiKey = "vxJzsf1d";  // Api key for SMAPI

let map;                    // Variable for the map
let latitude = linne.lat;   // Latitude of user
let longitude = linne.lng;  // Longitude of user
let radius = 1;             // Radius for search fetch
let flag = false;           // Flag for checking stickyHeader
let userMarker;             // Marker that places where the user clicks

var header;                 // Variable for header element
var headerImg;              // Variable for the image inside header
var position;               // The position of the header
var loader;                 // Declaring variabel for the div containing loader

// Init function
function init() {
    initMap("mapViewer");
    getUserGeo();

    header = document.querySelector("#headerContainer");
    headerImg = document.querySelector("#headerContainer img");
    loader = document.querySelector("#loaderId");

    position = header.offsetTop;
    position = headerImg.offsetTop;

    let radiusDropdownElem = document.querySelector("#radius");
    for (let i = 0; i < radiusDropdownElem.children.length; i++) {
        radiusDropdownElem.children[i].addEventListener("click", () => setRadius(radiusDropdownElem.children[i].innerHTML));
    }

    document.querySelector("#shareLocation").addEventListener("click", getUserGeo);
    document.querySelector("#test").addEventListener("click", fetchData);
    window.addEventListener("scroll", stickyHeader);
}
window.addEventListener("load", init);

// Function that defiens the value of the radius
function setRadius(value) {
    radius = value;
}

// Function for initiation of the map
function initMap(id) {
    map = L.map(id).setView([linne.lat, linne.lng], linne.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    userMarker = L.marker();
    map.on("click", newUserMarker);
}

// Function that sets a new marker on the map 
function newUserMarker(e) {
    userMarker.setLatLng(e.latlng);
    userMarker.addTo(map);

    latitude = e.latlng.lat;
    longitude = e.latlng.lng;
}

// Function that adds markers to the map of all restaurants
function newRestaurantMarker(lat, lng) {
    L.marker([lat, lng], { icon: marker }).addTo(map);
}

// Function for gathering data regarding users position
function getUserGeo() {
    navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        updateMapLoc();
    }, function (error) {
        console.log("Could not fetch user geolocation, Error: " + error)
        updateMapLoc();
    });
}

// Function that updates the position of the map with the geo-data
function updateMapLoc() {
    map.setView([latitude, longitude], 16);
    L.marker([latitude, longitude]).addTo(map);
}

// Async function that collects restaurant data
async function fetchData() {
    initLoader();
    let response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + "&controller=food&method=getFromLatLng&lat=" + latitude + "&lng=" + longitude + "&radius=" + radius);
    if (response.ok) {
        let dataResponse = await response.json();
        showData(dataResponse);
    }
    else console.log("Error during fetch: " + response.status);
}

// Function for toggling sticky header
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

// Function that adds CSS-class in order to show loader
function initLoader() {
    loader.classList.add("show");
}

// Function that removes CSS-class in order to hide loader
function stopLoader() {
    loader.classList.remove("show");
}

// Function that displays data using a list 
function showData(json) {
    const restaurantContainer = document.querySelector("#restaurantInfo");
    const jsonArray = json.payload;
    const elementBuilder = new ElementConstructor(jsonArray);                 // Object that is used to construct elements on website

    for (let i = 0; i < jsonArray.length; i++) {                              // Loop that constructs elements on page
        newRestaurantMarker(jsonArray[i].lat, jsonArray[i].lng);
        const listElements = document.createElement("div");
        listElements.appendChild(elementBuilder.renderElement(i));
        restaurantContainer.appendChild(listElements);
    }

    stopLoader();
    window.location.hash = "#restaurantInfo";
}

// Class that constructs any element based on method used
class ElementConstructor {

    constructor(data) {
        this.data = data;                                                    // Uses the array that contains all JSON data
        this.distances = this.data.map(item => item.distance_in_km);         // Array with all distance values
        this.sortedDistances = this.distances.slice().sort((a, b) => a - b); // Distance array sortend in ascending order
    }

    renderElement(index) {
        const fragment = new DocumentFragment();
        const propertyToShow = ['description', 'type', 'rating', 'sub_type', 'distance_in_km', 'search_tags', 'avg_lunch_pricing', 'buffet_option'];  // Data that will be displayed
        //const data = Object.keys(this.data[index]);                                            // Switch out property to show with data to display all data in div elements
        const distanceIndex = this.distances.indexOf(this.sortedDistances[index]);

        const titleElement = document.createElement("h4");
        titleElement.innerText = this.data[distanceIndex].name;
        fragment.appendChild(titleElement);

        for (let i = 0; i < propertyToShow.length; i++) {
            const property = String(propertyToShow[i]);
            const paragraphElement = document.createElement("p");
            const parsedNumber = parseFloat((this.data[distanceIndex][property]).toString());

            if (parsedNumber) {
                paragraphElement.innerText = property.charAt(0).toUpperCase() + property.slice(1).replace(/_/g, " ") + ": " + Math.round((parsedNumber + Number.EPSILON) * 100) / 100
            }
            else {
                paragraphElement.innerText = property.charAt(0).toUpperCase() + property.slice(1).replace(/_/g, " ") + ": " + this.data[distanceIndex][property];
            }

            fragment.appendChild(paragraphElement);
        }

        return fragment;
    }
}