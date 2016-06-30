require('./index.css');
const inject = require('./inject');
const changeContributionsColor = require('./change-color');

// invoke inject function
inject();
// invoke changeColor function
changeContributionsColor();
// attach click handler to navs
attachNavClickHandler();

function navClickHandler() {
    /**
     * look for changes in the js-pjax-loader-bar
     * and invoke inject function
     * to inject github streak container
     */
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.oldValue && mutation.oldValue.indexOf('is-loading') > -1) {
                // stop observing
                observer.disconnect();
                // invoke inject function
                inject();
                // invoke changeColor function
                changeContributionsColor();
                // attach clickHandler to nav as it has been detached
                attachNavClickHandler();
            }
        });
    });
    /**
     * observe pjaxLoaderBar for changes in attributes
     */
    const pjaxLoaderBar = document.getElementById('js-pjax-loader-bar');
    const config = {
        attributes: true,
        attributeOldValue: true
    };
    observer.observe(pjaxLoaderBar, config);
}

function attachNavClickHandler() {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.addEventListener('click', navClickHandler, false);
    }
}
