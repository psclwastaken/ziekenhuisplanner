if(
    sessionStorage.getItem("authenticated")
    !== "true"
){

    window.location.href="index.html";

}


const familyMembers = [
    "Jan",
    "Piet",
    "Oma",
    "Maria"
];



const calendar =
document.getElementById("calendar");



const reservations =
JSON.parse(
localStorage.getItem("reservations")
)
||
{};

const archivedReservations =
JSON.parse(
localStorage.getItem("archivedReservations")
)
||
{};



function save(){

localStorage.setItem(
"reservations",
JSON.stringify(reservations)
);
localStorage.setItem(
"archivedReservations",
JSON.stringify(archivedReservations)
);

}


function archivePastDates(){
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let day = 1; day <= 31; day++) {
        const date = `2026-07-${String(day).padStart(2, '0')}`;
        const dayDate = new Date(date);
        dayDate.setHours(0,0,0,0);

        if (dayDate < today) {
            ["middag", "avond"].forEach(period => {
                const key = `${date}-${period}`;
                if (reservations[key] && reservations[key].length) {
                    if (!archivedReservations[key]) {
                        archivedReservations[key] = [];
                    }
                    archivedReservations[key] = archivedReservations[key].concat(reservations[key]);
                    delete reservations[key];
                }
            });
        }
    }

    save();
}


function reserve(date, period){


let name =
prompt(
"Vul je naam in:");



if(!name || !name.trim())
{
alert("Ongeldige naam");
return;
}



const key =
`${date}-${period}`;



if(!reservations[key])
{

reservations[key]=[];

}



if(reservations[key].length >=2)
{

alert(
"Dit tijdstip is vol"
);

return;

}



reservations[key].push(name);


save();

render();


}


function render(){


archivePastDates();

calendar.innerHTML="";


for(
let day=1;
day<=31;
day++
){


let date =
`2026-07-${String(day).padStart(2, '0')}`;

const today = new Date();
today.setHours(0,0,0,0);
const dayDate = new Date(date);
dayDate.setHours(0,0,0,0);

if(dayDate < today){
    continue;
}


let middag =
reservations[
`${date}-middag`
] || [];


let avond =
reservations[
`${date}-avond`
] || [];


calendar.innerHTML += `


<div class="day">


<h2>
${day} juli
</h2>


<div class="block">

<h3>
☀ Middag — 14:00 tot 15:00
</h3>


<p>
${middag.join("<br>") || "Vrij"}
</p>


<button onclick="reserve('${date}','middag')">

Reserveer

</button>


</div>


<div class="block">

<h3>
🌙 Avond — 18:30 tot 20:00
</h3>


<p>
${avond.join("<br>") || "Vrij"}
</p>


<button onclick="reserve('${date}','avond')">

Reserveer

</button>


</div>


</div>


`;


}


}


window.reserve = reserve;


render();
