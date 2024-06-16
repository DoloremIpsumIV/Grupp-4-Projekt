let imageFolder = "mapIconsSVG"; //Mappen med svg bilderna

let imagesUsed = [
    "A_LA_CARTE.svg",
    "asian.svg",
    "burgers.svg",
    "HOT_DOGS.svg",
    "latin.svg",
    "MEDITERRANEAN.svg",
    "PASTRIES.svg",
    "pizza.svg"
]; //Bilderna som ska användas

let playBtn; // spela knappen

let markerOnMiniMap; // Markerare för liten karta

let userMarker;

let map;

let miniMap;


function init () {

    playBtn = document.querySelector("#playButton");

    playBtn.addEventListener("click", startGame);

    let mapBtn = document.querySelector("#mapBtn2");

    mapBtn.addEventListener("click", openMap);


}
window.addEventListener("load", init);



function startGame() {
    console.log("FGH")

    playBtn.style.display = "none";

    let selectBox = document.querySelector("#selectBox");
    selectBox.style.display = "flex";

}


function openMap() {


    if (markerOnMiniMap != undefined) {
        markerOnMiniMap.remove();
    }
    if (userMarker != undefined) {
        userMarker.remove();
    }


    const mapBox = document.querySelector("#newMap");

    mapBox.style.display = "block";
    mapBox.style.height = "80%";
    mapBox.style.width = "60%";

    let selectBox2 = document.querySelector("#selectBox2");
    selectBox2.style.display = "flex";

    // Creates a mini popup map for the chosen lat and lng
    if (!miniMap) {
        // Skapa kartan om den inte redan finns
        miniMap = L.map('map').setView([57.309, 14.637], 9); // Använd defaultvärden eller justera efter behov

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 8,
            maxZoom: 18,
            maxBoundsViscosity: 1,
        }).addTo(miniMap);

        miniMap.on('click', function (event) {
            const markerPosition = event.latlng;
            markerOnMiniMap.setLatLng(markerPosition);
            userMarker.setLatLng(markerPosition);
        });

        miniMap.on("click", newUserMarker);
    }


    const ownPositionMarker = L.icon({
        iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
        iconSize: [20, 40],
        iconAnchor: [10, 40]
    });

    if (updateMapLoc(false) === "smaland") {
        markerOnMiniMap = L.marker([57.309, 14.637], { icon: ownPositionMarker }).addTo(miniMap);
        userMarker = L.marker([57.309, 14.637], { icon: ownPositionMarker }).addTo(map); 
    } else {
        markerOnMiniMap = L.marker([57.0, 16.0], { icon: ownPositionMarker }).addTo(miniMap); 
        userMarker = L.marker([57.0, 16.0], { icon: ownPositionMarker }).addTo(map); 
    }

}

function newUserMarker(e) {
    userMarker.setLatLng(e.latlng);
    userMarker.addTo(map);

    latitude = e.latlng.lat;
    longitude = e.latlng.lng;
}

// Function that updates the position of the map with the geo-data
function updateMapLoc(success) {
    if (success) {
        userMarker.remove();
        userMarker = new L.marker([latitude, longitude], { icon: ownPositionMarker }).addTo(map);
        map.setView([latitude, longitude], zoom = 16);
        if (miniMap) {
            miniMap.setView([latitude, longitude], zoom = 16);
        }
    }
    
}


// Closes the small popup map
function closeMapDialog() {
    latitude = userMarker._latlng.lat
    longitude = userMarker._latlng.lng;
    map.setView([latitude, longitude], zoom = 16);
    const mapBox = document.querySelector("#map");
    const overlay = document.querySelector("#overlay");

    mapBox.style.display = "none";
    overlay.style.display = "none";
}
