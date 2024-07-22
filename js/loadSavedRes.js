
let listCounter = 0; // Hur många listor som finns
let maxList = 5; // Max antal på listorna
let listArray = [];
let cleanedIds;

function initLoadSaved() {

    document.getElementById("addNewListBox").addEventListener("click", addNewList);

    loadSavedCards();
    loadSavedState();
    recreateRestaurantCards();
}
window.addEventListener("load", init);

async function recreateRestaurantCards() {
    const savedRestaurantIds = JSON.parse(localStorage.getItem("savedRestaurant")) || [];

    if (savedRestaurantIds.length === 0) {
        console.log("No saved restaurants to recreate");
        return;
    }
    cleanedIds = savedRestaurantIds.map(id => id.replace(/r/, ''));
    console.log(savedRestaurantIds); // original ids
    console.log(cleanedIds); // cleaned ids

    fetchData();
}

// Lägger till och skapar lista
function addNewList() {


    let savedFlexbox = document.getElementById("savedFlexbox");

    // Avslutar om det redan finns 5 lådor
    if (listCounter > maxList) {
        return;
    }


    // Skapar ny låda för den nya listan
    let newListBox = document.createElement("div");
    newListBox.classList.add("box");

    let inputDiv = document.createElement("div");
    let input = document.createElement("input");
    input.type = "text";
    input.classList.add("listInput");
    input.placeholder = `Ny lista ${getListNumber()}`;
    //input.placeholder = `Ny lista ${getListNumber()}`;
    let penIcon = document.createElement("img");
    penIcon.src = "images/penna.svg";
    penIcon.classList.add("pen");

    inputDiv.appendChild(input);
    inputDiv.appendChild(penIcon);
    newListBox.appendChild(inputDiv);

    //För att kunna lägga till fler listor
    let listBoxDiv = document.createElement("div");
    listBoxDiv.classList.add("listBox");
    newListBox.appendChild(listBoxDiv);


    let closeButton = document.createElement("p");
    closeButton.classList.add("closeButton");
    closeButton.textContent = "x";
    closeButton.addEventListener("click", function () {
        savedFlexbox.removeChild(newListBox);
        listCounter--;
        removeBox();
        updateListNames();
        saveState();


    });

    listBoxDiv.appendChild(closeButton);


    input.addEventListener("blur", function () {
        saveListName(newListBox, input, inputDiv, penIcon);
        saveState();
    });

    // 
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            input.blur();
            saveListName(newListBox, input, inputDiv, penIcon);
            saveState();

        }
    });

    // Lägger till listan före lägg till nya listor-boxen
    savedFlexbox.insertBefore(newListBox, document.getElementById("addNewListBox"));

    listCounter++;
    saveState();

    makeCardsDraggable();
    removeBox();


}

//Uppdaterar namn när en lista tas bort så sifforna stämmer
function updateListNames() {
    let lists = document.querySelectorAll(".listInput");
    lists.forEach((list, index) => {
        list.placeholder = `Ny lista ${index + 1}`;
    });
}

// Hämtar i nästa led tillgängliga nummer för listan
function getListNumber() {
    let currentNumbers = Array.from(document.querySelectorAll(".listInput")).map(input => parseInt(input.placeholder.split(" ")[2]));
    for (let i = 1; i <= maxList; i++) {
        if (!currentNumbers.includes(i)) {
            return i;
        }
    }
    return maxList + 1; // Om alla nummer skulle vara upptagna
}

// Läser av och gömmer addnewlistbox om det finns 5 listor lägger till när det tas bort och är under 5
function removeBox() {
    if (listCounter === maxList) {
        document.getElementById("addNewListBox").style.display = "none";

    } else {
        document.getElementById("addNewListBox").style.display = "block";
    }
}


