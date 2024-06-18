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

let availableImages; // Håller koll på vilka bilder som använts

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

    let firstBoxInside = document.querySelector("#firstBox .insideBox");
    let secondBoxInside = document.querySelector("#secondBox .insideBox");

    let firstBox = document.querySelector("#firstBox");
    let secondBox = document.querySelector("#secondBox");

    firstBox.addEventListener("click", newImage);
    secondBox.addEventListener("click", newImage);

    availableImages = [...imagesUsed]



    let notSameImage = twoNotSameImages(availableImages);

    firstBoxInside.innerHTML = `<img src="${imageFolder}/${notSameImage[0]}" alt="Random Image 1">`;
    secondBoxInside.innerHTML = `<img src="${imageFolder}/${notSameImage[1]}" alt="Random Image 2">`;

}

function twoNotSameImages(imagesArray) {

    let firstImage = Math.floor(Math.random() * imagesArray.length);

    let secondImage;
    do {
        secondImage = Math.floor(Math.random() * imagesArray.length);
    } while (secondImage === firstImage);

    return [imagesArray[firstImage], imagesArray[secondImage]];
}

function newImage() {

    let firstBox = document.querySelector("#firstBox .insideBox img").src.split('/').pop();
    let secondBox = document.querySelector("#secondBox .insideBox img").src.split('/').pop();

    availableImages = availableImages.filter(image => image !== firstBox && image !== secondBox);

    if (availableImages.length === 0) {
        endGame();
        return;
    }

    if (this.id === "firstBox") {
        let newImage = getNewImage(secondBox);
        document.querySelector("#secondBox .insideBox").innerHTML = `<img src="${imageFolder}/${newImage}" alt="Random Image">`;
    } else if (this.id === "secondBox") {
        let newImage = getNewImage(firstBox);
        document.querySelector("#firstBox .insideBox").innerHTML = `<img src="${imageFolder}/${newImage}" alt="Random Image">`;
    }  
   
}

function getNewImage(currentImage) {
    let newImage;
    do {
        newImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    } while (newImage === currentImage);
    return newImage;
}

function endGame() {
    let gameBackground = document.querySelector("#boxBackground");
    gameBackground.style.display = "none";

    let resultPage = document.querySelector("#endGame");
    endGamePage.style.display = "flex";

}



   
