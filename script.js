let creatureStartId = 1;
let loadDataUntil = 20;
let currentSelectedCreature = '';
let activeSearch = false;
let foundedCreatureList = [];
const creatureCach = {};
const evoChainCach = [];
const nameList = [];
const evoBaseList = [];
const evoStepTwoList = [];
const evoStepThreeList = [];
const loadingText = document.getElementById('loadingText');
const dialogRef = document.getElementById(`detailCard`);
const loadingDialog = document.getElementById('loading');

dialogRef.addEventListener('cancel', (event) => {
    dialogRef.innerHTML = '';
});

dialogRef.addEventListener('click', (event) => {
    if (event.target === dialogRef) {
        dialogRef.close();
        dialogRef.innerHTML = '';
    };
});

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
    const text = document.getElementById('searchField').value.toLowerCase().trim();
    const items = Object.values(creatureCach).map(data => data?.name);
    activeSearch = text.length >= 3;
    if (activeSearch) {
        const founded = items.filter(item => item && item.toLowerCase().includes(text));
        showFoundedCreatrues(founded);
    } else {
        foundedCreatureList = [];
        document.getElementById('cardContainer').innerHTML = '';
        console.log(loadDataUntil);
        
        showCreatureCard(1, loadDataUntil);
    };
}

function showFoundedCreatrues(array) {
    const containerRef = document.getElementById('cardContainer');
    containerRef.innerHTML = '';
    if (array.length != 0) {
        for (let i = 0; i < array.length; i++) {
            foundedCreatureList[getCreatureIdFromMemoryCach(array[i])] = creatureCach[getCreatureIdFromMemoryCach(array[i])];
            containerRef.innerHTML += renderCreatureCard(getCreatureIdFromMemoryCach(array[i]),
                creatureCach[getCreatureIdFromMemoryCach(array[i])]);
            getCreatureClassDataFromMemory(getCreatureIdFromMemoryCach(array[i]), `creatureClass${getCreatureIdFromMemoryCach(array[i])}`);
        };
    } else {
        containerRef.innerHTML = `No Pokemone's founded! Please try agian`;
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
    };
    closeLoadingScreen();
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
    const mainData = await response.json();
    const evoResponse = await fetch(mainData.evolution_chain.url);
    let currentStep = (await evoResponse.json()).chain;
    const evoSteps = [];
    while (currentStep) {
        const name = currentStep.species.name;
        evoSteps.push(name);
        await ensureCreatureInMemory(name);
        currentStep = currentStep.evolves_to[0];
    };
    saveEvoDataInCach(i, evoSteps[0] || '', evoSteps[1] || '', evoSteps[2] || '');
}

function saveEvoDataInCach(i, base, stepTwo, stepThree) {
    const data = { id: i, base: base, stepTwo: stepTwo, stepThree: stepThree };
    evoChainCach[i] = data;
}

async function ensureCreatureInMemory(name) {
    if (!name) return;
    const exists = Object.values(creatureCach).some(c => c && c.name === name);
    if (!exists) {
        await loadCreatureDataFromApi(0, name);
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

async function openDialog(id) {
    const matches = id.match(/\d+/);
    if (!matches) return;
    currentSelectedCreature = parseInt(matches);

    dialogRef.innerHTML = renderDetailCard(creatureCach[currentSelectedCreature]);
    getCreatureClassDataFromMemory(currentSelectedCreature, `detailCardClass`);
    setMainData(); dialogRef.showModal();
    hiddenPrevBtn(); hiddenNextBtn();

    await loadEvoChainDataFromApi(creatureCach[currentSelectedCreature].name, currentSelectedCreature);
    if (document.getElementById('btnMain').classList.contains('active')) setMainData();
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
    const container = document.getElementById('detailInformation');
    if (container) container.innerHTML = '';
}

function getMinCreatureIndex(cache) {
    const indices = Object.keys(cache).map(Number).filter(i => cache[i] !== undefined && cache[i] !== null);
    return indices.length > 0 ? Math.min(...indices) : 1;
}

async function previousCreature() {
    if (!activeSearch && creatureCach[currentSelectedCreature - 1]) {
        currentSelectedCreature--;
        loadPrevios(creatureCach, currentSelectedCreature);
    };
    if (activeSearch && foundedCreatureList[currentSelectedCreature - 1]) {
        currentSelectedCreature--;
        loadPrevios(foundedCreatureList, currentSelectedCreature);
    };
    hiddenNextBtn();
    hiddenPrevBtn();
    await loadEvoChainDataFromApi(creatureCach[currentSelectedCreature].name, currentSelectedCreature);
}

function loadPrevios(cache, currentSelectedCreature) {
    const dialogRef = document.getElementById(`detailCard`);
    resetDialog(dialogRef);
    dialogRef.innerHTML += renderDetailCard(cache[currentSelectedCreature]);
    getCreatureClassDataFromMemory(currentSelectedCreature, `detailCardClass`);
    loadMainData(getCreatureIdFromDialog());
}

async function nextCreature() {
    if (!activeSearch && creatureCach[currentSelectedCreature + 1]) {
        currentSelectedCreature++;
        loadNext(creatureCach, currentSelectedCreature);
    };
    if (activeSearch && foundedCreatureList[currentSelectedCreature + 1]) {
        currentSelectedCreature++;
        loadNext(foundedCreatureList, currentSelectedCreature);
    };
    hiddenNextBtn();
    hiddenPrevBtn();
    await loadEvoChainDataFromApi(creatureCach[currentSelectedCreature].name, currentSelectedCreature);
}

function loadNext(cache, currentSelectedCreature) {
    const dialogRef = document.getElementById(`detailCard`);
    resetDialog(dialogRef);
    dialogRef.innerHTML += renderDetailCard(cache[currentSelectedCreature]);
    getCreatureClassDataFromMemory(currentSelectedCreature, `detailCardClass`);
    loadMainData(getCreatureIdFromDialog());
}

function hiddenPrevBtn() {
    const btnPref = document.getElementById('prev');
    if (!activeSearch && currentSelectedCreature === 1) {
        btnPref.classList.add('hidden');
        return;
    };
    if (activeSearch && !foundedCreatureList[currentSelectedCreature - 1]) {
        btnPref.classList.add('hidden');
        return;
    };
    btnPref.classList.remove('hidden');
}

function hiddenNextBtn() {
    const btnNext = document.getElementById('next');
    if (!activeSearch && !creatureCach[currentSelectedCreature + 1]) {
        btnNext.classList.add('hidden');
        return;
    };
    if (activeSearch && !foundedCreatureList[currentSelectedCreature + 1]) {
        btnNext.classList.add('hidden');
        return;
    };
    btnNext.classList.remove('hidden');
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