// Skapar så att det man namnger listan till blir en h2
function saveListName(newListBox, input, inputDiv, penIcon) {

    let value = input.value.trim();

    if (value !== "" && value.length !== 0) {
        let title = document.createElement("h2");
        title.textContent = value;
        newListBox.replaceChild(title, inputDiv);
        penIcon.style.display = "none";
        title.addEventListener("click", function () {
            newListBox.replaceChild(inputDiv, title);
            penIcon.style.display = "inline";
            input.focus();
        });
        saveState();

    } else {
        defaultName = `Ny lista ${getListNumber()}`;
        input.value = defaultName;
        saveListName(newListBox, input, inputDiv, penIcon, defaultName);
    }

}


// Gör så att korten blir dragbara
function makeCardsDraggable() {
    let cards = document.querySelectorAll(".restaurantCard");
    let listBoxes = document.querySelectorAll(".listBox");

    cards.forEach(card => {
        if (listBoxes.length > 1) {
            card.setAttribute("draggable", true);
            card.addEventListener("dragstart", dragStart);
        } else {
            card.removeAttribute("draggable");
            card.removeEventListener("dragstart", dragStart);
        }
    });
}


// dragstart och stopp
function dragStart(e) {
    let dragElem = this;
    dragElem.classList.add("dragging");

    const listBoxes = document.querySelectorAll(".listBox");
    listBoxes.forEach(listBox => {
        listBox.addEventListener("dragover", dragOver);
        listBox.addEventListener("dragenter", dragEnter);
        listBox.addEventListener("drop", dropZone);
    });
}
function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();

}

function dropZone(e) {
    e.preventDefault();
    const droppedListBox = this;

    if (droppedListBox.querySelector(".plusSign")) {
        return;
    }

    let draggedRestaurant = document.querySelector(".dragging");
    console.log(draggedRestaurant.className);
    console.log(draggedRestaurant);
    droppedListBox.appendChild(draggedRestaurant);

    draggedRestaurant.classList.remove("dragging");
    whenDropped(draggedRestaurant);
    saveState();

}


// Tar bort elementet från localstorage med soptunnan
function setupTrashCanClick() {
    console.log("i funktion");
    const trashCans = document.querySelectorAll(".saveBtnIndex");

    trashCans.forEach(trashCan => {
        trashCan.addEventListener("click", function () {
            const listElement = this.parentNode.parentNode;
            console.log(listElement);

            const restaurantId = listElement.firstElementChild.id.startsWith("#") ? listElement.firstElementChild.id.slice(1) : listElement.firstElementChild.id.id;
            console.log("Removing restaurant ID:", restaurantId);

            let savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];
            console.log("Before removing:", savedRestaurant);

            if (savedRestaurant.includes(restaurantId)) {
                savedRestaurant = savedRestaurant.filter(id => id !== restaurantId);
                localStorage.setItem("savedRestaurant", JSON.stringify(savedRestaurant));
                console.log("After removing:", savedRestaurant);

                // Remove the card element from the DOM
                listElement.parentNode.removeChild(listElement);
                console.log("Card removed from DOM");

                // Save the state
                saveState();
            }
        });
    });
}

function whenDropped(draggedRestaurant) {
    console.log("123");
    console.log(draggedRestaurant);

    const restaurantId = draggedRestaurant.firstElementChild.id.startsWith("#") ? draggedRestaurant.firstElementChild.id.slice(1) : draggedRestaurant.firstElementChild.id.id;
    console.log(restaurantId);

    console.log("Removing restaurant ID:", restaurantId);

    let savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];
    console.log("Before removing:", savedRestaurant);

    if (savedRestaurant.includes(restaurantId)) {
        savedRestaurant = savedRestaurant.filter(id => id !== restaurantId);
        localStorage.setItem("savedRestaurant", JSON.stringify(savedRestaurant));
        console.log("After removing:", savedRestaurant);

        saveState();
    }
}


function loadSavedCards() {
    let trashCans = document.querySelectorAll(".saveBtnIndex");

    for (let i = 0; i < trashCans.length; i++) {
        trashCans[i].src = "/images/soptunna.svg";

    }

}

