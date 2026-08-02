// Alberto NFT Marketplace
// Pi Sandbox Marketplace

document.addEventListener("DOMContentLoaded", () => {

    Pi.init({
        version: "2.0",
        sandbox: true
    });

    const username = localStorage.getItem("piUser");

    const userBox = document.getElementById("pi-user");

    if (username && userBox) {
        userBox.innerHTML = "👤 Welcome, " + username;
    }

    const search = document.getElementById("searchNFT");

    if (search) {

        search.addEventListener("input", function () {

            const value = this.value.toLowerCase();

            document.querySelectorAll(".card").forEach(card => {

                card.style.display =
                    card.innerText.toLowerCase().includes(value)
                        ? ""
                        : "none";

            });

        });

    }

    document.querySelectorAll(".buy-btn").forEach(button => {

        button.addEventListener("click", () => {

            buyNFT(button);

        });

    });

});


async function buyNFT(button) {

    const username = localStorage.getItem("piUser");

    if (!username) {

        alert("Please login with Pi first.");

        return;

    }

    const nftName = button.dataset.nft;

    const price = Number(button.dataset.price);

    button.disabled = true;
    button.innerText = "Opening Pi...";

    try {

        Pi.createPayment({

            amount: price,

            memo: "Purchase NFT: " + nftName,

            metadata: {

                nftName: nftName,

                buyer: username

            }

        },

        {

            onReadyForServerApproval(paymentId) {

                fetch("https://alphen09-github-io.onrender.com/approve-payment", {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        paymentId,

                        nftName,

                        buyer: username,

                        price

                    })

                });

            },

            onReadyForServerCompletion(paymentId, txid) {

                fetch("https://alphen09-github-io.onrender.com/complete-payment", {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        paymentId,

                        txid,

                        nftName,

                        buyer: username,

                        price

                    })

                });

                alert(
                    "✅ NFT Purchased Successfully!\n\n" +
                    nftName +
                    "\nPrice: " + price + " Pi"
                );

                button.disabled = false;
                button.innerText = "Buy with Pi";

            },

            onCancel() {

                alert("Payment Cancelled");

                button.disabled = false;
                button.innerText = "Buy with Pi";

            },

            onError(error) {

                console.error(error);

                alert(error.message || error);

                button.disabled = false;
                button.innerText = "Buy with Pi";

            }

        });

    } catch (error) {

        console.error(error);

        alert(error.message || error);

        button.disabled = false;
        button.innerText = "Buy with Pi";

    }

}