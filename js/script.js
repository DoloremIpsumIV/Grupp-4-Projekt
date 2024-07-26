// Global variables
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
const smalandBoundries = {
    maxLatCorner: 58.135979,
    maxLngCorner: 13.272047,
    minLatCorner: 56.392624,
    minLngCorner: 16.826773
}
const olandBoundries = {
    maxLatCorner: 57.234476,
    maxLngCorner: 15.944010,
    minLatCorner: 56.136368,
    minLngCorner: 17.505087
}
const marker = L.Icon.extend({    // Definition of a marker with an image
    options: {
        iconSize: [34, 54],
        iconAnchor: [17, 54]
    }
});
const ownPositionMarker = L.icon({// Position marker for the users location
    iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
    iconSize: [24, 44],
    iconAnchor: [12, 44],
    zIndexOffset: 1000
});
const subTypes = ["&sub_types=", "A_LA_CARTE", "ASIAN", "BURGERS", "HOT_DOGS", "LATIN", "LOCAL", "MEDITERRANEAN", "PIZZA", "OTHER", "PASTRIES"]; // Array for all types
const types = ["&types=", "CASUAL", "ETHNIC", "FAST", "FINE_DINING"];                                                                            // Array for all subTypes 
const ApiKey = "vxJzsf1d";                     // Api key for SMAPI
const controller = new AbortController();      // Creates a controller object that can cancel async fetches from SMAPI
const signal = controller.signal;              // Links the controller object with the beforeunload event listener to be able to abort it
const foodMap = new Map();                     // A map with all the food restaurants that have the id searched for them
const establishmentMap = new Map();            // A map with all establishments that can be retrieved with the correct id as the key
const currentWindow = (window.location.pathname).split('/').pop(); // Const that saves the current window to avoid conflicting init

let restuarantMarkerArray = [];     // Array that stores all restaurant markers so they can be removed
let smalandButtonElem;              // Button elem for småland
let smalandRadioBtn;                // RadioBtn element for Småland
let olandButtonElem;                // Button elem for Öland
let olandRadioBtn;                  // RadioBtn element for Öland
let miniMap;                        // Small map that pops up
let map;                            // Variable for the map
let latitude = smaland.lat;         // Latitude of Småland
let longitude = smaland.lng;        // Longitude of Småland
let restaurantFlag = false;         // Flag that checks if there are restaurants or not
let userMarker;                     // Marker that places where the user clicks
let selectedDropdownContent;        // The selected element that the user clicked on
let loader;                         // Declaring variable for the div containing loader
let markerOnMiniMap;                // The marker for the small map
let restaurant;                     // A map with all the data of the two fetches combined into one object with it's id as a key
let province = "&provinces=Småland";// province that will determine if it's småland or öland in SMAPI search
let sorting;                        // Variable with the sorting parameter for SMAPI
let restaurantType;                 // Variable with the type of restarant for SMAPI
let radius;                         // Variable with the radius amount for SMAPI
let priceRange;                     // Variable with the set price range for SMAPI

window.addEventListener("beforeunload", () => {
    controller.abort();
});

// Init function for all different init websites
function init() {
    if (currentWindow === "" || currentWindow.includes("index")) {
        initMap("mapViewer");

        const searchButton = document.querySelector("#searchButton");
        const findBtnElem = document.querySelector("#findBtn");
        const trashElement = document.querySelector("#searchResultTrash");

        searchButton.addEventListener("click", () => fetchData());
        findBtnElem.addEventListener("click", getUserGeo);
        trashElement.addEventListener("click", resetSearch)
        document.querySelector("#sort").addEventListener("change", () => fetchData());

        smalandButtonElem = document.querySelector("#smaland");
        smalandRadioBtn = document.querySelector("#smalandRadioBtn");
        smalandRadioBtn.checked = true;

        olandRadioBtn = document.querySelector("#olandRadioBtn");
        olandButtonElem = document.querySelector("#oland");
        olandRadioBtn.checked = false;
        olandButtonElem.classList.toggle("sortButtonsToggle");
        olandButtonElem.addEventListener("click", toggleSortButtons);

        userMarker = new L.marker([smaland.lat, smaland.lng], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(map);
        smalandRadioBtn.addEventListener("change", function () {
            if (this.checked) {
                province = "&provinces=Småland";
                olandRadioBtn.checked = false;
                userMarker.remove();
                userMarker = new L.marker([smaland.lat, smaland.lng], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(map);
                latitude = smaland.lat;
                longitude = smaland.lng;
                toggleSortButtons();
            }
        });

        olandRadioBtn.addEventListener("change", function () {
            if (this.checked) {
                province = "&provinces=Öland";
                smalandRadioBtn.checked = false;
                userMarker.remove();
                userMarker = new L.marker([oland.lat, oland.lng], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(map);
                latitude = oland.lat;
                longitude = oland.lng;
                toggleSortButtons();
            }
        });

        document.getElementById("closeButton").addEventListener("click", closeMapDialog);
        document.getElementById("mapBtn").addEventListener("click", openMapDialog);
        loader = document.querySelector("#loaderId");

        // When the fork and knife image is pressed it takes you to the search bar
        const forkNknife = document.querySelector("#forknknife");
        forkNknife.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
    else if (currentWindow.includes("geo")) {
        initGeoMatch();
    } else if (currentWindow.includes("favoriter")) {
        loader = document.querySelector("#loaderId");
        initLoadSaved();
    }
    else if (currentWindow.includes("alla")){
        initAllRestaurants();
    }
}
window.addEventListener("load", init);

// Function that toggles the two buttons
function toggleSortButtons() {
    olandButtonElem.classList.toggle("sortButtonsToggle");
    smalandButtonElem.classList.toggle("sortButtonsToggle");

    if (!olandButtonElem.classList.value) {
        latitude = smaland.lat;
        longitude = smaland.lng;

        smalandButtonElem.removeEventListener("click", toggleSortButtons);
        olandButtonElem.addEventListener("click", toggleSortButtons);
    }
    else {
        latitude = oland.lat;
        longitude = oland.lng;

        olandButtonElem.removeEventListener("click", toggleSortButtons);
        smalandButtonElem.addEventListener("click", toggleSortButtons);
    }
    updateMapLoc(false);
}

function resetSearch() {
    window.location.reload();
}