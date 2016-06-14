require('./index.css')
const inject = require('./inject')
const changeColor = require('./change-color')

// invoke inject function
inject()
// invoke changeColor function
changeColor()

/**
 * look for changes in the js-pjax-loader-bar
 * and invoke inject function
 * to inject github streak container
 */
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.oldValue && mutation.oldValue.indexOf("is-loading") > -1 ) {
            // invoke inject function
            inject()
            // invoke changeColor function
            changeColor()
        }
    })
})

/**
 * observe pjaxLoaderBar for changes in attributes
 */
const pjaxLoaderBar = document.getElementById("js-pjax-loader-bar")
const config = { attributes: true, attributeOldValue: true }
observer.observe(pjaxLoaderBar, config)

