let listCounter = 1; // How many list there are
let maxList = 5; // How many list there can be

function init() {

    document.getElementById("addNewListBox").addEventListener("click", addNewList);

    loadSavedList();
    makeCardsDraggable();
    setupTrashCanClick();
    loadAllLists();

}
window.addEventListener("load", init);

// Lägger till och skapar lista
function addNewList() {

    let savedFlexbox = document.getElementById("savedFlexbox");

    // Avslutar om det redan finns 5 lådor
    if (listCounter > maxList) {
        return;
    }

    // Ta bort den sista lådan som kommer upp även om det finns 5 redan
    if (listCounter === 5) {
        savedFlexbox.removeChild(savedFlexbox.lastElementChild);
    }

    // Skapar ny låda för den nya listan
    let newListBox = document.createElement("div");
    newListBox.classList.add("box");

    let inputDiv = document.createElement("div");
    let input = document.createElement("input");
    input.type = "text";
    input.classList.add("listInput");
    input.placeholder = `Ny lista ${listCounter}`;
    let penIcon = document.createElement("img");
    penIcon.src = "images/penna.svg";
    penIcon.classList.add("pen");

    inputDiv.appendChild(input);
    inputDiv.appendChild(penIcon);
    newListBox.appendChild(inputDiv);

    // För att kunna lägga till fler listor
    let listBoxDiv = document.createElement("div");
    listBoxDiv.classList.add("listBox");
    newListBox.appendChild(listBoxDiv);

    let closeButton = document.createElement("p");
    closeButton.classList.add("closeButton");
    closeButton.textContent = "x";
    closeButton.addEventListener("click", function () {

        savedFlexbox.removeChild(newListBox);
        listCounter--;
        saveAllLists();

    });

    listBoxDiv.appendChild(closeButton);

    let plusSign = document.createElement("p");
    plusSign.classList.add("plusSign");
    plusSign.textContent = "+";
    plusSign.addEventListener("click", addNewList);

    input.addEventListener("blur", function () {
        saveListName(newListBox, input, inputDiv, penIcon);

    });

    // Fungerar ej!!!!
    input.addEventListener("keydown", function (event) {
        if (event.key === "Tab") {
            event.preventDefault();
            saveListName(newListBox, input, inputDiv, penIcon);

        }
    });

    // Lägger till listan före lägg till nya listor-boxen
    savedFlexbox.insertBefore(newListBox, document.getElementById("addNewListBox"));

    listCounter++;

    makeCardsDraggable();
    saveAllLists();
}

// Skapar så att det man namnger listan till blir en h2
function saveListName(newListBox, input, inputDiv, penIcon) {

    let value = input.value.trim();
    if (value !== "") {
        // Skapar h2 för input text
        let title = document.createElement("h2");
        title.textContent = value;
        newListBox.replaceChild(title, inputDiv);
        penIcon.style.display = "none";
        saveAllLists();
    } else {
        newListBox.replaceChild(inputDiv, title);
        penIcon.style.display = "inline";
    }

}

function loadSavedList() {
    const savedBox = document.querySelector("#savedBox");
    const savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];
    savedBox.innerHTML = " ";

    for (let i = 0; i < savedRestaurant.length; i++) {
        const savedListElements = document.createElement("div");
        savedListElements.innerHTML = savedRestaurant[i];
        savedBox.appendChild(savedListElements);
    }

    let trashCans = document.querySelectorAll(".saveBtnIndex");

    for (let i = 0; i < trashCans.length; i++) {
        trashCans[i].src = "/images/soptunna.svg";
    }
}

// Gör så att korten blir dragbara
function makeCardsDraggable() {
    const cards = document.querySelectorAll(".restaurantCard");
    const listBoxes = document.querySelectorAll(".listBox");

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

        const draggedRestaurant = document.querySelector(".dragging");
        droppedListBox.appendChild(draggedRestaurant);
        draggedRestaurant.classList.remove("dragging");

    }

}

// Tar bort elementet från localstorage med soptunnan
function setupTrashCanClick() {
    const trashCans = document.querySelectorAll(".saveBtnIndex");
    trashCans.forEach(trashCan => {
        trashCan.addEventListener("click", function () {
            let thisId = this.parentElement.id;
            let savedArray = JSON.parse(localStorage.getItem("savedRestaurant"))
            let filteredArray = savedArray.filter(string => !string.includes(thisId));
            
            localStorage.clear();
            localStorage.setItem("savedRestaurant", JSON.stringify(filteredArray));
            this.parentElement.parentElement.remove();
        });
    });
}

// Sparar listorna
function saveAllLists() {
    let savedLists = [];
    const listBoxes = document.querySelectorAll(".box");

    listBoxes.forEach(listBox => {
        let listName = listBox.querySelector("h2").textContent;
        savedLists.push(listName);
    });

    localStorage.setItem("savedLists", JSON.stringify(savedLists));
}

// Laddar listorna
function loadAllLists() {
    const savedLists = JSON.parse(localStorage.getItem("savedLists")) || [];

    savedLists.forEach(listName => {
        addNewList(listName);
    });
}


/*




function loadCustomList() {
    const savedListArray = JSON.parse(localStorage.getItem("savedListArray")) || [];
    const dropElem = document.querySelector("#listBox");
    dropElem.innerHTML = " ";

    for (let i = 0; i < savedListArray.length; i++) {
        const div = document.createElement("div");
        card = savedListArray[i];
        div.innerHTML = card;
        dropElem.appendChild(div.firstChild);
    }

}


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


function loadSavedList() {
    const savedBox = document.querySelector("#savedBox");
    const savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];
    savedBox.innerHTML = " ";

    for (let i = 0; i < savedRestaurant.length; i++) {
        const savedListElements = document.createElement("div");
        savedListElements.innerHTML = savedRestaurant[i];
        savedBox.appendChild(savedListElements);
    }

    let trashCans = document.querySelectorAll(".saveBtnIndex");


    for (let i = 0; i < trashCans.length; i++) {
        trashCans[i].src = "/images/soptunna.svg";
    }
}

function loadCustomList() {
    const savedListArray = JSON.parse(localStorage.getItem("savedListArray")) || [];
    const dropElem = document.querySelector("#listBox");
    dropElem.innerHTML = " ";

    for (let i = 0; i < savedListArray.length; i++) {
        const div = document.createElement("div");
        card = savedListArray[i];
        div.innerHTML = card;
        dropElem.appendChild(div.firstChild);
    }

}

function removeRestaurant() {
    let trashCansFavorites = document.querySelectorAll("#savedBox .saveBtnIndex");

    for (let i = 0; i < trashCansFavorites.length; i++) {
        trashCansFavorites[i].addEventListener("click", () => {
            removeFromFavoritesList(i);
            loadSavedList();
            reInitDragElem();
            init();
        });
    }

    let trashCansCustom = document.querySelectorAll("#listBox .saveBtnIndex");

    for (let i = 0; i < trashCansCustom.length; i++) {
        trashCansCustom[i].addEventListener("click", () => {
            removeFromCustomList(i);
            loadCustomList();
            reInitDragElem();
            init();
        });
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