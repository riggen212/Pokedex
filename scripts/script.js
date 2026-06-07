let CREATURE_ID = 1;
let loadDataCount = 20;
let currentSelectedCreature = "";
const creatureCach = {};

function init() {
    for (let i = CREATURE_ID; i <= loadDataCount; i++) {
        loadDataFromApi(i);
    }
    CREATURE_ID = loadDataCount + 1;
}

// load creature data from api
async function loadDataFromApi(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        saveDataInMemory(id, data);
        document.getElementById('cardContainer').innerHTML += renderCreatureCard(id, creatureCach[id]);
        loadCreatureClassData(id, `creatureClass${id}`);

    } catch (error) {
        console.error("Fehler:", error);
    };
}

function saveDataInMemory(id, data) {
    creatureCach[id] = data;
}

function loadCreatureClassData(id, containerRef) {
    const displayClassRef = document.getElementById(containerRef);

    for (let i = 0; i < creatureCach[id].types.length; i++) {
        displayClassRef.innerHTML += renderCreatureClass(creatureCach[id].types[i].type.name);
    };
}

function loadCreatureData(id) {
    const cacheKey = id;
    // check, is data in memory storage?
    if (creatureCach[cacheKey]) {
        return true;
    } else {
        return false
    }
}

function openDialog(id) {
    const creatureId = id.match(/\d+/g);
    const dialogRef = document.getElementById(`detailCard`);
    dialogRef.innerHTML += renderDetailCard(creatureCach[creatureId]);
    loadCreatureClassData(creatureId, `detailCardClass`);
    loadMainData(getCreatureIdFromDialog());
    currentSelectedCreature = creatureId;
    dialogRef.showModal();
}

function closeDialog() {
    const dialogRef = document.getElementById('detailCard');
    resetDialog(dialogRef)
    dialogRef.close();
}
// render dialog-detail informations
function setMainData() {
    resetDetailData();
    loadMainData(getCreatureIdFromDialog());
}

function loadMainData(id) {
    const height = creatureCach[id].height / 10;
    const weight = creatureCach[id].weight / 10;
    const baseExperience = creatureCach[id].base_experience;

    let displayDetailRef = document.getElementById(`detailInformation`);
    displayDetailRef.innerHTML += renderDetailMainInformation(height, weight, baseExperience);
    loadAbilities(id);
}

function loadAbilities(id) {
    for (let i = 0; i < creatureCach[id].abilities.length; i++) {
        if (i == creatureCach[id].abilities.length - 1) {
            document.getElementById(`abilities`).innerHTML += creatureCach[id].abilities[i].ability.name
        } else {
            document.getElementById(`abilities`).innerHTML += creatureCach[id].abilities[i].ability.name + `, `;
        }
    };
}

function setStatsData() {
    resetDetailData();
    loadStatsData(getCreatureIdFromDialog());
}

function loadStatsData(id) {
    const hp = creatureCach[id].stats[0].base_stat;
    const attack = creatureCach[id].stats[1].base_stat;
    const defense = creatureCach[id].stats[2].base_stat;
    const specialAttack = creatureCach[id].stats[3].base_stat;
    const specialDefense = creatureCach[id].stats[4].base_stat;
    const speed = creatureCach[id].stats[5].base_stat;

    let displayDetailRef = document.getElementById(`detailInformation`);
    displayDetailRef.innerHTML += renderDetailStatsInformation(hp, attack, defense, specialAttack, specialDefense, speed);
}

function resetDetailData() {
    document.getElementById(`detailInformation`).children[0].remove();
}

// change data in dialog
function previousCreature() {
    if (currentSelectedCreature > 1) {
        currentSelectedCreature--;
        const dialogRef = document.getElementById(`detailCard`);
        resetDialog(dialogRef);
        dialogRef.innerHTML += renderDetailCard(creatureCach[currentSelectedCreature]);
        loadCreatureClassData(currentSelectedCreature, `detailCardClass`);
        loadMainData(getCreatureIdFromDialog());
    };
}

function nextCreature() {
    if (currentSelectedCreature < loadDataCount) {
        currentSelectedCreature++;
        const dialogRef = document.getElementById(`detailCard`);
        resetDialog(dialogRef);
        dialogRef.innerHTML += renderDetailCard(creatureCach[currentSelectedCreature]);
        loadCreatureClassData(currentSelectedCreature, `detailCardClass`);
        loadMainData(getCreatureIdFromDialog());
    };
}

function resetDialog(parentRef) {
    const cardRef = parentRef.children[0];
    cardRef.remove();
}

// allgemeine funktionen
function getCreatureIdFromDialog() {
    return document.getElementById(`detailCard`).children[0].children[0].children[1].textContent;
}