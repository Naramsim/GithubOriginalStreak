function printMissingNode(selector) {
    console.log(`Node '${selector}' not found. GitHubOriginalStreak might break.`)
}

function qs(selector, mandatory=true) {
    const node = document.querySelector(selector)
    if ((node === null) && mandatory) {
        printMissingNode(selector)
    }
    return node
}

function qsa(selector, mandatory=true) {
    const node = document.querySelectorAll(selector)
    if ((node && node.length === 0) && mandatory) {
        printMissingNode(selector)
    }
    return node
}

module.exports = {qs, qsa}
