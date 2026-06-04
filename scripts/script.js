const MAIN_DATA_URL = 'https://pokeapi.co/api/v2/pokemon-form/';
const MAIN_CREATURE_DATA = `api-cache-v1`;
let CREATURE_ID = 1;
const creatureCach = {};

async function loadCreatureData(id) {
    const cacheKey = id;
    // 1. Prüfen, ob die Daten im lokalen In-Memory-Cache liegen
    if (creatureCach[cacheKey]) {
        console.log("Daten aus dem In-Memory-Cache geladen!");
        return creatureCach[cacheKey];
    }
    // Prüfen, ob die Daten im LocalStorage des Browsers liegen
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        // Wieder in ein Objekt umwandeln
        const parsedData = JSON.parse(cachedData);
        // Für schnellen Zugriff direkt im Speicher ablegen
        creatureCach[cacheKey] = parsedData;
        return parsedData;
    }
    // 3. Wenn nichts vorhanden, Daten von der PokéAPI abrufen
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cacheKey}`);
        if (!response.ok) throw new Error("Pokémon nicht gefunden");
        const data = await response.json();
        // 4. Daten im In-Memory-Cache speichern
        creatureCach[cacheKey] = data;
        // 5. Daten im LocalStorage speichern (als String, daher JSON.stringify)
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error("Fehler:", error);
    };
}

function init() {
    for (let i = CREATURE_ID; i <= 24; i++) {
        loadCreatureData(i);

        // create creatureCards
        let creatureData = JSON.parse(getCreatureDataFromLocalStorage(i));
        document.getElementById('cardContainer').innerHTML += renderCreatureCards(i, creatureData);
        CREATURE_ID++;
    };
}


function getCreatureDataFromLocalStorage(id) {
    return localStorage.getItem(id);
}