function moveCardToFavorites(card) {
    console.log("DFGH")
    let favoritesBox = document.getElementById("savedBox");

    card.parentElement.removeChild(card);

    favoritesBox.appendChild(card);
    saveState();
}

function saveState() {
    let state = {
        lists: [],
        cards: []
    };

    document.querySelectorAll(".box").forEach((listBox, index) => {
        let listName = listBox.querySelector("h2") ? listBox.querySelector("h2").textContent : listBox.querySelector("input").placeholder;
        let cards = Array.from(listBox.querySelectorAll(".restaurantCard")).map(card => card.outerHTML);
        state.lists.push({ listName, cards });
    });

    localStorage.setItem("appState", JSON.stringify(state));
}

// Laddar tillståndet på sidan från localStorage
function loadSavedState() {


    let savedState = JSON.parse(localStorage.getItem("appState"));

    if (savedState) {
        console.log(savedState);

        savedState.lists.forEach(savedList => {
            // Ignorerar de statiska listorna, "Mina favoriter" och "Skapa ny lista"
            if (savedList.listName === "Mina favoriter" || savedList.listName === "Skapa ny lista") {
                return;
            }


            let newListBox = document.createElement("div");
            newListBox.classList.add("box");


            let title = document.createElement("h2");
            title.textContent = savedList.listName;
            title.addEventListener("click", function () {
                newListBox.replaceChild(inputDiv, title);
                penIcon.style.display = "inline";
                input.focus();
            });

            let inputDiv = document.createElement("div");
            let input = document.createElement("input");
            input.type = "text";
            input.classList.add("listInput");
            input.placeholder = savedList.listName;
            let penIcon = document.createElement("img");
            penIcon.src = "images/penna.svg";
            penIcon.classList.add("pen");

            inputDiv.appendChild(input);
            inputDiv.appendChild(penIcon);
            newListBox.appendChild(inputDiv);

            let listBoxDiv = document.createElement("div");
            listBoxDiv.classList.add("listBox");
            newListBox.appendChild(listBoxDiv);
            let closeButton = document.createElement("p");
            closeButton.classList.add("closeButton");
            closeButton.textContent = "x";
            closeButton.addEventListener("click", function () {
                newListBox.parentElement.removeChild(newListBox);
                listCounter--;
                updateListNames();
                saveState();
                removeBox();
            });

            listBoxDiv.appendChild(closeButton);

            savedList.cards.forEach(cardHTML => {
                let temporaryDiv = document.createElement("div");
                temporaryDiv.innerHTML = cardHTML;
                listBoxDiv.appendChild(temporaryDiv.firstChild);
            });

            input.addEventListener("blur", function (event) {
                // Adding a slight delay to allow keydown event to complete
                setTimeout(function () {
                    console.log(event);

                    console.log("inputDiv");

                    saveListName(newListBox, input, inputDiv, penIcon);
                    saveState();
                }, 10);
            });

            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    console.log(event);

                    event.preventDefault();
                    input.blur();
                }
            });

            let savedFlexbox = document.getElementById("savedFlexbox");
            savedFlexbox.insertBefore(newListBox, document.getElementById("addNewListBox"));
            listCounter++;
        });

        makeCardsDraggable();
        removeBox();
    } else {
        console.log("Inga sparade listor");
    }

}


