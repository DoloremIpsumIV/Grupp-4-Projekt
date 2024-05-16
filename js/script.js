// Global variables
const smaland = {            // Start position for the map
    name: "Småland",
    lat: 56.87767,
    lng: 14.80906,
    zoom: 9
}
const oland = {              // Öland coordinates
    name: "Öland",
    lat: 56.6499,
    lng: 16.46859,
    zoom: 10
}
const boundries = {          // Const with min and max boundries for the map
    maxLatCorner: 56.018610,
    maxLngCorner: 17.472606,
    minLatCorner: 58.122646,
    minLngCorner: 13.061037
}
const marker = L.Icon.extend({     // Definition of a marker with an image
    options: {
        iconSize: [30, 50],
        iconAnchor: [15, 50]
    }
});
const subTypes = ["&sub_types=", "A_LA_CARTE", "ASIAN", "BURGERS", "HOT_DOGS", "LATIN", "LOCAL", "MEDITERRANEAN", "PIZZA", "OTHER", "PASTRIES"]; // Array for all types
const types = ["&types=", "CASUAL", "ETHNIC", "FAST", "FINE_DINING"];                                                                            // Array for all subTypes 
const ApiKey = "vxJzsf1d";  // Api key for SMAPI

let restuarantMarkerArray = []; // Array that stores all restaurant markers so they can be removed
let smalandButtonElem;            // Button elem for småland
let smalandCheckbox;              // Checkbox element for Småland
let olandButtonElem;              // Button elem for Öland
let olandCheckbox;                // Checkbox element for Öland
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

// Init function
function init() {
    initMap("mapViewer");

    const searchButton = document.querySelector("#searchButton");
    const findBtnElem = document.querySelector("#findBtn");

    searchButton.addEventListener("click", fetchData);
    findBtnElem.addEventListener("click", getUserGeo);

    smalandButtonElem = document.querySelector("#smaland");
    smalandCheckbox = document.querySelector("#smalandCheckbox");
    smalandCheckbox.checked = true;

    olandCheckbox = document.querySelector("#olandCheckbox");
    olandButtonElem = document.querySelector("#oland");
    olandCheckbox.checked = false;
    olandButtonElem.classList.toggle("sortButtonsToggle");
    olandButtonElem.addEventListener("click", toggleSortButtons);

    smalandCheckbox.addEventListener("change", function () {
        if (this.checked) {
            olandCheckbox.checked = false;
            toggleSortButtons();
        }
    });

    olandCheckbox.addEventListener("change", function () {
        if (this.checked) {
            smalandCheckbox.checked = false;
            toggleSortButtons();
        }
    });

    document.getElementById("mapBtn").addEventListener("click", openMapDialog);
    document.getElementById("closeButton").addEventListener("click", closeMapDialog);

    header = document.querySelector("#headerContainer");
    headerImg = document.querySelector("#headerContainer img");
    loader = document.querySelector("#loaderId");

    // Updates the contents of the drop-down menus with the selected option
    let dropDownContentOptions = document.querySelectorAll(".dropDownContent a");
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

    const dropDownContentElem = document.querySelectorAll(".dropDownBtn");
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

// Function that toggles the dropdown menu
function toggleDropdownMenu() {
    const dropdown = this.nextElementSibling;
    dropdown.classList.toggle("show");
    dropdown.classList.toggle("hide");

    const arrow = this.querySelector(".arrow");
    arrow.classList.toggle("rotate");

    closeOtherDropdowns(this);
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

            if (selectedElement.parentElement.lastChild.previousElementSibling == selectedElement) { // Very bad fix for making sure the last dropdown element becomes selected. (I don't know why but only the last <a> element doesn't work without this check)
                selectedElement.removeEventListener("click", handleClick);
                selectedElement.style.opacity = "0.5";
                selectedElement.style.backgroundColor = "DimGray";
                selectedElement.style.cursor = "default";
            }
        }
    });
}

// If you click anywhere outside the dropdown menu it will check and close the menu
document.addEventListener("click", function (event) {
    const dropdownButtons = document.querySelectorAll(".dropDownBtn");
    const targetElement = event.target;
    let clickedInsideDropdown = false;

    dropdownButtons.forEach(button => {
        if (button.contains(targetElement)) {
            clickedInsideDropdown = true;
        }
    });

    if (!clickedInsideDropdown) {
        closeDropdownMenu();
    }
});

