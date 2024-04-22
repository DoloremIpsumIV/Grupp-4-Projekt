const linne = {             // Start position for the map
    name: "LinnéUniversitetet",
    lat: 56.85462,
    lng: 14.83038,
    zoom: 16
}
let map;                    // Variable for the map
const ApiKey = "vxJzsf1d";  // Api key for SMAPI
let latitude = linne.lat;   // Latitude of user
let longitude = linne.lng;  // Longitude of user

// Init function
function init() {
    console.log("56.8655872 14.8307968")
    console.log("56.852552 14.817572")
    getUserGeo();
    initMap("mapViewer");
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
    console.log(latitude, longitude)

}

// Function for gathering data regarding users position
function getUserGeo() {
    navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        updateMapLoc(latitude, longitude);
        console.log(latitude, longitude)

    });
}

// Function that updates the position of the map with the geo-data
function updateMapLoc(latitude, longitude) {
    map.setView([latitude, longitude], 16);
    L.marker([latitude, longitude]).addTo(map);
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
    const footer = document.querySelector("#footer");
    const jsonArray = json.payload;
    const divElement = document.createElement("div");
    divElement.id = "restaurantInfo";
    const elementCreator = new CreateElements(jsonArray);                  // Object that is used to construct elements on website

    for (let i = 0; i < jsonArray.length; i++) {                           // Loop that constructs elements on page
        const listElements = document.createElement("div");
        listElements.appendChild(elementCreator.createTitleElement(i));
        listElements.appendChild(elementCreator.createParagraphElement(i));
        divElement.appendChild(listElements);
    }
    footer.appendChild(divElement);
}

// Class that constructs any element based on method used
class CreateElements {

    constructor(data) {
        this.data = data;                                                   // Uses the array that contains all json data
    }

    createParagraphElement(index) {
        const fragment = new DocumentFragment();
        const propertyToShow = ['description', 'type', 'rating', 'sub_type', 'distance_in_km'];            // Data that will be displayed
        const data = Object.keys(this.data[index]);

        for (let i = 0; i < propertyToShow.length; i++) {
            const property = propertyToShow[i];
            const paragraphElement = document.createElement("p");
            paragraphElement.innerText = property + ": " + this.data[index][property];
            fragment.appendChild(paragraphElement);
        }

        for (let i = 0; i < data.length; i++) {                           // Loop that will display all data   
            const key = data[i];                                          // Takes the array of json data and produces all tags, example: id, name, rating, type, etc.
            console.log(data[i] + ": " + (this.data[index][key]))

            //    const paragraphElement = document.createElement("p");
            //    paragraphElement.innerText = data[i] + ": " + (this.data[index][key]);
            //    fragment.appendChild(paragraphElement);
            //
            //    //paragraphElement.innerText = this.data[index].description;  // Changing the output of data can be done by changing what comes after the this.data[index] statement
        }

        return fragment;
    }

    createTitleElement(index) {
        const titleElement = document.createElement("h4");
        titleElement.innerText = this.data[index].name;                     // Changing the output of data can be done by changing what comes after the this.data[index] statement

        return titleElement;
    }

}