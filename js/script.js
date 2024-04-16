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
let listArray;              // Array with list elements
const fragment = new DocumentFragment();
let jsonArray;

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
    L.marker([latitude, longitude]).addTo(map);
}

// Async function that collects restaurant data
async function fetchData() {
    let response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + "&controller=food&method=getFromLatLng&lat=" + latitude + "&lng=" + longitude + "&radius=1")
    if (response.ok) {
        let dataResponse = await response.json();
        showData(dataResponse);
        //console.log(dataResponse.payload);
    }
    else console.log = "Error during fetch: " + response.status;
}

// Function that displays data using a list 
function showData(json) {
    const Footer = document.querySelector("#footer");
    jsonArray = json.payload;
    fragment.appendChild(document.createElement("ol"))
    for (let i = 0; i < jsonArray.length; i++) {

    const list = fragment.appendChild(document.createElement("li")).appendChild(test(i));
    }
    //list.id = "list";
    //Footer.appendChild(list);

    listArray = document.querySelector("#list");

    //for (let i = 0; i < jsonArray.length; i++) {
    //    const listItem = fragment.appendChild(document.createElement("li"));
    //    listItem.innerText = jsonArray[i].name;
    //    //listArray.appendChild(listItem);
    //}

    Footer.appendChild(fragment);

    //const li = fragment.appendChild(document.createElement("section"))
    //    .appendChild(document.createElement("ul"))
    //    .appendChild(document.createElement("li"));
    //li.textContent = "hello world";
}

function test (num) {
    let listItem;
        listItem = (document.createElement("p"));
        listItem.innerText = jsonArray[num].name;
    return listItem;    

}