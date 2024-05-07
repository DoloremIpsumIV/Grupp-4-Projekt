// Global variables
const smaland = {            // Start position for the map
    name: "Småland",
    lat: 56.87767,
    lng: 14.80906,
    zoom: 8
}
const oland = {              // Öland coordinates
    name: "Öland",
    lat: 56.6499,
    lng: 16.46859,
    zoom: 9
}
const boundries = {          // Const with min and max boundries for the map
    maxLatCorner: 56.218610,
    maxLngCorner: 17.172606,
    minLatCorner: 58.122646,
    minLngCorner: 13.261037
}
const marker = L.icon({     // Definition of a marker with an image
    iconUrl: '/images/Marker.png',

    iconSize: [38, 45],
    iconAnchor: [45, 36]    // The location of the anchor is based on the top left of the image, and changes with scale, needs tweeking for correct placement
});
const ApiKey = "vxJzsf1d";  // Api key for SMAPI

let locationMarker;
let smalandButton;          // Button for småland
let olandButton;            // Button for Öland
let map;                    // Variable for the map
let latitude = smaland.lat;// Latitude of Småland
let longitude = smaland.lng;// Longitude of Småland
let radius = 1;             // Radius for search fetch
let flag = false;           // Flag for checking stickyHeader
let userMarker;             // Marker that places where the user clicks
let selectedDropdownContent;// The selected element that the user clicked on

var header;                 // Variable for header element
var headerImg;              // Variable for the image inside header
var loader;                 // Declaring variabel for the div containing loader

// Init function
function init() {
    initMap("mapViewer");
    getUserGeo();

    smalandButton = document.querySelector("#smaland");
    olandButton = document.querySelector("#oland");
    header = document.querySelector("#headerContainer");
    headerImg = document.querySelector("#headerContainer img");
    loader = document.querySelector("#loaderId");

    // Updates the contents of the drop-down menus with the selected option
    let dropDownContentOptions = document.querySelectorAll(".dropDownContent a");
    selectedDropdownContent = document.querySelectorAll(".dropDownContent :first-child");

    for (let i = 0; i < dropDownContentOptions.length; i++) {
        dropDownContentOptions[i].addEventListener("click", handleClick);
        for (let j = 0; j < selectedDropdownContent.length; j++) {
            selectedDropdownContent[j].removeEventListener("click", handleClick);
            selectedDropdownContent[j].style.opacity = "0.5";
            selectedDropdownContent[j].style.backgroundColor = "DimGray";
            selectedDropdownContent[j].style.cursor = "default";
        }
    }

    const radiusDropdownElem = document.querySelector("#radius");
    for (let i = 0; i < radiusDropdownElem.children.length; i++) {
        radiusDropdownElem.children[i].addEventListener("click", () => setRadius(radiusDropdownElem.children[i].innerHTML));
    }

    const dropDownContentElem = document.querySelectorAll(".dropDownBtn");
    for (let i = 0; i < dropDownContentElem.length; i++) {
        dropDownContentElem[i].addEventListener("click", toggleDropdownMenu);
    }

    olandButton.classList.toggle("sortButtonsToggle");
    olandButton.addEventListener("click", toggleSortButtons);
    document.querySelector("#shareLocation").addEventListener("click", () => updateMapLoc(Boolean = false));
    document.querySelector("#test").addEventListener("click", fetchData);
}
window.addEventListener("load", init);

// Function that toggles the two buttons
function toggleSortButtons() {
    olandButton.classList.toggle("sortButtonsToggle");
    smalandButton.classList.toggle("sortButtonsToggle");

    if (!olandButton.classList.value) {
        latitude = smaland.lat;
        longitude = smaland.lng;
        smalandButton.removeEventListener("click", toggleSortButtons);
        olandButton.addEventListener("click", toggleSortButtons);
        updateMapLoc(Boolean = false);
    }
    else {
        latitude = oland.lat;
        longitude = oland.lng;
        olandButton.removeEventListener("click", toggleSortButtons);
        smalandButton.addEventListener("click", toggleSortButtons);
        updateMapLoc(Boolean = false);
    }
}

// Function that toggles the dropdown menu
function toggleDropdownMenu() {
    const dropdown = this.nextElementSibling;
    dropdown.classList.toggle("show");
}

