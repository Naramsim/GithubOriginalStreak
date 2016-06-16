const moment = require('moment')

function updateContributionsHeading(contributionsCalendar) {
    const contributionsHeadingContainer = contributionsCalendar.previousElementSibling.childNodes
    let contributionsHeading

    if (contributionsHeadingContainer.length === 1) {
        contributionsHeading = contributionsHeadingContainer[0]
    } else {
        contributionsHeading = contributionsHeadingContainer[2]
    }
    contributionsHeading.textContent = "Contributions"
}

function getTotalContributionsText(firstContributionDate, lastContributionDate) {
    return `${moment(firstContributionDate).format("MMM D YYYY")} - ${moment(lastContributionDate).format("MMM D YYYY")}`
}
function getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate) {
    return `${moment(longestStreakStartingDate).format('MMM D')} - ${moment(longestStreakEndingDate).format('MMM D')}`
}

function getCurrentStreakText(contributionDate) {
    return contributionDate ? `${moment(contributionDate).format('MMM D')} - ${moment().format('MMM D')}` : ''
}

function getLastContributionText(contributionDate) {
    return `Last contributed <time>${moment(contributionDate).fromNow(true)} ago</time>`
}

function getStreakHTML(data) {
    // should be loopable
    return `
    <div class="contrib-column contrib-column-first table-column">
        <span class="text-muted">Contributions in the last year</span>
        <span class="contrib-number">${data.totalContributions} total</span>
        <span class="text-muted">${data.totalContributionsText}</span>
    </div>
    <div class="contrib-column table-column">
        <span class="text-muted">Longest streak</span>
        <span class="contrib-number">${data.longestStreak} days</span>
        <span class="text-muted">${data.longestStreakText}</span>
    </div>
    <div class="contrib-column table-column">
        <span class="text-muted">Current streak</span>
        <span class="contrib-number">${data.currentStreak} days</span>
        <span class="text-muted">${data.currentStreakText}</span>
    </div>
    `
}

function inject() {
    let totalContributions = 0

    let currentStreak = 0
    let longestStreak = 0
    let currentLongestStreak = 0

    let isCurrentStreak = true

    let totalContributionsText = ""
    let longestStreakText = ""
    let currentStreakText = ""
    let lastContributionText = ""

    let firstContributionDate = ""
    let lastContributionDate = ""
    let longestStreakStartingDate = ""
    let longestStreakEndingDate = ""

    const contributionsCalendar = document.getElementById("contributions-calendar")

    if (!!contributionsCalendar) {
        updateContributionsHeading(contributionsCalendar)

        const days = Array.from(document.getElementsByClassName("day")).reverse()
        // for each day from last day (current day) to first available day
        days.forEach((day) => {
            const contributionCount = +day.attributes["data-count"].value
            const contributionDate = day.attributes["data-date"].value

            if (contributionCount) {
                totalContributions += contributionCount
                firstContributionDate = contributionDate

                // dont update lastContributionDate once it is set
                if (!lastContributionDate) {
                    lastContributionDate = contributionDate
                }

                currentLongestStreak += 1
            } else {
                currentLongestStreak = 0
            }

            // when ever currentLongestStreak is more than longestStreak
            // set longestStreak to currentLongestStreak
            if (currentLongestStreak > longestStreak) {
                longestStreak = currentLongestStreak
                // since the day array is reversed
                // longestStreakStartingDate is set to contributionDate
                longestStreakStartingDate = contributionDate
                // and longestStreakEndingDate is calculated as longestStreakStartingDate + longestStreak days
                longestStreakEndingDate = moment(contributionDate).add(longestStreak - 1, "days")
            }

            if (contributionCount && isCurrentStreak) {
                currentStreak += 1
            } else if (isCurrentStreak) {
                // since contributionCount is 0
                // end currentStreak and
                // set isCurrentStreak to false
                currentStreakText = getCurrentStreakText(firstContributionDate)
                isCurrentStreak = false
            }

            // if lastContributionDate is not empty
            // but not currentStreak and lastContributionText is empty
            // implies contributionDate is the lastContributionDate
            if (lastContributionDate && !isCurrentStreak && !lastContributionText) {
                lastContributionText = getLastContributionText(contributionDate)
            }

        })

        if (firstContributionDate) {
            // if currentStreakText is empty
            // set currentStreak as lastContributionText
            if (!currentStreakText) {
                currentStreakText = lastContributionText
            }

            longestStreakText = getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate)
            totalContributionsText = getTotalContributionsText(firstContributionDate, lastContributionDate)

            const data = {
                // total contribution
                totalContributions: totalContributions,
                totalContributionsText: totalContributionsText,
                // longest streak
                longestStreak: longestStreak,
                longestStreakText: longestStreakText,
                // current streak
                currentStreak: currentStreak,
                currentStreakText: currentStreakText
            }

            const range = document.createRange()
            range.selectNode(contributionsCalendar)
            const documentFragment = range.createContextualFragment(getStreakHTML(data))
            contributionsCalendar.appendChild(documentFragment)
        }
    }
}

module.exports = inject
