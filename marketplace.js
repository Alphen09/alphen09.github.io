// Alberto NFT Marketplace V2

document.addEventListener("DOMContentLoaded", () => {

    // Welcome Pi User
    const username = localStorage.getItem("piUser");

    if (username) {
        const userBox = document.getElementById("pi-user");

        if (userBox) {
            userBox.innerHTML = "👤 Welcome, " + username;
        }
    }

    // Search NFT
    const search = document.getElementById("searchNFT");

    if (search) {

        search.addEventListener("keyup", function () {

            let value = this.value.toLowerCase();

            let cards = document.querySelectorAll(".card");

            cards.forEach(card => {

                let title = card.querySelector("h3").innerText.toLowerCase();

                if (title.includes(value)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }

            });

        });

    }

    // Buy Button (Temporary)

    const buttons = document.querySelectorAll(".buy-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            let nft = button.dataset.nft;
            let price = button.dataset.price;

            alert(
                "NFT : " + nft +
                "\nPrice : " + price + " Pi" +
                "\n\nNext Step:\nPi Sandbox Payment"
            );

        });

    });

});