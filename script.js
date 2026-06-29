let creatureStartId = 1;
let loadDataUntil = 20;
let currentSelectedCreature = "";
let counter = 1;
const creatureCach = {};
const evoChainCach = [];
const nameList = [];
const evoBaseList = [];
const evoStepTwoList = [];
const evoStepThreeList = [];

const loadingText = document.getElementById('loadingText');
const dialogRef = document.getElementById(`detailCard`);

dialogRef.addEventListener('cancel', (event) => {
    dialogRef.innerHTML = '';
});

dialogRef.addEventListener('click', (event) => {
    if (event.target === dialogRef) {
        dialogRef.close();
        dialogRef.innerHTML = '';
    };
});

const loadingDialog = document.getElementById('loading');

loadingDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
});

loadingDialog.addEventListener('click', (event) => {
    if (event.target === loadingDialog) {
        event.preventDefault();
    };
});

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById(`searchField`);
    searchInput.addEventListener(`input`, searchCreature);
});

function searchCreature() {
    const searchInput = document.getElementById(`searchField`);
    let text = searchInput.value.toLowerCase().trim();
    let items = Object.values(creatureCach).map(data => data?.name);
    if (text.length >= 3) {
        const foundedCreatures = items.filter(item => {
            if (!item) return false;
            const matches = item.toLowerCase().includes(text);
            return matches;
        });
        showFoundedCreatrues(foundedCreatures);
    }
    if (text.length < 3) {
        document.getElementById(`cardContainer`).innerHTML = '';
        showCreatureCard(1, loadDataUntil);
    };
}

function showFoundedCreatrues(array) {
    const containerRef = document.getElementById('cardContainer');
    containerRef.innerHTML = '';
    if (array.length != 0) {
        for (let i = 0; i < array.length; i++) {
            containerRef.innerHTML += renderCreatureCard(getCreatureIdFromMemoryCach(array[i]),
                creatureCach[getCreatureIdFromMemoryCach(array[i])]);
            getCreatureClassDataFromMemory(getCreatureIdFromMemoryCach(array[i]), `creatureClass${getCreatureIdFromMemoryCach(array[i])}`);
        };
    } else {
        containerRef.innerHTML = `No Pokemone's founded! Please try agian`
    };
}

function showLoadingScreen() {
    loadingDialog.showModal();
    loadingText.innerText = "0%";
}

function updateLoadingScreen(currentStep, creatureStartId, loadDataUntil) {
    const prozent = ((currentStep - creatureStartId) / (loadDataUntil - creatureStartId)) * 100;
    loadingText.innerText = `${Math.round(prozent)}%`;
}

function closeLoadingScreen() {
    setTimeout(() => {
        loadingDialog.close();
    }, 400);
}

async function init() {
    showLoadingScreen();
    for (let i = creatureStartId; i <= loadDataUntil; i++) {
        updateLoadingScreen(i, creatureStartId, loadDataUntil);
        await loadCreatureDataFromApi(i, '');
        await loadEvoChainDataFromApi(creatureCach[i].name, i);
    };
    closeLoadingScreen();
    compareEvoDataWithCreatureMemory();
    showCreatureCard(creatureStartId, loadDataUntil);
}

