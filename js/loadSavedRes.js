// Funktion som laddar in/upp datan som användaren sparat lokalt i savedBox elementet
// Behöver skriva en if-sats som kollar ifall den redan finns i localstorage

let clickCounter = 0;
let listCounter = 1;

function init() {

    document.getElementById('addNewListBox').addEventListener('click', addNewList);

    loadFromLocalStorage;






    /*
    loadSavedList();
    let dragElems = document.querySelectorAll("#savedBox div.restaurantCard");
    for (let i = 0; i < dragElems.length; i++) {
        dragElems[i].draggable = true;
        dragElems[i].addEventListener("dragstart", dragStart);
        dragElems[i].addEventListener("click", clickRestaurants);
    }

    loadCustomList();
    removeRestaurant();
    addList()
*/



}
window.addEventListener("load", init);


function addNewList() {

    let savedFlexbox = document.getElementById('savedFlexbox');

    // Avslutar om det redan finns 5 lådor
    if (listCounter > 5) {
        return; 
    }

    // Ta bort den sista lådan som kommer upp även om det finns 5 redan
    if (listCounter === 5) {
        savedFlexbox.removeChild(savedFlexbox.lastElementChild);
    } 

    // Skapar ny låda för den nya listan
    let newListBox = document.createElement('div');
    newListBox.classList.add('box');


    let inputDiv = document.createElement('div');
    let input = document.createElement('input');
    input.type = 'text';
    input.classList.add('listInput');
    input.placeholder = `Ny lista ${listCounter}`;
    let penIcon = document.createElement('img');
    penIcon.src = 'images/penna.svg';
    penIcon.classList.add('pen');

    inputDiv.appendChild(input);
    inputDiv.appendChild(penIcon);
    newListBox.appendChild(inputDiv);



    // För att lägga till fler listor
    let listBoxDiv = document.createElement('div');
    listBoxDiv.classList.add('listBox');
    newListBox.appendChild(listBoxDiv);

    let closeButton = document.createElement('p');
    closeButton.classList.add('closeButton');
    closeButton.textContent = 'x';
    closeButton.addEventListener('click', function() {
        
        savedFlexbox.removeChild(newListBox);
        listCounter--;
        saveListToLocalStorage();
        
    });


    listBoxDiv.appendChild(closeButton);

    
    let plusSign = document.createElement('p');
    plusSign.classList.add('plusSign');
    plusSign.textContent = '+';
    plusSign.addEventListener('click', addNewList);

    input.addEventListener('blur', function() {
        saveListName(newListBox, input, inputDiv, penIcon);
        saveListToLocalStorage();
    });


    input.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            saveListName(newListBox, input, inputDiv, penIcon);
            saveListToLocalStorage();
        }
    });

    // Lägger till listan före lägg till nya listor-boxen
    savedFlexbox.insertBefore(newListBox, document.getElementById('addNewListBox'));

    listCounter++;

    saveListToLocalStorage();
     
}



function saveListName(newListBox, input, inputDiv, penIcon) {

    let value = input.value.trim();
    if (value !== '') {
        // Skapar h2 för input text
        let title = document.createElement('h2');
        title.textContent = value;
        newListBox.replaceChild(title, inputDiv);
        penIcon.style.display = 'none';
    } else {
        newListBox.replaceChild(inputDiv, title); 
        penIcon.style.display = 'inline';
    } 

}

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











/*
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

function reInitDragElem() {
    let dragElems = document.querySelectorAll("#savedBox div.restaurantCard");
    for (let i = 0; i < dragElems.length; i++) {
        dragElems[i].draggable = true;
        dragElems[i].addEventListener("dragstart", dragStart);
    }
}

function dragStart() {
    let dragElem = this;
    dragElem.draggable = true;

    const dropElem = document.querySelector("#listBox");

    dragElem.addEventListener("dragend", dragEnd);
    dropElem.addEventListener("dragover", dropZone);
    dropElem.addEventListener("dragenter", dropZone);
    dropElem.addEventListener("dragleave", dropZone);
    dropElem.addEventListener("drop", dropZone);


    function dragEnd() {
        dragElem.removeEventListener("dragend", dragEnd);

        dropElem.removeEventListener("dragover", dropZone);
        dropElem.removeEventListener("dragenter", dropZone);
        dropElem.removeEventListener("dragleave", dropZone);
        dropElem.removeEventListener("drop", dropZone);

    }
    function dropZone(e) {
        e.preventDefault();
        let dropElem = this;

        switch (e.type) {
            case "dragenter":
                dropElem.classList.add("highlight");
                break;
            case "dragleave":
                dropElem.classList.remove("highlight");
                break;
            case "drop":
                dropElem.classList.remove("highlight");

                const clonedListElement = dragElem.cloneNode(true);
                dropElem.appendChild(clonedListElement);

                dragElem.classList.remove("restaurantCard");

                dragElem.parentNode.removeChild(dragElem);

                updateLocalStorage();
                init();
                break;
        }
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

function removeFromFavoritesList(index) {
    const savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];

    savedRestaurant.splice(index, 1);

    localStorage.setItem("savedRestaurant", JSON.stringify(savedRestaurant));
}

function removeFromCustomList(index) {
    const savedListArray = JSON.parse(localStorage.getItem("savedListArray")) || [];

    savedListArray.splice(index, 1);

    localStorage.setItem("savedListArray", JSON.stringify(savedListArray));
}

function clickRestaurants(e) {
    e.preventDefault();
    let dragElems = document.querySelectorAll("#savedBox div.restaurantCard");

    clickCounter++;

    let dragElemsArray = Array.from(dragElems);
    let index = dragElemsArray.indexOf(this);

    setTimeout(() => {
        clickCounter = 0;
    }, 500)

    if (clickCounter === 2) {
        const savedListArray = JSON.parse(localStorage.getItem("savedListArray")) || [];
        savedListArray.push(this.outerHTML);
        localStorage.setItem("savedListArray", JSON.stringify(savedListArray));

        removeFromFavoritesList(index);
        loadSavedList();
        loadCustomList();
        init();
    }
}
*/