document.addEventListener("DOMContentLoaded", function () {
    console.log("Collections page loaded!");

    const cards = document.querySelectorAll(".collection-card");

    cards.forEach(function(card) {
        card.addEventListener("click", function() {
            alert("Collection details coming soon!");
        });
    });
});