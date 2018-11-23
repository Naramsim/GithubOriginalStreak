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
            'ebedf0': 'ebedf0',
            'c6e48b': '9DC1F6',
            '7bc96f': '629DF3',
            '239a3b': '2B7BF2',
            '196127': '0363F0'
        },
        'halloween': {
            'ebedf0': 'ebedf0',
            'c6e48b': 'FFEE58',
            '7bc96f': 'FFCA28',
            '239a3b': 'EF6C00',
            '196127': '000000'
        }
    };

    if (color && colorSchemes[color]) {
        Object.keys(colorSchemes[color]).forEach(key => {
            const currentColorScheme = colorSchemes[color];
            updateStyle(`rect[fill='#${key}']`, 'fill', `#${currentColorScheme[key]}`);
            updateStyle(`li[style='background-color: #${key}']`, 'backgroundColor', `#${currentColorScheme[key]}`);
        });
    }
}

module.exports = changeContributionsColor;
