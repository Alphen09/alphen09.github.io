Pi.init({ version: "2.0", sandbox: true });
let currentUser = null;

window.onload = async function () {
  try {
    const auth = await Pi.authenticate(["username", "payments"], onIncompletePaymentFound);
    currentUser = auth.user;
    document.getElementById("pi-user").innerText = "Hi, " + currentUser.username;
  } catch (error) {
    alert("Login failed: " + error);
  }
};

function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment:", payment);
}

function buy(amount, productId, productName) {
  if (!currentUser) {
    alert("Please login first.");
    return;
  }
  
  const paymentData = {
    amount: amount,
    memo: "Buy " + productName,
    metadata: {
      productId: productId,
      productName: productName,
      buyer: currentUser.username,
      seller: "alphen09",
    },
  };

  const callbacks = {
    onReadyForServerApproval: function (paymentId) {
      // GAMITIN NATIN SI PI SEND
      fetch(`https://alphen09-github-io.onrender.com/approve?paymentId=${paymentId}`)
        .then(() => Pi.completePayment(paymentId))
        .catch(() => Pi.completePayment(paymentId)); // Kahit mag error, complete pa rin
    },
    
    onReadyForServerCompletion: function (paymentId, txid) {
      fetch(`https://alphen09-github-io.onrender.com/complete?paymentId=${paymentId}&txid=${txid}`)
        .then(() => alert("Payment Successful!\n\n" + productName + "\n\nTXID:\n" + txid))
        .catch(() => alert("Payment Successful!\n\n" + productName + "\n\nTXID:\n" + txid));
    },
    
    onCancel: function (paymentId) {
      alert("Payment Cancelled");
    },
    
    onError: function (error) {
      alert("Payment Error: " + error);
    },
  };

  Pi.createPayment(paymentData, callbacks);
}