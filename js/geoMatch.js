
let imagesUsed = [
    "A_LA_CARTE.svg",
    "asian.svg",
    "burgers.svg",
    "HOT_DOGS.svg",
    "latin.svg",
    "MEDITERRANEAN.svg",
    "PASTRIES.svg",
    "pizza.svg"
]; //Bilderna som ska användas

let imageNames = {
    "A_LA_CARTE.svg": "A la carte",
    "asian.svg": "Asiatisk",
    "burgers.svg": "Burgare",
    "HOT_DOGS.svg": "Varmkorvar",
    "latin.svg": "Latin",
    "MEDITERRANEAN.svg": "Medelhavs",
    "PASTRIES.svg": "Bakverk",
    "pizza.svg": "Pizzeria"
};
let imageFolder = "mapIconsSVG"; // Folder with all icon images
let availableImages;             // Saves all remaining images 
let lastClickedImage = "";       // Saves the last clicked image
let playBtn;                     // Button object that starts the game
let restartGameBtn;              // Button for restarting the game
let GameStartBtn;                // Button to start the game

// Function that initiates on window load
function initGeoMatch() {
    loader = document.querySelector("#loaderId");

    smalandRadioBtn = document.querySelector("#smalandRadioBtn");
    olandRadioBtn = document.querySelector("#olandRadioBtn");

    playBtn = document.querySelector("#playButton");
    playBtn.addEventListener("click", gameSettings);

    let mapBtn = document.querySelector("#mapBtn2");
    mapBtn.addEventListener("click", openMapDialog);

    let findBtn = document.querySelector("#findBtn2");
    findBtn.addEventListener("click", initLoader);
    findBtn.addEventListener("click", getUserGeo);

    GameStartBtn = document.querySelector("#mapPlaybtn");
    GameStartBtn.addEventListener("click", (e) => startGame(e));
    


    GameStartBtn = document.querySelector("#GameStartBtn");
    GameStartBtn.style.display = "none";
    GameStartBtn.addEventListener("click", (e) => startGame(e));
    
}

// Shows the options to use either geo location or a map to choose user position
function gameSettings() {
    restartGameBtn = document.querySelector("#restartBox");
    restartGameBtn.addEventListener("click", restartGame);
    playBtn.style.display = "none";

    let selectBox = document.querySelector("#selectBox");
    selectBox.style.display = "flex";

    let closeButton2 = document.querySelector("#closeButton2");
    closeButton2.addEventListener("click", function () {
        selectBox.style.display = "none";
        playBtn.style.display = "block";
    });
}

function restartGame() {
    window.location.reload()
}

// Initiates the game and defines an array (availableImages) and makes sure the images are different from one another
function startGame() {
    overlay.style.display = "none";
    playBtn.style.display = "none";
    selectBox.style.display = "none";

    
    restartGameBtn.style.display = "flex";

    let gameBackground = document.querySelector("#boxBackground");
    gameBackground.style.display = "flex";

    let firstBoxInside = document.querySelector("#firstBox .insideBox");
    let secondBoxInside = document.querySelector("#secondBox .insideBox");

    let firstBox = document.querySelector("#firstBox");
    let secondBox = document.querySelector("#secondBox");

    firstBox.addEventListener("click", newImage);
    secondBox.addEventListener("click", newImage);

    availableImages = [...imagesUsed];

    let settingsBackground = document.querySelector("#startPage");
    let text1 = document.querySelector("#text1");
    let text2 = document.querySelector("#text2");
    text1.style.display = "none";
    text2.style.display = "none";
    settingsBackground.style.display = "none";

    let notSameImage = twoNotSameImages(availableImages);

    firstBoxInside.innerHTML = `<img src="${imageFolder}/${notSameImage[0]}" alt="Random Image 1">`;
    secondBoxInside.innerHTML = `<img src="${imageFolder}/${notSameImage[1]}" alt="Random Image 2">`;

    food1.textContent = imageNames[notSameImage[0]];
    food2.textContent = imageNames[notSameImage[1]];

    lastClickedImage = "";
}

// Loops trough untill the images are different than one another
function twoNotSameImages(imagesArray) {
    let firstImage = Math.floor(Math.random() * imagesArray.length);

    let secondImage;
    do {
        secondImage = Math.floor(Math.random() * imagesArray.length);
    } while (secondImage === firstImage);

    return [imagesArray[firstImage], imagesArray[secondImage]];
}

// Removes the displayed images from availableImages, checks which image is clicked and calls endGame if the array is empty
function newImage() {
    let firstBox = document.querySelector("#firstBox .insideBox img").src.split("/").pop();
    let secondBox = document.querySelector("#secondBox .insideBox img").src.split("/").pop();

    availableImages = availableImages.filter(image => image !== firstBox && image !== secondBox);

    if (this.id === "firstBox" && availableImages.length !== 0) {
        let newImage = getNewImage(secondBox);
        document.querySelector("#secondBox .insideBox").innerHTML = `<img src="${imageFolder}/${newImage}" alt="">`;
        document.querySelector("#food2").textContent = imageNames[newImage];
    } else if (this.id === "secondBox" && availableImages.length !== 0) {
        let newImage = getNewImage(firstBox);
        document.querySelector("#firstBox .insideBox").innerHTML = `<img src="${imageFolder}/${newImage}" alt="">`;
        document.querySelector("#food1").textContent = imageNames[newImage];
    }

    if (this.id === "firstBox") {
        lastClickedImage = firstBox;
    } else if (this.id === "secondBox") {
        lastClickedImage = secondBox;
    }

    if (availableImages.length === 0) {
        document.getElementById("restaurantInfo").innerText = "";
        fetchData();
        endGame();
        return;
    }
}

// Displays new images based on the availableImages array and loops to make sure the image is not a copy of the prior one
function getNewImage(currentImage) {
    let newImage;
    do {
        newImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    } while (newImage === currentImage);
    return newImage;
}

// Hides the gameBackground and shows the endGamePage
function endGame() {
    let gameBackground = document.querySelector("#boxBackground");
    gameBackground.style.display = "none";

    let endGamePage = document.querySelector("#endGamePage");
    endGamePage.style.display = "flex";

    let circleImgHolder = document.querySelector("#circleImgHolder");

    circleImgHolder.innerHTML = `<img src="${imageFolder}/${lastClickedImage}" alt="Final Image">`;
    document.querySelector("#endGamePage h2").textContent = "Det verkar som att du är mest sugen på ";
    document.querySelector("#endGamePage h2").textContent += imageNames[lastClickedImage];
}

