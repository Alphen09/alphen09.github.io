// Alberto NFT Marketplace v2 Alpha
// Pi Sandbox Testing

document.addEventListener("DOMContentLoaded", function () {

    console.log("Marketplace Loaded");

    // ==========================================
    // PI SANDBOX INITIALIZATION
    // ==========================================

    Pi.init({
        version: "2.0",
        sandbox: true
    });


    // ==========================================
    // CHECK PI USER
    // ==========================================

    const piUser =
        localStorage.getItem("piUser");


    console.log(
        "Logged in Pi user:",
        piUser
    );


    // ==========================================
    // SEARCH BAR
    // ==========================================

    const search =
        document.querySelector(".search");


    if (search) {

        search.addEventListener(
            "keyup",
            function () {

                const searchText =
                    search.value.toLowerCase();


                const cards =
                    document.querySelectorAll(
                        ".card"
                    );


                cards.forEach(
                    function (card) {

                        const text =
                            card.innerText
                            .toLowerCase();


                        if (
                            text.includes(
                                searchText
                            )
                        ) {

                            card.style.display =
                                "";

                        } else {

                            card.style.display =
                                "none";

                        }

                    }
                );

            }
        );

    }


    // ==========================================
    // FILTER BUTTONS
    // ==========================================

    const filters =
        document.querySelectorAll(
            ".filters button"
        );


    filters.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    alert(
                        button.innerText +
                        " Collection"
                    );

                }
            );

        }
    );


    // ==========================================
    // BUY WITH PI BUTTONS
    // ==========================================

    const buyButtons =
        document.querySelectorAll(
            ".buy-btn"
        );


    buyButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    buyNFT(button);

                }
            );

        }
    );

});


// ==========================================
// BUY NFT WITH PI SANDBOX
// ==========================================

function buyNFT(button) {


    // Check login

    const piUser =
        localStorage.getItem("piUser");


    if (!piUser) {

        alert(
            "Please login with Pi first."
        );

        window.location.href =
            "index.html";

        return;

    }


    // Get NFT information

    const nftName =
        button.dataset.nft;


    const price =
        Number(
            button.dataset.price
        );


    if (
        !nftName ||
        !price
    ) {

        alert(
            "NFT information is missing."
        );

        return;

    }


    console.log(
        "Buying NFT:",
        nftName
    );


    console.log(
        "Price:",
        price,
        "Pi"
    );


    // ==========================================
    // PI SANDBOX PAYMENT
    // ==========================================

    const paymentData = {

        amount: price,

        memo:
            "Purchase NFT: " +
            nftName,

        metadata: {

            nftName:
                nftName,

            buyer:
                piUser,

            type:
                "NFT_PURCHASE"

        }

    };


    Pi.createPayment(

        paymentData,

        {

            // ----------------------------------
            // PAYMENT READY FOR SERVER APPROVAL
            // ----------------------------------

            onReadyForServerApproval:
                function (paymentId) {

                    console.log(
                        "Payment ID:",
                        paymentId
                    );


                    alert(

                        "Sandbox payment created.\n\n" +

                        "NFT: " +
                        nftName +
                        "\n" +

                        "Price: " +
                        price +
                        " Pi\n\n" +

                        "Payment ID:\n" +
                        paymentId

                    );


                    /*
                    IMPORTANT:

                    In the final production flow,
                    send paymentId to your backend
                    for server-side approval.

                    Example:

                    fetch("/api/approve-payment", {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            paymentId:
                                paymentId
                        })
                    });

                    Do NOT put your
                    Pi API secret
                    inside this file.
                    */

                },


            // ----------------------------------
            // PAYMENT COMPLETED
            // ----------------------------------

            onReadyForServerCompletion:
                function (
                    paymentId,
                    txid
                ) {

                    console.log(
                        "Payment completed"
                    );


                    console.log(
                        "Payment ID:",
                        paymentId
                    );


                    console.log(
                        "Transaction ID:",
                        txid
                    );


                    alert(

                        "Pi Sandbox Payment Completed!\n\n" +

                        "NFT: " +
                        nftName +
                        "\n\n" +

                        "Transaction ID:\n" +
                        txid

                    );

                },


            // ----------------------------------
            // PAYMENT CANCELLED
            // ----------------------------------

            onCancel:
                function (paymentId) {

                    console.log(
                        "Payment cancelled:",
                        paymentId
                    );


                    alert(
                        "Payment cancelled."
                    );

                },


            // ----------------------------------
            // PAYMENT ERROR
            // ----------------------------------

            onError:
                function (error) {

                    console.error(
                        "Payment error:",
                        error
                    );


                    alert(

                        "Pi Sandbox Payment Error.\n\n" +

                        error

                    );

                }

        }

    );

}