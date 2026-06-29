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
                <span id="detailCardId">#${data.id}</span>
                <button data-id="close-dialog-button" onclick="closeDialog()">
                    <img class="btnDialogeClose" src="./assets/icons/btn_close.png" alt="close the detail window">
                    <img class="btnDialogeCloseHover" src="./assets/icons/btn_close_hover.png" alt="close the detail window">
                </button>
            </header>
            <aside>
                <div id="detailCardClass"></div>
                <img data-id="card-image" class="detailCardImage" src="${data.sprites.other.dream_world.front_default}" alt="">
            </aside>
            <section>
                <nav>
                    <ul>
                        <li id="btnMain" class="btn active" onclick="setMainData()">main</li>
                        <li id="btnStats" class="btn" onclick="setStatsData()">stats</li>
                        <li id="btnEvo" class="btn" onclick="setEvoChainData()">evo chain</li>
                    </ul>
                </nav>
                <div id="detailInformation">
                </div>
            </section>
            <div class="switchCreature">
                <button id="prev" class="btn" data-id="prev-button" onclick="previousCreature()">
                    previous
                </button>
                <button id="next" class="btn" data-id="next-button" onclick="nextCreature()">
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

function renderDetailStatsInformation() {
    return `<table id="skillStats">
        </table>
    `;
}

function renderSkillValues(name) {
    return `<tr>
                <th>${name}:</th>
                <td>
                    <div class="skillBar">
                        <div class="skillLevel ${name}">
                        </div>
                    </div>
                </td>
            </tr>
    `;
}

function renderEvoChainContainer() {
    return `<div id="evoChainContainer" class="evoChain">
            </div>
    `;
}

function renderEVoChainStep(data, id) {
    return `<figure>
                <img data-id="dialog-image" class="evoImage" src="${data[id].sprites.other.dream_world.front_default}" alt="">
                <figcaption>${data[id].name}</figcaption>
            </figure>
    `;
}