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
}

// DITO LANG DAPAT ANG APPROVE
async function approvePayment(paymentId) {
  const res = await fetch("https://alphen09-github-io.onrender.com/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  });
  if (!res.ok) throw new Error("Approve failed");
  return await res.json();
}

// DITO LANG DAPAT ANG COMPLETE
async function completePayment(paymentId, txid) {
  const res = await fetch("https://alphen09-github-io.onrender.com/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId, txid }),
  });
  if (!res.ok) throw new Error("Complete failed");
  return await res.json();
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
        await completePayment(paymentId, txid); // TINAWAG NA NATIN DITO
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