/*
let savedState = JSON.parse(localStorage.getItem("appState"));

if (savedState) {
    savedState.lists.forEach(savedList => {
        let newListBox = document.createElement("div");
        newListBox.classList.add("box");

        let inputDiv = document.createElement("div");
        let input = document.createElement("input");
        input.type = "text";
        input.classList.add("listInput");
        input.placeholder = savedList.listName;
        let penIcon = document.createElement("img");
        penIcon.src = "images/penna.svg";
        penIcon.classList.add("pen");

        inputDiv.appendChild(input);
        inputDiv.appendChild(penIcon);
        newListBox.appendChild(inputDiv);

        let listBoxDiv = document.createElement("div");
        listBoxDiv.classList.add("listBox");
        newListBox.appendChild(listBoxDiv);

        savedList.cards.forEach(cardHTML => {
            let tempDiv = document.createElement("div");
            tempDiv.innerHTML = cardHTML;
            listBoxDiv.appendChild(tempDiv.firstChild);
        });

        let closeButton = document.createElement("p");
        closeButton.classList.add("closeButton");
        closeButton.textContent = "x";
        closeButton.addEventListener("click", function () {
            newListBox.parentElement.removeChild(newListBox);
            listCounter--;
            updateListNames();
            saveState(); 
            removeBox();
        });

        listBoxDiv.appendChild(closeButton);

        input.addEventListener("blur", function () {
            saveListName(newListBox, input, inputDiv, penIcon);
            saveState(); // Spara tillstånd efter namnändring
        });

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                input.blur();
                saveListName(newListBox, input, inputDiv, penIcon);
                saveState(); 
            }
        });

        let savedFlexbox = document.getElementById("savedFlexbox");
        savedFlexbox.insertBefore(newListBox, document.getElementById("addNewListBox"));
        listCounter++;
    });

    makeCardsDraggable();
    removeBox();
}  



*/









