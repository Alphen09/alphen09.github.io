// ============================================================
// ALBERTO NFT MARKETPLACE
// Pi Sandbox + Pet Ownership System
// ============================================================

let currentUser = null;

const PET_STORAGE_KEY = "alberto_owned_pets";
const REPUTATION_STORAGE_KEY = "alberto_reputation";

// ============================================================
// PET DATABASE
// ============================================================

const PET_DATA = {

    "Golden Tiger": {
        image: "Golden-tiger.png",
        rarity: "Legendary",
        hp: 240,
        attack: 120,
        defense: 95,
        speed: 88,
        ability: "Critical Claw",
        price: 18
    },

    "Inferno Dragon": {
        image: "inferno-dragon.png",
        rarity: "Mythic",
        hp: 420,
        attack: 210,
        defense: 180,
        speed: 75,
        ability: "Inferno Breath",
        price: 50
    },

    "Nature Mantis": {
        image: "nature-mantis.png",
        rarity: "Epic",
        hp: 180,
        attack: 95,
        defense: 70,
        speed: 110,
        ability: "Nature Slash",
        price: 12
    },

    "Ocean Shark": {
        image: "ocean-shark.png",
        rarity: "Legendary",
        hp: 300,
        attack: 150,
        defense: 110,
        speed: 95,
        ability: "Tsunami Bite",
        price: 22
    },

    "Phoenix": {
        image: "phoenix.png",
        rarity: "Mythic",
        hp: 350,
        attack: 190,
        defense: 130,
        speed: 100,
        ability: "Rebirth Flame",
        price: 60
    },

    "Shadow Spider": {
        image: "shadow-spider.png",
        rarity: "Epic",
        hp: 170,
        attack: 105,
        defense: 65,
        speed: 125,
        ability: "Shadow Venom",
        price: 15
    },

    "Storm Eagle": {
        image: "storm-eagle.png",
        rarity: "Legendary",
        hp: 260,
        attack: 145,
        defense: 90,
        speed: 135,
        ability: "Thunder Dive",
        price: 25
    },

    "Swamp Crocodile": {
        image: "swamp-crocodile.png",
        rarity: "Epic",
        hp: 280,
        attack: 120,
        defense: 140,
        speed: 60,
        ability: "Swamp Crush",
        price: 10
    },

    "Thunder Bee": {
        image: "thunder-bee.png",
        rarity: "Rare",
        hp: 120,
        attack: 85,
        defense: 40,
        speed: 160,
        ability: "Lightning Sting",
        price: 8
    },

    "Void Wolf": {
        image: "void-wolf.png",
        rarity: "Mythic",
        hp: 310,
        attack: 175,
        defense: 120,
        speed: 115,
        ability: "Void Howl",
        price: 45
    }

};


// ============================================================
// PI SDK INIT
// ============================================================

Pi.init({
    version: "2.0",
    sandbox: true
});


// ============================================================
// PI LOGIN
// ============================================================

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
                "👤 Welcome, " +
                currentUser.username;

        }

        console.log(
            "Pi user authenticated:",
            currentUser.username
        );

        initializeMarketplace();

    } catch (error) {

        console.error(
            "Pi authentication error:",
            error
        );

        alert(
            "Pi Login Error:\n\n" +
            (
                error && error.message
                    ? error.message
                    : String(error)
            )
        );

    }

});


// ============================================================
// INCOMPLETE PAYMENT
// ============================================================

function onIncompletePaymentFound(payment) {

    console.log(
        "Incomplete payment found:",
        payment
    );

}


// ============================================================
// MARKETPLACE INITIALIZATION
// ============================================================

function initializeMarketplace() {

    setupSearch();
    setupCategories();
    setupPetCards();
    setupBuyButtons();

}


// ============================================================
// SEARCH
// ============================================================

function setupSearch() {

    const search =
        document.getElementById("searchNFT");

    const cards =
        document.querySelectorAll(".card");

    if (!search) {
        return;
    }

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


// ============================================================
// CATEGORY FILTER
// ============================================================

function setupCategories() {

    const buttons =
        document.querySelectorAll(".category");

    const cards =
        document.querySelectorAll(".card");

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        function (btn) {
                            btn.classList.remove("active");
                        }
                    );

                    this.classList.add("active");

                    const category =
                        this.dataset.category;

                    cards.forEach(
                        function (card) {

                            if (
                                category === "all" ||
                                card.dataset.category === category
                            ) {

                                card.style.display = "";

                            } else {

                                card.style.display = "none";

                            }

                        }
                    );

                }
            );

        }
    );

}


// ============================================================
// PET CARDS / DETAILS
// ============================================================

