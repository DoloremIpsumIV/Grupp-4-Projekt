// Funktion som laddar in/upp datan som användaren sparat lokalt i savedBox elementet
// Behöver skriva en if-sats som kollar ifall den redan finns i localstorage


function init() {
    loadSavedList();

    let dragElems = document.querySelectorAll("#savedBox div.restaurantCard");
    console.log(dragElems);
    for (let i = 0; i < dragElems.length; i++) {
        dragElems[i].draggable = true;
        dragElems[i].addEventListener("dragstart", dragStart);
    }

    loadCustomList();
    removeRestaurant();
}
window.addEventListener("load", init);

function loadSavedList() {
    const savedBox = document.querySelector("#savedBox");
    const savedRestaurant = JSON.parse(localStorage.getItem("savedRestaurant")) || [];
    savedBox.innerHTML = " ";

    for (let i = 0; i < savedRestaurant.length; i++) {
        const savedListElements = document.createElement("div");
        savedListElements.innerHTML = savedRestaurant[i];
        savedBox.appendChild(savedListElements);
    }

    let trashCans = document.querySelectorAll("#saveBtnIndex");

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
    let trashCansFavorites = document.querySelectorAll("#savedBox #saveBtnIndex");

    for (let i = 0; i < trashCansFavorites.length; i++) {
        trashCansFavorites[i].addEventListener("click", () => {
            removeFromFavoritesList(i);
            loadSavedList();
            loadCustomList();
            removeRestaurant();
            reInitDragElem();
        });
    }

    let trashCansCustom = document.querySelectorAll("#listBox #saveBtnIndex");
    console.log(trashCansCustom);

    for (let i = 0; i < trashCansCustom.length; i++) {
        trashCansCustom[i].addEventListener("click", () => {
            removeFromCustomList(i);
            loadCustomList();
            removeRestaurant();
            reInitDragElem();

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
                removeRestaurant();
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