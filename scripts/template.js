function renderCreatureCards(id, data) {       
    return `<article class="creatureCard ${data.types[0].type.name}" id='creature${id}'>
                <header>
                    <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2> <span>#${id}</span>
                </header>
                <img class="creatureCardImage" src="${data.sprites.other.dream_world.front_default}" alt="">
                <aside>
                    <span>${data.types[0].type.name.charAt(0).toUpperCase() + data.types[0].type.name.slice(1)}</span>
                </aside>
            </article
    `;
}