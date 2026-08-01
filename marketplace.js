// Alberto NFT Marketplace V2
// Pi Sandbox Marketplace

document.addEventListener("DOMContentLoaded", function () {

    console.log("Alberto NFT Marketplace Loaded");

    // ==============================
    // PI INITIALIZATION
    // ==============================

    if (typeof Pi !== "undefined") {

        Pi.init({
            version: "2.0",
            sandbox: true
        });

        console.log("Pi SDK initialized");

    } else {

        console.error("Pi SDK not loaded");

        alert("Pi SDK is not loaded.");

        return;
    }


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

    const searchBox =
        document.getElementById("searchNFT");

    const cards =
        document.querySelectorAll(".card");

    if (searchBox) {

        searchBox.addEventListener("input", function () {

            const searchValue =
                this.value.toLowerCase().trim();

            cards.forEach(function (card) {

                const titleElement =
                    card.querySelector("h2, h3");

                const paragraphs =
                    card.querySelectorAll("p");

                const title =
                    titleElement
                        ? titleElement.textContent.toLowerCase()
                        : "";

                let text = title;

                paragraphs.forEach(function (p) {
                    text += " " +
                        p.textContent.toLowerCase();
                });

                card.style.display =
                    text.includes(searchValue)
                        ? ""
                        : "none";

            });

        });

    }


    // ==============================
    // BUY BUTTONS
    // ==============================

    const buyButtons =
        document.querySelectorAll(".buy-btn");

    buyButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            buyNFT(this);

        });

    });

});


// ==============================
// BUY NFT WITH PI
// ==============================

async function buyNFT(button) {

    const username =
        localStorage.getItem("piUser");


    // ==============================
    // CHECK LOGIN
    // ==============================

    if (!username) {

        alert(
            "Please login with Pi first."
        );

        return;
    }


    // ==============================
    // GET NFT DATA
    // ==============================

    const nftName =
        button.dataset.nft;

    const price =
        Number(button.dataset.price);


    if (!nftName || !price) {

        alert(
            "NFT information is missing."
        );

        return;
    }


    console.log(
        "Starting Pi payment:",
        nftName,
        price
    );


    // ==============================
    // DISABLE BUTTON
    // ==============================

    button.disabled = true;
    button.innerText = "Opening Pi Payment...";


    // ==============================
    // PAYMENT DATA
    // ==============================

    const paymentData = {

        amount: price,

        memo:
            "Purchase NFT: " +
            nftName,

        metadata: {

            nftName: nftName,

            buyer: username,

            type: "NFT_PURCHASE"

        }

    };


    // ==============================
    // CREATE PI PAYMENT
    // ==============================

    try {

        Pi.createPayment(

            paymentData,

            {

                // ==========================
                // SERVER APPROVAL
                // ==========================

                onReadyForServerApproval:
                    function (paymentId) {

                        console.log(
                            "Payment ready for approval:",
                            paymentId
                        );


                        // Send payment ID to backend

                        fetch(
                            "https://alphen09-github-io.onrender.com/approve",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    paymentId:
                                        paymentId,

                                    nftName:
                                        nftName,

                                    buyer:
                                        username,

                                    price:
                                        price

                                })

                            }
                        )
                        .then(function (response) {

                            return response.json();

                        })
                        .then(function (data) {

                            console.log(
                                "Backend approval response:",
                                data
                            );

                        })
                        .catch(function (error) {

                            console.error(
                                "Backend approval error:",
                                error
                            );

                        });

                    },


                // ==========================
                // SERVER COMPLETION
                // ==========================

                onReadyForServerCompletion:
                    function (
                        paymentId,
                        txid
                    ) {

                        console.log(
                            "Payment completed:",
                            paymentId,
                            txid
                        );


                        // Send completion to backend

                        fetch(
                            "https://alphen09-github-io.onrender.com/complete",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    paymentId:
                                        paymentId,

                                    txid:
                                        txid,

                                    nftName:
                                        nftName,

                                    buyer:
                                        username,

                                    price:
                                        price

                                })

                            }
                        )
                        .then(function (response) {

                            return response.json();

                        })
                        .then(function (data) {

                            console.log(
                                "Backend completion response:",
                                data
                            );


                            alert(
                                "🎉 Pi Sandbox Payment Completed!\n\n" +
                                "NFT: " +
                                nftName +
                                "\n" +
                                "Price: " +
                                price +
                                " Pi\n\n" +
                                "Transaction ID:\n" +
                                txid
                            );

                        })
                        .catch(function (error) {

                            console.error(
                                "Completion error:",
                                error
                            );

                        });


                        button.disabled = false;
                        button.innerText =
                            "Buy with Pi";

                    },


                // ==========================
                // CANCEL
                // ==========================

                onCancel:
                    function (paymentId) {

                        console.log(
                            "Payment cancelled:",
                            paymentId
                        );


                        alert(
                            "Payment cancelled."
                        );


                        button.disabled = false;
                        button.innerText =
                            "Buy with Pi";

                    },


                // ==========================
                // ERROR
                // ==========================

                onError:
                    function (error) {

                        console.error(
                            "Pi payment error:",
                            error
                        );


                        alert(
                            "Pi Payment Error:\n\n" +
                            error
                        );


                        button.disabled = false;
                        button.innerText =
                            "Buy with Pi";

                    }

            }

        );

    } catch (error) {

        console.error(
            "Payment exception:",
            error
        );


        alert(
            "Unable to start Pi payment."
        );


        button.disabled = false;
        button.innerText =
            "Buy with Pi";

    }

}