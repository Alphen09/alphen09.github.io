"use strict";

/*
============================================================
ALBERTO NFT MARKETPLACE
FRONTEND SCRIPT
Pi Sandbox + Render Backend
============================================================
*/

const BACKEND_URL = "https://alphen09-github-io.onrender.com";

/* ============================================================
   PI INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    if (typeof Pi === "undefined") {
        console.error("Pi SDK is not loaded.");
        return;
    }

    Pi.init({
        version: "2.0",
        sandbox: true
    });

    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", loginPi);
    }

    /*
     * Existing marketplace Buy buttons
     */
    const buyButtons = document.querySelectorAll(".buy-btn");

    buyButtons.forEach(button => {

        /*
         * Prevent duplicate listeners if another script
         * has already attached one.
         */
        if (button.dataset.amtHandlerAttached === "true") {
            return;
        }

        button.dataset.amtHandlerAttached = "true";

        button.addEventListener("click", async (event) => {

            event.stopPropagation();

            const nftName = button.dataset.nft;
            const price = Number(button.dataset.price);

            await buyNFT(nftName, price);

        });

    });

    /*
     * Show saved Pi user on pages where #pi-user exists.
     */
    showPiUser();

});


/* ============================================================
   PI LOGIN
============================================================ */

async function loginPi() {

    try {

        if (typeof Pi === "undefined") {

            alert("Pi SDK is not available.");
            return;

        }

        const auth = await Pi.authenticate(
            ["username"],
            onIncompletePaymentFound
        );

        if (!auth || !auth.user || !auth.user.username) {

            alert("Unable to get Pi username.");
            return;

        }

        const username = auth.user.username;

        localStorage.setItem("piUser", username);

        /*
         * Register user in our database.
         */
        await registerUser(username);

        /*
         * Go to marketplace.
         */
        window.location.href = "./marketplace.html";

    } catch (err) {

        console.error("PI LOGIN ERROR:", err);

        alert(
            "Pi Login failed or was cancelled.\n\n" +
            "Please try again in Pi Browser."
        );

    }

}


/* ============================================================
   INCOMPLETE PAYMENT HANDLER
============================================================ */

async function onIncompletePaymentFound(payment) {

    console.log(
        "Incomplete Pi payment found:",
        payment
    );

    /*
     * We intentionally do not automatically complete
     * an unknown payment.
     *
     * This prevents accidental ownership changes.
     */
}


/* ============================================================
   REGISTER USER
============================================================ */

