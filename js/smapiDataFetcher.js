// Function that defiens the value of the radius
function setRadius(value) {
    switch (value) {
        case value = "1 KM":
            return "1";
        case value = "3 KM":
            return "3";
        case value = "5 KM":
            return "5";
        case value = "10 KM":
            return "10";
        default:
            return "1";
    }
}

// Function that converts the input value of the dropdown to code that SMAPI understands
function setRestaurantType(value) {
    switch (value) {
        case value = "Alla Restauranger":
            return "";
        case value = "Pizzeria":
            return subTypes[0] + subTypes[8];
        case value = "Asiatisk":
            return subTypes[0] + subTypes[2];
        case value = "Etnisk":
            return types[0] + types[2];
        case value = "Casual":
            return types[0] + types[1];
        case value = "Snabb":
            return types[0] + types[3];
        case value = "Lyx mat":
            return types[0] + types[4];
        case value = "Burgare":
            return subTypes[0] + subTypes[3];
        case value = "Varmkorvar":
            return subTypes[0] + subTypes[4];
        case value = "Latin":
            return subTypes[0] + subTypes[5];
        case value = "Lokalägd":
            return subTypes[0] + subTypes[6];
        case value = "Medelhavs":
            return subTypes[0] + subTypes[7];
        case value = "Annat":
            return subTypes[0] + subTypes[9];
        case value = "Bakverk":
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

// Async function that saves all establishment data in a map, it will abort the fetch request if the page is closed or reloaded
async function getEstablishmentData() {
    try {
        let response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + "&sort_in=DESC&order_by=distance_in_km&controller=establishment&method=getall&types=food", { signal });
        if (response.ok) {
            let dataResponse = await response.json();
            establishmentMap = new Map(dataResponse.payload.map(obj => [obj.id, obj]));
        }
        else window.alert("Error during fetch: " + response.status + "\nHämtning av data fungerade inte, testa senare eller kontakta oss för hjälp", stopLoader());
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Fetch aborted");
        } else {
            console.error("Fetch error:", error);
        }
    }
}

// Async function that saves all food data in a map with the correct id, it will abort the fetch request if the page is closed or reloaded
async function getFoodData(id) {
    try {
        initLoader();
        const restaurantType = setRestaurantType(document.querySelector("#restaurantType").firstElementChild.value);
        const radius = setRadius(document.querySelector("#distance").firstElementChild.value);
        const priceRange = setPriceRange(document.querySelector("#priceRange").firstElementChild.value);

        document.querySelector("#searchedRestaurant").innerHTML = document.querySelector("#restaurantType").firstElementChild.value;
        document.querySelector("#searchedDistance").innerHTML = document.querySelector("#distance").firstElementChild.value;
        document.querySelector("#searchedPrice").innerHTML = document.querySelector("#priceRange").firstElementChild.value;

        if (id) {
            id = "&ids=" + id;
        }
        else {
            id = "";
        }
        const response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + "&sort_in=DESC&order_by=distance_in_km&controller=food&method=getfromlatlng&" + id + "&lat=" + latitude + "&lng=" + longitude + "&radius=" + radius + restaurantType + priceRange, { signal });
        if (response.ok) {
            const dataResponse = await response.json();
            console.log(dataResponse.payload.length)
            const container = document.getElementById("restaurantInfo");
            container.innerText = "";
            if (dataResponse.payload.length == 0) {
                container.innerHTML = "Inga restauranger kunde hittas med dessa alternativ, testa att sök på något annat!";
                container.classList.remove("restaurantSize");
                for (let i = 0; i < restuarantMarkerArray.length; i++) {
                    restuarantMarkerArray[i].remove();
                }
            }
            else {
                dataResponse.payload.forEach(obj => {
                    if (!foodMap.has(obj.id)) {
                        foodMap.set(obj.id, obj);
                        restaurant = combineRestaurantData(establishmentMap, foodMap);
                        createCard(obj);
                    }
                });
            }
            stopLoader();
        }
        else window.alert("Error during fetch: " + response.status + "\nHämtning av data fungerade inte, testa senare eller kontakta oss för hjälp", stopLoader());
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Fetch aborted");
        } else {
            console.error("Fetch error:", error);
        }
    }
}

