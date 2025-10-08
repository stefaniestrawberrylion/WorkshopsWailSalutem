document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('cardContainer');
    const showEmailForm = document.getElementById('showEmailForm');
    const backToLogin = document.getElementById('backToLogin');

    // Panel switching
    if (showEmailForm) {
        showEmailForm.addEventListener('click', () => {
            cardContainer.classList.add('show-email');
            cardContainer.classList.remove('reset');
        });
    }

    if (backToLogin) {
        backToLogin.addEventListener('click', () => {
            cardContainer.classList.remove('show-email');
            cardContainer.classList.add('reset');
        });
    }

    const loginBtn = document.querySelector(".login button");
    loginBtn.addEventListener("click", async () => {
        const email = document.querySelector(".login input[type='email']").value;
        const password = document.querySelector(".login input[type='password']").value;

        const response = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });

        if (response.ok) {
            const token = response.headers.get("Authorization");
            if (token) {
                localStorage.setItem("jwt", token); // inclusief "Bearer "
                window.location.href = "/html/workshopToevoegen.html";
            }
        } else {
            alert("Login mislukt: " + response.status);
        }
    });
    async function fetchWorkshops() {
        const token = localStorage.getItem("jwt");
        const response = await fetch("http://localhost:8080/api/workshops", {
            headers: { "Authorization": token }
        });

        if (response.ok) {
            const workshops = await response.json();
            console.log(workshops);
        } else {
            console.error("Failed", response.status);
        }
    }

    fetchWorkshops();

});


//Registeren gebruiker

document.addEventListener('DOMContentLoaded', () => {

    // Login functionaliteit (zoals jij had)
    const loginBtn = document.querySelector(".login button");
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = document.querySelector(".login input[type='email']").value;
            const password = document.querySelector(".login input[type='password']").value;

            const response = await fetch("http://localhost:8080/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const token = response.headers.get("Authorization");
                if (token) {
                    localStorage.setItem("jwt", token);
                    window.location.href = "/html/workshopToevoegen.html";
                }
            } else {
                alert("Login mislukt: " + response.status);
            }
        });
    }

    // Registratie-aanvraag
    const sendEmailBtn = document.getElementById('sendEmail');
    sendEmailBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;

        if (!email || !firstName || !lastName) {
            alert("Vul alle velden in!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/register/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, firstName, lastName })
            });

            const data = await response.json();
            if (data.success) {
                alert("Je aanvraag is verstuurd! De opdrachtgever zal contact opnemen.");
            } else {
                alert("Er is iets misgegaan. Probeer later opnieuw.");
            }

        } catch (error) {
            console.error(error);
            alert("Er is een fout opgetreden bij het versturen van de aanvraag.");
        }
    });

});

