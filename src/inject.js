const moment = require('moment');
const store = require('./store');
const {qs, qsa} = require('./node');

const now = moment();

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

function getTotalContributionsText(firstContributionDate, lastContributionDate, moreThan1Year = false) {
    let contributionText = '';
    if (moreThan1Year) {
        contributionText = `${moment(lastContributionDate).subtract(1, 'year').format('MMM D YYYY')} - ${moment(lastContributionDate).format('MMM D YYYY')}`;
    } else {
        contributionText = `${moment(firstContributionDate).format('MMM D YYYY')} - ${moment(lastContributionDate).format('MMM D YYYY')}`;
    }
    return contributionText;
}
function getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate, format = 'MMM D') {
    return `${moment(longestStreakStartingDate).format(format)} - ${moment(longestStreakEndingDate).format(format)}`;
}

function getCurrentStreakText(contributionDate = '', noContributionsToday, format = 'MMM D') {
    if (noContributionsToday) {
        contributionDate = `${moment(contributionDate).format(format)} - ${now.subtract(1, 'days').format(format)}`;
    } else {
        contributionDate = `${moment(contributionDate).format(format)} - ${now.format(format)}`;
    }
    return contributionDate;
}

function getLastContributionText(contributionDate) {
    return `Last contributed <time>${moment(contributionDate).fromNow(true)} ago</time>`;
}

function getStreakHTML(data) {
    return data.map((item, index) => {
        return `
        <div class="contrib-column table-column ${index === 0 ? 'contrib-column-first' : ''}">
            <span class="text-muted">${item[0]}</span>
            <span class="contrib-number">${item[1].toLocaleString()}</span>
            <span class="text-muted">${item[2]}</span>
        </div>
        `;
    }).join('\n');
}

function while_2s() {
    setInterval(() => {
        inject()
    }, 2000);
}