//Function for closing the dropdown menu
function closeDropdownMenu() {
    const dropdowns = document.querySelectorAll(".dropDownContent");
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove("show");
        dropdown.classList.remove("hide");
    });

    const arrows = document.querySelectorAll(".arrow");
    arrows.forEach(arrow => {
        arrow.classList.remove("rotate");
    });
}

// Function that closes the dropdown menu if you click outside of it
function closeOtherDropdowns(clickedButton) {
    const dropdowns = document.querySelectorAll(".dropDownContent");
    dropdowns.forEach(dropdown => {
        if (dropdown.previousElementSibling !== clickedButton) {
            dropdown.classList.remove("show");
            dropdown.classList.add("hide");

            const arrow = dropdown.previousElementSibling.querySelector(".arrow");
            arrow.classList.remove("rotate");
        }
    });
}

// Function that defiens the value of the radius
function setRadius(value) {
    radius = value;
}

// Function that converts the input value of the dropdown to code that SMAPI understands
function setRestaurantType(value) {
    switch (value) {
        case value = "Alla":
            restaurantType = "";
            break;
        case value = "Pizzeria":
            restaurantType = subTypes[0] + subTypes[8];
            break;
        case value = "Asiatisk":
            restaurantType = subTypes[0] + subTypes[2];
            break;
        case value = "Etnisk":
            restaurantType = types[0] + types[2];
            break;
        case value = "Casual":
            restaurantType = types[0] + types[1];
            break;
        case value = "Snabb":
            restaurantType = types[0] + types[3];
            break;
        case value = "Lyx mat":
            restaurantType = types[0] + types[4];
            break;
        case value = "Burgare":
            restaurantType = subTypes[0] + subTypes[3];
            break;
        case value = "Varmkorvar":
            restaurantType = subTypes[0] + subTypes[4];
            break;
        case value = "Latin":
            restaurantType = subTypes[0] + subTypes[5];
            break;
        case value = "Lokalägd":
            restaurantType = subTypes[0] + subTypes[6];
            break;
        case value = "Medelhavs":
            restaurantType = subTypes[0] + subTypes[7];
            break;
        case value = "Annat":
            restaurantType = subTypes[0] + subTypes[9];
            break;
        case value = "Bakverk":
            restaurantType = subTypes[0] + subTypes[10];
            break;
    }
}

// Function that sets the pricerange of SMAPI fetch
function setPriceRange(value) {
    switch (value) {
        case "&gt;60 SEK":
            priceRange = "&max_avg_lunch_pricing=60";
            break;
        case "61-90 SEK":
            priceRange = "&max_avg_lunch_pricing=90&min_avg_lunch_pricing=61";
            break;
        case "91-119 SEK":
            priceRange = "&max_avg_lunch_pricing=119&min_avg_lunch_pricing=91";
            break;
        case "&lt;120 SEK":
            priceRange = "&min_avg_lunch_pricing=120";
            break;
        default:
            priceRange = "";
            break;
    }
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

    bounds = L.latLngBounds(L.latLng(boundries.maxLatCorner, boundries.maxLngCorner),
        L.latLng(boundries.minLatCorner, boundries.minLngCorner));
    map.setMaxBounds(bounds);

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
function newRestaurantMarker(lat, lng, urlType) {
    if (restaurantFlag == true) {
        for (let i = 0; i < restuarantMarkerArray.length; i++) {
            restuarantMarkerArray[i].remove();
        }
    }

    let restaurantMarker = new marker({ iconUrl: "/mapIcons/map" + urlType + ".png" });
    if (urlType == "OTHER" || urlType == "PASTRIES") {
        restaurantMarker = new marker({ iconUrl: "/mapIcons/mapLOCAL.png" });
    }
    restuarantMarkerArray.push(L.marker([lat, lng], { icon: restaurantMarker }).addTo(map));
    restaurantFlag = false;
}

// Function for gathering data regarding users position, it handles errors by displaying a warning for the user
function getUserGeo() {
    let successFlag = true;

    navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        updateMapLoc(successFlag);
    }, function (error) {
        if (error == "[object GeolocationPositionError]") {
            window.alert("Du kan klicka på [Välj placering på karta], klicka på kartan eller välja mellan Småland/Öland för att välja vart du vill se de närmsta resturangerna! \n\nDu kan också tillåta platsdelning på webbsidan igen om du vill hitta din position automatiskt.");
        }
        else {
            window.alert("Fel vid hämtning av geo position: " + error)
        }
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
        if (!olandButtonElem.classList.value) {
            map.setView([latitude, longitude], smaland.zoom);
        }
        else {
            map.setView([latitude, longitude], oland.zoom);
        }
    }
    userMarker = new L.marker([latitude, longitude]).addTo(map);
}

