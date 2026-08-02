// 1. Initialize Pi SDK
Pi.init({ version: "2.0" });

// 2. Hawak sa incomplete payments
function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment found:", payment);
}

// 3. Auto Login pag bukas ng page
Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
.then(function(auth) {
    document.getElementById("pi-user").innerHTML = "Hi, " + auth.user.username;
    console.log("Logged in:", auth.user.username);
})
.catch(function(error) {
    console.error("Login error:", error);
    alert("Please open this in Pi Browser");
});

// 4. Lahat ng Buy buttons
document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', function() {
        const price = parseFloat(this.dataset.price);
        const nftName = this.dataset.nft;

        const paymentData = {
            amount: price,
            memo: "Buy: " + nftName,
            metadata: { nft: nftName, price: price }
        };

        const callbacks = {
            onReadyForServerApproval: (paymentId) => {
                // PALITAN MO ITO NG RENDER URL MO
                fetch('https://alberto-backend.onrender.com/approve', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({paymentId})
                }).then(res => res.json());
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                // PALITAN MO DIN ITO
                fetch('https://alberto-backend.onrender.com/complete', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({paymentId, txid})
                }).then(res => res.json());
            },
            onCancel: () => alert("Payment cancelled"),
            onError: (error) => {
                console.log("Payment error:", error);
                alert("Error: " + error.message);
            }
        };
        
        Pi.createPayment(paymentData, callbacks);
    });
});