// Alberto NFT Marketplace v2 Alpha

document.addEventListener("DOMContentLoaded", function () {

    console.log("Marketplace Loaded");

    // Search Bar
    const search = document.querySelector(".search");

    if (search) {
        search.addEventListener("keyup", function () {
            console.log("Searching:", search.value);
        });
    }

    // Filter Buttons
    const filters = document.querySelectorAll(".filters button");

    filters.forEach(function (button) {
        button.addEventListener("click", function () {
            alert(button.innerText + " Collection");
        });
    });

    // View Details Buttons
    const cards = document.querySelectorAll(".card button");

    cards.forEach(function (button) {
        button.addEventListener("click", function () {
            alert("NFT Details page coming soon.");
        });
    });

});