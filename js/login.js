const FAMILY_PASSWORD = "familie2026";

function login(){

    const password =
        document.getElementById("password").value;

    if(password === FAMILY_PASSWORD){

        sessionStorage.setItem(
            "authenticated",
            "true"
        );

        window.location.href =
            "calendar.html";

    }
    else{

        document.getElementById("error")
            .innerHTML =
            "Onjuist wachtwoord";

    }
}