async function loadCreatureDataFromApi(id, name) {
    if (id !== 0) {
        try {
            await loadDataBasedOnId(id, name);
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
        await saveEvoSteps(creatureDataResponse, i);
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

async function compareEvoDataWithCreatureMemory() {
    getNameListForCompare();
    await compareBase();
    await compareStepTwo();
    await compareStepThree();
}

async function compareBase() {
    const baseLength = evoBaseList.length;
    for (let i = 0; i < baseLength; i++) {
        const name = evoBaseList[i];
        if (name && searchCreatureInMemory(name) === false) {
            await loadCreatureDataFromApi(0, name);
        };
    };
}

async function compareStepTwo() {
    const stepTwoLength = evoStepTwoList.length;
    for (let i = 0; i < stepTwoLength; i++) {
        const name = evoStepTwoList[i];
        if (name && searchCreatureInMemory(name) === false) {
            await loadCreatureDataFromApi(0, name);
        };
    };
}

async function compareStepThree() {
    const stepThreeLength = evoStepThreeList.length;
    for (let i = 0; i < stepThreeLength; i++) {
        const name = evoStepThreeList[i];
        if (name && searchCreatureInMemory(name) === false) {
            await loadCreatureDataFromApi(0, name);
        };
    };
}

function getNameListForCompare() {
    const cachedIds = Object.keys(evoChainCach);
    for (let i = 0; i < cachedIds.length; i++) {
        const id = cachedIds[i];
        const evoData = evoChainCach[id];

        createStepDataList(evoData);
    };
}

function createStepDataList(evoData) {
    if (evoData !== undefined) {
        if (evoData.base && !evoBaseList.includes(evoData.base)) {
            evoBaseList.push(evoData.base);
        };
        if (evoData.stepTwo && !evoStepTwoList.includes(evoData.stepTwo)) {
            evoStepTwoList.push(evoData.stepTwo);
        };
        if (evoData.stepThree && !evoStepThreeList.includes(evoData.stepThree)) {
            evoStepThreeList.push(evoData.stepThree);
        };
    };
}

function showCreatureCard(start, end) {
    for (let i = start; i <= end; i++) {
        document.getElementById('cardContainer').innerHTML += renderCreatureCard(i, creatureCach[i]);
        getCreatureClassDataFromMemory(i, `creatureClass${i}`);
    };
}

function getCreatureClassDataFromMemory(id, containerRef) {
    const displayClassRef = document.getElementById(containerRef);
    for (let i = 0; i < creatureCach[id].types.length; i++) {
        displayClassRef.innerHTML += renderCreatureClass(creatureCach[id].types[i].type.name);
    };
}

function closeDialog() {
    const dialogRef = document.getElementById('detailCard');
    resetDialog(dialogRef);
    dialogRef.close();
}

function loadMoreCreatures() {
    creatureStartId = loadDataUntil + 1;
    if (loadDataUntil + 20 < 1029) {
        loadDataUntil = loadDataUntil + 20;
        init();
    } else {
        loadDataUntil = 1029;
        init();
    };
}

function openDialog(id) {
    const creatureId = id.match(/\d+/g);
    dialogRef.innerHTML += renderDetailCard(creatureCach[creatureId]);
    getCreatureClassDataFromMemory(creatureId, `detailCardClass`);
    loadMainData(getCreatureIdFromDialog());
    currentSelectedCreature = creatureId;
    dialogRef.showModal();
    hiddenPrevBtn();
    hiddenNextBtn();
}

function setMainData() {
    document.getElementById('btnMain').classList.add('active');
    document.getElementById('btnStats').classList.remove('active');
    document.getElementById('btnEvo').classList.remove('active');
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
            document.getElementById(`abilities`).innerHTML += creatureCach[id].abilities[i].ability.name;
        } else {
            document.getElementById(`abilities`).innerHTML += creatureCach[id].abilities[i].ability.name + `, `;
        };
    };
}

function setStatsData() {
    document.getElementById('btnMain').classList.remove('active');
    document.getElementById('btnStats').classList.add('active');
    document.getElementById('btnEvo').classList.remove('active');
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
    document.getElementById('btnMain').classList.remove('active');
    document.getElementById('btnStats').classList.remove('active');
    document.getElementById('btnEvo').classList.add('active');
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
            index = creature?.id;
        };
    });
    return index;
}

function showEvoStepData(id) {
    const evoChainContainerRef = document.getElementById('evoChainContainer');
    evoChainContainerRef.innerHTML += renderEVoChainStep(creatureCach, id);
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
    hiddenPrevBtn();
}

function nextCreature() {
    if (currentSelectedCreature < loadDataUntil) {
        const dialogRef = document.getElementById(`detailCard`);
        currentSelectedCreature++;
        resetDialog(dialogRef);
        dialogRef.innerHTML += renderDetailCard(creatureCach[currentSelectedCreature]);
        getCreatureClassDataFromMemory(currentSelectedCreature, `detailCardClass`);
        loadMainData(getCreatureIdFromDialog());
    };
    hiddenNextBtn();
}

function hiddenPrevBtn() {
    const btnPref = document.getElementById(`prev`);
    if (parseFloat(getCreatureIdFromDialog()) == 1) {
        btnPref.classList.add('hidden');
    };
}

function hiddenNextBtn() {
    const btnNext = document.getElementById(`next`);
    if (parseFloat(getCreatureIdFromDialog()) == loadDataUntil) {
        btnNext.classList.add('hidden');
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