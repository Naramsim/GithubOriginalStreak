const moment = require('moment');

function updateContributionsHeading(contributionsCalendar) {
    const contributionsHeadingContainer = contributionsCalendar.previousElementSibling.childNodes;
    let contributionsHeading;

    if (contributionsHeadingContainer.length === 1) {
        contributionsHeading = contributionsHeadingContainer[0];
    } else {
        contributionsHeading = contributionsHeadingContainer[2];
    }
    contributionsHeading.textContent = 'Contributions';
}

function getTotalContributionsText(firstContributionDate, lastContributionDate) {
    return `${moment(firstContributionDate).format('MMM D YYYY')} - ${moment(lastContributionDate).format('MMM D YYYY')}`;
}
function getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate) {
    return `${moment(longestStreakStartingDate).format('MMM D')} - ${moment(longestStreakEndingDate).format('MMM D')}`;
}

function getCurrentStreakText(contributionDate) {
    return contributionDate ? `${moment(contributionDate).format('MMM D')} - ${moment().format('MMM D')}` : '';
}

function getLastContributionText(contributionDate) {
    return `Last contributed <time>${moment(contributionDate).fromNow(true)} ago</time>`;
}

function getStreakHTML(data) {
    return data.map((item, index) => {
        return `
        <div class="contrib-column table-column ${index === 0 ? 'contrib-column-first' : ''}">
            <span class="text-muted">${item[0]}</span>
            <span class="contrib-number">${item[1]}</span>
            <span class="text-muted">${item[2]}</span>
        </div>
        `;
    }).join('\n');
}

function inject() {
    let totalContributions = 0;

    let currentStreak = 0;
    let longestStreak = 0;
    let currentLongestStreak = 0;

    let isCurrentStreak = true;

    let totalContributionsText = '';
    let longestStreakText = '';
    let currentStreakText = '';
    let lastContributionText = '';

    let firstContributionDate = '';
    let lastContributionDate = '';
    let longestStreakStartingDate = '';
    let longestStreakEndingDate = '';

    const contributionsCalendar = document.getElementById('contributions-calendar');

    if (contributionsCalendar) {
        updateContributionsHeading(contributionsCalendar);

        const days = Array.from(document.getElementsByClassName('day')).reverse();
        // for each day from last day (current day) to first available day
        days.forEach(day => {
            const contributionCount = parseInt(day.attributes['data-count'].value, 10);
            const contributionDate = day.attributes['data-date'].value;

            if (contributionCount) {
                totalContributions += contributionCount;
                firstContributionDate = contributionDate;

                // dont update lastContributionDate once it is set
                if (!lastContributionDate) {
                    lastContributionDate = contributionDate;
                }

                currentLongestStreak += 1;
            } else {
                currentLongestStreak = 0;
            }

            // when ever currentLongestStreak is more than longestStreak
            // set longestStreak to currentLongestStreak
            if (currentLongestStreak > longestStreak) {
                longestStreak = currentLongestStreak;
                // since the day array is reversed
                // longestStreakStartingDate is set to contributionDate
                longestStreakStartingDate = contributionDate;
                // and longestStreakEndingDate is calculated as longestStreakStartingDate + longestStreak days
                longestStreakEndingDate = moment(contributionDate).add(longestStreak - 1, 'days');
            }

            if (contributionCount && isCurrentStreak) {
                currentStreak += 1;
            } else if (isCurrentStreak) {
                // since contributionCount is 0
                // end currentStreak and
                // set isCurrentStreak to false
                currentStreakText = getCurrentStreakText(firstContributionDate);
                isCurrentStreak = false;
            }

            // if lastContributionDate is not empty
            // but not currentStreak and lastContributionText is empty
            // implies contributionDate is the lastContributionDate
            if (lastContributionDate && !isCurrentStreak && !lastContributionText) {
                lastContributionText = getLastContributionText(contributionDate);
            }
        });

        if (firstContributionDate) {
            // if isCurrentStreak is not false
            // then the getCurrentStreakText w.r.t firstContributionDate
            if (isCurrentStreak) {
                currentStreakText = getCurrentStreakText(firstContributionDate);
            }
            // if currentStreakText is empty
            // set currentStreak as lastContributionText
            if (!currentStreakText) {
                currentStreakText = lastContributionText;
            }

            longestStreakText = getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate);
            totalContributionsText = getTotalContributionsText(firstContributionDate, lastContributionDate);

            const data = [
                [
                    'Contributions in the last year',
                    `${totalContributions} total`,
                    totalContributionsText
                ], [
                    'Longest streak',
                    `${longestStreak} days`,
                    longestStreakText
                ], [
                    'Current streak',
                    `${currentStreak} days`,
                    currentStreakText
                ]
            ];

            const container = document.createElement('div');
            container.innerHTML = getStreakHTML(data);
            contributionsCalendar.appendChild(container);
        }
    }
}

module.exports = inject;
