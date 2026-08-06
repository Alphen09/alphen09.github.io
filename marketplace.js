// Alberto NFT Marketplace
// Pi Sandbox Payment

let currentUser = null;

// ==============================
// PI SDK INIT
// ==============================

Pi.init({
    version: "2.0",
    sandbox: true
});


// ==============================
// LOGIN / AUTHENTICATION
// ==============================

window.addEventListener("load", async function () {

    try {

        const auth = await Pi.authenticate(
            ["username", "payments"],
            onIncompletePaymentFound
        );

        currentUser = auth.user;

        const userBox =
            document.getElementById("pi-user");

        if (userBox) {
            userBox.textContent =
                "👤 Welcome, " + currentUser.username;
        }

        console.log(
            "Pi user authenticated:",
            currentUser.username
        );

    } catch (error) {

        console.error(
            "Pi authentication error:",
            error
        );

        alert(
            "Pi Login Error:\n\n" +
            (error && error.message
                ? error.message
                : String(error))
        );

    }

});


// ==============================
// INCOMPLETE PAYMENT
// ==============================

function onIncompletePaymentFound(payment) {

    console.log(
        "Incomplete payment found:",
        payment
    );

}


// ==============================
// NFT SEARCH
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const search =
            document.getElementById("searchNFT");

        const cards =
            document.querySelectorAll(".card");

        if (search) {

            search.addEventListener(
                "input",
                function () {

                    const value =
                        this.value
                            .toLowerCase()
                            .trim();

                    cards.forEach(
                        function (card) {

                            const text =
                                card.innerText
                                    .toLowerCase();

                            card.style.display =
                                text.includes(value)
                                    ? ""
                                    : "none";

                        }
                    );

                }
            );

        }


        // ==============================
        // BUY BUTTONS
        // ==============================

        const buyButtons =
            document.querySelectorAll(".buy-btn");

        buyButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        buyNFT(this);

                    }
                );

            }
        );

    }
);


// ==============================
// BUY NFT
// ==============================

function buyNFT(button) {

    if (!currentUser) {

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

            buyer:
                currentUser.username,

            type:
                "NFT_PURCHASE"

        }

    };


    Pi.createPayment(

        paymentData,

        {

            // ==========================
            // SERVER APPROVAL
            // ==========================

            onReadyForServerApproval:
                function (paymentId) {

                    console.log(
                        "Payment created:",
                        paymentId
                    );


                    fetch(
                        "https://alphen09-github-io.onrender.com/approve-payment",
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
                                        currentUser.username,

                                    price:
                                        price

                                })

                        }
                    )

                    .then(
                        async function (response) {

                            const data =
                                await response.json();

                            if (!response.ok) {

                                throw new Error(
                                    data.message ||
                                    "Payment approval failed."
                                );

                            }

                            console.log(
                                "Server approval:",
                                data
                            );

                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                "Approval error:",
                                error
                            );

                            alert(
                                "Payment Approval Error:\n\n" +
                                error.message
                            );

                            button.disabled =
                                false;

                            button.innerText =
                                "Buy with Pi";

                        }
                    );

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


                    fetch(
                        "https://alphen09-github-io.onrender.com/complete-payment",
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
                                        currentUser.username,

                                    price:
                                        price

                                })

                        }
                    )

                    .then(
                        async function (response) {

                            const data =
                                await response.json();

                            console.log(
                                "Server completion:",
                                data
                            );


                            alert(
                                "🎉 Pi Sandbox Payment Completed!\n\n" +
                                "NFT: " +
                                nftName +
                                "\n\n" +
                                "Price: " +
                                price +
                                " Pi\n\n" +
                                "Transaction ID:\n" +
                                txid
                            );

                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                "Completion error:",
                                error
                            );

                            alert(
                                "Payment completed, but server confirmation failed.\n\n" +
                                "TXID:\n" +
                                txid
                            );

                        }
                    );


                    button.disabled =
                        false;

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
                        "Payment Cancelled."
                    );

                    button.disabled =
                        false;

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
                        (
                            error &&
                            error.message
                                ? error.message
                                : String(error)
                        )
                    );

                    button.disabled =
                        false;

                    button.innerText =
                        "Buy with Pi";

                }

        }

    );

}