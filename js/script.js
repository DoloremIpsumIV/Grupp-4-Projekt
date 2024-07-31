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
const smalandBoundries = {        // Const with min and max boundries for Småland
    maxLatCorner: 58.135979,
    maxLngCorner: 13.272047,
    minLatCorner: 56.392624,
    minLngCorner: 16.826773
}   
const olandBoundries = {          // Const with min and max boundries for Öland
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
const currentWindow = (window.location.pathname).split("/").pop(); // Const that saves the current window to avoid conflicting init

let restuarantMarkerArray = [];     // Array that stores all restaurant markers so they can be removed
let smalandButtonElem;              // Button elem for småland
let idPosition = new Map();         // Map that has the positions of the restaurants on favorites page
let cleanedIds;                     // Array with all the id's for the restaurants
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

        let trashCan = document.querySelector("#searchResultTrash");

        trashCan.addEventListener("mouseenter", function () {
            trashCan.src = "/images/soptunnaOpen.svg";
        });

        trashCan.addEventListener("mouseleave", function () {
            trashCan.src = "/images/soptunna.svg";
        });

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
    else if (currentWindow.includes("alla")) {
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

// Resets search by reloading web page
function resetSearch() {
    window.location.reload();
}

// fetches the stored data from local storage
function fetchStoredData() {
    const storedData = localStorage.getItem("idPosition");
    if (storedData) {
        if (JSON.parse(storedData).length > 0) {
            idPosition = new Map(JSON.parse(storedData));
        }
    }
}

// Cleans up and recieves the id"s in an array from local storage
function getRestaurantIds() {
    let restaurantIds = JSON.parse(localStorage.getItem("savedRestaurant"));
    cleanedIds = restaurantIds.map(id => id.replace(/r/, ""));
}

// Removes the selected restaurant based of the give id from the parameter
function removeRestaurant(id) {
    idPosition.delete(id);
    const index = cleanedIds.indexOf(id);
    if (index !== -1) {
        cleanedIds.splice(index, 1);
    }

    if (cleanedIds.length > 0) {
        localStorage.setItem("savedRestaurant", JSON.stringify(cleanedIds));
    } else {
        localStorage.removeItem("savedRestaurant");
    }

    if (idPosition.size > 0) {
        localStorage.setItem("idPosition", JSON.stringify(Array.from(idPosition.entries())));
    } else {
        localStorage.removeItem("idPosition");
    }
}
// ---------- SMAPI DataFetcher code following ----------

// Function that defiens the value of the radius
function setRadius(value) {
    switch (value) {
        case "1 KM":
            return "1";
        case "3 KM":
            return "3";
        case "5 KM":
            return "5";
        case "10 KM":
            return "10";
        default:
            return "1";
    }
}

// Function that converts the input value of the dropdown to code that SMAPI understands
function setRestaurantType(value) {
    switch (value) {
        case "Alla Restauranger":
            return "";
        case "Pizzeria":
            return subTypes[0] + subTypes[8];
        case "Asiatisk":
            return subTypes[0] + subTypes[2];
        case "Etnisk":
            return types[0] + types[2];
        case "Casual":
            return types[0] + types[1];
        case "Snabb":
            return types[0] + types[3];
        case "A la carte":
            return types[0] + types[4];
        case "Burgare":
            return subTypes[0] + subTypes[3];
        case "Varmkorvar":
            return subTypes[0] + subTypes[4];
        case "Latin":
            return subTypes[0] + subTypes[5];
        case "Lokalägd":
            return subTypes[0] + subTypes[6];
        case "Medelhavs":
            return subTypes[0] + subTypes[7];
        case "Annat":
            return subTypes[0] + subTypes[9];
        case "Bakverk":
            return subTypes[0] + subTypes[10];
        default:
            return "";
    }
}

// Function that sets the pricerange of SMAPI fetch
function setPriceRange(value) {
    switch (value) {
        case ">60 SEK":
            return "&max_avg_lunch_pricing=60";
        case "61-90 SEK":
            return "&max_avg_lunch_pricing=90&min_avg_lunch_pricing=61";
        case "91-119 SEK":
            return "&max_avg_lunch_pricing=119&min_avg_lunch_pricing=91";
        case "<120 SEK":
            return "&min_avg_lunch_pricing=120";
        default:
            return "";
    }
}

// Function that sets the sorting order for SMAPI fetch
function setSortingOrder(value, fetchType) {
    if (fetchType == "establishment") {
        switch (value) {
            case "rating":
                return "&sort_in=DESC&order_by=rating"
            default:
                return "&sort_in=DESC&order_by=distance_in_km"
        }
    }
    else {
        switch (value) {
            case "student_discount":
                return "&sort_in=ASC&order_by=student_discount"
            case "rating":
                return "&sort_in=DESC&order_by=rating"
            case "price_rangeDESC":
                return "&sort_in=ASC&order_by=avg_lunch_pricing"
            case "price_rangeASC":
                return "&sort_in=DESC&order_by=avg_lunch_pricing"
            default:
                return "&sort_in=DESC&order_by=distance_in_km"
        }
    }
}

// Async function that collects restaurant data, it will handle errors by popping up a warning on the page, also can cancel async fetch requests
async function fetchData() {
    try {
        let response;   // SMAPI data response
        sorting = "";
        radius = "";

        foodMap.clear();
        establishmentMap.clear();
        initLoader();

        if (currentWindow.includes("geo")) {
            province = "";
            response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}&controller=establishment&types=food&method=getAll`, { signal });
        }

        else if (currentWindow === "" || currentWindow.includes("index")) {

            sorting = setSortingOrder(document.querySelector("#sort").value, "establishment");
            radius = setRadius(document.querySelector("#distance").firstElementChild.value);

            document.querySelector("#searchedRestaurant").innerHTML = document.querySelector("#restaurantType").firstElementChild.value + ",";
            document.querySelector("#searchedDistance").innerHTML = document.querySelector("#distance").firstElementChild.value + ",";
            document.querySelector("#searchedPrice").innerHTML = document.querySelector("#priceRange").firstElementChild.value + ",";
            document.querySelector("#searchedProvince").innerHTML = province.replace("&provinces=", "");

            response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}${sorting}&controller=establishment&types=food&method=getFromLatLng&lat=${latitude}&lng=${longitude}&radius=${radius}${province}`, { signal });
        } else if (currentWindow.includes("favoriter")) {
            response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}&controller=establishment&types=food&method=getAll&ids=${cleanedIds}`, { signal });
        }

        if (response.ok) {
            const dataResponse = await response.json();
            if (currentWindow === "" || currentWindow.includes("index")) {
                const container = document.getElementById("restaurantInfo");
                container.innerText = "";

                if (dataResponse.payload.length === 0) {
                    container.innerHTML = "Inga restauranger kunde hittas med dessa alternativ, testa att sök på något annat, eller välj en annan provins!";
                    container.classList.remove("restaurantSize");

                    for (let i = 0; i < restuarantMarkerArray.length; i++) {
                        restuarantMarkerArray[i].remove();
                    }
                }
            }

            dataResponse.payload.forEach(obj => {
                if (!foodMap.has(obj.id)) {
                    foodMap.set(obj.id, obj);
                }
            });

            await getFoodData();
            restaurant = combineRestaurantData(establishmentMap, foodMap);
            restaurant.forEach(object => {
                createCard(object);
            });

            if (currentWindow === "" || currentWindow.includes("index")) {
                restaurantFlag = true;
                document.querySelector("#mapBtn").scrollIntoView();
                updateMapLoc();
            }

            stopLoader();
            toggleHeartImg();
        }
        else window.alert(`Error during fetch: ${response.status}
Hämtning av data fungerade inte, testa senare eller kontakta oss för hjälp`, stopLoader());
    }
    catch (error) {
        if (error.name === "AbortError") {
            console.log("Fetch aborted");
        } else {
            console.error("Fetch error:", error);
        }
    }
}

// Async function that saves all food data in a map with the correct id, it will abort the fetch request if the page is closed or reloaded
async function getFoodData() {
    try {
        let response;   // SMAPI data response
        sorting = "";
        radius = "";
        priceRange = "";
        restaurantType = "";
        let id = "&ids=";
        foodMap.forEach(restaurant => {
            id += `${restaurant.id},`;
        });
        id = id.slice(0, -1);

        if (currentWindow.includes("geo")) {
            restaurantType = setRestaurantType(imageNames[lastClickedImage]);
            response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}&sort_in=DESC&order_by=distance_in_km&controller=food&method=getFromLatLng&lat=${latitude}${id}&lng=${longitude}&radius=1000${restaurantType}`, { signal });
        }
        else if (currentWindow === "" || currentWindow.includes("index")) {
            sorting = setSortingOrder(document.querySelector("#sort").value, "");
            restaurantType = setRestaurantType(document.querySelector("#restaurantType").firstElementChild.value);
            radius = setRadius(document.querySelector("#distance").firstElementChild.value);
            priceRange = setPriceRange(document.querySelector("#priceRange").firstElementChild.value);
            response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}${sorting}&controller=food&method=getFromLatLng&lat=${latitude}&${id}&lng=${longitude}&radius=${radius}${restaurantType}${priceRange}`, { signal });
        } else if (currentWindow.includes("favoriter")) {
            province = "";
            response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}&controller=food&method=getAll&ids=${cleanedIds}`, { signal });
        }

        if (response.ok) {
            const dataResponse = await response.json();
            if (currentWindow === "" || currentWindow.includes("index")) {
                const container = document.getElementById("restaurantInfo");
                container.innerText = "";

                if (dataResponse.payload.length === 0) {
                    container.innerHTML = "Inga restauranger kunde hittas med dessa alternativ, testa att sök på något annat, eller välj en annan provins!";
                    container.classList.remove("restaurantSize");

                    for (let i = 0; i < restuarantMarkerArray.length; i++) {
                        restuarantMarkerArray[i].remove();
                    }
                }
            }

            dataResponse.payload.forEach(obj => {
                if (!establishmentMap.has(obj.id)) {
                    establishmentMap.set(obj.id, obj);
                }
            });
        }
        else window.alert(`Error during fetch: ${response.status}
    Hämtning av data fungerade inte, testa senare eller kontakta oss för hjälp`, stopLoader());
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Fetch aborted");
        } else {
            console.error("Fetch error:", error);
        }
    }
}

