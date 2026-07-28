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

        alert("Welcome " + auth.user.username);

        const loginBtn = document.getElementById("loginBtn");

        if (loginBtn) {
            loginBtn.innerHTML = "👤 " + auth.user.username;
        }

    } catch (err) {

        console.log(err);

        alert("Login cancelled.");

    }

}