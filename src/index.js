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
                setTimeout(() => {
                    // invoke inject function
                    inject();
                    // invoke changeColor function
                    changeContributionsColor();
                    // attach clickHandler to nav as it has been detached
                    attachNavClickHandler();
                }, 300);
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
    const navs = document.querySelectorAll('nav, .profile-timeline-year-list.js-sticky');
    if (navs.length > 0) {
        navs.forEach(nav => {
            // resets and adds a click handler
            // since the page is rewritten
            nav.removeEventListener('click', navClickHandler, false);
            nav.addEventListener('click', navClickHandler, false);
        });
    }
}
