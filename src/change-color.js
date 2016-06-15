/* change github streak color functionality */
function updateStyle(selector, property, value) {
    [...document.querySelectorAll(selector)].forEach((node)=> {
        node.style[property] = value
    })
}

function changeColor() {
    const color = localStorage.getItem("blueSky")
    const colorsHash = {
        "eeeeee": "eeeeee",
        "d6e685": "9DC1F6",
        "8cc665": "629DF3",
        "44a340": "2B7BF2",
        "1e6823": "0363F0"
    }

    if(color) {
        Object.keys(colorsHash).forEach((key) => {
            updateStyle(`rect[fill='#${key}']`, "fill", `#${colorsHash[key]}`)
            updateStyle(`li[style='background-color: #${key}']`, "backgroundColor", `#${colorsHash[key]}`)
        })
    }
}

module.exports = changeColor
