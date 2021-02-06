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

function inject() {
    let currentProfile = false;
    let loggedProfile = false;
    let days = false;

    let totalContributions = 0;

    let currentStreak = 0;
    let longestStreak = 0;
    let currentLongestStreak = 0;

    let nonContributingDays = 0;

    let isCurrentStreak = true;
    let initialStreakDateGivenByUser = false;
    let initialStreakDateGivenByUserBkp = false;
    let customStartStreakDateWasSetByUser = false;

    let totalContributionsText = '';
    let longestStreakText = '';
    let currentStreakText = '';
    let lastContributionText = '';

    let firstContributionDate = '';
    let lastContributionDate = '';
    let longestStreakStartingDate = '';
    let longestStreakEndingDate = '';

    let contributionsCalendar = document.querySelectorAll('.graph-before-activity-overview')[0];

    const body = document.body;
    const vCardSelector = document.getElementsByClassName('vcard-username');
    const loginSelector = document.querySelectorAll('.dropdown-header strong.css-truncate-target');
    const daysSelector = document.querySelectorAll('.ContributionCalendar-day[data-count]');
    const modalOverlay = document.getElementsByClassName('modal-backdrop');

    const customStartStreakHintText = `<div style="display: none" class="anim-scale-in js-menu-content dropdown-menu-content">
    <div class="dropdown-menu dropdown-menu-w" style="width:300px;padding-top:1px;">
        <div class="signed-commit-header flex-table px-3">
            <div class="flex-table-item">
                <svg aria-hidden="true" class="octicon octicon-versions mr-3" height="32" version="1.1" viewBox="0 0 14 16" width="28"><<path d="M13 3H7c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-1 8H8V5h4v6zM4 4h1v1H4v6h1v1H4c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1zM1 5h1v1H1v4h1v1H1c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1z"></path></svg>
            </div>
            <div class="flex-table-item-primary">
            Whoa! This calendar looks pretty good. By the way thanks for using GithubOriginalStreak.
            </div>
        </div>
        <div class="signed-commit-footer">
            <span class="d-block">If your initial start streak date is incorrect you can set here a new one.</span>
            <span class="d-block text-muted">So current and longest streaks will show as they were: more than one year!</span>
            <span class="d-block text-muted">Click anywhere else to dismiss this dialog permanently</span>
        </div>
        <form style="margin-left: 9px;margin-bottom: 4px;" onsubmit="return false;">
            <input type="date" id="customDateInput" class="form-control filename js-gist-filename js-blob-filename" aria-label="YYYY-MM-DD" value="" placeholder="YYYY-MM-DD"  autofocus="">
            <button type="button" id="submitCustomStartStreakDate" class="btn btn-primary js-add-gist-file">Set</button>
            <button type="button" id="sumbitLaterCustomStartStreakDate" class="btn js-add-gist-file">Later</button>
        </form>
        </div>
    </div>`;

    // if the user has the old versions
    if (!contributionsCalendar) {
        contributionsCalendar = document.getElementById('.js-contribution-graph > div.border');
    }

    if (vCardSelector.length > 0) {
        currentProfile = vCardSelector[0].textContent;
    }
    if (loginSelector.length > 0) {
        loggedProfile = loginSelector[0].textContent;
    }
    if (daysSelector.length > 0) {
        days = Array.from(daysSelector).reverse();
    }

    if (contributionsCalendar && currentProfile) {
        // insert modal for asking custom start streak date (not visible)
        contributionsCalendar.insertAdjacentHTML('afterbegin', customStartStreakHintText);
        parse();

        // if probably has a full calendar
        // retrieve custom start streak date
        if (nonContributingDays <= 30) {
            // invoke and wait data retrieval
            Promise.all([store.get].map(p => p.catch(err => err)))
                .then(results => {
                    if (results) {
                        const userData = results[0].files[currentProfile];
                        if (userData) {
                            const match = userData.content.match(/^(\d{4}-\d{2}-\d{2})?(?:#(\d{4}-\d{2}-\d{2}))?(?:@([01]))?$/);
                            if (match) {
                                initialStreakDateGivenByUser = match[1];
                                initialStreakDateGivenByUserBkp = match[2];
                                customStartStreakDateWasSetByUser = match[3] === '1';
                            }
                        }
                        build();
                    }
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
            const contributionCount = parseInt(day.attributes['data-count'].value, 10);
            const contributionDate = day.attributes['data-date'].value;
            const noContributionToday = Number(days[0].attributes['data-count'].value) === 0;

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
                if (index !== 0) {
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

        // if the calendar is full
        // of the user hasn'n committed anything today (but the calendar is full)
        if (fullCalendar || fullCalendarApartToday) {
            buildFullCalendar();

        // if user set a custom start streak date
        // but the calendar is no more full
        // thus he ended his streak
        } else if (initialStreakDateGivenByUser) {
            // delete custom start streak date
            // store.del(currentProfile);
            store.delAndBackup(currentProfile, initialStreakDateGivenByUserBkp);
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
            if (!document.querySelector('.original-streak')) {
                contributionsCalendar.appendChild(container);
            }
        }

        function buildFullCalendar() {
            const customStartStreakDateWasAsked = localStorage.getItem('customStartStreakDateWasAsked');

            // if there is a backup
            // and we need to restore it
            if (initialStreakDateGivenByUserBkp && (initialStreakDateGivenByUserBkp !== initialStreakDateGivenByUser)) {
                // set the custom start streak date equal to the backup date
                store.set(currentProfile, initialStreakDateGivenByUserBkp, Boolean(customStartStreakDateWasSetByUser));
                initialStreakDateGivenByUser = initialStreakDateGivenByUserBkp;
                // abort this call and start another one
                build();
                return false;
            }

            // if the user hasn't a custom start date
            if (!initialStreakDateGivenByUser) {
                if (currentProfile) {
                    // set today as the start streak date
                    store.set(currentProfile, firstContributionDate, false);
                }
            }

            // if the user is seeing his profile
            if (currentProfile === loggedProfile) {
                // if he hasn't answered whether he wants a custom start streak date
                // ask him if he wants
                if (!customStartStreakDateWasAsked && !customStartStreakDateWasSetByUser) {
                    showCustomStartDateHint();
                } else if (customStartStreakDateWasAsked === 'later') {
                    // if he answered 'later'
                    // randomly re-ask
                    if (Math.floor(Math.random() * 8) === 0) {
                        showCustomStartDateHint();
                    }
                }
            }
        }
    }

    function showCustomStartDateHint() {
        const submitCustomDate = document.getElementById('submitCustomStartStreakDate');
        const laterCustomDate = document.getElementById('sumbitLaterCustomStartStreakDate');
        const customDateInput = document.getElementById('customDateInput');
        const customDateRe = /\d{4}-\d{1,2}-\d{1,2}/;
        if (modalOverlay.length > 0) {
            body.classList.add('menu-active');
            modalOverlay[0].addEventListener('click', () => {
                closeCustomDateModal('yes');
            });
            submitCustomDate.addEventListener('click', () => {
                const customDate = customDateInput.value;
                if (customDate && customDateRe.test(customDate)) {
                    closeCustomDateModal('yes');
                    store.set(currentProfile, customDate, true);
                } else {
                    customDateInput.classList.add('glowing');
                }
            });
            laterCustomDate.addEventListener('click', () => {
                closeCustomDateModal('later');
            });
            contributionsCalendar.classList.add('dropdown');
            contributionsCalendar.classList.add('active');
        }
    }

    function closeCustomDateModal(permanent) {
        contributionsCalendar.classList.remove('active');
        body.classList.remove('menu-active');
        localStorage.setItem('customStartStreakDateWasAsked', permanent);
    }
}

module.exports = inject;
