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


function removeReservation(date, period, index){
    const key = `${date}-${period}`;
    const list = reservations[key];
    if (!list || index < 0 || index >= list.length) {
        return;
    }
    list.splice(index, 1);
    if (list.length === 0) {
        delete reservations[key];
    }
    save();
    render();
}


function escapeHtml(text){
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


function render(){


archivePastDates();

calendar.innerHTML="";


const weekdayNames = [
    'Zondag',
    'Maandag',
    'Dinsdag',
    'Woensdag',
    'Donderdag',
    'Vrijdag',
    'Zaterdag'
];

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

const weekday = weekdayNames[dayDate.getDay()];


const middag =
reservations[
`${date}-middag`
] || [];


const avond =
reservations[
`${date}-avond`
] || [];


const middagHtml = middag.length
    ? middag.map((name, index) =>
        `<div class="reservation-line">
            <span>${escapeHtml(name)}</span>
            <button class="remove-button" onclick="removeReservation('${date}','middag',${index})">Verwijder</button>
        </div>`
      ).join('')
    : 'Vrij';

const avondHtml = avond.length
    ? avond.map((name, index) =>
        `<div class="reservation-line">
            <span>${escapeHtml(name)}</span>
            <button class="remove-button" onclick="removeReservation('${date}','avond',${index})">Verwijder</button>
        </div>`
      ).join('')
    : 'Vrij';

calendar.innerHTML += `


<div class="day">


<h2>
${weekday} ${day} juli
</h2>


<div class="block">

<h3>
☀ Middag — 14:00 tot 15:00
</h3>


<div class="reservation-list">
${middagHtml}
</div>


<button onclick="reserve('${date}','middag')">

Reserveer

</button>


</div>


<div class="block">

<h3>
🌙 Avond — 18:30 tot 20:00
</h3>


<div class="reservation-list">
${avondHtml}
</div>


<button onclick="reserve('${date}','avond')">

Reserveer

</button>


</div>


</div>


`;


}


}


window.reserve = reserve;
window.removeReservation = removeReservation;


render();
