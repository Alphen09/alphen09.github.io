// 1. Initialize Pi SDK
Pi.init({ version: "2.0" });

// 2. Handle incomplete payments
function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment found:", payment);
}

// 3. Auto Login when page opens
Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
.then(function(auth) {
    document.getElementById("pi-user").innerHTML = "Hi, " + auth.user.username;
    console.log("Logged in:", auth.user.username);
})
.catch(function(error) {
    console.error("Login error:", error);
    document.getElementById("pi-user").innerHTML = "Please open in Pi Browser";
    alert("Please open this in Pi Browser");
});

// 4. All "Buy with Pi" buttons
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
                fetch('https://alphen09-github-io.onrender.com/approve', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({paymentId})
                });
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                fetch('https://alphen09-github-io.onrender.com/complete', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({paymentId, txid})
                });
                alert("Success! You bought: " + nftName);
            },
            onCancel: () => alert("Payment cancelled"),
            onError: (error) => alert("Error: " + error.message)
        };
        
        Pi.createPayment(paymentData, callbacks);
    });
});