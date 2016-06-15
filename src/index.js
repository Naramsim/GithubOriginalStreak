require('./index.css')
const inject = require('./inject')
const changeColor = require('./change-color')

// invoke inject function
inject()
// invoke changeColor function
changeColor()
// attach click handler to navs
attachNavClickHandler()

function navClickHandler() {
    /**
     * look for changes in the js-pjax-loader-bar
     * and invoke inject function
     * to inject github streak container
     */
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.oldValue && mutation.oldValue.indexOf("is-loading") > -1 ) {
                // stop observing
                observer.disconnect()
                // invoke inject function
                inject()
                // invoke changeColor function
                changeColor()
                // attach clickHandler to nav as it has been detached
                attachNavClickHandler()
            }
        })
    })
    /**
     * observe pjaxLoaderBar for changes in attributes
     */
    const pjaxLoaderBar = document.getElementById("js-pjax-loader-bar")
    const config = { attributes: true, attributeOldValue: true }
    observer.observe(pjaxLoaderBar, config)
}

function attachNavClickHandler() {
    document.querySelector("nav").addEventListener('click', navClickHandler, false)
}

