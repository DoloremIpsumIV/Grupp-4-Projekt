// Global variables and constants
const place = {
    name: "Växjö",
    lat: 56.8795,
    lng: 14.8055,
    zoom: 16
}                   // Start position for the map
let map;            // Variable for the map
const ApiKey = "vxJzsf1d";
const myApiKey = "944195cd6a0ce82f6dd768796b3cd760";
let moreImgElem;


// Init function
function init() {
    initMap("mapViewer");
    document.querySelector("#shareLocation").addEventListener("click", getUserGeo);
    let button = document.querySelector("#test");
    button.addEventListener("click", test);
    moreImgElem = document.querySelector("#moreImgElem")
}
window.addEventListener("load", init);

async function test() {
    console.log("sup")
    let locationImgResponse = await fetch("https://api.flickr.com/services/rest/?api_key=" + myApiKey + "&method=flickr.photos.search&lat=" + "56.878880" + "&lon=" + "16.657668" + "&per_page=5&format=json&nojsoncallback=1");
    if (locationImgResponse.ok) {
        let locationImgResponseData = await locationImgResponse.json();
        console.log(locationImgResponseData)
        showMoreImgs(locationImgResponseData);
    }
    else console.log = "Fel vid hämtning: " + locationResponse.status;
}

function showMoreImgs(jsonData) {
    moreImgElem.innerHTML = "";
    for (let i = 0; i < jsonData.photos.photo.length; i++) {
        const photo = jsonData.photos.photo[i]; // Ett foto i svaret
        const imgUrl = "https://live.staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
        const newElem = document.createElement("img");
        newElem.setAttribute("src", imgUrl);
        moreImgElem.appendChild(newElem);
    }
} // Slut showMoreImgs

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