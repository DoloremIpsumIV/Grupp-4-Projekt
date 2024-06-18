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

// Function that sets the sorting order for SMAPI fetch
function setSortingOrder(value, fetchType) {
    if (fetchType == "establishment") {
        switch (value) {
            case "rating":
                return "&sort_in=DESC&order_by=rating"
            case "student_discount":
                return "&sort_in=DESC&order_by=student_discount"
            default:
                return "&sort_in=DESC&order_by=distance_in_km"
        }
    }
    else {
        switch (value) {
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
        foodMap.clear();
        establishmentMap.clear();
        initLoader();

        const sorting = setSortingOrder(document.querySelector("#sort").value, "establishment");
        const radius = setRadius(document.querySelector("#distance").firstElementChild.value);
        document.querySelector("#searchedRestaurant").innerHTML = document.querySelector("#restaurantType").firstElementChild.value;
        document.querySelector("#searchedDistance").innerHTML = document.querySelector("#distance").firstElementChild.value;
        document.querySelector("#searchedPrice").innerHTML = document.querySelector("#priceRange").firstElementChild.value;
        document.querySelector("#searchedProvince").innerHTML = province.replace("&provinces=", "");
        let response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + sorting + "&controller=establishment&types=food&method=getFromLatLng&lat=" + latitude + "&lng=" + longitude + "&radius=" + radius + province, { signal });
        if (response.ok) {
            const dataResponse = await response.json();
            const container = document.getElementById("restaurantInfo");
            container.innerText = "";
            if (dataResponse.payload.length == 0) {
                container.innerHTML = "Inga restauranger kunde hittas med dessa alternativ, testa att sök på något annat, eller välj en annan provins!";
                container.classList.remove("restaurantSize");
                for (let i = 0; i < restuarantMarkerArray.length; i++) {
                    restuarantMarkerArray[i].remove();
                }
            }
            else {
                dataResponse.payload.forEach(obj => {
                    if (!foodMap.has(obj.id)) {
                        foodMap.set(obj.id, obj);
                    }
                });

                await getFoodData()
                restaurant = combineRestaurantData(establishmentMap, foodMap);
                restaurant.forEach(object => {
                    createCard(object);
                });
            }
            restaurantFlag = true;
        }
        else window.alert("Error during fetch: " + response.status + "\nHämtning av data fungerade inte, testa senare eller kontakta oss för hjälp", stopLoader());
        document.querySelector("#mapBtn").scrollIntoView();

        stopLoader();
        updateMapLoc();
        toggleHeartImg();
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
        let id = "&ids=";
        foodMap.forEach(restaurant => {
            id += restaurant.id + ",";
        });
        const sorting = setSortingOrder(document.querySelector("#sort").value, "");
        const restaurantType = setRestaurantType(document.querySelector("#restaurantType").firstElementChild.value);
        const radius = setRadius(document.querySelector("#distance").firstElementChild.value);
        const priceRange = setPriceRange(document.querySelector("#priceRange").firstElementChild.value);
        const response = await fetch("https://smapi.lnu.se/api/?api_key=" + ApiKey + sorting + "&controller=food&method=getfromlatlng&" + id + "&lat=" + latitude + "&lng=" + longitude + "&radius=" + radius + restaurantType + priceRange, { signal });
        if (response.ok) {
            const dataResponse = await response.json();
            const container = document.getElementById("restaurantInfo");
            container.innerText = "";
            if (dataResponse.payload.length == 0) {
                container.innerHTML = "Inga restauranger kunde hittas med dessa alternativ, testa att sök på något annat, eller välj en annan provins!";
                container.classList.remove("restaurantSize");
                for (let i = 0; i < restuarantMarkerArray.length; i++) {
                    restuarantMarkerArray[i].remove();
                }
            }

            dataResponse.payload.forEach(obj => {
                if (!establishmentMap.has(obj.id)) {
                    establishmentMap.set(obj.id, obj);
                }
            });
            return dataResponse;
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

// Function that adds CSS-class in order to show loader
function initLoader() {
    loader.classList.add("show");
}

// Function that removes CSS-class in order to hide loader
function stopLoader() {
    loader.classList.remove("show");
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
                saveRestaurant(this.parentNode.parentNode);
            } else {
                console.log("tomthjärta nu");
                this.src = "/images/emptyHeart.svg";

                listElements = this.parentNode.parentNode;

                let listElemsArray = Array.from(listElements);
                let index = listElemsArray.indexOf(this);

                const savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];

                savedRestaurant.splice(index, 1);

                localStorage.setItem("savedRestaurant", JSON.stringify(savedRestaurant));
            }
        });
    });
}
