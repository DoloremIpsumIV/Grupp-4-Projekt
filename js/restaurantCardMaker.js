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
                    const crossAndCheck = document.createElement("img");
                    if (value == "N") {
                        crossAndCheck.src = "/images/Cross.png";
                    }
                    else {
                        crossAndCheck.src = "/images/Check.png";
                    }
                    crossAndCheck.classList = "crossAndCheck";

                    paragraphElement.innerHTML = `${key}: `;
                    paragraphElement.appendChild(crossAndCheck);
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