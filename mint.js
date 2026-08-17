/* =========================================================
   ALBERTO NFT MARKETPLACE
   MINT NFT SYSTEM — PI SANDBOX
   SAFE LOCAL STORAGE VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const mintBtn = document.getElementById("mintBtn");

    const nftName = document.getElementById("nftName");
    const description = document.getElementById("description");
    const collection = document.getElementById("collection");
    const category = document.getElementById("category");
    const price = document.getElementById("price");
    const imageInput = document.getElementById("image");

    /* =====================================================
       CHECK REQUIRED ELEMENTS
    ===================================================== */

    if (
        !mintBtn ||
        !nftName ||
        !description ||
        !collection ||
        !category ||
        !price ||
        !imageInput
    ) {
        console.error(
            "Mint system: required element is missing."
        );

        return;
    }


    /* =====================================================
       MINT BUTTON
    ===================================================== */

    mintBtn.addEventListener(
        "click",
        async function () {

            try {

                /* =============================
                   CHECK PI USER
                ============================= */

                const piUser =
                    localStorage.getItem("piUser");


                if (!piUser) {

                    alert(
                        "Please connect your Pi account first."
                    );

                    window.location.href =
                        "index.html";

                    return;
                }


                /* =============================
                   GET VALUES
                ============================= */

                const name =
                    nftName.value.trim();

                const desc =
                    description.value.trim();

                const selectedCollection =
                    collection.value;

                const selectedCategory =
                    category.value;

                const priceValue =
                    Number(price.value);


                /* =============================
                   VALIDATION
                ============================= */

                if (!name) {

                    alert(
                        "Please enter your NFT name."
                    );

                    nftName.focus();

                    return;
                }


                if (!desc) {

                    alert(
                        "Please enter an NFT description."
                    );

                    description.focus();

                    return;
                }


                if (
                    !priceValue ||
                    priceValue <= 0
                ) {

                    alert(
                        "Please enter a valid Pi price."
                    );

                    price.focus();

                    return;
                }


                if (
                    !imageInput.files ||
                    imageInput.files.length === 0
                ) {

                    alert(
                        "Please upload your NFT image."
                    );

                    imageInput.focus();

                    return;
                }


                /* =============================
                   IMAGE VALIDATION
                ============================= */

                const imageFile =
                    imageInput.files[0];


                if (
                    !imageFile.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Please select a valid image file."
                    );

                    return;
                }


                /* =============================
                   BUTTON STATE
                ============================= */

                mintBtn.disabled = true;

                mintBtn.innerText =
                    "Saving NFT...";


                /* =============================
                   READ IMAGE
                ============================= */

                const imageData =
                    await readImage(
                        imageFile
                    );


                /* =============================
                   CREATE NFT
                ============================= */

                const nft = {

                    id:
                        "ALB-" +
                        Date.now() +
                        "-" +
                        Math.random()
                            .toString(36)
                            .substring(2, 8),

                    name:
                        name,

                    description:
                        desc,

                    collection:
                        selectedCollection,

                    category:
                        selectedCategory,

                    rarity:
                        document.getElementById(
                            "rarity"
                        )?.value ||
                        "Common",

                    level:
                        Number(
                            document.getElementById(
                                "level"
                            )?.value ||
                            1
                        ),

                    royalty:
                        5,

                    price:
                        priceValue,

                    currency:
                        "Pi",

                    image:
                        imageData,

                    owner:
                        piUser,

                    creator:
                        piUser,

                    status:
                        "Sandbox Minted",

                    minted:
                        true,

                    network:
                        "Pi Sandbox",

                    createdAt:
                        new Date().toISOString()

                };


                /* =================================================
                   SAVE TO EXISTING COLLECTION
                ================================================= */

                let myCollection = [];

                try {

                    myCollection =
                        JSON.parse(
                            localStorage.getItem(
                                "myCollection"
                            )
                        ) || [];

                } catch (error) {

                    console.warn(
                        "Existing collection could not be read."
                    );

                    myCollection = [];

                }


                myCollection.push(nft);


                localStorage.setItem(
                    "myCollection",
                    JSON.stringify(
                        myCollection
                    )
                );


                /* =================================================
                   SAVE LAST MINT
                ================================================= */

                localStorage.setItem(
                    "lastMintedNFT",
                    JSON.stringify(
                        nft
                    )
                );


                /* =================================================
                   SAVE SHARED ALBERTO NFT LIST
                ================================================= */

                let albertoNFTs = [];

                try {

                    albertoNFTs =
                        JSON.parse(
                            localStorage.getItem(
                                "albertoMintedNFTs"
                            )
                        ) || [];

                } catch (error) {

                    console.warn(
                        "Alberto NFT list could not be read."
                    );

                    albertoNFTs = [];

                }


                albertoNFTs.push(nft);


                localStorage.setItem(
                    "albertoMintedNFTs",
                    JSON.stringify(
                        albertoNFTs
                    )
                );


                /* =================================================
                   SUCCESS
                ================================================= */

                mintBtn.innerText =
                    "✓ NFT Saved";

                mintBtn.disabled =
                    true;


                alert(

                    "🎉 NFT Saved Successfully!\n\n" +

                    "NFT: " +
                    name +

                    "\nOwner: @" +
                    piUser +

                    "\nPrice: " +
                    priceValue +
                    " Pi" +

                    "\n\nNetwork: Pi Sandbox"

                );


                /* =================================================
                   REDIRECT
                ================================================= */

                setTimeout(
                    function () {

                        window.location.href =
                            "collections.html";

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "Mint Error:",
                    error
                );


                mintBtn.disabled =
                    false;

                mintBtn.innerText =
                    "🔨 Mint NFT";


                alert(

                    "Mint failed.\n\n" +

                    (
                        error.message ||
                        String(error)
                    )

                );

            }

        }
    );


    /* =====================================================
       IMAGE READER
    ===================================================== */

    function readImage(file) {

        return new Promise(
            function (
                resolve,
                reject
            ) {

                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        resolve(
                            event.target.result
                        );

                    };


                reader.onerror =
                    function () {

                        reject(
                            new Error(
                                "Unable to read NFT image."
                            )
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }

});