function setupPetCards() {

    const cards =
        document.querySelectorAll(".card");

    cards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target.closest(".buy-btn") ||
                        event.target.closest(".amt-btn")
                    ) {
                        return;
                    }

                    const nameElement =
                        card.querySelector("h2");

                    const imageElement =
                        card.querySelector(
                            ".nft-image img"
                        );

                    if (
                        !nameElement ||
                        !imageElement
                    ) {
                        return;
                    }

                    const petName =
                        nameElement.textContent.trim();

                    const pet =
                        PET_DATA[petName];

                    if (!pet) {
                        console.warn(
                            "Pet data not found:",
                            petName
                        );
                        return;
                    }

                    openPetModal(
                        petName,
                        pet,
                        imageElement.src
                    );

                }
            );

        }
    );

}


// ============================================================
// OPEN PET MODAL
// ============================================================

function openPetModal(
    petName,
    pet,
    imageSource
) {

    const modal =
        document.getElementById("petModal");

    if (!modal) {
        return;
    }

    const image =
        document.getElementById(
            "petModalImage"
        );

    const name =
        document.getElementById(
            "petModalName"
        );

    const rarity =
        document.getElementById(
            "petModalRarity"
        );

    const hp =
        document.getElementById(
            "petHP"
        );

    const attack =
        document.getElementById(
            "petAttack"
        );

    const defense =
        document.getElementById(
            "petDefense"
        );

    const speed =
        document.getElementById(
            "petSpeed"
        );

    const ability =
        document.getElementById(
            "petAbility"
        );


    if (image) {
        image.src = imageSource || pet.image;
        image.alt = petName;
    }

    if (name) {
        name.textContent = petName;
    }

    if (rarity) {
        rarity.textContent = pet.rarity;
    }

    if (hp) {
        hp.textContent = pet.hp;
    }

    if (attack) {
        attack.textContent = pet.attack;
    }

    if (defense) {
        defense.textContent = pet.defense;
    }

    if (speed) {
        speed.textContent = pet.speed;
    }

    if (ability) {
        ability.textContent = pet.ability;
    }


    modal.style.display = "flex";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


// ============================================================
// CLOSE PET MODAL
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const modal =
            document.getElementById("petModal");

        const close =
            document.getElementById("closePet");

        if (close) {

            close.addEventListener(
                "click",
                closePetModal
            );

        }

        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {
                        closePetModal();
                    }

                }
            );

        }

    }
);


function closePetModal() {

    const modal =
        document.getElementById("petModal");

    if (!modal) {
        return;
    }

    modal.style.display = "none";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {
            closePetModal();
        }

    }
);


// ============================================================
// BUY BUTTONS
// ============================================================

function setupBuyButtons() {

    const buttons =
        document.querySelectorAll(".buy-btn");

    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    buyNFT(this);

                }
            );

        }
    );

}


// ============================================================
// BUY NFT
// ============================================================

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


    const pet =
        PET_DATA[nftName];


    if (
        !nftName ||
        !price ||
        !pet
    ) {

        alert(
            "Pet information is missing."
        );

        return;
    }


    button.disabled = true;

    button.innerText =
        "Opening Pi Payment...";


    const paymentData = {

        amount: price,

        memo:
            "Purchase Pet: " +
            nftName,

        metadata: {

            nftName: nftName,

            buyer:
                currentUser.username,

            type:
                "PET_PURCHASE",

            rarity:
                pet.rarity,

            ability:
                pet.ability

        }

    };


    Pi.createPayment(

        paymentData,

        {

            // ==================================================
            // SERVER APPROVAL
            // ==================================================

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
                                        price,

                                    petData:
                                        pet

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


            // ==================================================
            // SERVER COMPLETION
            // ==================================================

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


                    const completedPet = {

                        id:
                            "pet_" +
                            Date.now() +
                            "_" +
                            Math.random()
                                .toString(36)
                                .substring(2, 8),

                        name:
                            nftName,

                        image:
                            pet.image,

                        rarity:
                            pet.rarity,

                        hp:
                            pet.hp,

                        attack:
                            pet.attack,

                        defense:
                            pet.defense,

                        speed:
                            pet.speed,

                        ability:
                            pet.ability,

                        price:
                            price,

                        owner:
                            currentUser.username,

                        paymentId:
                            paymentId,

                        txid:
                            txid,

                        purchasedAt:
                            new Date().toISOString(),

                        status:
                            "owned"

                    };


                    // ==========================================
                    // SEND COMPLETE PAYMENT TO SERVER
                    // ==========================================

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
                                        price,

                                    petData:
                                        completedPet,

                                    type:
                                        "PET_PURCHASE"

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


                            // ==================================
                            // SAVE OWNERSHIP
                            // ==================================

                            saveOwnedPet(
                                completedPet
                            );


                            // ==================================
                            // SUCCESS MESSAGE
                            // ==================================

                            alert(

                                "🎉 PET PURCHASE SUCCESSFUL!\n\n" +

                                "🐾 Pet: " +
                                nftName +

                                "\n⭐ Rarity: " +
                                pet.rarity +

                                "\n\n❤️ HP: " +
                                pet.hp +

                                "\n⚔️ Attack: " +
                                pet.attack +

                                "\n🛡️ Defense: " +
                                pet.defense +

                                "\n⚡ Speed: " +
                                pet.speed +

                                "\n✨ Ability: " +
                                pet.ability +

                                "\n\n💰 Price: " +
                                price +
                                " Pi" +

                                "\n\nTransaction ID:\n" +
                                txid

                            );


                            console.log(
                                "OWNED PET:",
                                completedPet
                            );


                            button.disabled =
                                false;

                            button.innerText =
                                "Buy with Pi";

                        }
                    )

                    .catch(
                        function (error) {

                            console.error(
                                "Completion error:",
                                error
                            );


                            /*
                             * Payment itself was completed.
                             * We do NOT pretend it failed.
                             */

                            alert(

                                "⚠️ Pi payment completed.\n\n" +

                                "Pet: " +
                                nftName +

                                "\n\n" +

                                "TXID:\n" +
                                txid +

                                "\n\n" +

                                "Server confirmation is pending."

                            );


                            button.disabled =
                                false;

                            button.innerText =
                                "Buy with Pi";

                        }
                    );

                },


            // ==================================================
            // CANCEL
            // ==================================================

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


            // ==================================================
            // ERROR
            // ==================================================

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


