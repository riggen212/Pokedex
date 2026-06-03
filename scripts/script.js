const MAIN_DATA_URL = 'https://pokeapi.co/api/v2/pokemon-form/';

async function test() {
    const antwort = await fetch(`${MAIN_DATA_URL}/1`)
        .then(antwort => antwort.json())
        .then(data => console.log(data.name))
        .catch(error => console.error('Fehler: ', error));
}


async function setPokemonName(creatureID) {
    const RESPONSE = await fetch(`${MAIN_DATA_URL}/${creatureID}`);
    const RESPONSE_AS_JSON = await RESPONSE.json();
    document.getElementById('test').textContent = RESPONSE_AS_JSON.name;
}



function setCreatureData() {
    setPokemonName(1);
}