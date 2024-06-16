// Funktion som laddar in/upp datan som användaren sparat lokalt i savedBox elementet
// Behöver skriva en if-sats som kollar ifall den redan finns i localstorage

console.log("loadsavedres")
document.addEventListener("DOMContentLoaded", () => {
    const savedBox = document.querySelector("#savedBox");
    let savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];

    for (let i = 0; i < savedRestaurant.length; i++) {
        const savedListElements = document.createElement("div");
        savedListElements.innerHTML = savedRestaurant[i];
        savedBox.appendChild(savedListElements);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    let dragElems = document.querySelectorAll("#savedBox div.restaurantCard");
    console.log(dragElems);
    for (let i = 0; i < dragElems.length; i++) {
        dragElems[i].draggable = true;
        dragElems[i].addEventListener("dragstart", dragStart);
    }
});

function dragStart() {
    let dragElem = this;
    dragElem.draggable = true;

    const dropElem = document.querySelector("#listBox");
    console.log(dropElem);

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
                dragElem.classList.remove(".restaurantCard")
                break;
            case "dragleave":
                dropElem.classList.remove("highlight");
                dragElem.classList.remove(".restaurantCard")
                break;
            case "drop":
                dropElem.classList.remove("highlight");

                const clonedListElement = dragElem.cloneNode(true);
                dropElem.appendChild(clonedListElement);

                dragElem.classList.remove("restaurantCard");

                dragElem.parentNode.removeChild(dragElem);

                updateLocalStorage();
                removeFromLocalStorage(dragElem.innerHTML);
                break;
        }
    }
}

function updateLocalStorage() {
    const dropElem = document.querySelector("#listBox");
    const restaurantCards = dropElem.querySelectorAll(".restaurantCard");
    console.log(restaurantCards);
    const savedListArray = [];
    console.log(savedListArray);
    for (let i = 0; i < restaurantCards.length; i++) {
        card = restaurantCards[i];
        savedListArray.push(card.outerHTML);
    }

    localStorage.setItem("savedListArray", JSON.stringify(savedListArray));
}

document.addEventListener("DOMContentLoaded", () => {
    const savedListArray = JSON.parse(localStorage.getItem("savedListArray")) || [];
    const dropElem = document.querySelector("#listBox");

    for (let i = 0; i < savedListArray.length; i++) {
        const div = document.createElement("div");
        card = savedListArray[i];

        div.innerHTML = card;
        dropElem.appendChild(div.firstChild);
    }

})

function removeFromLocalStorage(html) {
    const savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];
    const index = savedRestaurant.findIndex(item => item === html);

    savedRestaurant.splice(index, 1);

    localStorage.setItem("savedRestaurant", JSON.stringify(savedRestaurant));

    // förstår ej varför den alltid endast tar bort det sista indexet i arrayen
}