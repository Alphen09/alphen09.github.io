Pi.init({ version: "2.0" });
let currentUser = null;
window.onload = function() {
  Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
    .then(function(auth) {
      currentUser = auth.user;
      console.log("Logged in as:", currentUser.username);
      document.getElementById("user").innerText = "Hi, " + currentUser.username;
    })
    .catch(function(error) {
      console.error(error);
      alert("Login failed: " + error);
    });
}
function onIncompletePaymentFound(payment) {
  console.log("Found incomplete payment:", payment);
}
function buy() {
  console.log("Buy button clicked");
  const paymentData = {
    amount: 0.01,
    memo: "Test Payment - Marketplace Item",
    metadata: { 
      productId: "test-001",
      buyer: currentUser.username,
      seller: "alphen09"
    }
  };
  const callbacks = {
    onReadyForServerApproval: (paymentId) => {
      console.log("Payment ready for approval:", paymentId);
      alert("Payment approved! ID: " + paymentId);
    },
    onReadyForServerCompletion: (paymentId, txid) => {
      console.log("Payment completed:", paymentId, txid);
      alert("Payment Successful! \nTXID: " + txid);
    },
    onCancel: (paymentId) => {
      console.log("Payment cancelled:", paymentId);
      alert("Payment cancelled");
    },
    onError: (error, payment) => {
      console.error("Payment error:", error);
      alert("Payment error: " + error);
    }
  };
  Pi.createPayment(paymentData, callbacks);
}