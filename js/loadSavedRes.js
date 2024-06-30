

let listCounter = 0; // Hur många listor som finns
let maxList = 5; // Max antal på listorna

function init() {

    document.getElementById("addNewListBox").addEventListener("click", addNewList);

    let cards = document.querySelectorAll(".restaurantCard");
    cards.forEach(card => {
        card.addEventListener("dblclick", function () {
            moveCardToFavorites(card);
        });
    });

    console.log("listCounter:", listCounter);

    console.log(cards)

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

        console.log("Före borttagning:", listCounter);
        savedFlexbox.removeChild(newListBox);
        listCounter--;
        console.log("Efter borttagning:", listCounter);

        removeBox();
        saveAllLists();
        updateListNames();
    });

    listBoxDiv.appendChild(closeButton);


    input.addEventListener("blur", function () {
        saveListName(newListBox, input, inputDiv, penIcon);

    });

    // 
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            input.blur(); 
            saveListName(newListBox, input, inputDiv, penIcon);

        }
    });

    // Lägger till listan före lägg till nya listor-boxen
    savedFlexbox.insertBefore(newListBox, document.getElementById("addNewListBox"));

    listCounter++;

    makeCardsDraggable();
    saveAllLists();
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
function removeBox(){
    if (listCounter === maxList) {
        document.getElementById("addNewListBox").style.display = "none";
        
    } else {
        document.getElementById("addNewListBox").style.display = "block";
    }
}


// Skapar så att det man namnger listan till blir en h2
function saveListName(newListBox, input, inputDiv, penIcon) {

    let value = input.value.trim();
    if (value !== "") {
        let title = document.createElement("h2");
        title.textContent = value;
        newListBox.replaceChild(title, inputDiv);
        penIcon.style.display = "none";
        title.addEventListener("click", function () {
            newListBox.replaceChild(inputDiv, title);
            penIcon.style.display = "inline";
            input.focus();
        });
        saveAllLists();
    } else {
        input.value = defaultName;
        saveListName(newListBox, input, inputDiv, penIcon, defaultName);
    }

}

function loadSavedList() {

    const savedBox = document.querySelector("#savedBox");
    const savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];
    savedBox.innerHTML = "";

    savedRestaurant.forEach(savedItem => {
        const savedListElements = document.createElement("div");
        savedListElements.innerHTML = savedItem;

        const cards = savedListElements.querySelectorAll(".restaurantCard");
        cards.forEach(card => {
            card.addEventListener("dblclick", function () {
                moveCardToFavorites(card);
            });
        });

        savedBox.appendChild(savedListElements);
    });
 
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

    saveAllLists(); 
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
        let listNameElement = listBox.querySelector("h2") || listBox.querySelector("input");
        if (listNameElement) {
            let listName = listNameElement.textContent || listNameElement.value;
            savedLists.push(listName);
        }
    });
    localStorage.setItem("savedLists", JSON.stringify(savedLists));

    /*
    let savedLists = [];
    const listBoxes = document.querySelectorAll(".box");

    listBoxes.forEach(listBox => {
        let listName = listBox.querySelector("h2").textContent;
        savedLists.push(listName);
    });

    localStorage.setItem("savedLists", JSON.stringify(savedLists));
    */
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