function inject() {
    let currentProfile = false;
    let days = false;

    let totalContributions = 0;

    let currentStreak = 0;
    let longestStreak = 0;
    let currentLongestStreak = 0;

    let nonContributingDays = 0;

    let isCurrentStreak = true;
    let initialStreakDateGivenByUser = false;

    let totalContributionsText = '';
    let longestStreakText = '';
    let currentStreakText = '';
    let lastContributionText = '';

    let firstContributionDate = '';
    let lastContributionDate = '';
    let longestStreakStartingDate = '';
    let longestStreakEndingDate = '';

    let contributionsCalendar = qsa('.graph-before-activity-overview')[0];

    if (! contributionsCalendar) {
        return 0
    }

    if (document.querySelector('.original-streak')) {
        return 0
    }

    const daysSelector = qsa('.ContributionCalendar-grid .ContributionCalendar-day');


    if (daysSelector.length > 0) {
        days = Array.from(daysSelector).reverse();
    }

    currentProfile = window.location.pathname.substring(1);

    if (contributionsCalendar && currentProfile) {
        parse();

        // if probably has a full calendar
        // retrieve custom start streak date
        if (nonContributingDays <= 30) {
            // invoke and wait data retrieval

            store.get(currentProfile).then(userData => {
                if (userData) {
                    const match = userData.data.match(/^(\d{4}-\d{2}-\d{2})?(?:#(\d{4}-\d{2}-\d{2}))?(?:@([01]))?$/);
                    if (match) {
                        initialStreakDateGivenByUser = match[1];
                        // initialStreakDateGivenByUserBkp = match[2]; // Deprecated
                        // customStartStreakDateWasSetByUser = (match[3] === '1'); // Deprecated
                    }
                }
                build();
            });
        } else {
            build();
        }
    }

    function parse() {
        updateContributionsHeading(contributionsCalendar);

        // the line below is for testing
        // days[23].attributes['data-count'].value = 0

        // for each day from last day (current day) to first available day
        days.forEach((day, index) => {
        // Attribute patching/DOM surgery because it looks like GitHub has removed the 'data-count' attribute :(
            const day_id = day.id;
            if (! day_id.startsWith('contribution-day-component') ) {
                return 0
            }

            const parseContributionCount = () => {
                let contributionCount = 0
                let day_contributions = parseInt(qs(`tool-tip[for=${day_id}]`).textContent.split(' ')[0]) // parseInt inteprets 0 as false
                if (day_contributions) {
                    contributionCount += day_contributions
                } else {
                    contributionCount += 0 // Unnecessary
                }

                return contributionCount;
            }
            const extractedContributionCount = parseContributionCount();

			var count = undefined;
            if (day.attributes['data-count']) {
                count = parseInt(day.attributes['data-count'].value, 10);
            }
            if (typeof count === 'undefined') {
                days[index].setAttribute('data-count', extractedContributionCount);
            }
            var contributionCount = extractedContributionCount;
            if (!contributionCount) {
                contributionCount = 0;
            }
			var contributionDate = undefined;
			if (day.attributes['data-date']) {
                contributionDate = day.attributes['data-date'].value;
            }

            var noContributionToday = contributionCount === 0;

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
                nonContributingDays += 1;
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
                // only if we are not processing the very last day
                // check that the contribution date isn't undefined (this an artefact from the fact that the legend now makes its way into the array of contribution squares.)
                if (index !== 0 && contributionDate) {
                    if (firstContributionDate) {
                        currentStreakText = getCurrentStreakText(firstContributionDate, noContributionToday);
                    }
                    isCurrentStreak = false;
                }
            }

            // if lastContributionDate is not empty
            // but not currentStreak and lastContributionText is empty
            // implies contributionDate is the lastContributionDate
            if (lastContributionDate && !isCurrentStreak && !lastContributionText) {
                lastContributionText = getLastContributionText(contributionDate);
            }
        });
    }

    function build() {
        const noContributionToday = Number(days[0].attributes['data-count'].value) === 0;
        const fullCalendar = nonContributingDays === 0;
        const fullCalendarApartToday = (nonContributingDays === 1) && noContributionToday;
        // if has submitted a custom start streak date
        // and the calendar is full
        if (initialStreakDateGivenByUser && (fullCalendar || fullCalendarApartToday)) {
            // if he doesn't contributed today
            // remove a day from currentStreak
            if (noContributionToday) {
                // update current streak
                currentStreak = now.diff(moment(initialStreakDateGivenByUser, 'YYYY-MM-DD').add(1, 'days'), 'days');
            } else {
                // update current streak
                currentStreak = now.diff(moment(initialStreakDateGivenByUser, 'YYYY-MM-DD'), 'days');
            }
            firstContributionDate = initialStreakDateGivenByUser;
        }

        // if has submitted a custom start streak date
        // and  the calendar is full
        // or the user hasn'n committed anything today (but the calendar is full)
        if (initialStreakDateGivenByUser && (fullCalendar || fullCalendarApartToday)) {
            // update longest streak
            longestStreak = now.diff(moment(initialStreakDateGivenByUser, 'YYYY-MM-DD'), 'days') - nonContributingDays;
            longestStreakStartingDate = initialStreakDateGivenByUser;
        }

        // if has contributed at least one time
        if (firstContributionDate) {
            // if isCurrentStreak is not false
            // then the getCurrentStreakText w.r.t firstContributionDate
            if (isCurrentStreak) {
                if (currentStreak < 365) {
                    currentStreakText = getCurrentStreakText(firstContributionDate, noContributionToday);
                } else {
                    currentStreakText = getCurrentStreakText(firstContributionDate, noContributionToday, 'MMM D YYYY');
                }
            }

            // if currentStreakText is empty
            // set currentStreak as lastContributionText
            if (!currentStreakText) {
                currentStreakText = lastContributionText;
            }

            if (longestStreak < 365) {
                longestStreakText = getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate);
                totalContributionsText = getTotalContributionsText(firstContributionDate, lastContributionDate);
            } else {
                longestStreakText = getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate, 'MMM D YYYY');
                totalContributionsText = getTotalContributionsText(firstContributionDate, lastContributionDate, true);
            }

            const data = [
                [
                    'Contributions in the last year',
                    `${totalContributions.toLocaleString()} total`,
                    totalContributionsText
                ], [
                    'Longest streak',
                    `${longestStreak.toLocaleString()} ${longestStreak == 1 ? 'day' : 'days'}`,
                    longestStreakText
                ], [
                    'Current streak',
                    `${currentStreak.toLocaleString()} ${currentStreak == 1 ? 'day' : 'days'}`,
                    currentStreakText
                ]
            ];

            const container = document.createElement('div');
            container.innerHTML = getStreakHTML(data);
            container.classList.add('original-streak')
            if (!qs('.original-streak')) {
                contributionsCalendar.appendChild(container);
            }
        }
    }
}

module.exports = while_2s;
