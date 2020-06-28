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
    let table = document.querySelector('.table');
    let readyTable = `
    <table>
    <thead>
        <tr>
            <th>Position</th>
            <th>Club</th>
            <th>Played games</th>
            <th>Wins</th>
            <th>Draws</th>
            <th>Losses</th>
            <th>Points</th>
         </tr>
    </thead>
    <tbody>
    `;

    const countTeams = data.standings[0].table.length;

    for (let i = 0; i < countTeams; i++) {
        readyTable += '<tr data-id="' + data.standings[0].table[i].team.id + '"><td>' + data.standings[0].table[i].position +
            '</td><td>' + data.standings[0].table[i].team.name +
            '</td><td>' + data.standings[0].table[i].playedGames +
            '</td><td>' + data.standings[0].table[i].won +
            '</td><td>' + data.standings[0].table[i].draw +
            '</td><td>' + data.standings[0].table[i].lost +
            '</td><td>' + data.standings[0].table[i].points +
            '</td></tr>';
    }

    readyTable += '</tbody></table>';
    table.innerHTML = readyTable;
    document.body.append(table);
};

const url = 'https://api.football-data.org/v2/competitions/2021/standings?standingType=TOTAL';

request(url)
    .then(
        (result) => {
            insertHeader(result);
            createTable(result);
        })
    .then(
        () => {
            const rows = document.querySelectorAll('tr');
            const modal = document.querySelector('.modal');
            const modalContent = document.querySelector('.modal-content');
            const overlay = document.querySelector('.modal-overlay');

            for (let i = 0; i < rows.length; i++) {
                rows[i].onclick = function () {
                    const teamId = this.dataset.id;

                    getTeam(teamId)
                        .then(
                            (team) => {
                                const phone = (team.phone !== null) ? team.phone : "Not specified";

                                overlay.style.display = 'block';
                                modal.style.display = 'block';

                                modalContent.innerHTML = '<img class="logo" src="' + team.crestUrl +
                                    '"><h3>' + team.name + '</h3>' +
                                    '<p class="close">Close</p>' +
                                    '<p><span>Country: </span>' + team.area.name + '</p>' +
                                    '<p><span>Club colors: </span>' + team.clubColors + '</p>' +
                                    '<p><span>Address: </span>' + team.address + '</p>' +
                                    '<p><span>Phone: </span>' + phone + '</p>' +
                                    '<p><span>Site: </span><a href="' + team.website + '" target="_blank">'
                                     + team.website + '</a></p></div>';

                                const close = document.querySelector('.close');
                                close.onclick = function () {
                                    modal.style.display = 'none';
                                    overlay.style.display = 'none';
                                }
                            }
                        )
                };


            }
        }
    );