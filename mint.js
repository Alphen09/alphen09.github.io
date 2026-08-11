/* =========================================================
   ALBERTO NFT MARKETPLACE
   MINT NFT SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const mintBtn = document.getElementById("mintBtn");

    const nftName = document.getElementById("nftName");
    const description = document.getElementById("description");
    const collection = document.getElementById("collection");
    const category = document.getElementById("category");
    const royalty = document.getElementById("royalty");
    const price = document.getElementById("price");
    const imageInput = document.getElementById("image");


    /* =====================================================
       MINT BUTTON
    ===================================================== */

    mintBtn.addEventListener("click", async function () {

        try {

            /* -----------------------------
               CHECK PI USER
            ----------------------------- */

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


            /* -----------------------------
               GET VALUES
            ----------------------------- */

            const name =
                nftName.value.trim();

            const desc =
                description.value.trim();

            const selectedCollection =
                collection.value;

            const selectedCategory =
                category.value;

            const royaltyValue =
                Number(royalty.value);

            const priceValue =
                Number(price.value);


            /* -----------------------------
               VALIDATION
            ----------------------------- */

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


            if (!priceValue || priceValue <= 0) {

                alert(
                    "Please enter a valid Pi price."
                );

                price.focus();

                return;
            }


            if (
                royaltyValue < 0 ||
                royaltyValue > 10
            ) {

                alert(
                    "Royalty must be between 0% and 10%."
                );

                royalty.focus();

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


            /* -----------------------------
               IMAGE
            ----------------------------- */

            const imageFile =
                imageInput.files[0];


            if (
                !imageFile.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image file."
                );

                return;
            }


            /* -----------------------------
               READ IMAGE
            ----------------------------- */

            const imageData =
                await readImage(imageFile);


            /* -----------------------------
               CREATE NFT
            ----------------------------- */

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

                royalty:
                    royaltyValue,

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
                    "Minted",

                minted:
                    true,

                createdAt:
                    new Date().toISOString()

            };


            /* -----------------------------
               LOAD COLLECTION
            ----------------------------- */

            let myCollection =
                JSON.parse(
                    localStorage.getItem(
                        "myCollection"
                    )
                ) || [];


            /* -----------------------------
               ADD NFT
            ----------------------------- */

            myCollection.push(nft);


            /* -----------------------------
               SAVE COLLECTION
            ----------------------------- */

            localStorage.setItem(
                "myCollection",
                JSON.stringify(
                    myCollection
                )
            );


            /* -----------------------------
               SAVE LAST MINT
            ----------------------------- */

            localStorage.setItem(
                "lastMintedNFT",
                JSON.stringify(nft)
            );


            /* -----------------------------
               SUCCESS
            ----------------------------- */

            mintBtn.disabled = true;

            mintBtn.innerText =
                "✓ NFT Minted";


            alert(
                "🎉 NFT Minted Successfully!\n\n" +
                "NFT: " + name +
                "\nOwner: @" + piUser +
                "\nPrice: " + priceValue + " Pi"
            );


            /* -----------------------------
               OPEN COLLECTION
            ----------------------------- */

            setTimeout(function () {

                window.location.href =
                    "collections.html";

            }, 800);


        } catch (error) {

            console.error(
                "Mint Error:",
                error
            );

            alert(
                "Mint failed.\n\n" +
                (
                    error.message ||
                    String(error)
                )
            );

        }

    });


    /* =====================================================
       IMAGE READER
    ===================================================== */

    function readImage(file) {

        return new Promise(
            function (resolve, reject) {

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

                reader.readAsDataURL(file);

            }
        );

    }

});