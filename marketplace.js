// Alberto NFT Marketplace V2
// Pi Sandbox Marketplace

document.addEventListener("DOMContentLoaded", function () {

    console.log("Alberto NFT Marketplace Loaded");

    // ==============================
    // SHOW PI USERNAME
    // ==============================

    const username = localStorage.getItem("piUser");
    const userBox = document.getElementById("pi-user");

    if (username && userBox) {
        userBox.textContent = "👤 Welcome, " + username;
    }


    // ==============================
    // NFT SEARCH
    // ==============================

    const searchBox = document.getElementById("searchNFT");
    const cards = document.querySelectorAll(".card");

    if (searchBox) {

        searchBox.addEventListener("input", function () {

            const searchValue = this.value.toLowerCase().trim();

            cards.forEach(function (card) {

                const title = card
                    .querySelector("h2")
                    .textContent
                    .toLowerCase();

                const collection = card
                    .querySelector("p")
                    .textContent
                    .toLowerCase();

                if (
                    title.includes(searchValue) ||
                    collection.includes(searchValue)
                ) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }

            });

        });

    }


    // ==============================
    // BUY BUTTONS
    // ==============================

    const buyButtons = document.querySelectorAll(".buy-btn");

    buyButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const nftName = this.dataset.nft;
            const price = this.dataset.price;

            alert(
                "NFT: " + nftName +
                "\nPrice: " + price + " Pi" +
                "\n\nPi Sandbox payment integration is being prepared."
            );

        });

    });

});