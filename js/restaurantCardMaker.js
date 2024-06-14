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

// 
function displayCardFlex(restuarantId) {
    const restaurantObject = restaurant.get(restuarantId.toString());
    const fragment = new DocumentFragment();
    const divElement = document.createElement("div");
    divElement.classList.add("restaurantCardFlex");
    divElement.id = restaurantObject.id;

    const imgElement = document.createElement("img");
    imgElement.id = "picture";

    const titleElement = document.createElement("h2");
    titleElement.id = "restaurantName";
    titleElement.innerText = restaurantObject.name;

    imgElement.src = "/mapIconsSVG/" + restaurantObject.sub_type + ".svg";

    divElement.appendChild(imgElement);
    divElement.appendChild(titleElement);
    fragment.appendChild(divElement);

    const secondDivElement = document.createElement("div");
    secondDivElement.classList.add("restaurantCardFlex");
    secondDivElement.style.display = "block";

    //else if (property == "distance_in_km") {                                      WRITE THE DISTANCE 
    //paragraphElement.style.display = "inline";
    //paragraphElement.style.padding = "10px 10px 0px 10px";
    //paragraphElement.style.marginTop = "13px";
    //if (parsedNumber >= 1) {
    //    paragraphElement.innerText = parsedNumber.toFixed(2) + " km bort";
    //} else {
    //    paragraphElement.innerText = (parsedNumber * 1000).toFixed(0) + " meter bort";
    //}
    //}

    
    //    paragraphElement.innerText = translatedWord.charAt(0).toUpperCase() + translatedWord.slice(1).replace(/_/g, " ") + this.#wordTranslator(this.data[distanceIndex][property]).charAt(0).toUpperCase() + this.#wordTranslator(this.data[distanceIndex][property]).slice(1).replace(/_/g, " ").toLowerCase();
   
    const displayValues = ["name", "type", "phone_number", "website", "abstract", "text", "avg_lunch_pricing", "student_discount", "rating"]
    Object.entries(restaurantObject).forEach(([key, value]) => {
        if (displayValues.includes(key)) {
            console.log(key)
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
                    paragraphElement.style.padding = "10px 10px 0px 10px";
                    paragraphElement.style.fontSize = "23px";
                    paragraphElement.appendChild(dollar);
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
                    break;

                default:
                    paragraphElement.innerText = `${key}: ${value}`;
                    break;
            }
            secondDivElement.appendChild(paragraphElement);
            fragment.appendChild(secondDivElement);
        }
    });
    return fragment;
}


function compare(number) {                  // Method that compares a number to see if it's below 60, between 60 and 90, or above 90 for different price ranges
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


function starBuilder(halfStarExists) {      // Method that creates a star image whenever called and if halfStarExists is false, if it's true it ads a half star
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