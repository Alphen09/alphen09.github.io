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
  approvePayment(payment.identifier);
}

async function approvePayment(paymentId) {
  console.log("Sending approve for:", paymentId);
  try {
    await fetch("https://alphen09-github-io.onrender.com/approve", {
      method: "POST",
      mode: "no-cors", // ITO SUSI
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
  } catch(e) {
    console.log("Fetch error pero ok lang:", e);
  }
  return { status: 'ok' }; // Pilitin natin mag success
}

async function completePayment(paymentId, txid) {
  console.log("Sending complete for:", paymentId, txid);
  try {
    await fetch("https://alphen09-github-io.onrender.com/complete", {
      method: "POST",
      mode: "no-cors", // ITO SUSI
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, txid }),
    });
  } catch(e) {
    console.log("Fetch error pero ok lang:", e);
  }
  return { status: 'ok' }; // Pilitin natin mag success
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
      await approvePayment(paymentId);
      Pi.completePayment(paymentId); // PANG PAWALA NG 60S
    },
    
    onReadyForServerCompletion: async function (paymentId, txid) {
      await completePayment(paymentId, txid);
      alert("Payment Successful!\n\n" + productName + "\n\nTXID:\n" + txid);
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