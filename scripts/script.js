let creatureStartId = 1;
let loadDataUntil = 20;
let currentSelectedCreature = "";
const creatureCach = {};
const evoChainCach = [];
const nameList = [];
const evoBaseList = [];
const evoStepTwoList = [];
const evoStepThreeList = [];

async function init() {
    for (let i = creatureStartId; i <= loadDataUntil; i++) {
        await loadCreatureDataFromApi(i, '');
        await loadEvoChainDataFromApi(creatureCach[i].name, i);
    };
    compareEvoDataWithCreatureMemory();
    showCreatureCard();
}

async function loadCreatureDataFromApi(id, name) {
    if (id !== 0) {
        try {
            await loadDataBasedOnId(id, name)
        } catch (error) {
            console.error("Fehler:", error);
        };
    } else {
        try {
            await loadDataBasedOnName(id, name);
        } catch (error) {
            console.error("Fehler:", error);
        };
    };
}

async function loadDataBasedOnId(id, name) {
    const creatureDataResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!creatureDataResponse.ok) {
        console.warn(`Pokémon "${name}" wurde auf dem Server nicht gefunden (Status: ${response.status}).`);
        return null;
    };
    const data = await creatureDataResponse.json();
    saveCreatureDataInMemory(data.id, data);
}

async function loadDataBasedOnName(id, name) {
    const creatureDataResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!creatureDataResponse.ok) {
        console.warn(`Pokémon "${name}" wurde auf dem Server nicht gefunden (Status: ${creatureDataResponse.status}).`);
        return null;
    };
    const data = await creatureDataResponse.json();
    saveCreatureDataInMemory(data.id, data);
    await loadEvoChainDataFromApi(creatureCach[data.id].name, data.id);
}

function saveCreatureDataInMemory(id, data) {
    creatureCach[id] = data;
}

async function loadEvoChainDataFromApi(name, i) {
    const creatureDataResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
    if (!creatureDataResponse.ok) {
        console.warn(`Pokémon "${name}" wurde auf dem Server nicht gefunden (Status: ${creatureDataResponse.status}).`);
        return null;
    } else {
        await saveEvoSteps(creatureDataResponse, i)
    };
}

async function saveEvoSteps(response, i) {
    let base = '';
    let stepTwo = '';
    let stepThree = '';
    const mainData = await response.json();
    const evoChainDataResponse = await fetch(`${mainData.evolution_chain.url}`);
    const evoChain = await evoChainDataResponse.json();
    if (evoChain.chain.species !== undefined) {
        base = evoChain.chain.species.name;
        if (evoChain.chain.evolves_to[0] !== undefined) {
            stepTwo = evoChain.chain.evolves_to[0].species.name;
            if (evoChain.chain.evolves_to[0].evolves_to[0] !== undefined) {
                stepThree = evoChain.chain.evolves_to[0].evolves_to[0].species.name;
            };
        };
    };
    saveEvoDataInCach(i, base, stepTwo, stepThree);
}

function saveEvoDataInCach(i, base, stepTwo, stepThree) {
    const data = { id: i, base: base, stepTwo: stepTwo, stepThree: stepThree };
    evoChainCach[i] = data;
}

function compareEvoDataWithCreatureMemory() {
    getNameListForCompare();
    for (let i = 0; i < evoBaseList.length; i++) {
        if (searchCreatureInMemory(evoBaseList[i]) === false && evoBaseList[i] != '') {
            loadCreatureDataFromApi(0, evoBaseList[i]);
        };
    };
    for (let i = 0; i < evoStepTwoList.length; i++) {
        if (searchCreatureInMemory(evoStepTwoList[i]) === false && evoStepTwoList[i] != '') {
            loadCreatureDataFromApi(0, evoStepTwoList[i]);
        };
    };
    for (let i = 0; i < evoStepThreeList.length; i++) {
        if (searchCreatureInMemory(evoStepThreeList[i]) === false && evoStepThreeList[i] != '') {
            loadCreatureDataFromApi(0, evoStepThreeList[i]);
        };
    };
}

function getNameListForCompare() {
    for (let i = 1; i <= Object.keys(creatureCach).length; i++) {
        if (evoChainCach[i] !== undefined) {
            if (!evoBaseList.includes(evoChainCach[i].base)) {
                evoBaseList.push(evoChainCach[i].base)
            };
            if (!evoStepTwoList.includes(evoChainCach[i].stepTwo)) {
                evoStepTwoList.push(evoChainCach[i].stepTwo)
            };
            if (!evoStepThreeList.includes(evoChainCach[i].stepThree)) {
                evoStepThreeList.push(evoChainCach[i].stepThree)
            };
        };
    };
}

function showCreatureCard() {
    for (let i = creatureStartId; i <= loadDataUntil; i++) {
        document.getElementById('cardContainer').innerHTML += renderCreatureCard(i, creatureCach[i]);
        getCreatureClassDataFromMemory(i, `creatureClass${i}`);
    };
    creatureStartId = loadDataUntil + 1;
}

