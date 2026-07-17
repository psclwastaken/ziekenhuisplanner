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



function save(){

localStorage.setItem(
"reservations",
JSON.stringify(reservations)
);

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


calendar.innerHTML="";


for(
let day=1;
day<=31;
day++
){


let date =
`2026-07-${day}`;


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
☀ Middag
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
🌙 Avond
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
