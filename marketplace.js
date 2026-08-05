Pi.init({ version: "2.0", sandbox: true }); // Test Pi muna
let currentUser = null;

window.onload = async function () {
  try {
    const auth = await Pi.authenticate(["username", "payments"], onIncompletePaymentFound);
    currentUser = auth.user;
    document.getElementById("pi-user").innerText = "Hi, " + currentUser.username;
  } catch (error) {
    alert("Login failed: " + error);
    console.error(error);
  }
};

function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment found:", payment);
  // Auto complete pag may naiwan
  approvePayment(payment.identifier);
}

async function approvePayment(paymentId) {
  console.log("Sending approve for:", paymentId);
  const res = await fetch("https://alphen09-github-io.onrender.com/approve", {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  });
  
  const data = await res.json();
  console.log("Approve response:", data);
  return data;
}

async function completePayment(paymentId, txid) {
  console.log("Sending complete for:", paymentId, txid);
  const res = await fetch("https://alphen09-github-io.onrender.com/complete", {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId, txid }),
  });
  
  const data = await res.json();
  console.log("Complete response:", data);
  return data;
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
        await approvePayment(paymentId);
        Pi.completePayment(paymentId); // PANG PAWALA NG 60S
      } catch (err) {
        console.error(err);
        alert("Approval failed.");
      }
    },
    
    onReadyForServerCompletion: async function (paymentId, txid) {
      try {
        await completePayment(paymentId, txid);
        alert("Payment Successful!\n\n" + productName + "\n\nTXID:\n" + txid);
      } catch (err) {
        console.error(err);
        alert("Completion failed.");
      }
    },
    
    onCancel: function (paymentId) {
      alert("Payment Cancelled");
    },
    
    onError: function (error) {
      console.error(error);
      alert("Payment Error: " + error);
    },
  };

  Pi.createPayment(paymentData, callbacks);
}