// Function that adds CSS-class in order to show loader
function initLoader() {
    loader ? loader.classList.add("show") : "";
}

// Function that removes CSS-class in order to hide loader
function stopLoader() {
    loader ? loader.classList.remove("show") : "";
}

// Function that saves the id of the restaurant to local storage
function saveRestaurant(listElement) {
    const restaurantId = listElement.firstElementChild.id.startsWith("#") ? listElement.firstElementChild.id.slice(1) : listElement.firstElementChild.id.id;
    const savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];

    if (!savedRestaurant.includes(restaurantId)) {
        savedRestaurant.push(restaurantId);
        const position = 0;
        fetchStoredData();
        idPosition.set(restaurantId.substring(1), position);
        localStorage.setItem("idPosition", JSON.stringify(Array.from(idPosition.entries())));
        localStorage.setItem("savedRestaurant", JSON.stringify(savedRestaurant));
    }
}

// Toggles the heart img on restaurant cards
function toggleHeartImg() {
    if (currentWindow === "" || currentWindow.includes("index") || currentWindow.includes("geo") || currentWindow.includes("favoriter")) {
        const saveBtns = document.querySelectorAll(".saveBtnIndex");
        saveBtns.forEach(saveBtn => {
            saveBtn.addEventListener("click", function () {
                if (this.src.includes("/images/emptyHeart.svg")) {
                    this.src = "/images/filledHeart.svg";
                    saveRestaurant(this.parentNode.parentNode);
                } else {
                    this.src = "/images/emptyHeart.svg";
                    getRestaurantIds();
                    removeRestaurant(this.parentNode.parentNode.firstElementChild.id.substring(2));
                    if (currentWindow.includes("favoriter")) {
                        loadCards();
                    }
                }
            });
            if (currentWindow.includes("favoriter")) {
                saveBtn.addEventListener("touchstart", function () {
                    getRestaurantIds();
                    removeRestaurant(this.parentNode.parentNode.firstElementChild.id.substring(2));
                    if (currentWindow.includes("favoriter")) {
                        loadCards();
                    }
                });
            }
        });
    }
}
// ---------- RestaurantCardMaker code following ----------

// Function that takes the two Map:s and combines them if they have the same id
function combineRestaurantData(map1, map2) {
    const combinedMap = new Map();
    map1.forEach((value, key) => {
        if (map2.has(key)) {
            combinedMap.set(key, { ...value, ...map2.get(key) });
        }
    });
    return combinedMap;
}

