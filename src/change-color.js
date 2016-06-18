/* change github streak color functionality */
function updateStyle(selector, property, value) {
    [...document.querySelectorAll(selector)].forEach(node => {
        node.style[property] = value;
    });
}

function changeContributionsColor() {
    const color = localStorage.getItem('colorScheme');
    const colorSchemes = {
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

    if (color && colorSchemes[color]) {
        Object.keys(colorSchemes[color]).forEach(key => {
            let currentColorScheme = colorSchemes[color];
            updateStyle(`rect[fill='#${key}']`, 'fill', `#${currentColorScheme[key]}`);
            updateStyle(`li[style='background-color: #${key}']`, 'backgroundColor', `#${currentColorScheme[key]}`);
        });
    }
}

module.exports = changeContributionsColor;
