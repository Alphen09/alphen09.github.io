document.addEventListener("DOMContentLoaded", () => {

    Pi.init({
        version: "2.0",
        sandbox: true
    });

    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", loginPi);
    }

});

async function loginPi() {

    try {

        const auth = await Pi.authenticate(["username"]);

        // Save Pi username
        localStorage.setItem("piUser", auth.user.username);

        // Redirect to Marketplace
        window.location.href = "./marketplace.html";

    } catch (err) {

        console.log(err);

        alert("Login cancelled.");

    }

}
function goMint() {
    window.location.href = "mint.html";
}