// Function that creates each card on the webbsite
function createCard(obj) {
    const listElements = document.createElement("div");
    listElements.classList.add("restaurantCard");
    if (currentWindow === "" || currentWindow.includes("index")) {
        listElements.appendChild(displayCardFlex(obj.id));
        listElements.addEventListener("click", () => popup(obj));
        listElements.style.cursor = "pointer";
        newRestaurantMarker(obj.lat, obj.lng, obj.sub_type, obj.id, obj);
    }

    if (currentWindow === "" || currentWindow.includes("index") || currentWindow.includes("geo")) {
        const container = document.getElementById("restaurantInfo");
        container.appendChild(listElements);
        container.classList.add("restaurantSize");
    }
    if (currentWindow.includes("geo")) {
        listElements.appendChild(displayCardFlex(obj.id));
    }
    if (currentWindow.includes("favoriter")) {
        listElements.draggable = true;
        currentContainer = document.getElementById(`box${idPosition.get(obj.id)}`);
        listElements.appendChild(displayCardFlex(obj.id));

        currentContainer.appendChild(listElements);
        currentContainer.classList.add("restaurantSize");
    }
}

// Function that will display a restaurant card aslong as the restaurant id exists in the restaurant map
function displayCardFlex(restuarantId) {
    if (restuarantId == undefined) {
        return;
    }
    const restaurantObject = restaurant.get(restuarantId.toString());
    const fragment = new DocumentFragment();

    const divElement = document.createElement("div");
    const secondDivElement = document.createElement("div");
    const imgElement = document.createElement("img");
    const titleElement = document.createElement("h2");
    const saveBtn = document.createElement("img");

    fetchStoredData();
    if (idPosition.get(restaurantObject.id) >= 0) {
        saveBtn.src = "/images/filledHeart.svg";
        if (currentWindow.includes("favoriter")) {
            saveBtn.src = "/images/soptunna.svg";
            saveBtn.classList.add("TrashCan");
        }
    }
    else {
        saveBtn.src = "/images/emptyHeart.svg";
    }

    saveBtn.classList.add("saveBtnIndex");
    saveBtn.style.cursor = "pointer";

    divElement.classList.add("restaurantCardFlex");
    divElement.id = "#r" + restaurantObject.id;

    secondDivElement.classList.add("restaurantCardFlex");
    secondDivElement.style.display = "block";

    imgElement.id = "picture";
    imgElement.src = `/mapIconsSVG/${restaurantObject.sub_type}.svg`;

    titleElement.id = "restaurantName";
    titleElement.innerText = restaurantObject.name;

    divElement.appendChild(imgElement);
    divElement.appendChild(titleElement);
    divElement.appendChild(saveBtn);

    fragment.appendChild(divElement);

    const displayValues = ["student_discount", "rating", "distance_in_km", "phone_number", "website", "abstract", "text", "avg_lunch_pricing", "sub_type", "address", "city"];

    Object.entries(restaurantObject).forEach(([key, value]) => {
        if (displayValues.includes(key) && value != "") {
            const paragraphElement = document.createElement("p");
            switch (key) {
                case "avg_lunch_pricing":
                    const dollar = document.createElement("p");
                    dollar.style.display = "inline";
                    dollar.style.textShadow = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000";
                    switch (compare(value)) {
                        case 1:
                            dollar.style.color = "green";
                            dollar.innerText = "$";
                            break;
                        case 2:
                            dollar.style.color = "yellow";
                            dollar.innerText = "$$";
                            break;
                        case 3:
                            dollar.style.color = "red";
                            dollar.innerText = "$$$";
                            break;
                    }
                    paragraphElement.style.display = "inline";
                    paragraphElement.style.marginLeft = "0";
                    paragraphElement.style.fontSize = "23px";
                    paragraphElement.appendChild(dollar);
                    secondDivElement.prepend(paragraphElement);
                    break;

                case "rating":
                    const digit = Math.floor((value) * 10) / 10;
                    const secondDigit = Math.floor((value * 10) % 10);
                    paragraphElement.style.display = "inline";
                    paragraphElement.style.padding = "10px 10px 0px 10px"
                    for (let i = 1; i < digit; i++) {
                        paragraphElement.appendChild(starBuilder(false));
                    }
                    if (secondDigit >= 5) {
                        paragraphElement.appendChild(starBuilder(true));
                    }
                    else if (secondDigit == 0) {
                        paragraphElement.appendChild(starBuilder(false));
                    }

                    secondDivElement.prepend(paragraphElement);
                    break;

                case "distance_in_km":
                    paragraphElement.style.display = "inline";
                    paragraphElement.style.padding = "10px 10px 0px 10px";
                    paragraphElement.style.marginTop = "13px";
                    if (value >= 1) {
                        paragraphElement.innerText = `${value.toFixed(2)} km bort`;
                    } else {
                        paragraphElement.innerText = `${(value * 1000).toFixed(0)} meter bort`;
                    }

                    secondDivElement.prepend(paragraphElement);
                    break;

                case "website":
                    const linkElement = document.createElement("a");
                    linkElement.href = value;
                    linkElement.innerText = `Länk till: ${restaurantObject.name}`

                    secondDivElement.appendChild(linkElement);
                    break;

                case "student_discount":
                    const studentDiscountImage = document.createElement("img");
                    if (value == "N") {
                        studentDiscountImage.src = "/images/noStudentDiscount.svg";
                    }
                    else {
                        studentDiscountImage.src = "/images/studentDiscount.svg";
                    }
                    studentDiscountImage.classList.add("studentDiscount");
                    studentDiscountImage.style.width = "initial";
                    paragraphElement.appendChild(studentDiscountImage);
                    secondDivElement.prepend(paragraphElement);
                    break;

                case "city":
                    paragraphElement.style.margin = "initial";
                case "address":
                    key === "address" ? paragraphElement.innerHTML = `${value}, ` : paragraphElement.innerHTML = `${value}`;
                    paragraphElement.style.display = "inline";
                    secondDivElement.appendChild(paragraphElement);
                    break;

                case "sub_type":
                    paragraphElement.innerText = `${value.replace(/_/g, " ").toLowerCase().charAt(0).toUpperCase() + value.replace(/_/g, " ").toLowerCase().slice(1)}`;
                    secondDivElement.appendChild(paragraphElement);
                    break;

                default:
                    paragraphElement.innerText = `${value}`;
                    secondDivElement.appendChild(paragraphElement);
                    fragment.appendChild(secondDivElement);
                    break;
            }
        }
    });
    return fragment;
}

