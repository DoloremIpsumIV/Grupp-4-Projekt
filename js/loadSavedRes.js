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