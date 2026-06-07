function renderCreatureCard(id, data) {          
    return `<article class="creatureCard ${data.types[0].type.name}" id='creature${id}' onclick="openDialog(this.id)">
                <header>
                    <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2> <span>#${id}</span>
                </header>
                <img class="creatureCardImage" src="${data.sprites.other.dream_world.front_default}" alt="">
                <aside id='creatureClass${id}'>
                </aside>
            </article
    `;
}

function renderCreatureClass(className) {
    return `<span>${className.charAt(0).toUpperCase() + className.slice(1)}</span>
    `;
}

function renderDetailCard(data) { 
    return `<div class="detailCard ${data.types[0].type.name}" data-id="overlay-pokemon-name">
            <header>
                <h2 id="detailCardName">${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
                <span id="detailCardId">${data.id}</span>
                <button data-id="close-dialog-button" onclick="closeDialog()">close</button>
            </header>
            <aside>
                <div id="detailCardClass"></div>
                <img data-id="card-image" id="detailCardImage" src="" alt="">
            </aside>
            <section>
                <nav>
                    <ul>
                        <li onclick="setMainData()">main</li>
                        <li onclick="setStatsData()">stats</li>
                        <li>evo chain</li>
                    </ul>
                </nav>
                <div id="detailInformation">
                </div>
            </section>
            <div>
                <button data-id="prev-button" onclick="previousCreature()">
                    previous
                </button>
                <button data-id="next-button" onclick="nextCreature()">
                    next
                </button>
            </div>
        </div>
    `;
}

function renderDetailMainInformation(height, weight, baseExperience) {
    return `<table>
            <tr>
                <th>Height:</th>
                <td>${height} m</td>
            </tr>
            <tr>
                <th>Weight:</th>
                <td>${weight} kg</td>
            </tr>
            <tr>
                <th>Base Experience:</th>
                <td>${baseExperience}</td>
            </tr>
            <tr>
                <th>abilities:</th>
                <td id="abilities"></td>
            </tr>
        </table>
    `;
}

function renderDetailStatsInformation(hp, attack, defense, specialAttack, specialDefense, speed) {
    return `<table>
            <tr>
                <th>hp:</th>
                <td>${hp}</td>
            </tr>
            <tr>
                <th>attack:</th>
                <td>${attack}</td>
            </tr>
            <tr>
                <th>defense:</th>
                <td>${defense}</td>
            </tr>
            <tr>
                <th>special-attack:</th>
                <td>${specialAttack}</td>
            </tr>
             <tr>
                <th>special-defense:</th>
                <td>${specialDefense}</td>
            </tr>
            <tr>
                <th>speed:</th>
                <td>>${speed}</td>
            </tr>
        </table>
    `;
}