// Function that takes a number to check if it's below 60, between 60 and 90, or above 90 for different price ranges
function compare(number) {
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

// Function that creates a star image whenever called and if halfStarExists is false. If it's true it ads a half star
function starBuilder(halfStarExists) {
    const star = document.createElement("img");
    const halfStar = document.createElement("img");

    star.src = "/images/wholeStar.svg";
    star.classList = "star";
    halfStar.src = "/images/halfStar.svg";
    halfStar.classList = "star";

    if (halfStarExists == true) {
        return halfStar;
    }
    else {
        return star;
    }
}
// ---------- MapLogic code following ----------

// Function for initiation of the map
function initMap(id) {
    map = L.map(id).setView([smaland.lat, smaland.lng], 9);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        minZoom: 8,
        maxZoom: 18,
        maxBoundsViscosity: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    bounds = L.latLngBounds(L.latLng(boundries.maxLatCorner, boundries.maxLngCorner),
        L.latLng(boundries.minLatCorner, boundries.minLngCorner));
    map.setMaxBounds(bounds);

    userMarker = L.marker();
}

// Function that sets a new marker on the map 
function newUserMarker(e) {
    if (currentWindow === "" || currentWindow.includes("index")) {
        userMarker.setLatLng(e.latlng);
        userMarker.addTo(map);

        latitude = e.latlng.lat;
        longitude = e.latlng.lng;
    }
    else if (currentWindow.includes("geo")) {
        if (userMarker) {
            userMarker.setLatLng(e.latlng);
            userMarker.addTo(miniMap);
        } else {
            userMarker = L.marker(e.latlng, {
                icon: L.icon({
                    iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
                    iconSize: [24, 44],
                    iconAnchor: [12, 44],
                    zIndexOffset: 1000
                })
            }).addTo(miniMap);

        }
        latitude = e.latlng.lat;
        longitude = e.latlng.lng;
    }
}

// Function that adds markers to the map of all restaurants
function newRestaurantMarker(lat, lng, urlType, id, location) {
    if (restaurantFlag == true) {
        for (let i = 0; i < restuarantMarkerArray.length; i++) {
            restuarantMarkerArray[i].remove();
        }
    }

    const restaurantMarker = new marker({ iconUrl: `/mapIconsSVG/map${urlType}.svg`, popupAnchor: [0, -35] });
    restuarantMarkerArray.push(L.marker([lat, lng], { icon: restaurantMarker }).addTo(map).on("click", () => scrollToRestaurant(id)).bindPopup(popupText(location)));
    restaurantFlag = false;
}

// Function that determines what is added to the popup dialogue box
function popupText(location) {
    let text = `${location.name}<br>`;
    text += `Stad: ${location.city}<br>`;
    text += `Länk: <a href="${location.website}"> ${location.website} </a><br>`;
    text += `Telefon nummer: ${location.phone_number}`;

    return text;
}

function popup(e) {
    const popup = L.popup({ offset: [0, -30] });
    popup
        .setLatLng([e.lat, e.lng])
        .setContent(`${e.name}<br>` +
            `Stad: ${e.city}<br>` +
            `Webbsida: <a href="${e.website}"> ${e.website} </a><br>` +
            `Telefon nummer: ${e.phone_number}`.toString())
        .openOn(map);
    map.setView([e.lat, e.lng], zoom = 15);
}

// Function that scrolls to the corresponding restaurant when a marker is clicked
function scrollToRestaurant(id) {
    const clickedRestaurant = document.getElementById(`#r${id}`);
    clickedRestaurant.scrollIntoView();
    let y;
    if (!currentWindow.includes("alla")) {
        y = document.querySelector("#restaurantInfo").getBoundingClientRect().top + window.scrollY - 50;
        clickedRestaurant.parentElement.style.backgroundColor = "#899e1d7a";
        clickedRestaurant.parentElement.style.border = "8px solid black";
        setTimeout(() => restaurantHighlightTimer(clickedRestaurant), 800);
    }
    else {
        y = 200;
    }
    window.scrollTo({ top: y, behavior: "instant" });
}

// Function that reverts the restaurant CSS after a timed amount
function restaurantHighlightTimer(restaurant) {
    restaurant.parentElement.style.backgroundColor = "rgb(253, 245, 235)";
    restaurant.parentElement.style.border = "4px solid black";
}

// Function for gathering data regarding users position, it handles errors by displaying a warning for the user
function getUserGeo() {
    if (currentWindow === "" || currentWindow.includes("index")) {
        const findBtn = document.getElementById("findBtn");
        findBtn.classList.add("activated");

        const mapBtn = document.getElementById("mapBtn");
        mapBtn.classList.remove("activated");

        let successFlag = true;

        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            updateMapLoc(successFlag);
        }, function (error) {
            if (error == "[object GeolocationPositionError]") {
                window.alert(`Om du inte godkänner att sidan använder din platsinformation kommer inte denna funktionen att fungera! Välj då istället plats via kartan 

För att använda hitta min plats måste du ladda om sidan och godkänna på nytt`);
            }
            else {
                window.alert(`Fel vid hämtning av geo position: ${error}`);
            }
            successFlag = false;
            updateMapLoc(successFlag);
        });
    }
    else if (currentWindow.includes("geo")) {
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            overlay.style.display = "none";

            stopLoader();
            startGame();
        }, function (error) {
            if (error == "[object GeolocationPositionError]") {
                stopLoader();
                window.alert(`Om du inte godkänner att sidan använder din platsinformation kommer inte denna funktionen att fungera! Välj då istället plats via kartan 
    
    För att använda hitta min plats måste du ladda om sidan och godkänna på nytt`);
            }
            else {
                stopLoader();
                window.alert(`Fel vid hämtning av geo position: ${error}`);
            }
        });
    }
    else if (currentWindow.includes("alla")) {
        let successFlag = true;
        navigator.geolocation.getCurrentPosition(function (position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            updateMapLoc(successFlag);
        }, function (error) {
            if (error == "[object GeolocationPositionError]") {
                window.alert(`Om du inte godkänner att sidan använder din platsinformation kommer inte denna funktionen att fungera! Välj då istället plats via kartan 

För att använda hitta min plats måste du ladda om sidan och godkänna på nytt`);
            }
            else {
                window.alert(`Fel vid hämtning av geo position: ${error}`);
            }
            successFlag = false;
            updateMapLoc(successFlag);
        });
    }
}