function getCreatureClassDataFromMemory(id, containerRef) {
    const displayClassRef = document.getElementById(containerRef);

    for (let i = 0; i < creatureCach[id].types.length; i++) {
        displayClassRef.innerHTML += renderCreatureClass(creatureCach[id].types[i].type.name);
    };
}

function closeDialog() {
    const dialogRef = document.getElementById('detailCard');
    resetDialog(dialogRef)
    dialogRef.close();
}

function loadMoreCreatures() {
    if (loadDataUntil + 20 < 1029) {
        loadDataUntil = loadDataUntil + 20;
        init();
    } else {
        loadDataUntil = 1029;
        init();
    }
}
// render dialog-detail informations
function openDialog(id) {
    const creatureId = id.match(/\d+/g);
    const dialogRef = document.getElementById(`detailCard`);
    dialogRef.innerHTML += renderDetailCard(creatureCach[creatureId]);
    getCreatureClassDataFromMemory(creatureId, `detailCardClass`);
    loadMainData(getCreatureIdFromDialog());
    currentSelectedCreature = creatureId;
    dialogRef.showModal();
}

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
    const displayDetailRef = document.getElementById(`detailInformation`);
    displayDetailRef.innerHTML += renderDetailStatsInformation();
    loadStatsData(getCreatureIdFromDialog());
}

function loadStatsData(id) {
    let tableRef = document.getElementById(`skillStats`);
    for (let i = 0; i < creatureCach[id].stats.length; i++) {
        const name = creatureCach[id].stats[i].stat.name;
        const value = creatureCach[id].stats[i].base_stat;

        tableRef.innerHTML += renderSkillValues(name);
        getSkillClassValue(name, value);
    };
}

function setEvoChainData() {
    const evoChainContainerRef = document.getElementById('detailInformation');
    resetDetailData();
    evoChainContainerRef.innerHTML += renderEvoChainContainer();
    setEvoChainStep(getCreatureIdFromDialog());
}

function getSkillClassValue(name, value) {
    const className = document.querySelector(`.${name}`);
    className.style.setProperty(`--${name}`, value);
}

function setEvoChainStep(i) {
    const evoChainContainerRef = document.getElementById('evoChainContainer');

    if (evoChainCach[i].base != '') {
        showEvoStepData(getCreatureIdFromMemoryCach(evoChainCach[i].base));
    };
    if (evoChainCach[i].stepTwo != '') {
        evoChainContainerRef.innerHTML += `<img src="./assets/icons/next_step.png" alt="">`;
        showEvoStepData(getCreatureIdFromMemoryCach(evoChainCach[i].stepTwo));
        if (evoChainCach[i].stepThree != '') {
            evoChainContainerRef.innerHTML += `<img src="./assets/icons/next_step.png" alt="">`;
            showEvoStepData(getCreatureIdFromMemoryCach(evoChainCach[i].stepThree));
        };
    };
}

function getCreatureIdFromMemoryCach(name) {
    let index = '';
    Object.values(creatureCach).forEach((creature, i) => {
        if (creature?.name === name) {
            index = creature?.id
        }
    });
    return index;
}

function showEvoStepData(id) {
    const evoChainContainerRef = document.getElementById('evoChainContainer');
    evoChainContainerRef.innerHTML += renderEVoChainStep(creatureCach, id)
}

function resetDetailData() {
    document.getElementById(`detailInformation`).children[0].remove();
}

function previousCreature() {
    if (currentSelectedCreature > 1) {
        currentSelectedCreature--;
        const dialogRef = document.getElementById(`detailCard`);
        resetDialog(dialogRef);
        dialogRef.innerHTML += renderDetailCard(creatureCach[currentSelectedCreature]);
        getCreatureClassDataFromMemory(currentSelectedCreature, `detailCardClass`);
        loadMainData(getCreatureIdFromDialog());
    };
}

function nextCreature() {
    if (currentSelectedCreature < loadDataUntil) {
        currentSelectedCreature++;
        const dialogRef = document.getElementById(`detailCard`);
        resetDialog(dialogRef);
        dialogRef.innerHTML += renderDetailCard(creatureCach[currentSelectedCreature]);
        getCreatureClassDataFromMemory(currentSelectedCreature, `detailCardClass`);
        loadMainData(getCreatureIdFromDialog());
    };
}

function resetDialog(parentRef) {
    const cardRef = parentRef.children[0];
    cardRef.remove();
}

function getCreatureIdFromDialog() {
    return document.getElementById(`detailCardId`).textContent.match(/\d+/g)[0];
}

function searchCreatureInMemory(name) {
    const nameList = Object.values(creatureCach).map(data => data?.name);
    return nameList.includes(name);
}