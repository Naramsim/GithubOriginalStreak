require('./index.css');
const inject = require('./inject');
const {qs, qsa} = require('./node');
// const changeContributionsColor = require('./change-color');

// invoke inject function
inject();
// invoke changeColor function
// changeContributionsColor();
// attach click handler to navs
// attachNavClickHandler();

// function navClickHandler() {
//     /**
//      * look for changes in the progress-pjax-loader-bar
//      * and invoke inject function
//      * to inject github streak container
//      */
//     const observer = new MutationObserver(mutations => {
//         mutations.forEach(mutation => {
//             if (mutation.oldValue) {
//                 if (mutation.target.classList.contains('selected')) {
//                     // stop observing
//                 //observer.disconnect();
//                     setTimeout(() => {
//                         // invoke inject function
//                         inject();
//                         // invoke changeColor function
//                         changeContributionsColor();
//                         // attach clickHandler to nav as it has been detached
//                         attachNavClickHandler();
//                     }, 3000);
//                 }
//             }
//         });
//     });
//     /**
//      * observe pjaxLoaderBar for changes in attributes
//      */
//     const pjaxLoaderBar = qs('#overview-tab', true);
//     const yearsList = qs('.filter-list.small', false);
//     const orgsNav = qs('.js-org-filter-links-container > nav', false);
//     const config = {
//         attributes: true,
//         attributeOldValue: true,
//         subtree: true
//     };
//     if (pjaxLoaderBar) {
//         observer.observe(pjaxLoaderBar, config);
//     }
//     if (yearsList) {
//         observer.observe(yearsList, config);
//     }
//     if (orgsNav) {
//         observer.observe(orgsNav, config);
//     }
// }

// function attachNavClickHandler() {
//     const navs = qsa('nav, .profile-timeline-year-list.js-sticky');
//     if (navs.length > 0) {
//         navs.forEach(nav => {
//             // resets and adds a click handler
//             // since the page is rewritten
//             nav.removeEventListener('click', navClickHandler, false);
//             nav.addEventListener('click', navClickHandler, false);
//         });
//     }
// }
