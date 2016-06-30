const moment = require('moment');
const store = require('./store');

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

function getTotalContributionsText(firstContributionDate, lastContributionDate) {
    return `${moment(firstContributionDate).format('MMM D YYYY')} - ${moment(lastContributionDate).format('MMM D YYYY')}`;
}
function getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate, format = 'MMM D') {
    return `${moment(longestStreakStartingDate).format(format)} - ${moment(longestStreakEndingDate).format(format)}`;
}

function getCurrentStreakText(contributionDate, format = 'MMM D') {
    return contributionDate ? `${moment(contributionDate).format(format)} - ${now.format(format)}` : '';
}

function getLastContributionText(contributionDate) {
    return `Last contributed <time>${moment(contributionDate).add(1, 'days').fromNow(true)} ago</time>`;
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

    const contributionsCalendar = document.getElementById('contributions-calendar');
    const vCardSelector = document.getElementsByClassName('vcard-username');
    const daysSelector = document.getElementsByClassName('day');

    let currentProfile = false;
    let days = false;

    if (vCardSelector.length > 0) {
        currentProfile = vCardSelector[0].textContent;
    }
    if (daysSelector.length > 0) {
        days = Array.from(daysSelector).reverse();
    }

    if (contributionsCalendar && currentProfile) {
        parse();

        // if probably has a full calendar
        // retrieve custom start streak date
        if (nonContributingDays <= 1) {
            // invoke and wait data retrieval
            Promise.all([store.get].map(p => p.catch(err => err)))
                .then(results => {
                    const profileData = results[0].files[currentProfile];
                    if (profileData) {
                        initialStreakDateGivenByUser = profileData.content;
                    } else {
                        initialStreakDateGivenByUser = false;
                    }
                    build();
                });
        } else {
            build();
        }
    }

    function parse() {
        updateContributionsHeading(contributionsCalendar);

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
    }

    function build() {
        const noContributionToday = Number(days[0].attributes['data-count'].value) === 0;
        const fullCalendar = nonContributingDays === 0;
        const fullCalendarApartToday = (nonContributingDays === 1) && noContributionToday;

        // if has submitted a custom start streak date
        // and the calendar is full
        if (initialStreakDateGivenByUser && fullCalendar) {
            // update current streak
            currentStreak = now.diff(moment(initialStreakDateGivenByUser, 'YYYY-MM-DD'), 'days');
            firstContributionDate = initialStreakDateGivenByUser;
        }

        // if has submitted a custom start streak date
        // and  the calendar is full
        //      or the user hasn'n committed anything today (but the calendar is full)
        if (initialStreakDateGivenByUser && (fullCalendar || fullCalendarApartToday)) {
            // update longest streak
            longestStreak = now.diff(moment(initialStreakDateGivenByUser, 'YYYY-MM-DD'), 'days') - nonContributingDays;
            longestStreakStartingDate = initialStreakDateGivenByUser;
        }

        // if the calendar is full
        // of the user hasn'n committed anything today (but the calendar is full)
        if (fullCalendar || fullCalendarApartToday) {
            // if the user hasn't set a custom start date
            if (!initialStreakDateGivenByUser) {
                if (currentProfile) {
                    // set today as the start streak date
                    store.set(currentProfile, firstContributionDate);
                }
            }

        // if user set a custom start streak date
        // but the calendar is no more full
        // thus he ended his streak
        } else if (initialStreakDateGivenByUser) {
            // delete custom start streak date
            store.del(currentProfile);
        }

        // if has submitted a custom start streak date
        if (firstContributionDate) {
            // if isCurrentStreak is not false
            // then the getCurrentStreakText w.r.t firstContributionDate
            if (isCurrentStreak) {
                if (currentStreak < 365) {
                    currentStreakText = getCurrentStreakText(firstContributionDate);
                } else {
                    currentStreakText = getCurrentStreakText(firstContributionDate, 'MMM D YYYY');
                }
            }

            // if currentStreakText is empty
            // set currentStreak as lastContributionText
            if (!currentStreakText) {
                currentStreakText = lastContributionText;
            }

            if (longestStreak < 365) {
                longestStreakText = getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate);
            } else {
                longestStreakText = getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate, 'MMM D YYYY');
            }

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
