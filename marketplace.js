Pi.init({ version: "2.0" });
let currentUser = null;

window.onload = function() {
  Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
    .then(function(auth) {
      currentUser = auth.user;
      document.getElementById("user").innerText = "Hi, " + currentUser.username;
    })
    .catch(function(error) {
      alert("Login failed: " + error);
    });
}

function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment:", payment);
}

function buy(amount, productId, productName) {
  const paymentData = {
    amount: amount,
    memo: "Buy " + productName,
    metadata: { 
      productId: productId,
      productName: productName,
      buyer: currentUser.username,
      seller: "alphen09"
    }
  };

  const callbacks = {
    onReadyForServerApproval: (paymentId) => {
      alert("Approved! Payment ID: " + paymentId);
    },
    onReadyForServerCompletion: (paymentId, txid) => {
      alert("Payment Successful! \n" + productName + "\nTXID: " + txid);
    },
    onCancel: (paymentId) => {
      alert("Payment cancelled");
    },
    onError: (error) => {
      alert("Payment error: " + error);
    }
  };

  Pi.createPayment(paymentData, callbacks);
}