// Function that updates the position of the map with the geo-data
function updateMapLoc(success) {
    if (success) {
        if (userMarker) {
            userMarker.remove();
        }
        userMarker = new L.marker([latitude, longitude], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(map);
        map.setView([latitude, longitude], zoom = 16);
        if (miniMap) {
            miniMap.setView([latitude, longitude], zoom = 16);
        }
    }
    else {
        if (!olandButtonElem.classList.value) {
            map.setView([latitude, longitude], smaland.zoom);
            if (miniMap) {
                miniMap.setView([latitude, longitude], smaland.zoom);
                return "smaland";
            }
        }
        else {
            map.setView([latitude, longitude], oland.zoom);
            if (miniMap) {
                miniMap.setView([latitude, longitude], oland.zoom);
                return "oland";
            }
            if (success === undefined) {
                map.setView([latitude, longitude], 13);
            }
        }
    }
}

// Opens the small popup map
function openMapDialog() {
    if (currentWindow === "" || currentWindow.includes("index")) {
        if (markerOnMiniMap != undefined) {
            markerOnMiniMap.remove();
        }
        if (userMarker != undefined) {
            userMarker.remove();
        }

        const mapBtn = document.getElementById("mapBtn");
        mapBtn.classList.add("activated");

        const findBtn = document.getElementById("findBtn");
        findBtn.classList.remove("activated");

        const mapBox = document.querySelector("#map");
        const overlay = document.querySelector("#overlay");

        mapBox.style.display = "block";
        mapBox.style.height = "60%";
        mapBox.style.width = "60%";

        overlay.style.display = "block";

        if (miniMap === undefined) {
            miniMap = L.map("map", {
                center: [smaland.lat, smaland.lng],
                zoom: smaland.zoom,
                minZoom: 8.5,
                maxZoom: 18,
                maxBoundsViscosity: 1,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(miniMap);
            miniMap.on("click", function (event) {
                const markerPosition = event.latlng;
                markerOnMiniMap.setLatLng(markerPosition);
                userMarker.setLatLng(markerPosition);

            });
            miniMap.on("click", newUserMarker);
        }
        const ownPositionMarker = L.icon({
            iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
            iconSize: [20, 40],
            iconAnchor: [10, 40],
            zIndexOffset: 1000
        });

        if (smalandRadioBtn.checked) {
            const miniBounds = L.latLngBounds(
                L.latLng(smalandBoundries.minLatCorner, smalandBoundries.minLngCorner),
                L.latLng(smalandBoundries.maxLatCorner, smalandBoundries.maxLngCorner)
            );
            miniMap.setMaxBounds(miniBounds);
        }
        else if (olandRadioBtn.checked) {
            const miniBounds = L.latLngBounds(
                L.latLng(olandBoundries.minLatCorner, olandBoundries.minLngCorner),
                L.latLng(olandBoundries.maxLatCorner, olandBoundries.maxLngCorner)
            );
            miniMap.setMaxBounds(miniBounds);
        }
        if (updateMapLoc(false) == "smaland") {
            markerOnMiniMap = L.marker([smaland.lat, smaland.lng], { icon: ownPositionMarker }).addTo(miniMap);
            userMarker = new L.marker([smaland.lat, smaland.lng], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(map);
        }
        else {
            markerOnMiniMap = L.marker([oland.lat, oland.lng], { icon: ownPositionMarker }).addTo(miniMap);
            userMarker = new L.marker([oland.lat, oland.lng], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(map);
        }
    }
    else if (currentWindow.includes("geo")) {
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

            miniMap = L.map("map", {
                center: [latitude, longitude],
                zoom: 13,
                minZoom: 8,
                maxZoom: 20,
                maxBounds: mapBounds,
                maxBoundsViscosity: 1,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(miniMap);
            miniMap.on("click", function (event) {
                const markerPosition = event.latlng;
                userMarker.setLatLng(markerPosition);
            });
            miniMap.on("click", newUserMarker);
        }
        if (smalandRadioBtn.checked) {
            latitude = smaland.lat;
            longitude = smaland.lng;
            miniMap.setView([latitude, longitude], smaland.zoom);
        }
        else {
            latitude = oland.lat;
            longitude = oland.lng;
            miniMap.setView([latitude, longitude], oland.zoom);
        }

        const ownPositionMarker = L.icon({
            iconUrl: "/mapIconsSVG/mapOwnPosition.svg",
            iconSize: [24, 44],
            iconAnchor: [12, 44],
            zIndexOffset: 1000
        });

        userMarker = new L.marker([latitude, longitude], { icon: ownPositionMarker, zIndexOffset: 1000 }).addTo(miniMap);

        const closeButton = document.querySelector("#closeButton");
        closeButton.addEventListener("click", function () {
            overlay.style.display = "none";
        });
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
// ---------- Favoriter code following ----------

let listCounter = 0;        // The amount of lists that are currently present
const maxBoxes = 5;         // Maximum amount of lists possible
let currentContainer;       // The current dragged container
let movingCard;             // The container that the card is dropped on
let boxContainer;           // Container that contains restaurant cards
let addButton;              // Button to press to add new list item
let scrollSpeed = 20; // Speed fo the scroll
let screenEdgeMargin = 70; // Margin before it scrolls

// Init function that fetches local storage and loads cards
function initLoadSaved() {
    boxContainer = document.getElementById("savedFlexbox");
    addButton = document.getElementById("addBtn");
    addButton.addEventListener("click", () => addBox(false));
    updateBoxIds();
    initBoxes();

    try {
        getRestaurantIds();
        cleanedIds.forEach(id => {
            const position = 0;
            idPosition.set(id, position);
        });

        fetchStoredData();
        loadCards();
        initTitleEventListeners();
    } catch (error) {
        console.log("No id's");
    }
}

// Initiates the title event listners and changes their texts and id's so that they are correct
function initTitleEventListeners() {
    const titles = document.querySelectorAll(".BoxTitle");
    titles.forEach(title => {
        const savedTitle = localStorage.getItem(title.id);
        if (savedTitle) {
            title.textContent = savedTitle;
        }
        title.addEventListener("click", function () {
            const originalText = this.textContent;
            const input = document.createElement("input");
            input.type = "text";
            input.value = originalText;
            input.style.width = "100%";
            input.maxLength = "20";

            this.textContent = "";
            this.appendChild(input);

            input.focus();
            input.addEventListener("blur", () => {
                const newText = input.value;
                if (input.value == "") {
                    this.textContent = `Lista ${this.id.substring(9)}`;
                }
                else {
                    this.textContent = newText;
                }
                localStorage.setItem(this.id, newText);
            });
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    input.blur();
                }
            });
        });
    });
    showTitle();
}

// Changes the title and shows it on the page
function showTitle() {
    const titles = document.querySelectorAll(".BoxTitle");
    titles.forEach(title => {
        const savedTitle = localStorage.getItem(title.id);
        if (savedTitle) {
            title.textContent = savedTitle;
        }
    }
    );
}

// Function that initiates all the boxes on the site as it loads
function initBoxes() {
    listCounter = JSON.parse(localStorage.getItem("listCounter"));
    if (listCounter >= 4) {
        addButton.style.opacity = '0.5';
        addButton.style.cursor = 'not-allowed';
    }
    for (let i = 0; i < listCounter; i++) {
        addBox(true);
    }
}

// Function that adds a box both at the init and if a button is pressed
function addBox(init) {
    const boxes = document.querySelectorAll(".listBox");
    if (boxes.length < maxBoxes) {
        if (!init) {
            listCounter++;
            if (listCounter === 4) {
                addButton.style.opacity = '0.5';
                addButton.style.cursor = 'not-allowed';
            }
        }
        localStorage.setItem("listCounter", JSON.stringify(listCounter));

        const newBox = document.createElement("div");
        newBox.classList.add("listBox");

        const removeButton = document.createElement("button");
        removeButton.classList.add("removeBtn");
        removeButton.textContent = "x";
        removeButton.addEventListener("click", removeBox);
        removeButton.addEventListener("touchstart", removeBox);
        newBox.appendChild(removeButton);

        const elementBoxDiv = document.createElement("div");
        const newTitle = document.createElement("h2");
        newTitle.classList.add("BoxTitle");
        newTitle.innerText = `Lista ${listCounter + 1}`;

        elementBoxDiv.prepend(newTitle);
        elementBoxDiv.classList.add("elementBox");
        elementBoxDiv.appendChild(newBox);
        boxContainer.insertBefore(elementBoxDiv, addButton);

        updateBoxIds();
        initTitleEventListeners();
        const h2ElementArray = Array.from(document.querySelectorAll(".BoxTitle"));
        for (let i = 0; i < h2ElementArray.length; i++) {
            const element = h2ElementArray[i];
            element.innerText = `Lista ${element.nextElementSibling.id.substring(3)}`;
            element.id = `BoxTitle-${element.nextElementSibling.id.substring(3)}`;
        }
        showTitle()
        if (!init) {
            loadCards();
        }
    }
}

// Function that removes a box, if there are cards on that box it removes them aswell
function removeBox(event) {
    listCounter--;
    if (listCounter < 4) {
        addButton.style.opacity = "1";
        addButton.style.cursor = "pointer";
    }
    localStorage.setItem("listCounter", JSON.stringify(listCounter));
    const box = event.target.parentElement;
    localStorage.removeItem(`BoxTitle-${box.previousElementSibling.id.substring(9)}`)
    boxContainer.removeChild(box.parentElement);

    updateBoxIds();
    idPosition.forEach(id => {
        const key = getKeyByValue(idPosition, id);
        if (box.id.substring(3) == id) {
            removeRestaurant(key);
        }
        else if (box.id.substring(3) < id) {
            if (id - 1 >= 0) {
                idPosition.set(key, id - 1);
                localStorage.setItem("idPosition", JSON.stringify(Array.from(idPosition.entries())));
            }
        }
    });
}

// Makes sure that all boxes are ordered from 0-4 even if a box gets removed in the middle
function updateBoxIds() {
    const boxes = document.querySelectorAll(".listBox");
    boxes.forEach((box, index) => {
        box.id = `box${index}`;
    });
}

// Function to get map id key by inserted value
function getKeyByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
        if (value == searchValue) {
            return key;
        }
    }
    return null;
}

// Updates positions and loads cards
async function moveCard(containerId) {
    const thisCard = movingCard.firstChild.id.substring(2);
    idPosition.set(thisCard, containerId.substring(3));
    localStorage.setItem("idPosition", JSON.stringify(Array.from(idPosition.entries())));

    loadCards();
}

// Fetches cards from id and gives event listners to containers and cards
async function loadCards() {
    for (let i = 0; i < listCounter + 1; i++) {
        currentContainer = document.getElementById(`box${i}`);
        try {
            const containerChildrenNodes = Array.from(currentContainer.children);
            containerChildrenNodes.forEach(node => {
                if (node.tagName.toLowerCase() === "div") {
                    node.remove();
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    await fetchData();

    const cards = document.querySelectorAll(".restaurantCard");
    const containers = document.querySelectorAll(".listBox");
    containers.forEach(container => {
        container.addEventListener("dragover", handleDragOver);
        container.addEventListener("drop", handleDrop);
        container.addEventListener("touchmove", handleTouchMove);
        container.addEventListener("touchend", handleTouchEnd);
    });
    cards.forEach(card => {
        card.addEventListener("dragstart", () => dragCard(card));
        card.addEventListener("touchstart", (event) => handleTouchStart(event, card));
        card.addEventListener("touchmove", handleTouchMove);
        card.addEventListener("touchend", () => {
            setTimeout((event) => handleTouchEnd, 10);
        });
    });
    showTitle();
}

// Defines what card is being moved
function dragCard(card) {
    movingCard = card;
}

// Default handler for drag over event
function handleDragOver(event) {
    event.preventDefault();
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    if (mouseY < screenEdgeMargin) {
        window.scrollBy(0, -scrollSpeed);
    } else if (mouseY > windowHeight - screenEdgeMargin) {
        window.scrollBy(0, scrollSpeed);
    }

    if (mouseX < screenEdgeMargin) {
        window.scrollBy(-scrollSpeed, 0);
    } else if (mouseX > windowWidth - screenEdgeMargin) {
        window.scrollBy(scrollSpeed, 0);
    }
}

// Moves the card to the dropped container
function handleDrop(event) {
    event.preventDefault();
    moveCard(this.id);
}

// Handles touch start event on restaurant cards
function handleTouchStart(event, card) {
    event.preventDefault();
    movingCard = card;
    const touch = event.touches[0];
    const rect = movingCard.getBoundingClientRect();
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;
    const restaurantCards = document.querySelectorAll(".restaurantCard");
    restaurantCards.forEach(restaurantCard => {
        restaurantCard.style.pointerEvents = "none";
    });
}

// Handles move event on restaurant cards
function handleTouchMove(event) {
    event.preventDefault();
    if (!movingCard) return;
    
    const touch = event.touches[0];
    movingCard.style.position = "fixed";
    movingCard.style.width = "370px";
    movingCard.style.zIndex = "202";
    movingCard.style.left = (touch.clientX - touchOffsetX) + "px";
    movingCard.style.top = (touch.clientY - touchOffsetY) + "px";

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    if (touch.clientY < screenEdgeMargin) {
        window.scrollBy(0, -scrollSpeed);
    } else if (touch.clientY > windowHeight - screenEdgeMargin) {
        window.scrollBy(0, scrollSpeed);
    }
    
    if (touch.clientX < screenEdgeMargin) {
        window.scrollBy(-scrollSpeed, 0);
    } else if (touch.clientX > windowWidth - screenEdgeMargin) {
        window.scrollBy(scrollSpeed, 0);
    }

}

// Handles the touch end event on restaurant cards
function handleTouchEnd(event) {
    event.preventDefault();
    if (!movingCard) return;
    movingCard.style.position = "";
    movingCard.style.left = "";
    movingCard.style.top = "";

    const touch = event.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    if (dropTarget && dropTarget.classList.contains("listBox")) {
        moveCard(dropTarget.id);
    }
}
// ---------- AllaRestauranger code following ----------

const restaurantSearchMap = new Map();      // Map that contains all the names of the different restaurants along with their id 
let restaurantData;                         // Variable with all the data for all restaurants
let searchResultElem;                       // Element that shows all results
let searchInputElem;                        // Element that takes input of user

// Init function
function initAllRestaurants() {
    loader = document.querySelector("#loaderId");
    loader.firstElementChild.firstElementChild.innerText = "Laddar in alla restauranger, snälla vänta lite...";
    map = L.map("largeMap").setView([56.87767, 14.80906], 8);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        minZoom: 8,
        maxZoom: 18,
        maxBoundsViscosity: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const boundries = {
        maxLatCorner: 56.018610,
        maxLngCorner: 17.472606,
        minLatCorner: 58.322646,
        minLngCorner: 13.061037
    }

    bounds = L.latLngBounds(L.latLng(boundries.maxLatCorner, boundries.maxLngCorner),
        L.latLng(boundries.minLatCorner, boundries.minLngCorner));
    map.setMaxBounds(bounds);

    searchResultElem = document.getElementById("searchResultsDivLocation");

    searchInputElem = document.getElementById("searchInputLocation");
    searchInputElem.value = "";
    searchInputElem.addEventListener("input", () => filterLocations(["name", "city", "province", "sub_type", "type"]));

    initializePopularSearchButtons();
    initLoader();
    fetchAllRestaurants();

    const arrow = document.querySelector("#arrowUp");
    const resultBoxElem = document.getElementById("resultBox");
    arrow.addEventListener("click", () => {
        resultBoxElem.scrollTo({ top: 0, behavior: 'smooth' });
    });

}

// Function that fetches all restaurants form establishments, then combines it with the getRestaurant() fetch to display all markers with newRestaurantMarker()
async function fetchAllRestaurants() {
    try {
        const response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}&controller=establishment&types=food&method=getAll`, { signal });
        if (response.ok) {
            const dataResponse = await response.json();
            if (dataResponse.payload.length === 0) {
                window.alert`Error during fetch: ${response.status}
                Hämtning av data fungerade inte, testa senare eller kontakta oss för hjälp` }
            else {
                dataResponse.payload.forEach(obj => {
                    establishmentMap.set(obj.id, obj);
                });

                await getRestaurant();
                restaurantData = new Map(combineRestaurantData(establishmentMap, foodMap));
            }
        }
        stopLoader();
        displayLocations(restaurantData);
    }
    catch (error) {
        if (error.name === "AbortError") {
            console.log("Fetch aborted");
        } else {
            console.error("Fetch error:", error);
        }
    }
}

// Function that fetches all food restaurant markers
async function getRestaurant() {
    try {
        const response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}&controller=food&method=getAll`, { signal });
        if (response.ok) {
            const dataResponse = await response.json();
            if (dataResponse.payload.length === 0) {
                window.alert`Error during fetch: ${response.status}
                Hämtning av data fungerade inte, testa senare eller kontakta oss för hjälp` }
            else {
                dataResponse.payload.forEach(obj => {
                    foodMap.set(obj.id, obj);
                });
            }
        }
    }
    catch (error) {
        if (error.name === "AbortError") {
            console.log("Fetch aborted");
        } else {
            console.error("Fetch error:", error);
        }
    }
}

// Function that displays the restaurants in a list and on the map with newRestaurantMarker()
function displayLocations(locationsMap) {
    searchResultElem.innerText = "";
    for (let i = 0; i < restuarantMarkerArray.length; i++) {
        restuarantMarkerArray[i].remove();
    }
    restuarantMarkerArray = [];

    locationsMap.forEach(location => {
        const li = document.createElement("li");
        const p = document.createElement("p");

        li.textContent = location.name;
        li.id = "#r" + location.id;
        li.addEventListener("click", () => popup(location));
        li.style.float = "initial";
        li.style.cursor = "pointer";
        p.textContent = `${location.city}, ${location.province}`;
        li.appendChild(p);
        searchResultElem.appendChild(li);
        newRestaurantMarker(location.lat, location.lng, location.sub_type, location.id, location);
    });
}

// Function that filters the search array and resends it to the displayLocations() function to update the shown data
function filterLocations(locationNames) {
    const query = searchInputElem.value.toLowerCase();
    const filteredLocations = new Map(
        Array.from(restaurantData).filter(([id, obj]) =>
            locationNames.some(key =>
                obj[key].toLowerCase().includes(query)
            )
        )
    );
    displayLocations(filteredLocations);
}

// Function that switches the shown tab on the page
function showTab(tabId) {
    const tabs = document.querySelectorAll(".tabContent");
    tabs.forEach(function (tab) {
        tab.style.display = "none";
    });
    document.getElementById(tabId).style.display = "block";

    const popularSearch1 = document.querySelector("#popularSearch1");
    const popularSearch2 = document.querySelector("#popularSearch2");

    if (tabId === "locationResults") {
        popularSearch1.style.display = "block";
        popularSearch2.style.display = "none";
    } else if (tabId === "specificRestaurantResults") {
        popularSearch1.style.display = "none";
        popularSearch2.style.display = "block";
    }

}

// Function that adds event listeners to popular choices buttons
function initializePopularSearchButtons() {
    const popularButtons1 = document.querySelectorAll("#shortcutButtons1 button");
    popularButtons1.forEach(function (button) {
        button.addEventListener("click", function () {
            if (searchInputElem) {
                searchInputElem.value = button.textContent;
                filterLocations(["name", "city", "province", "sub_type", "type"]);
            } else {
                console.error('Input element with ID "' + searchInputElem + '" not found.');
            }
        });
    });

    const popularButtons2 = document.querySelectorAll("#shortcutButtons2 button");
    popularButtons2.forEach(function (button) {
        button.addEventListener("click", function () {
            if (searchInputElem) {
                searchInputElem.value = button.textContent;
                filterLocations(["name", "city", "province", "sub_type", "type"]);
            } else {
                console.error('Input element with ID "' + searchInputElem + '" not found.');
            }
        });
    });
}
// ---------- GeoMatch code following ----------

const imagesUsed = [
    "A_LA_CARTE.svg",
    "asian.svg",
    "burgers.svg",
    "HOT_DOGS.svg",
    "latin.svg",
    "MEDITERRANEAN.svg",
    "PASTRIES.svg",
    "pizza.svg"
]; // List of images used

const imageNames = {
    "A_LA_CARTE.svg": "A la carte",
    "asian.svg": "Asiatisk",
    "burgers.svg": "Burgare",
    "HOT_DOGS.svg": "Varmkorvar",
    "latin.svg": "Latin",
    "MEDITERRANEAN.svg": "Medelhavs",
    "PASTRIES.svg": "Bakverk",
    "pizza.svg": "Pizzeria"
}; // List of names for the images

const imageFolder = "mapIconsSVG"; // Folder with all icon images
let availableImages;               // Saves all remaining images 
let lastClickedImage = "";         // Saves the last clicked image
let playBtn;                       // Button object that starts the game
let restartGameBtn;                // Button for restarting the game
let GameStartBtn;                  // Button to start the game

// Function that initiates on window load
function initGeoMatch() {
    restartGameBtn = document.querySelector("#restartBox");
    restartGameBtn.addEventListener("click", restartGame);

    loader = document.querySelector("#loaderId");

    smalandRadioBtn = document.querySelector("#smalandRadioBtn");
    olandRadioBtn = document.querySelector("#olandRadioBtn");

    playBtn = document.querySelector("#playButton");
    playBtn.addEventListener("click", gameSettings);

    const mapBtn = document.querySelector("#mapBtn2");
    mapBtn.addEventListener("click", openMapDialog);

    const findBtn = document.querySelector("#findBtn2");
    findBtn.addEventListener("click", initLoader);
    findBtn.addEventListener("click", getUserGeo);

    GameStartBtn = document.querySelector("#mapPlaybtn");
    GameStartBtn.addEventListener("click", (e) => startGame(e));

    const closeButton2 = document.querySelector("#closeButton2");
    closeButton2.addEventListener("click", function () {
        selectBox.style.display = "none";
        playBtn.style.display = "block";
    });

}

// Shows the options to use either geo location or a map to choose user position
function gameSettings() {
    playBtn.style.display = "none";

    const selectBox = document.querySelector("#selectBox");
    selectBox.style.display = "flex";
}

function restartGame() {
    window.location.reload()
}

// Initiates the game and defines an array (availableImages) and makes sure the images are different from one another
function startGame() {
    overlay.style.display = "none";
    playBtn.style.display = "none";
    selectBox.style.display = "none";


    restartGameBtn.style.display = "flex";

    const gameBackground = document.querySelector("#boxBackground");
    gameBackground.style.display = "flex";

    const firstBoxInside = document.querySelector("#firstBox .insideBox");
    const secondBoxInside = document.querySelector("#secondBox .insideBox");

    const firstBox = document.querySelector("#firstBox");
    const secondBox = document.querySelector("#secondBox");

    firstBox.addEventListener("click", newImage);
    secondBox.addEventListener("click", newImage);

    availableImages = [...imagesUsed];

    const settingsBackground = document.querySelector("#startPage");
    const text1 = document.querySelector("#text1");
    const text2 = document.querySelector("#text2");
    text1.style.display = "none";
    text2.style.display = "none";
    settingsBackground.style.display = "none";

    const notSameImage = twoNotSameImages(availableImages);

    firstBoxInside.innerHTML = `<img src="${imageFolder}/${notSameImage[0]}" alt="Random Image 1">`;
    secondBoxInside.innerHTML = `<img src="${imageFolder}/${notSameImage[1]}" alt="Random Image 2">`;

    food1.textContent = imageNames[notSameImage[0]];
    food2.textContent = imageNames[notSameImage[1]];

    lastClickedImage = "";
}

// Loops trough untill the images are different than one another
function twoNotSameImages(imagesArray) {
    const firstImage = Math.floor(Math.random() * imagesArray.length);
    let secondImage;
    do {
        secondImage = Math.floor(Math.random() * imagesArray.length);
    } while (secondImage === firstImage);

    return [imagesArray[firstImage], imagesArray[secondImage]];
}

// Removes the displayed images from availableImages, checks which image is clicked and calls endGame if the array is empty
function newImage() {
    const firstBox = document.querySelector("#firstBox .insideBox img").src.split("/").pop();
    const secondBox = document.querySelector("#secondBox .insideBox img").src.split("/").pop();

    availableImages = availableImages.filter(image => image !== firstBox && image !== secondBox);

    if (this.id === "firstBox" && availableImages.length !== 0) {
        const newImage = getNewImage(secondBox);
        document.querySelector("#secondBox .insideBox").innerHTML = `<img src="${imageFolder}/${newImage}" alt="">`;
        document.querySelector("#food2").textContent = imageNames[newImage];
    } else if (this.id === "secondBox" && availableImages.length !== 0) {
        const newImage = getNewImage(firstBox);
        document.querySelector("#firstBox .insideBox").innerHTML = `<img src="${imageFolder}/${newImage}" alt="">`;
        document.querySelector("#food1").textContent = imageNames[newImage];
    }

    if (this.id === "firstBox") {
        lastClickedImage = firstBox;
    } else if (this.id === "secondBox") {
        lastClickedImage = secondBox;
    }

    if (availableImages.length === 0) {
        document.getElementById("restaurantInfo").innerText = "";
        fetchData();
        endGame();
        return;
    }
}

// Displays new images based on the availableImages array and loops to make sure the image is not a copy of the prior one
function getNewImage(currentImage) {
    let newImage;
    do {
        newImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    } while (newImage === currentImage);
    return newImage;
}

// Hides the gameBackground and shows the endGamePage
function endGame() {
    const gameBackground = document.querySelector("#boxBackground");
    gameBackground.style.display = "none";

    const endGamePage = document.querySelector("#endGamePage");
    endGamePage.style.display = "flex";

    const circleImgHolder = document.querySelector("#circleImgHolder");
    circleImgHolder.innerHTML = `<img src="${imageFolder}/${lastClickedImage}" alt="Final Image">`;

    document.querySelector("#endGamePage h2").textContent = "Det verkar som att du är mest sugen på ";
    document.querySelector("#endGamePage h2").textContent += imageNames[lastClickedImage];
}