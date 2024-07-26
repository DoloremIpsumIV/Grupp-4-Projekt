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
        case "Lyx mat":
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

        console.log(response)
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

function saveRestaurant(listElement) {
    console.log(listElement)
    const restaurantId = listElement.firstElementChild.id.startsWith("#") ? listElement.firstElementChild.id.slice(1) : listElement.firstElementChild.id.id;
    console.log("Saving restaurant ID:", restaurantId);

    let savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];

    if (!savedRestaurant.includes(restaurantId)) {
        savedRestaurant.push(restaurantId);

        localStorage.setItem("savedRestaurant", JSON.stringify(savedRestaurant));
    }
}

function toggleHeartImg() {
    if (currentWindow.includes("index")) {
        const saveBtns = document.querySelectorAll(".saveBtnIndex");

        saveBtns.forEach(saveBtn => {
            saveBtn.addEventListener("click", function () {
                const listElement = this.parentNode.parentNode;
                console.log(listElement)
                const restaurantId = listElement.firstElementChild.id.startsWith("#") ? listElement.firstElementChild.id.slice(1) : listElement.firstElementChild.id.id;
                console.log(restaurantId)



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
}