/*


function saveListToArray(newListBox) {
    let listObject = {
        id: listCounter,
        element: newListBox,
        name: newListBox.querySelector('input').placeholder
    };
    listArray.push(listObject);
    console.log(listArray);
    saveListsToLocalStorage();
}

function saveListsToLocalStorage() {
    let listsToSave = listArray.map(list => ({
        id: list.id,
        name: list.name
    }));
    localStorage.setItem('savedLists', JSON.stringify(listsToSave));
    console.log("Listor sparade i localStorage:", listsToSave);
}

function loadSavedLists() {
    
    let savedLists = JSON.parse(localStorage.getItem('savedLists')) || [];
    savedLists.forEach(list => {
        let newListBox = document.createElement("div");
        newListBox.classList.add("box");

        let inputDiv = document.createElement("div");
        let input = document.createElement("input");
        input.type = "text";
        input.classList.add("listInput");
        input.placeholder = list.name;

        let penIcon = document.createElement("img");
        penIcon.src = "images/penna.svg";
        penIcon.classList.add("pen");

        inputDiv.appendChild(input);
        inputDiv.appendChild(penIcon);
        newListBox.appendChild(inputDiv);

        let listBoxDiv = document.createElement("div");
        listBoxDiv.classList.add("listBox");
        newListBox.appendChild(listBoxDiv);

        let closeButton = document.createElement("p");
        closeButton.classList.add("closeButton");
        closeButton.textContent = "x";
        closeButton.addEventListener("click", function () {
            document.getElementById("savedFlexbox").removeChild(newListBox);
            listCounter--;
            removeListFromArray(newListBox);
            updateListNames();
            saveListsToLocalStorage();
        });

        listBoxDiv.appendChild(closeButton);

        input.addEventListener("blur", function () {
            saveListName(newListBox, input, inputDiv, penIcon);
        });

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                input.blur();
                saveListName(newListBox, input, inputDiv, penIcon);
            }
        });

        document.getElementById("savedFlexbox").insertBefore(newListBox, document.getElementById("addNewListBox"));

        listCounter++;
        saveListToArray(newListBox);
    });
    
}





/*
// Sparar listor i localStorage
function saveLists() {
    listArray = [];
    document.querySelectorAll('.box').forEach(box => {
        let listTitle = box.querySelector('h2') ? box.querySelector('h2').textContent : box.querySelector('input').placeholder;
        let items = [];
        box.querySelectorAll('.restaurantCard').forEach(card => {
            items.push(card.outerHTML);
        });
        listArray.push({ title: listTitle, items: items });
    });
    localStorage.setItem('lists', JSON.stringify(listArray));
}

// Laddar listor från localStorage
function loadSavedLists() {
    let savedLists = JSON.parse(localStorage.getItem('lists')) || [];
    let savedFlexbox = document.getElementById("savedFlexbox");

    savedLists.forEach(savedList => {
        let newListBox = document.createElement("div");
        newListBox.classList.add("box");

        let inputDiv = document.createElement("div");
        let input = document.createElement("input");
        input.type = "text";
        input.classList.add("listInput");
        input.placeholder = savedList.title;

        let penIcon = document.createElement("img");
        penIcon.src = "images/penna.svg";
        penIcon.classList.add("pen");

        inputDiv.appendChild(input);
        inputDiv.appendChild(penIcon);
        newListBox.appendChild(inputDiv);

        let listBoxDiv = document.createElement("div");
        listBoxDiv.classList.add("listBox");
        newListBox.appendChild(listBoxDiv);

        let closeButton = document.createElement("p");
        closeButton.classList.add("closeButton");
        closeButton.textContent = "x";
        closeButton.addEventListener("click", function () {
            savedFlexbox.removeChild(newListBox);
            listCounter--;
            removeBox();
            updateListNames();
            saveLists();
        });

        listBoxDiv.appendChild(closeButton);

        savedList.items.forEach(item => {
            let itemDiv = document.createElement("div");
            itemDiv.innerHTML = item;
            listBoxDiv.appendChild(itemDiv.firstChild);
        });

        savedFlexbox.insertBefore(newListBox, document.getElementById("addNewListBox"));

        listCounter++;
    });

    updateListNames();
    removeBox();
    makeCardsDraggable();
}




/*
// Sparar listorna
function saveAllLists() {
    let savedLists = [];
    const listBoxes = document.querySelectorAll(".box");
    listBoxes.forEach(listBox => {
        let listNameElement = listBox.querySelector("h2") || listBox.querySelector("input");
        if (listNameElement) {
            let listName = listNameElement.textContent || listNameElement.value;
            savedLists.push(listName);
        }
    });
    localStorage.setItem("savedLists", JSON.stringify(savedLists));

    
    let savedLists = [];
    const listBoxes = document.querySelectorAll(".box");

    listBoxes.forEach(listBox => {
        let listName = listBox.querySelector("h2").textContent;
        savedLists.push(listName);
    });

    localStorage.setItem("savedLists", JSON.stringify(savedLists));
    
}
/*



// Laddar listorna
function loadAllLists() {
    const savedLists = JSON.parse(localStorage.getItem("savedLists")) || [];

    savedLists.forEach(listName => {
        addNewList(listName);
    });
}

/*


/*
function saveListToLocalStorage() {
    let lists = [];

    console.log(lists)

    let savedFlexbox = document.getElementById('savedFlexbox');
    let listElements = savedFlexbox.querySelectorAll('.box');

    listElements.forEach(element => {
        let titleElement = element.querySelector('h2');
        if (titleElement) {
            lists.push(titleElement.textContent);
        }
    });

    try {
        localStorage.setItem('savedLists', JSON.stringify(lists));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Ladda listorna från localStorage vid sidans laddning
function loadFromLocalStorage() {
    let lists = JSON.parse(localStorage.getItem('savedLists'));

    if (lists) {
        lists.forEach(list => {
            let newListBox = document.createElement('div');
            newListBox.classList.add('box');

            let title = document.createElement('h2');
            title.textContent = list;

            newListBox.appendChild(title);
            document.getElementById('savedFlexbox').appendChild(newListBox);
        });

        listCounter = lists.length + 1;
    }
}


function updateLocalStorage() {
    const dropElem = document.querySelector("#listBox");
    const restaurantCards = dropElem.querySelectorAll(".restaurantCard");
    const savedListArray = [];

    for (let i = 0; i < restaurantCards.length; i++) {
        card = restaurantCards[i];
        savedListArray.push(card.outerHTML);
    }
    removeFromFavoritesList(card);
    localStorage.setItem("savedListArray", JSON.stringify(savedListArray));

}


*/