// 
function createCard(obj) {
    const container = document.getElementById("restaurantInfo");
    const listElements = document.createElement("div");
    listElements.appendChild(displayCardFlex(obj.id));
    listElements.classList.add("restaurantCard");
    container.appendChild(listElements);
    container.classList.add("restaurantSize");
}

// Async function that collects restaurant data, it will handle errors by popping up a warning on the page, also can cancel async fetch requests
async function fetchData() {
    try {
        const restaurantType = setRestaurantType(document.querySelector("#restaurantType").firstElementChild.value);
        const radius = setRadius(document.querySelector("#distance").firstElementChild.value);
        const priceRange = setPriceRange(document.querySelector("#priceRange").firstElementChild.value);

        document.querySelector("#searchedRestaurant").innerHTML = document.querySelector("#restaurantType").firstElementChild.value;
        document.querySelector("#searchedDistance").innerHTML = document.querySelector("#distance").firstElementChild.value;
        document.querySelector("#searchedPrice").innerHTML = document.querySelector("#priceRange").firstElementChild.value;

        initLoader();
        let response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + "&sort_in=DESC&order_by=distance_in_km&controller=food&method=getFromLatLng&lat=" + latitude + "&lng=" + longitude + "&radius=" + radius + restaurantType + priceRange, { signal });
        if (response.ok) {
            let dataResponse = await response.json();
            showData(dataResponse);
        }
        else window.alert("Error during fetch: " + response.status + "\nHämtning av data fungerade inte, testa senare eller kontakta oss för hjälp", stopLoader());
    }
    catch (error) {
        if (error.name === "AbortError") {
            console.log("Fetch aborted");
        } else {
            console.error("Fetch error:", error);
        }
    }
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
        restaurantContainer.innerHTML = "Inga restauranger kunde hittas med dessa alternativ, testa att sök på något annat!";
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
            const restaurant = jsonArray[i];

            newRestaurantMarker(jsonArray[i].lat, jsonArray[i].lng, jsonArray[i].sub_type, jsonArray[i].id);

            const listElements = document.createElement("div");
            listElements.appendChild(elementBuilder.renderElement(i));
            listElements.classList.add("restaurantCard");
            // Byt då detta till att lägga in bilden för stjärnan istället
            const saveBtn = document.createElement("img");
            saveBtn.src = "/images/emptyHeart.svg";
            saveBtn.id = "saveBtnIndex";
            listElements.appendChild(saveBtn);

            restaurantContainer.appendChild(listElements);
        }
        restaurantFlag = true;
    }
    updateMapLoc();
    stopLoader();

    document.querySelector("#mapBtn").scrollIntoView();
    restaurantContainer.classList.add("restaurantSize");
    toggleHeartImg();
}

function saveRestaurant(listElements) {
    console.log(listElements);

    let savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];

    const clonedListElement = listElements.cloneNode(true);

    savedRestaurant.push(clonedListElement.outerHTML);
    localStorage.setItem("savedRestaurant", JSON.stringify(savedRestaurant));

}

function toggleHeartImg() {
    console.log("hejhej");
    const saveBtns = document.querySelectorAll("#saveBtnIndex");

    saveBtns.forEach(saveBtn => {
        saveBtn.addEventListener("click", function () {

            if (this.src.includes("/images/emptyHeart.svg")) {
                console.log("fullthjärta nu");
                this.src = "/images/filledHeart.svg";
                saveRestaurant(this.parentNode);
            } else {
                console.log("tomthjärta nu");
                this.src = "/images/emptyHeart.svg";
            }
        });
    });
}

// Funktion som laddar in/upp datan som användaren sparat lokalt i savedBox elementet
// Behöver skriva en if-sats som kollar ifall den redan finns i localstorage
function loadSavedRestaurant() {
    const savedBox = document.querySelector("#savedBox");
    let savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant"));

    for (let i = 0; i < savedRestaurant.length; i++) {
        const savedListElements = document.createElement("div");
        savedListElements.innerHTML = savedRestaurant[i];
        savedBox.appendChild(savedListElements);
    }
}
window.addEventListener("load", loadSavedRestaurant);