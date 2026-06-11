let CREATURE_ID = 1;
let loadDataCount = 24;
let currentSelectedCreature = "";
evoStepCount = 0;
const creatureCach = {};
const evoChainCach = {};

function init() {
    for (let i = CREATURE_ID; i <= loadDataCount; i++) {
        loadCreatureDataFromApi(i);
        loadEvoChainDataFromApi(i);
    }
    CREATURE_ID = loadDataCount + 1;
}

// load creature data from api
async function loadCreatureDataFromApi(id) {
    try {
        const creatureDataResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await creatureDataResponse.json();
        saveCreatureDataInMemory(id, data);

        // noch auslagern
        document.getElementById('cardContainer').innerHTML += renderCreatureCard(id, creatureCach[id]);
        loadCreatureClassData(id, `creatureClass${id}`);
        // noch auslagern

    } catch (error) {
        console.error("Fehler:", error);
    };
}

async function loadEvoChainDataFromApi(id) {
    const creatureDataResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const mainData = await creatureDataResponse.json();
    const evoChainDataResponse = await fetch(`${mainData.evolution_chain.url}`);
    const evoChain = await evoChainDataResponse.json()
    if (evoChain.chain.evolves_to[0] !== undefined) {
    }
    if (evoChain.chain.evolves_to[0].evolves_to[0] !== undefined) {
    }

    saveEvoChainDataInMemory(id, evoChain);
}

function saveCreatureDataInMemory(id, data) {
    creatureCach[id] = data;
}

function saveEvoChainDataInMemory(id, data) {
    evoChainCach[id] = data;
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

function setEvoChainData() {
    const evoChainContainerRef = document.getElementById('detailInformation');
    resetDetailData();
    evoChainContainerRef.innerHTML += renderEvoChainContainer();
    setEvoChainStep(getCreatureIdFromDialog());
}

function setEvoChainStep(id) {
    const evoChainContainerRef = document.getElementById('evoChainContainer');
    if (evoChainCach[id].chain.species.name != undefined) {
        loadEvoStepData(id, evoChainCach[id].chain.species.name);
        evoChainContainerRef.innerHTML += `<img src="./assets/icons/next_step.png" alt="">`;
    };
    if (evoChainCach[id].chain.evolves_to[0] !== undefined) {
        loadEvoStepData(id, evoChainCach[id].chain.evolves_to[0].species.name);
        if (evoChainCach[id].chain.evolves_to[0].evolves_to[0] !== undefined) {
            evoChainContainerRef.innerHTML += `<img src="./assets/icons/next_step.png" alt="">`;
            loadEvoStepData(id, evoChainCach[id].chain.evolves_to[0].evolves_to[0].species.name);
        } else {
            return;
        }
    };
}

function loadEvoStepData(id, name) {
    const evoChainContainerRef = document.getElementById('evoChainContainer');
    id = searchCreatureIdWithName(name);
    evoChainContainerRef.innerHTML += renderEVoChainStep(creatureCach, id)
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
    return document.getElementById(`detailCard`).children[0].children[0].children[1].textContent.match(/\d+/g);
}

//search picture for evoChain
function searchCreatureIdWithName(name) {  
    let result = '';
    
    for (let i = 1; i <= Object.keys(creatureCach).length; i++) {
        if (creatureCach[i].forms[0].name === name) {
            return creatureCach[i].id
        }     
    };

    if (result === '') {
        console.log(`${name} wurde nicht gefunden!`);
    }
}