// Async function that collects restaurant data, it will handle errors by popping up a warning on the page
async function fetchData() {
    initLoader();

    let response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + "&controller=food&method=getFromLatLng&lat=" + latitude + "&lng=" + longitude + "&radius=" + radius + restaurantType + priceRange);
    if (response.ok) {
        let dataResponse = await response.json();
        showData(dataResponse);
    }
    else window.alert("Error during fetch: " + response.status + "\nHämtning av data fungerade inte, testa senare eller kontakta oss för hjälp", stopLoader());
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

    if (json.payload.length == 0) {
        restaurantContainer.innerHTML = "Inga resturanger kunde hittas med dessa alternativ, testa att sök på något annat!";
        restaurantContainer.classList.remove("restaurantSize");
        for (let i = 0; i < restuarantMarkerArray.length; i++) {
            restuarantMarkerArray[i].remove();
        }
    }
    else {
        restaurantContainer.removeChild(restaurantContainer.firstChild);
        restaurantContainer.innerHTML = "";
        const jsonArray = json.payload;
        const elementBuilder = new ElementConstructor(jsonArray);                 // Object that is used to construct elements on website

        for (let i = 0; i < jsonArray.length; i++) {                              // Loop that constructs elements on page
            newRestaurantMarker(jsonArray[i].lat, jsonArray[i].lng, jsonArray[i].sub_type);

            const listElements = document.createElement("div");
            listElements.appendChild(elementBuilder.renderElement(i));
            listElements.id = "restaurantCard";

            restaurantContainer.appendChild(listElements);
        }
        restaurantFlag = true;
    }
    stopLoader();

    restaurantContainer.classList.add("restaurantSize");
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

        for (let i = 0; i < propertyToShow.length; i++) {
            const property = String(propertyToShow[i]);
            if (property == "sub_type") {
                if (this.data[distanceIndex][property] == "OTHER") {
                    imgElement.src = "/mapIcons/PASTRIES.png";
                }
                else {
                    imgElement.src = "/mapIcons/" + this.data[distanceIndex][property] + ".png";
                }
            }
        }

        divElement.appendChild(imgElement);
        divElement.appendChild(titleElement);
        fragment.appendChild(divElement);

        const secondDivElement = document.createElement("div");
        secondDivElement.classList.add("restaurantCardFlex");
        secondDivElement.style.display = "block";

        for (let i = 0; i < propertyToShow.length; i++) {                                        // This loop will display all the elements in the restuarant cards, it checks the raw data to display it differently
            const property = String(propertyToShow[i]);
            const paragraphElement = document.createElement("p");
            const secondImageElement = document.createElement("img");
            const parsedNumber = parseFloat((this.data[distanceIndex][property]).toString());

            if (this.data[distanceIndex][property] == "N" || this.data[distanceIndex][property] == "Y") {   // This will check if the current data is "Y" or "N", which will make it into a cross or check
                if (this.data[distanceIndex][property] == "N") {
                    secondImageElement.src = "/images/Cross.png";
                }
                else {
                    secondImageElement.src = "/images/Check.png";
                }
                secondImageElement.classList = "crossAndCheck";
                paragraphElement.innerText = property.charAt(0).toUpperCase() + property.slice(1).replace(/_/g, " ") + ": ";
                paragraphElement.appendChild(secondImageElement);
            }

            else if (property == "avg_lunch_pricing") {   // This will check if the data is avgerage lunch pricing, it will compare the numbers and give it one to three dollars depening on set amounts
                const dollar = document.createElement("p");
                dollar.style.display = "inline";
                dollar.style.textShadow = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000";
                paragraphElement.innerText = property.charAt(0).toUpperCase() + property.slice(1).replace(/_/g, " ") + ": " + parsedNumber + " ";
                switch (this.#compare(this.data[distanceIndex][property])) {
                    case 1:
                        dollar.style.color = "green";
                        dollar.innerText = " $";
                        break;
                    case 2:
                        dollar.style.color = "yellow";
                        dollar.innerText = " $$";
                        break;
                    case 3:
                        dollar.style.color = "red";
                        dollar.innerText = " $$$";
                        break;
                }
                paragraphElement.appendChild(dollar);
            }

            else if (property == "rating") {   // This will check if the data is a rating, it will then check the first number to loop the amount of stars needed, if the second number (decimal) is 5 or above it will display a half star on the end
                paragraphElement.innerText = property.charAt(0).toUpperCase() + property.slice(1).replace(/_/g, " ") + ": ";
                const digit = Math.floor((this.data[distanceIndex][property]) * 10) / 10;
                const secondDigit = Math.floor((this.data[distanceIndex][property] * 10) % 10);

                for (let i = 1; i < digit; i++) {
                    paragraphElement.appendChild(this.#starBuilder(false));
                }
                if (secondDigit >= 5) {
                    paragraphElement.appendChild(this.#starBuilder(true));
                }
                else if (secondDigit == 0) {
                    paragraphElement.appendChild(this.#starBuilder(false));
                }
            }

            else {
                if (parsedNumber) {   // If the data is just a number, like distance to target, it will display it in a readable format and with a max of three decimals
                    paragraphElement.innerText = property.charAt(0).toUpperCase() + property.slice(1).replace(/_/g, " ") + ": " + Math.round((parsedNumber + Number.EPSILON) * 100) / 100
                }
                else {   // This will simply display the raw text in a more readable format, it cleans it up basically
                    paragraphElement.innerText = property.charAt(0).toUpperCase() + property.slice(1).replace(/_/g, " ") + ": " + this.data[distanceIndex][property].charAt(0).toUpperCase() + this.data[distanceIndex][property].slice(1).replace(/_/g, " ").toLowerCase();
                }
            }
            secondDivElement.appendChild(paragraphElement);
            fragment.appendChild(secondDivElement);
        }
        return fragment;
    }

    #compare(number) {                  // Method that compares a number to see if it's below 60, between 60 and 90, or above 90 for different price ranges
        this.numberArray = [60, 90];
        if (number <= this.numberArray[0]) {
            return 1;
        }
        else if (number <= this.numberArray[1]) {
            return 2;
        }
        else if (number >= this.numberArray[1]) {
            return 3;
        }
    }

    #starBuilder(halfStarExists) {      // Method that creates a star image whenever called and if halfStarExists is false, if it's true it ads a half star
        const star = document.createElement("img");
        const halfStar = document.createElement("img");

        star.src = "/images/wholeStar.png";
        star.classList = "star";
        halfStar.src = "/images/halfStar.png";
        halfStar.classList = "star";

        if (halfStarExists == true) {
            return halfStar;
        }
        else {
            return star;
        }
    }
}


// Opens the small popup map
function openMapDialog() {
    const mapBox = document.querySelector("#map");
    const overlay = document.querySelector("#overlay");

    mapBox.style.display = "block";
    overlay.style.display = "block";

    if (document.querySelector("#smalandCheckbox").checked) {
        selectedProvince = smaland;
    } else if (document.querySelector("#olandCheckbox").checked) {
        selectedProvince = oland;
    }

    // Creates a mini popup map for the chosen lat and lng
    if (miniMap === undefined) {
        miniMap = L.map('map').setView([selectedProvince.lat, selectedProvince.lng], selectedProvince.zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);
    }
}

// Closes the small popup map
function closeMapDialog() {
    const mapBox = document.querySelector("#map");
    const overlay = document.querySelector("#overlay");

    mapBox.style.display = "none";
    overlay.style.display = "none";
}

