// would not be required with moment.js
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

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
    // use moment.js to easy this computation
    const dayFrom = firstContributionDate.getUTCDate()
    const monthFrom = monthNames[firstContributionDate.getMonth()]
    const yearFrom = firstContributionDate.getFullYear()
    const dayTo = lastContributionDate.getUTCDate()
    const monthTo = monthNames[lastContributionDate.getMonth()]
    const yearTo = lastContributionDate.getFullYear()
    const totalContributions = totalContributions
    const totalContributionsText = totalContributionsText

    return `${monthFrom} ${dayFrom} ${yearFrom} - ${monthTo} ${dayTo} ${yearTo}`
}
function getLongestStreakText(longestStreakStartingDate, longestStreakEndingDate) {
    // use moment.js to easy this computation
    return `
        ${monthNames[longestStreakStartingDate.getMonth()]} ${longestStreakStartingDate.getUTCDate()} –
        ${monthNames[longestStreakEndingDate.getMonth()]} ${longestStreakEndingDate.getUTCDate()}
    `
}

function getCurrentStreakText(contributionDate) {
    // use moment.js to easy this computation
    const dateFrom = new Date(contributionDate)
    const dayFrom = dateFrom.getUTCDate() + 1
    const monthFrom = monthNames[dateFrom.getMonth()]

    const dateTo = new Date()
    const dayTo = dateTo.getUTCDate()
    const monthTo = monthNames[dateTo.getMonth()]

    return `${dayFrom} ${monthFrom} - ${dayTo} ${monthTo}`
}

function getLastContributionText(contributionDate) {
    // use moment.js to easy this computation
    const lastContributionDate = new Date(contributionDate)
    const diff = Math.abs((new Date()).getTime() - lastContributionDate.getTime())
    let unit = "days"
    let timeDiff = Math.ceil(diff / (1000 * 3600 * 24)) - 1

    if (timeDiff === 1) {
        unit = "day"
    }

    if (timeDiff > 30) {
        unit = "month"
        if (timeDiff > 60) {
            unit = "months"
        }
        timeDiff = (new Date()).getMonth() - lastContributionDate.getMonth() + (12 * ((new Date()).getFullYear() - lastContributionDate.getFullYear()))
    }

    return `Last contributed <time>${timeDiff} ${unit} ago</time>`
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
    let nonContributingStreak = 0

    // find a better name, stop what?
    let stop = 0

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

        days.forEach((day) => {
            const contributionCount = +day.attributes["data-count"].value
            const contributionDate = day.attributes["data-date"].value

            if (contributionCount) {
                totalContributions += contributionCount
                firstContributionDate = new Date(contributionDate)

                if (!lastContributionDate) {
                    lastContributionDate = new Date(contributionDate)
                }

                currentLongestStreak += 1
            } else {
                currentLongestStreak = 0
            }

            if (currentLongestStreak > longestStreak) {
                // use moment.js to easy this computation
                longestStreak = currentLongestStreak
                longestStreakStartingDate = new Date(contributionDate)
                longestStreakEndingDate = new Date(contributionDate)
                longestStreakEndingDate.setDate(longestStreakEndingDate.getDate() + longestStreak - 1)
            }

            if (contributionCount && !stop) {
                currentStreak += 1
            } else {
                nonContributingStreak += 1
                if (stop === 0) {
                    currentStreakText = getCurrentStreakText(contributionDate)
                    stop = 1
                }
            }

            if (!currentStreak && nonContributingStreak > 1 && contributionCount && !lastContributionText) {
                lastContributionText = getLastContributionText(contributionDate)
            }

        })

        if (firstContributionDate) {
            currentStreakText = lastContributionText ? lastContributionText : currentStreakText
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
