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

let latitude, longitude;

const smaland = {                 // Start position for the map
    name: "Småland",
    lat: 56.87767,
    lng: 14.80906,
    zoom: 12
}
const oland = {                   // Öland coordinates
    name: "Öland",
    lat: 56.6499,
    lng: 16.46859,
    zoom: 10
}
const boundries = {               // Const with min and max boundries for the map
    maxLatCorner: 56.018610,
    maxLngCorner: 17.472606,
    minLatCorner: 58.122646,
    minLngCorner: 13.061037
}


function init () {

    playBtn = document.querySelector("#playButton");
    playBtn.addEventListener("click", gameSettings);

    let mapBtn = document.querySelector("#mapBtn2");
    mapBtn.addEventListener("click", openMapDialog);

    let findBtn = document.querySelector("#findBtn2");
    findBtn.addEventListener("click", startGame);

    let mapPlayBtn =document.querySelector("#mapPlaybtn");
    mapPlayBtn.addEventListener("click", startGame);



}
window.addEventListener("load", init);



function gameSettings() {
    console.log("FGH")

    playBtn.style.display = "none";

    let selectBox = document.querySelector("#selectBox");
    selectBox.style.display = "flex";
}

function openMapDialog() {

     if (markerOnMiniMap !== undefined) {
        markerOnMiniMap.remove();
    }
    if (userMarker !== undefined) {
        userMarker.remove();
    }

    const mapBox = document.querySelector("#map");
    const overlay = document.querySelector("#overlay");

    mapBox.style.display = "block";
    mapBox.style.height = "60%";
    mapBox.style.width = "60%";


    overlay.style.display = "block";

    if (miniMap === undefined) {
        const mapBounds = L.latLngBounds(
            [boundries.minLatCorner, boundries.minLngCorner],
            [boundries.maxLatCorner, boundries.maxLngCorner]
        );

        miniMap = L.map('map', {
            center: [56.8770, 14.8090], // Växjös koordinater
            zoom: 13,
            minZoom: 8,
            maxZoom: 20,
            maxBounds: mapBounds,
            maxBoundsViscosity: 1,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);
        miniMap.on('click', function (event) {
            const markerPosition = event.latlng;
            markerOnMiniMap.setLatLng(markerPosition);
            userMarker.setLatLng(markerPosition);
        });
        miniMap.on("click", newUserMarker);
    }

    const ownPositionMarker = L.icon({
        iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
        iconSize: [24, 44],
        iconAnchor: [12, 44]
    });

   // Sätter Växjö som default
    markerOnMiniMap = L.marker([56.8770, 14.8090], { icon: ownPositionMarker }).addTo(miniMap);
    userMarker = new L.marker([56.8770, 14.8090], { icon: ownPositionMarker }).addTo(miniMap);

    let closeButton = document.querySelector("#closeButton");
    closeButton.addEventListener("click", function() {
        overlay.style.display = "none";
    });
}

// Sätter en ny markör på kartan
function newUserMarker(e) {
    if (userMarker) {
        userMarker.setLatLng(e.latlng);
        userMarker.addTo(miniMap);
    } else {
        userMarker = L.marker(e.latlng, {
            icon: L.icon({
                iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
                iconSize: [24, 44],
                iconAnchor: [12, 44]
            })
        }).addTo(miniMap);
    }
    
    const latitude = e.latlng.lat;
    const longitude = e.latlng.lng;
    console.log(`New marker set at latitude: ${latitude}, longitude: ${longitude}`);
}

function startGame() {

    overlay.style.display = "none";
    playBtn.style.display = "none";
    selectBox.style.display = "none";


    let gameBackground = document.querySelector("#boxBackground");
    gameBackground.style.display = "flex";
    console.log("SDFGH")

}

   