// ============================================================
// SAVE OWNED PET
// ============================================================

function saveOwnedPet(pet) {

    if (!currentUser) {
        return;
    }


    const allOwners =
        JSON.parse(
            localStorage.getItem(
                PET_STORAGE_KEY
            ) || "{}"
        );


    const username =
        currentUser.username;


    if (!allOwners[username]) {

        allOwners[username] = [];

    }


    /*
     * Prevent duplicate ownership
     * for the same payment.
     */

    const alreadyExists =
        allOwners[username].some(
            function (item) {

                return item.paymentId ===
                    pet.paymentId;

            }
        );


    if (!alreadyExists) {

        allOwners[username].push(
            pet
        );

    }


    localStorage.setItem(
        PET_STORAGE_KEY,
        JSON.stringify(allOwners)
    );


    console.log(
        "Pet saved to My Pets:",
        pet
    );

}


// ============================================================
// GET MY PETS
// ============================================================

function getMyPets() {

    if (!currentUser) {
        return [];
    }


    const allOwners =
        JSON.parse(
            localStorage.getItem(
                PET_STORAGE_KEY
            ) || "{}"
        );


    return (
        allOwners[currentUser.username] ||
        []
    );

}


// ============================================================
// REPUTATION SYSTEM FOUNDATION
// ============================================================

function getReputation(username) {

    const reputation =
        JSON.parse(
            localStorage.getItem(
                REPUTATION_STORAGE_KEY
            ) || "{}"
        );


    if (!reputation[username]) {

        return {

            rating: 5.0,

            reviews: 0,

            successfulSales: 0,

            successfulPurchases: 0,

            trusted: false

        };

    }


    return reputation[username];

}


// ============================================================
// CREATE INITIAL REPUTATION
// ============================================================

function initializeReputation(username) {

    if (!username) {
        return;
    }


    const reputation =
        JSON.parse(
            localStorage.getItem(
                REPUTATION_STORAGE_KEY
            ) || "{}"
        );


    if (!reputation[username]) {

        reputation[username] = {

            rating: 5.0,

            reviews: 0,

            successfulSales: 0,

            successfulPurchases: 0,

            trusted: false

        };


        localStorage.setItem(
            REPUTATION_STORAGE_KEY,
            JSON.stringify(reputation)
        );

    }

}


// ============================================================
// INITIALIZE REPUTATION AFTER LOGIN
// ============================================================

window.addEventListener(
    "load",
    function () {

        const checkUser =
            setInterval(
                function () {

                    if (currentUser) {

                        initializeReputation(
                            currentUser.username
                        );

                        clearInterval(
                            checkUser
                        );

                    }

                },
                500
            );

    }
);


// ============================================================
// GLOBAL PET API
// Future My Pets / Sell Pet pages can use this
// ============================================================

window.AlbertoPets = {

    getAllPetData:
        function () {
            return PET_DATA;
        },

    getPet:
        function (name) {
            return PET_DATA[name] || null;
        },

    getMyPets:
        getMyPets,

    getReputation:
        getReputation,

    saveOwnedPet:
        saveOwnedPet

};