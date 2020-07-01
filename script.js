const API_TOKEN = '9234701f82be4ed2bb53926a3108acb4';

const headers = new Headers({
    'X-Auth-Token': API_TOKEN,
});

async function request(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return await response.json();
}

function getTeam(id) {
    return request(`http://api.football-data.org/v2/teams/${id}`);
}

function toggleDisplay(component, isVisible) {
    if (isVisible) {
        component.style.display = "block";
    } else {
        component.style.display = "none";
    }
}

function appendElementWithContent(parent, element, content = "") {
    let component = document.createElement(element);
    component.innerHTML = content;
    return parent.appendChild(component);
}

function insertHeader(data) {
    function getMonth(date) {
        let months = ['January', 'February', 'March', 'April', 'May', 'Juny', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];
        return months[date.getMonth()];
    }

    let league = document.getElementById('league');
    let elDateStart = document.getElementById('startSeason');
    let elDateEnd = document.getElementById('endSeason');
    let currentMatchday = document.getElementById('matchday');

    const dateStart = new Date(data.season.startDate);
    const dateEnd = new Date(data.season.endDate);

    const date = {
        'start': {
            'day': dateStart.getDate(),
            'month': getMonth(dateStart),
            'year': dateStart.getFullYear(),
        },
        'end': {
            'day': dateEnd.getDate(),
            'month': getMonth(dateEnd),
            'year': dateEnd.getFullYear(),
        }
    }

    const formattedDateStart = `${date.start.day} ${date.start.month} ${date.start.year}`;
    const formattedDateEnd = `${date.end.day} ${date.end.month} ${date.end.year}`;

    league.innerHTML += data.competition.name;
    elDateStart.innerHTML += formattedDateStart;
    elDateEnd.innerHTML += formattedDateEnd;
    currentMatchday.innerHTML += data.season.currentMatchday;
}

function createTable(data) {
    let tableArea = document.querySelector('.table');
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');

    let tr = appendElementWithContent(thead, 'tr');

    const content = ['Position', 'Club', 'Played games', 'Wins', 'Draws', 'Losses', 'Points'];
    const countColumns = content.length;
    const countTeams = data.standings[0].table.length;

    // Append table header
    for (let i = 0; i < countColumns; i++) {
        appendElementWithContent(tr, 'td', content[i]);
    }

    // Append table body
    for (let i = 0; i < countTeams; i++) {
        const {team: {id, name}, position, playedGames, won, draw, lost, points} = data.standings[0].table[i];

        let tr = appendElementWithContent(tbody, 'tr');
        tr.onclick = function() {
            showModal(id);
        };

        appendElementWithContent(tr, 'td', position);
        appendElementWithContent(tr, 'td', name);
        appendElementWithContent(tr, 'td', playedGames);
        appendElementWithContent(tr, 'td', won);
        appendElementWithContent(tr, 'td', draw);
        appendElementWithContent(tr, 'td', lost);
        appendElementWithContent(tr, 'td', points);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    tableArea.appendChild(table);
};

function showModal(teamId) {
    const modal = document.querySelector('.modal');
    const modalContent = document.querySelector('.modal-content');
    const overlay = document.querySelector('.modal-overlay');

    getTeam(teamId)
        .then(
            (team) => {
                modalContent.innerHTML = '';

                const phone = (team.phone !== null) ? team.phone : "Not specified";
                const { area: {name: areaName}, crestUrl, name: teamName, clubColors, address, website } = team;

                toggleDisplay(overlay, true);
                toggleDisplay(modal, true);

                let img = appendElementWithContent(modalContent, 'img');
                img.src = crestUrl;
                img.classList.add('logo');

                let close = appendElementWithContent(modalContent, 'p', 'Close');
                close.classList.add('close');

                appendElementWithContent(modalContent, 'h3', teamName);
                appendElementWithContent(modalContent, 'p', `<span>Country: </span> ${areaName}`);
                appendElementWithContent(modalContent, 'p', `<span>Club colors: </span> ${clubColors}`);
                appendElementWithContent(modalContent, 'p', `<span>Adress: </span> ${address}`);
                appendElementWithContent(modalContent, 'p', `<span>Phone: </span> ${phone}`);
                appendElementWithContent(modalContent, 'p', `<span>Site: </span><a href="${website}" target="_blank">${website}</a>`);

                const closeButton = document.querySelector('.close');

                closeButton.onclick = function () {
                    toggleDisplay(overlay, false);
                    toggleDisplay(modal, false);
                }
            }
        )

    }

const url = 'https://api.football-data.org/v2/competitions/2021/standings?standingType=TOTAL';

request(url)
    .then(
        (result) => {
            insertHeader(result);
            createTable(result);
        })