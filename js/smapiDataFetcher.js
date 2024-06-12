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
        default:
            restaurantType = "";
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

// Async function that saves all establishment data in a map, it will abort the fetch request if the page is closed or reloaded
async function getEstablishmentData() {
    try {
        let response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + "&controller=establishment&method=getall&types=food", { signal });
        if (response.ok) {
            let dataResponse = await response.json();
            establishmentMap = new Map(dataResponse.payload.map(obj => [obj.id, obj]));
            console.log(establishmentMap)
            const restaurant = getEstablishmentRestaurant("268")
            console.log(restaurant);
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

// Takes the id from the establishment map and returns the coresponding restaurant object 
function getEstablishmentRestaurant(id){
    return establishmentMap.get(id);
}

// Async function that collects restaurant data, it will handle errors by popping up a warning on the page, also can cancel async fetch requests
async function fetchData() {
    try {
        handleClick(true);
        initLoader();

        let response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + "&controller=food&method=getFromLatLng&lat=" + latitude + "&lng=" + longitude + "&radius=" + radius + restaurantType + priceRange, { signal });
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
            newRestaurantMarker(jsonArray[i].lat, jsonArray[i].lng, jsonArray[i].sub_type, jsonArray[i].id);

            const listElements = document.createElement("div");
            listElements.appendChild(elementBuilder.renderElement(i));
            listElements.classList.add("restaurantCard");

            restaurantContainer.appendChild(listElements);
        }
        restaurantFlag = true;
    }
    updateMapLoc();
    stopLoader();

    document.querySelector("#mapBtn").scrollIntoView();
    restaurantContainer.classList.add("restaurantSize");
}