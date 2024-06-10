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
function handleClick(defaultSearch) {
    const dropDownButtonImg = document.querySelector("#distance button img");
    if (defaultSearch == true) {                                                // Selects the first dropdown elements if the user searches without choosing anything first
        for (let i = 0; i < dropDownContentElem.length; i++) {
            const childElem = dropDownContentFirstChild[i].firstElementChild;
            switch (dropDownContentElem[i].innerText) {
                case "Restaurangtyp":
                    dropDownContentElem[i].innerHTML = "Alla" + dropDownButtonImg.outerHTML;
                    Array.from(selectedDropdownContent).splice(0, 1, childElem);

                    childElem.removeEventListener("click", handleClick);
                    childElem.style.opacity = "0.5";
                    childElem.style.backgroundColor = "DimGray";
                    childElem.style.cursor = "default";
                    break;
                case "Avstånd (km)":
                    dropDownContentElem[i].innerHTML = "1 KM" + dropDownButtonImg.outerHTML;
                    Array.from(selectedDropdownContent).splice(0, 1, childElem);

                    childElem.removeEventListener("click", handleClick);
                    childElem.style.opacity = "0.5";
                    childElem.style.backgroundColor = "DimGray";
                    childElem.style.cursor = "default";
                    break;
                case "Prisklass (sek)":
                    dropDownContentElem[i].innerHTML = "Alla" + dropDownButtonImg.outerHTML;
                    Array.from(selectedDropdownContent).splice(0, 1, childElem);

                    childElem.removeEventListener("click", handleClick);
                    childElem.style.opacity = "0.5";
                    childElem.style.backgroundColor = "DimGray";
                    childElem.style.cursor = "default";
                    break;
            }
        }
    }
    else {
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
    }
}

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
