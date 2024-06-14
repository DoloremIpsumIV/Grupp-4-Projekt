// Class that constructs any element based on method used
class ElementConstructor {

    constructor(data) {
        this.data = data;                                                    // Uses the array that contains all JSON data
        this.distances = this.data.map(item => item.distance_in_km);         // Array with all distance values
        this.sortedDistances = this.distances.slice().sort((a, b) => a - b); // Distance array sortend in ascending order
    }

    renderElement(index) {
        const fragment = new DocumentFragment();
        const propertyToShow = ['rating', 'avg_lunch_pricing', 'distance_in_km', 'sub_type', 'search_tags', 'id'];  // Data that will be displayed
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
                imgElement.src = "/mapIconsSVG/" + this.data[distanceIndex][property] + ".svg";
            }
            if (property == "id") {
                divElement.id = "r" + this.data[distanceIndex][property];
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
            const translatedWord = this.#wordTranslator(property);
            const paragraphElement = document.createElement("p");
            const parsedNumber = parseFloat((this.data[distanceIndex][property]).toString());

            if (property == "sub_type" || property == "id") {
                continue;
                // skips displaying the sub_type and id
            }

            else if (property == "avg_lunch_pricing") {   // This will check if the data is avgerage lunch pricing, it will compare the numbers and give it one to three dollars depening on set amounts
                const dollar = document.createElement("p");
                dollar.style.display = "inline";
                dollar.style.textShadow = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000";
                switch (this.#compare(this.data[distanceIndex][property])) {
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
            }

            else if (property == "rating") {   // This will check if the data is a rating, it will then check the first number to loop the amount of stars needed, if the second number (decimal) is 5 or above it will display a half star on the end
                const digit = Math.floor((this.data[distanceIndex][property]) * 10) / 10;
                const secondDigit = Math.floor((this.data[distanceIndex][property] * 10) % 10);
                paragraphElement.style.display = "inline";
                paragraphElement.style.padding = "10px 10px 0px 10px"

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

            else if (property == "distance_in_km") {    // Writes the distance in km if above or equal to one, or in meters if less than that
                paragraphElement.style.display = "inline";
                paragraphElement.style.padding = "10px 10px 0px 10px";
                paragraphElement.style.marginTop = "13px";
                if (parsedNumber >= 1) {
                    paragraphElement.innerText = parsedNumber.toFixed(2) + " km bort";
                } else {
                    paragraphElement.innerText = (parsedNumber * 1000).toFixed(0) + " meter bort";
                }
            }

            else {
                // This will simply display the raw text in a more readable format, it cleans it up basically
                paragraphElement.innerText = translatedWord.charAt(0).toUpperCase() + translatedWord.slice(1).replace(/_/g, " ") + this.#wordTranslator(this.data[distanceIndex][property]).charAt(0).toUpperCase() + this.#wordTranslator(this.data[distanceIndex][property]).slice(1).replace(/_/g, " ").toLowerCase();
                //console.log(getEstablishmentRestaurant(savedId))
                //paragraphElement.innerText = getEstablishmentRestaurant(savedId).website
                //paragraphElement.innerText += getEstablishmentRestaurant(savedId).phone_number
                //paragraphElement.innerText += getEstablishmentRestaurant(savedId).text
                //paragraphElement.innerText = getEstablishmentRestaurant(savedId).student_discount
            }
            secondDivElement.appendChild(paragraphElement);
            fragment.appendChild(secondDivElement);
        }
        return fragment;
    }

    #wordTranslator(word) {
        const swedishNames = ['beskrivning', '', 'betyg', '', 'distans_i_km', '', 'snitt_lunch_pris', 'buffé_alternativ', 'medelhavskost', 'lokal_mat', 'annat', 'varmkorvar', 'hamburgare', 'konditori', 'asiatiskt'];
        switch (word) {
            case 'description':
                word = swedishNames[0];
                return word;
            case 'type':
                word = swedishNames[1];
                return word;
            case 'rating':
                word = swedishNames[2];
                return word;
            case 'sub_type':
                word = swedishNames[1];
                return word;
            case 'distance_in_km':
                word = swedishNames[4];
                return word;
            case 'search_tags':
                word = swedishNames[5];
                return word;
            case 'avg_lunch_pricing':
                word = swedishNames[6];
                return word;
            case 'buffet_option':
                word = swedishNames[7];
                return word;
            case 'MEDITERRANEAN':
                word = swedishNames[8];
                return word;
            case 'LOCAL':
                word = swedishNames[9];
                return word;
            case 'OTHER':
                word = swedishNames[10];
                return word;
            case 'HOT_DOGS':
                word = swedishNames[11];
                return word;
            case 'BURGERS':
                word = swedishNames[12];
                return word;
            case 'PASTRIES':
                word = swedishNames[13];
                return word;
            case 'ASIAN':
                word = swedishNames[14];
                return word;
            default:
                return word;
        }
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
}

