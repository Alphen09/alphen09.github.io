Pi.init({ version: "2.0", sandbox: true }); // Test mode muna

let currentUser = null;

window.onload = async function () {
  try {
    const auth = await Pi.authenticate(["username", "payments"], onIncompletePaymentFound);
    currentUser = auth.user;
    document.getElementById("pi-user").innerText = "Hi, " + currentUser.username; // pi-user gamit mo sa HTML
  } catch (error) {
    alert("Login failed: " + error);
    console.error(error);
  }
};

function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment found:", payment);
}

async function approvePayment(paymentId) {
  const response = await fetch("https://alphen09-github-io.onrender.com/approve-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId: paymentId }),
  });
  return await response.json();
}

async function completePayment(paymentId, txid) {
  const response = await fetch("https://alphen09-github-io.onrender.com/complete-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId: paymentId, txid: txid }),
  });
  return await response.json();
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
    onReadyForServerApproval: async function (paymentId) {
      try {
        const result = await approvePayment(paymentId);
        console.log("Approved:", result);
        Pi.completePayment(paymentId); // <-- ITO YUNG PANG PAWALA NG 60S
      } catch (err) {
        console.error(err);
        alert("Approval failed.");
      }
    },
    
    onReadyForServerCompletion: async function (paymentId, txid) {
      try {
        const result = await completePayment(paymentId, txid);
        console.log("Completed:", result);
        alert("Payment Successful!\n\n" + productName + "\n\nTXID:\n" + txid);
      } catch (err) {
        console.error(err);
        alert("Completion failed.");
      }
    },
    
    onCancel: function (paymentId) {
      console.log(paymentId);
      alert("Payment Cancelled");
    },
    
    onError: function (error) {
      console.error(error);
      alert("Payment Error: " + error);
    },
  };

  Pi.createPayment(paymentData, callbacks);
}