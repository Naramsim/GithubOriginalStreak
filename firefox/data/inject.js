var skeleton = '<div class="contrib-column contrib-column-first table-column">' +
    '<span class="text-muted">Contributions in the last year</span>' +
    '<span class="contrib-number">{{totalContributions}} total</span>' +
    '{{totalSkeleton}}' +
'</div>' +
'<div class="contrib-column table-column">' +
    '<span class="text-muted">Longest streak</span>' +
    '<span class="contrib-number">{{longestStreak}} days</span>' +
    '<span class="text-muted">' +
    '{{longestStreakMonthF}} {{longestStreakDayF}} –' +
    '{{longestStreakMonthT}} {{longestStreakDayT}}' +
    '</span>' +
'</div>' +
'<div class="contrib-column table-column">' +
    '<span class="text-muted">Current streak</span>' +
    '<span class="contrib-number">{{currentStreak}} days</span>' +
    '{{currentStreakSkeleton}}'+
'</div>';
var currentStreakSkeleton = '<span class="text-muted">{{innerStreak}}</span>'
var totalSkeleton ='<span class="text-muted">{{monthF}} {{dayF}} {{yearF}} - {{monthT}} {{dayT}} {{yearT}}</span>'
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
var totalContributions = 0
var longestStreak = 0
var evaluatingStreak = 0
var stop = 0
var stops = 0
var currentStreak = 0
var notActiveForMonths = 0
var streakFromTo = ""
var innerStreak = ""
var firstCommitDate = 0
var lastCommitDate = 0
var longestStreakStartingDate = 0
var longestStreakEndingDate = 0

function inject() {
    if(!!document.getElementById("contributions-calendar")){
        var couple = document.getElementById("contributions-calendar").previousElementSibling.childNodes
        if(couple.length === 1){
            couple[0].textContent = "Contributions"
        }else{
            couple[2].textContent = "Contributions"
        }
         
        var days = ([].slice.call(document.getElementsByClassName("day"))).reverse()
        days.forEach(function(day){
            var todayValue = !!+day.attributes["data-count"].value;
            if(todayValue){totalContributions += +day.attributes["data-count"].value; firstCommitDate = new Date(day.attributes["data-date"].value)}
            if(todayValue && !lastCommitDate){lastCommitDate = new Date(day.attributes["data-date"].value)}
            if(todayValue && !stops){
                ++currentStreak
            }else{
                ++stops;
                if(stop === 0){
                    var start = new Date(day.attributes["data-date"].value)
                    var end = new Date()
                    streakFromTo = "{{dayF}} {{monthF}} - {{dayT}} {{monthT}}".replace("{{dayF}}", start.getUTCDate() + 1)
                        .replace("{{monthF}}", monthNames[start.getMonth()])
                        .replace("{{dayT}}", end.getUTCDate())
                        .replace("{{monthT}}", monthNames[end.getMonth()])
                    stop = 1
                    innerStreak = streakFromTo
                }
            }
            if(!currentStreak && stops > 30 && todayValue && !notActiveForMonths){
                var lastCommit = new Date(day.attributes["data-date"].value)
                var lastMonth = (new Date()).getMonth() - lastCommit.getMonth() + (12 * ((new Date()).getFullYear() - lastCommit.getFullYear()));
                notActiveForMonths = 'Last contributed <time>{{month}} months ago</time>'.replace("{{month}}", lastMonth)
            }
            if(todayValue){
                ++evaluatingStreak
            } else {
                evaluatingStreak = 0
            }
            if(evaluatingStreak > longestStreak){
                longestStreak = evaluatingStreak
                longestStreakStartingDate = new Date(day.attributes["data-date"].value)
                longestStreakEndingDate = new Date(day.attributes["data-date"].value)
                longestStreakEndingDate.setDate(longestStreakEndingDate.getDate() + longestStreak - 1)
            }
        });
        if(notActiveForMonths){
            currentStreakSkeleton = currentStreakSkeleton.replace("{{innerStreak}}", notActiveForMonths)
        }else{
            currentStreakSkeleton = currentStreakSkeleton.replace("{{innerStreak}}", innerStreak)
        }
        totalSkeleton = totalSkeleton.replace("{{monthF}}", monthNames[firstCommitDate.getMonth()])
            .replace("{{dayF}}", firstCommitDate.getUTCDate())
            .replace("{{yearF}}", firstCommitDate.getFullYear())
            .replace("{{monthT}}", monthNames[lastCommitDate.getMonth()])
            .replace("{{dayT}}", lastCommitDate.getUTCDate())
            .replace("{{yearT}}", lastCommitDate.getFullYear()) 
        skeleton = skeleton.replace("{{totalContributions}}", totalContributions)
            .replace("{{longestStreak}}", longestStreak)
            .replace("{{currentStreak}}", currentStreak)
            .replace("{{currentStreakSkeleton}}", currentStreakSkeleton)
            .replace("{{totalSkeleton}}", totalSkeleton)
            .replace("{{longestStreakDayF}}", longestStreakStartingDate.getUTCDate())
            .replace("{{longestStreakMonthF}}", monthNames[longestStreakStartingDate.getMonth()])
            .replace("{{longestStreakDayT}}", longestStreakEndingDate.getUTCDate())
            .replace("{{longestStreakMonthT}}", monthNames[longestStreakEndingDate.getMonth()])
        var range = document.createRange();
        range.selectNode(document.getElementById("contributions-calendar"));
        var documentFragment = range.createContextualFragment(skeleton);
        document.getElementById("contributions-calendar").appendChild(documentFragment);
        //document.getElementById("contributions-calendar").insertAdjacentHTML('beforeend', skeleton)
    }
}

function attachClickInjecter() {
    var pixelBar = document.getElementById("js-pjax-loader-bar")
    var config = { attributes: true, childList: true, characterData: true, attributeOldValue: true };
    ([].slice.call(document.getElementsByClassName("tabnav-tab")).forEach(function(tab) {
        tab.addEventListener('click', function() { //on "Repo" click the event is deattached
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if(mutation.oldValue && mutation.oldValue.indexOf("is-loading") > 0 ){
                        inject()
                        attachClickInjecter()
                        observer.disconnect()
                    }
                })   
            })
            observer.observe(pixelBar, config);
        }, false)
    }))
}

(function() {
    inject()
    attachClickInjecter()
})();