async function registerUser(username) {

    try {

        const response = await fetch(
            `${BACKEND_URL}/users/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            console.error(
                "USER REGISTER FAILED:",
                data
            );

            return false;
        }

        console.log(
            "Pi user registered:",
            data.user
        );

        return true;

    } catch (error) {

        console.error(
            "USER REGISTER ERROR:",
            error
        );

        return false;

    }

}


/* ============================================================
   SHOW PI USER
============================================================ */

function showPiUser() {

    const username =
        localStorage.getItem("piUser");

    const element =
        document.getElementById("pi-user");

    if (username && element) {

        element.textContent =
            "👤 Welcome, " + username;

    }

}


/* ============================================================
   BUY NFT
============================================================ */

async function buyNFT(nftName, price) {

    try {

        /*
         * Require Pi login first.
         */

        const username =
            localStorage.getItem("piUser");

        if (!username) {

            alert(
                "Please login with Pi first."
            );

            return;

        }

        if (!nftName) {

            alert(
                "NFT name is missing."
            );

            return;

        }

        const numericPrice =
            Number(price);

        if (
            !Number.isFinite(numericPrice) ||
            numericPrice <= 0
        ) {

            alert(
                "Invalid NFT price."
            );

            return;

        }

        if (typeof Pi === "undefined") {

            alert(
                "Pi SDK is not available."
            );

            return;

        }

        /*
         * Confirm purchase.
         */

        const confirmed =
            confirm(
                `Buy "${nftName}" for ${numericPrice} Pi on Pi Sandbox?`
            );

        if (!confirmed) {
            return;
        }

        /*
         * Disable all buy buttons while payment
         * is being created.
         */

        setBuyButtonsDisabled(true);

        console.log(
            "Creating Pi payment:",
            {
                nftName,
                price: numericPrice,
                buyer: username
            }
        );

        /*
         * Create Pi payment.
         *
         * IMPORTANT:
         * The amount is TESTNET Pi because sandbox=true.
         */

        const payment =
            await Pi.createPayment(
                {
                    amount: numericPrice,

                    memo:
                        `Alberto Pet Marketplace: ${nftName}`,

                    metadata: {
                        app:
                            "Alberto NFT Marketplace",

                        nftName:
                            nftName,

                        buyer:
                            username,

                        price:
                            numericPrice
                    }
                },

                {

                    onReadyForServerApproval:
                        async function(paymentId) {

                            console.log(
                                "Payment ready for approval:",
                                paymentId
                            );

                            await approvePayment(
                                paymentId,
                                nftName,
                                username,
                                numericPrice
                            );

                        },

                    onReadyForServerCompletion:
                        async function(
                            paymentId,
                            txid
                        ) {

                            console.log(
                                "Payment ready for completion:",
                                {
                                    paymentId,
                                    txid
                                }
                            );

                            await completePayment(
                                paymentId,
                                txid,
                                nftName,
                                username,
                                numericPrice
                            );

                        },

                    onCancel:
                        function(paymentId) {

                            console.log(
                                "Payment cancelled:",
                                paymentId
                            );

                            setBuyButtonsDisabled(false);

                            alert(
                                "Pi payment was cancelled."
                            );

                        },

                    onError:
                        function(error) {

                            console.error(
                                "Pi payment error:",
                                error
                            );

                            setBuyButtonsDisabled(false);

                            alert(
                                "Pi payment failed.\n\n" +
                                "Please try again."
                            );

                        }

                }
            );

        console.log(
            "Pi payment object:",
            payment
        );

    } catch (error) {

        console.error(
            "BUY NFT ERROR:",
            error
        );

        setBuyButtonsDisabled(false);

        alert(
            "Unable to start Pi payment.\n\n" +
            "Please try again."
        );

    }

}


/* ============================================================
   APPROVE PAYMENT
============================================================ */

async function approvePayment(
    paymentId,
    nftName,
    buyer,
    price
) {

    try {

        const response =
            await fetch(
                `${BACKEND_URL}/approve-payment`,
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
                            buyer,

                        price:
                            price

                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "Backend approval response:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Pi payment approval failed."
            );

        }

        console.log(
            "Pi payment approved:",
            paymentId
        );

    } catch (error) {

        console.error(
            "APPROVE PAYMENT ERROR:",
            error
        );

        setBuyButtonsDisabled(false);

        alert(
            "Pi payment approval failed.\n\n" +
            error.message
        );

        throw error;

    }

}


/* ============================================================
   COMPLETE PAYMENT
============================================================ */

async function completePayment(
    paymentId,
    txid,
    nftName,
    buyer,
    price
) {

    try {

        const response =
            await fetch(
                `${BACKEND_URL}/complete-payment`,
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
                            buyer,

                        price:
                            price

                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "Backend completion response:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Pi payment completion failed."
            );

        }

        /*
         * Save local owner information for the
         * existing details modal.
         */

        localStorage.setItem(
            "petOwner_" + nftName,
            buyer
        );

        /*
         * Store transaction locally for UI/debugging.
         */

        localStorage.setItem(
            "lastPiPayment",
            JSON.stringify({
                paymentId,
                txid,
                nftName,
                buyer,
                price,
                completedAt:
                    new Date().toISOString()
            })
        );

        setBuyButtonsDisabled(false);

        alert(
            `Purchase completed successfully!\n\n` +
            `${nftName}\n` +
            `Owner: ${buyer}\n` +
            `Price: ${price} Pi\n\n` +
            `NFT ownership has been recorded in the Alberto marketplace database.`
        );

        /*
         * Reload marketplace so the latest database state
         * can be displayed when marketplace integration
         * is expanded.
         */

        window.location.reload();

    } catch (error) {

        console.error(
            "COMPLETE PAYMENT ERROR:",
            error
        );

        setBuyButtonsDisabled(false);

        alert(
            "Payment was not recorded by the marketplace.\n\n" +
            error.message
        );

    }

}


/* ============================================================
   DISABLE / ENABLE BUY BUTTONS
============================================================ */

function setBuyButtonsDisabled(disabled) {

    const buttons =
        document.querySelectorAll(
            ".buy-btn"
        );

    buttons.forEach(button => {

        button.disabled =
            disabled;

        if (disabled) {

            button.dataset.originalText =
                button.textContent;

            button.textContent =
                "Processing...";

            button.style.opacity =
                "0.6";

            button.style.pointerEvents =
                "none";

        } else {

            button.textContent =
                button.dataset.originalText ||
                "Buy";

            button.style.opacity =
                "";

            button.style.pointerEvents =
                "";

        }

    });

}


/* ============================================================
   MINT PAGE
============================================================ */

function goMint() {

    window.location.href =
        "mint.html";

}