/* change github streak color functionality */
function updateStyle(selector, property, value) {
    [...document.querySelectorAll(selector)].forEach(node => {
        node.style[property] = value;
    });
}

function changeContributionsColor() {
    const color = localStorage.getItem('color-scheme');
    const colorScheme = {
        'blue-sky': {
            'eeeeee': 'eeeeee',
            'd6e685': '9DC1F6',
            '8cc665': '629DF3',
            '44a340': '2B7BF2',
            '1e6823': '0363F0'
        },
        'halloween': {
            'eeeeee': 'eeeeee',
            'd6e685': 'FFEE58',
            '8cc665': 'FFCA28',
            '44a340': 'EF6C00',
            '1e6823': '000000'
        }
    };

    if (color && (color in colorScheme)) {
        Object.keys(colorScheme[color]).forEach(key => {
            updateStyle(`rect[fill='#${key}']`, 'fill', `#${colorScheme[color][key]}`);
            updateStyle(`li[style='background-color: #${key}']`, 'backgroundColor', `#${colorScheme[color][key]}`);
        });
    }
}

module.exports = changeContributionsColor;
