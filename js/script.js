// Global variables
const smaland = {                 // Start position for the map
    name: "Småland",
    lat: 56.87767,
    lng: 14.80906,
    zoom: 9
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
    maxLatCorner: 57.835979,
    maxLngCorner: 13.372047,
    minLatCorner: 56.392624,
    minLngCorner: 15.526773
}
const olandBoundries = {
    maxLatCorner: 57.234476,
    maxLngCorner: 15.944010,
    minLatCorner: 56.136368,
    minLngCorner: 17.505087
}
const marker = L.Icon.extend({    // Definition of a marker with an image
    options: {
        iconSize: [30, 50],
        iconAnchor: [15, 50]
    }
});
const ownPositionMarker = L.icon({// Position marker for the users location
    iconUrl: "/mapIcons/mapOwnPosition.png",
    iconSize: [20, 40],
    iconAnchor: [10, 40]
});
const subTypes = ["&sub_types=", "A_LA_CARTE", "ASIAN", "BURGERS", "HOT_DOGS", "LATIN", "LOCAL", "MEDITERRANEAN", "PIZZA", "OTHER", "PASTRIES"]; // Array for all types
const types = ["&types=", "CASUAL", "ETHNIC", "FAST", "FINE_DINING"];                                                                            // Array for all subTypes 
const ApiKey = "vxJzsf1d";        // Api key for SMAPI

let restuarantMarkerArray = [];   // Array that stores all restaurant markers so they can be removed
let smalandButtonElem;            // Button elem for småland
let smalandRadioBtn;              // RadioBtn element for Småland
let olandButtonElem;              // Button elem for Öland
let olandRadioBtn;                // RadioBtn element for Öland
let miniMap;                      // Small map that pops up
let map;                          // Variable for the map
let latitude = smaland.lat;       // Latitude of Småland
let longitude = smaland.lng;      // Longitude of Småland
let radius = 1;                   // Radius for search fetch
let restaurantType = "";          // Type that will be searched for in SMAPI
let priceRange = "";              // Price range used for SMAPI fetch
let flag = false;                 // Flag for checking stickyHeader
let restaurantFlag = false;       // Flag that checks if there are restaurants or not
let userMarker;                   // Marker that places where the user clicks
let selectedDropdownContent;      // The selected element that the user clicked on
let loader;                       // Declaring variable for the div containing loader
let dropDownContentElem;          // All the button elements for the dropdown
let dropDownContentFirstChild;    // Array with all the first elements from the first dropdown elements
let markerOnMiniMap;              // The marker for the small map

// Init function
function init() {
    initMap("mapViewer");

    const searchButton = document.querySelector("#searchButton");
    const findBtnElem = document.querySelector("#findBtn");

    searchButton.addEventListener("click", fetchData);
    findBtnElem.addEventListener("click", getUserGeo);

    smalandButtonElem = document.querySelector("#smaland");
    smalandRadioBtn = document.querySelector("#smalandRadioBtn");
    smalandRadioBtn.checked = true;

    olandRadioBtn = document.querySelector("#olandRadioBtn");
    olandButtonElem = document.querySelector("#oland");
    olandRadioBtn.checked = false;
    olandButtonElem.classList.toggle("sortButtonsToggle");
    olandButtonElem.addEventListener("click", toggleSortButtons);

    userMarker = new L.marker([smaland.lat, smaland.lng], { icon: ownPositionMarker }).addTo(map);
    smalandRadioBtn.addEventListener("change", function () {
        if (this.checked) {
            olandRadioBtn.checked = false;
            userMarker.remove();
            userMarker = new L.marker([smaland.lat, smaland.lng], { icon: ownPositionMarker }).addTo(map);
            toggleSortButtons();
        }
    });

    olandRadioBtn.addEventListener("change", function () {
        if (this.checked) {
            smalandRadioBtn.checked = false;
            userMarker.remove();
            userMarker = new L.marker([oland.lat, oland.lng], { icon: ownPositionMarker }).addTo(map);
            toggleSortButtons();
        }
    });

    document.getElementById("mapBtn").addEventListener("click", openMapDialog);
    document.getElementById("closeButton").addEventListener("click", closeMapDialog);

    header = document.querySelector("#headerContainer");
    headerImg = document.querySelector("#headerContainer img");
    loader = document.querySelector("#loaderId");

    // Updates the contents of the drop-down menus with the selected option
    dropDownContentFirstChild = document.querySelectorAll(".dropDownContent");
    const dropDownContentOptions = document.querySelectorAll(".dropDownContent a");
    selectedDropdownContent = document.querySelectorAll(".dropDownContent a");
    for (let i = 0; i < dropDownContentOptions.length; i++) {
        dropDownContentOptions[i].addEventListener("click", handleClick);
    }

    const radiusDropdownElem = document.querySelector("#radius");
    for (let i = 0; i < radiusDropdownElem.children.length; i++) {
        radiusDropdownElem.children[i].addEventListener("click", () => setRadius(radiusDropdownElem.children[i].innerHTML));
    }
    const restaurantDropdownElem = document.querySelector("#restaurantType");
    for (let i = 0; i < restaurantDropdownElem.children.length; i++) {
        restaurantDropdownElem.children[i].addEventListener("click", () => setRestaurantType(restaurantDropdownElem.children[i].innerHTML));
    }
    const priceDropdownElem = document.querySelector("#price");
    for (let i = 0; i < priceDropdownElem.children.length; i++) {
        priceDropdownElem.children[i].addEventListener("click", () => setPriceRange(priceDropdownElem.children[i].innerHTML));
    }

    dropDownContentElem = document.querySelectorAll(".dropDownBtn");
    for (let i = 0; i < dropDownContentElem.length; i++) {
        dropDownContentElem[i].addEventListener("click", toggleDropdownMenu);
    }

    // When the fork and knife image is pressed it takes you to the search bar
    const forkNknife = document.querySelector("#forknknife");
    forkNknife.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
    updateMapLoc(false);
}
window.addEventListener("load", init);

// Function that toggles the two buttons
function toggleSortButtons() {
    updateMapLoc(false);

    olandButtonElem.classList.toggle("sortButtonsToggle");
    smalandButtonElem.classList.toggle("sortButtonsToggle");

    if (!olandButtonElem.classList.value) {
        latitude = smaland.lat;
        longitude = smaland.lng;

        smalandButtonElem.removeEventListener("click", toggleSortButtons);
        olandButtonElem.addEventListener("click", toggleSortButtons);
        updateMapLoc(Boolean = false);
    }
    else {
        latitude = oland.lat;
        longitude = oland.lng;

        olandButtonElem.removeEventListener("click", toggleSortButtons);
        smalandButtonElem.addEventListener("click", toggleSortButtons);
        updateMapLoc(Boolean = false);
    }
}