// Function that updates the dropdown menu options
function handleClick() {
    const dropDownButtonImg = document.querySelector("#distance button img");
    const buttonClicked = this.parentElement.previousElementSibling;
    const thisElem = this;
    switch (buttonClicked.parentElement.id) {
        case "distance":
            updateDropdownOptions("distance", thisElem);
            buttonClicked.innerHTML = this.innerHTML + dropDownButtonImg.outerHTML;
            selectedDropdownContent.splice(1, 1, thisElem);
            break;
        case "priceRange":
            updateDropdownOptions("priceRange", thisElem);
            buttonClicked.innerHTML = this.innerHTML + dropDownButtonImg.outerHTML;
            selectedDropdownContent.splice(2, 1, thisElem);
            break;

        default:
            updateDropdownOptions("typeOfRestaurant", thisElem);
            buttonClicked.innerHTML = this.innerHTML + dropDownButtonImg.outerHTML;
            selectedDropdownContent.splice(0, 1, thisElem);
            break;
    }
};

// Function that updates the dropdown menu and it's CSS
function updateDropdownOptions(dropdownIdentifier, selectedElement) {
    selectedDropdownContent.forEach(option => {
        if (option.parentElement.parentElement.id.indexOf(dropdownIdentifier) === 0) {
            selectedElement.removeEventListener("click", handleClick);
            selectedElement.style.opacity = "0.5";
            selectedElement.style.backgroundColor = "DimGray";
            selectedElement.style.cursor = "default";

            option.addEventListener("click", handleClick);
            option.style.backgroundColor = "";
            option.style.cursor = "pointer";
            option.style.opacity = "1";
            selectedDropdownContent = Array.from(selectedDropdownContent);
        }
    });
}

// Function that defiens the value of the radius
function setRadius(value) {
    radius = value;
}

// Function for initiation of the map
function initMap(id) {
    map = L.map(id).setView([smaland.lat, smaland.lng], smaland.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 8,
        maxZoom: 18,
        maxBoundsViscosity: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    console.log(map.maxBoundsViscosity);

    bounds = L.latLngBounds(L.latLng(boundries.maxLatCorner, boundries.maxLngCorner),
        L.latLng(boundries.minLatCorner, boundries.minLngCorner));
    map.setMaxBounds(bounds);
    var rect = L.rectangle(bounds, {
        color: 'blue',
        weight: 1
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
    let successFlag = true;
    navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        updateMapLoc(successFlag);
    }, function (error) {
        console.log("Could not fetch user geolocation, Error: " + error)
        successFlag = false;
        updateMapLoc(successFlag);
    });
}
// Function that updates the position of the map with the geo-data
function updateMapLoc(success) {
    map.removeLayer(userMarker);
    if (success) {
        map.setView([latitude, longitude], zoom = 16);
    }
    else {
        if (!olandButton.classList.value) {
            map.setView([latitude, longitude], smaland.zoom);
        }
        else {
            map.setView([latitude, longitude], oland.zoom);
        }
    }

    userMarker = new L.marker([latitude, longitude]).addTo(map);
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
    restaurantContainer.removeChild(restaurantContainer.firstChild);
    restaurantContainer.innerHTML = "";
    const jsonArray = json.payload;
    const elementBuilder = new ElementConstructor(jsonArray);                 // Object that is used to construct elements on website

    for (let i = 0; i < jsonArray.length; i++) {                              // Loop that constructs elements on page
        newRestaurantMarker(jsonArray[i].lat, jsonArray[i].lng);
        const listElements = document.createElement("div");
        listElements.appendChild(elementBuilder.renderElement(i));
        listElements.id = "restaurantCard";
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

        const divElement = document.createElement("div");
        divElement.classList.add("restaurantCardFlex");

        const imgElement = document.createElement("img");
        imgElement.id = "picture";

        const titleElement = document.createElement("h2");
        titleElement.id = "restaurantName";
        titleElement.innerText = this.data[distanceIndex].name;

        divElement.appendChild(imgElement);
        divElement.appendChild(titleElement);
        fragment.appendChild(divElement);

        const secondDivElement = document.createElement("div");
        secondDivElement.classList.add("restaurantCardFlex");
        secondDivElement.style.display = "block";
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

            secondDivElement.appendChild(paragraphElement);
        }
        fragment.appendChild(secondDivElement);

        return fragment;
    }
}