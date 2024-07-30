
let listCounter = 0;        // The amount of lists that are currently present
const maxBoxes = 5;         // Maximum amount of lists possible
let currentContainer;       // The current dragged container
let movingCard;             // The container that the card is dropped on
let boxContainer;           // Container that contains restaurant cards
let addButton;              // Button to press to add new list item

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

        initTitleEventListeners(); // Call the new function
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

        // Ändra så att den inte lägger massa eventlistners på samma elment hela tiden
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
    if (listCounter >= 5) {
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
            let containerChildrenNodes = Array.from(currentContainer.children);
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

    let cards = document.querySelectorAll(".restaurantCard");
    let containers = document.querySelectorAll(".listBox");
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
    movingCard.style.width = "370px"
    movingCard.style.zIndex = "202";
    movingCard.style.left = (touch.clientX - touchOffsetX) + "px";
    movingCard.style.top = (touch.clientY - touchOffsetY) + "px";
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