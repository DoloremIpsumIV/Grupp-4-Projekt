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

    searchResultElem = document.getElementById("searchResults");

    searchInputElem = document.getElementById("searchInput");
    searchInputElem.value = "";
   searchInputElem.addEventListener("input", filterLocations);

    initializePopularSearchButtons(); 

    initLoader();
    fetchAllRestaurants();
}

// Function that fetches all restaurants form establishments, then combines it with the getRestaurant() fetch to display all markers with newRestaurantMarker()
async function fetchAllRestaurants() {
    try {
        let response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}&controller=establishment&types=food&method=getAll`, { signal });
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
        let response = await fetch(`https://smapi.lnu.se/api/?api_key=${ApiKey}&controller=food&method=getAll`, { signal });
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
        p.textContent = `${location.city}, ${location.province}`;
        li.appendChild(p);
        searchResults.appendChild(li);
        newRestaurantMarker(location.lat, location.lng, location.sub_type, location.id, location);
    });
}

// Function that filters the search array and resends it to the displayLocations() function to update the shown data
function filterLocations() {
    const query = searchInputElem.value.toLowerCase();
    const filteredLocations = new Map(
        Array.from(restaurantData).filter(([id, obj]) =>
            ["name", "city", "province", "sub_type", "type"].some(key =>
                obj[key].toLowerCase().includes(query)
            )
        )
    );
    displayLocations(filteredLocations);
}

function showTab(tabId) {
    
    let tabs = document.querySelectorAll(".tabContent");
    tabs.forEach(function(tab) {
        tab.style.display = "none";
    });

    document.getElementById(tabId).style.display = "block";


    let popularSearch1 = document.querySelector("#popularSearch1");
    let popularSearch2 = document.querySelector("#popularSearch2");

    if (tabId === 'locationResults') {
        popularSearch1.style.display = "block";
        popularSearch2.style.display = "none";
    } else if (tabId === 'specificRestaurantResults') {
        popularSearch1.style.display = "none";
        popularSearch2.style.display = "block";
    }
    
}

function initializePopularSearchButtons() {
    console.log("SDFGHJK")
    let popularButtons1 = document.querySelectorAll("#shortcutButtons1 button");
    popularButtons1.forEach(function(button) {
        insertText(button);
    });

    let popularButtons2 = document.querySelectorAll("#shortcutButtons2 button");
    popularButtons2.forEach(function(button) {
        insertText(button);
    });
}

function insertText(button) {
    button.addEventListener('click', function() {
        const inputElem = document.getElementById(currentSearchInputId);
        if (inputElem) {
            inputElem.value = button.textContent;
            filterLocations();
        } else {
            console.error('Input element with ID "' + currentSearchInputId + '" not found.');
        }
    });

    /*
    button.addEventListener('click', function() {
        const inputElem = document.getElementById(inputId);
        inputElem.value = button.textContent;
        filterLocations();
    });
    */
}

