/* =========================================================
   ALBERTO NFT MARKETPLACE
   MINT NFT SYSTEM — PI SANDBOX
   QUOTA-SAFE VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const mintBtn = document.getElementById("mintBtn");

    const nftName = document.getElementById("nftName");
    const description = document.getElementById("description");
    const collection = document.getElementById("collection");
    const category = document.getElementById("category");
    const price = document.getElementById("price");
    const imageInput = document.getElementById("image");

    const rarity = document.getElementById("rarity");
    const level = document.getElementById("level");


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
            "Alberto Mint System: Required element missing."
        );

        return;
    }


    /* =====================================================
       MINT BUTTON
    ===================================================== */

    mintBtn.addEventListener("click", async function () {

        try {

            /* =================================================
               PI USER
            ================================================= */

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


            /* =================================================
               GET FORM VALUES
            ================================================= */

            const name =
                nftName.value.trim();

            const desc =
                description.value.trim();

            const selectedCollection =
                collection.value;

            const selectedCategory =
                category.value;

            const selectedRarity =
                rarity
                    ? rarity.value
                    : "Common";

            const selectedLevel =
                level
                    ? Number(level.value) || 1
                    : 1;

            const priceValue =
                Number(price.value);


            /* =================================================
               VALIDATION
            ================================================= */

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


            /* =================================================
               IMAGE CHECK
            ================================================= */

            const imageFile =
                imageInput.files[0];


            if (
                !imageFile.type ||
                !imageFile.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image file."
                );

                return;
            }


            /* =================================================
               BUTTON STATE
            ================================================= */

            mintBtn.disabled = true;

            mintBtn.innerText =
                "Saving NFT...";


            /* =================================================
               CREATE SAFE IMAGE INFORMATION
               
               IMPORTANT:
               Hindi natin ise-save ang malaking Base64
               image sa localStorage.
            ================================================= */

            const imageInfo = {

                name:
                    imageFile.name,

                type:
                    imageFile.type,

                size:
                    imageFile.size

            };


            /* =================================================
               CREATE NFT
            ================================================= */

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
                    selectedRarity,

                level:
                    selectedLevel,

                price:
                    priceValue,

                currency:
                    "Pi",

                image:
                    imageInfo,

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
               LOAD EXISTING COLLECTION
            ================================================= */

            let myCollection = [];

            try {

                const saved =
                    localStorage.getItem(
                        "myCollection"
                    );

                if (saved) {

                    const parsed =
                        JSON.parse(saved);

                    if (Array.isArray(parsed)) {

                        myCollection =
                            parsed;

                    }

                }

            } catch (error) {

                console.warn(
                    "Old collection data could not be loaded.",
                    error
                );

                myCollection = [];

            }


            /* =================================================
               REMOVE OLD LARGE IMAGE DATA
               
               Ito ang safety cleanup para hindi na
               bumalik ang quota error.
            ================================================= */

            myCollection =
                myCollection.map(function (item) {

                    if (
                        item &&
                        typeof item.image === "string" &&
                        item.image.length > 1000
                    ) {

                        return {
                            ...item,
                            image:
                                {
                                    name:
                                        "previous-image",
                                    type:
                                        "image/unknown",
                                    size:
                                        0
                                }
                        };

                    }

                    return item;

                });


            /* =================================================
               ADD NEW NFT
            ================================================= */

            myCollection.push(nft);


            /* =================================================
               SAVE COLLECTION SAFELY
            ================================================= */

            try {

                localStorage.setItem(
                    "myCollection",
                    JSON.stringify(
                        myCollection
                    )
                );

            } catch (storageError) {

                console.error(
                    "Collection storage error:",
                    storageError
                );

                /*
                 * Kung may lumang sobrang laki pa rin,
                 * ise-save natin ang latest NFT lamang.
                 */

                try {

                    localStorage.setItem(
                        "myCollection",
                        JSON.stringify([
                            nft
                        ])
                    );

                } catch (finalError) {

                    throw new Error(
                        "Browser storage is full. Please clear the old NFT data from this site and try again."
                    );

                }

            }


            /* =================================================
               SAVE LAST MINT
            ================================================= */

            try {

                localStorage.setItem(
                    "lastMintedNFT",
                    JSON.stringify(nft)
                );

            } catch (error) {

                console.warn(
                    "Last minted NFT could not be saved.",
                    error
                );

            }


            /* =================================================
               SAVE SHARED NFT METADATA
            ================================================= */

            let albertoNFTs = [];

            try {

                const savedNFTs =
                    localStorage.getItem(
                        "albertoMintedNFTs"
                    );

                if (savedNFTs) {

                    const parsedNFTs =
                        JSON.parse(savedNFTs);

                    if (
                        Array.isArray(parsedNFTs)
                    ) {

                        albertoNFTs =
                            parsedNFTs;

                    }

                }

            } catch (error) {

                albertoNFTs = [];

            }


            /*
             * Keep only metadata-safe records.
             */

            albertoNFTs =
                albertoNFTs.map(function (item) {

                    if (
                        item &&
                        typeof item.image === "string" &&
                        item.image.length > 1000
                    ) {

                        return {
                            ...item,
                            image: null
                        };

                    }

                    return item;

                });


            albertoNFTs.push(nft);


            try {

                localStorage.setItem(
                    "albertoMintedNFTs",
                    JSON.stringify(
                        albertoNFTs
                    )
                );

            } catch (error) {

                console.warn(
                    "Shared NFT list could not be saved.",
                    error
                );

            }


            /* =================================================
               SUCCESS
            ================================================= */

            mintBtn.innerText =
                "✓ NFT Saved";

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
               GO TO COLLECTION
            ================================================= */

            setTimeout(function () {

                window.location.href =
                    "collections.html";

            }, 800);


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

                "Mint failed:\n\n" +

                (
                    error.message ||
                    String(error)
                )

            );

        }

    });

});