// Alberto NFT Marketplace
// Pi Sandbox Payment

document.addEventListener("DOMContentLoaded", function () {

    console.log("Alberto NFT Marketplace Loaded");

    // ==============================
    // PI SDK
    // ==============================

    if (typeof Pi === "undefined") {
        alert("Pi SDK is not loaded.");
        return;
    }

    Pi.init({
        version: "2.0",
        sandbox: true
    });


    // ==============================
    // PI USER
    // ==============================

    const username =
        localStorage.getItem("piUser");

    const userBox =
        document.getElementById("pi-user");

    if (username && userBox) {
        userBox.textContent =
            "👤 Welcome, " + username;
    }


    // ==============================
    // SEARCH
    // ==============================

    const search =
        document.getElementById("searchNFT");

    const cards =
        document.querySelectorAll(".card");

    if (search) {

        search.addEventListener("input", function () {

            const value =
                this.value.toLowerCase();

            cards.forEach(function (card) {

                const text =
                    card.innerText.toLowerCase();

                card.style.display =
                    text.includes(value)
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
// BUY NFT
// ==============================

function buyNFT(button) {

    const username =
        localStorage.getItem("piUser");


    if (!username) {

        alert(
            "Please login with Pi first."
        );

        return;
    }


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


    button.disabled = true;

    button.innerText =
        "Opening Pi Payment...";


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


    try {

        Pi.createPayment(

            paymentData,

            {

                // ======================
                // APPROVAL
                // ======================

                onReadyForServerApproval:
                    function (paymentId) {

                        console.log(
                            "Payment ID:",
                            paymentId
                        );


                        fetch(
                            "https://alphen09-github-io.onrender.com/approve",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

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
                                "Approval:",
                                data
                            );

                        })
                        .catch(function (error) {

                            console.error(
                                "Approval error:",
                                error
                            );

                        });

                    },


                // ======================
                // COMPLETION
                // ======================

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


                        fetch(
                            "https://alphen09-github-io.onrender.com/complete",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

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
                                "Completion:",
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


                // ======================
                // CANCEL
                // ======================

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


                // ======================
                // ERROR
                // ======================

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
    "Pi Payment Error:\n\n" +
    (error && error.message
        ? error.message
        : String(error))
);

        button.disabled = false;

        button.innerText =
            "Buy with Pi";

    }

}