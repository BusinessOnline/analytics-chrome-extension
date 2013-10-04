/**
 * Analytics Preview
 * @author  Stuart Runyan
 * @copyright 2013 BusinessOnline
 *
 * @see http://ga-dev-tools.appspot.com/explorer/
 */

var bgPage = chrome.extension.getBackgroundPage();

if (!bgPage.ext.auth || bgPage.ext.auth.code === 401) {
    var authorizeButton = document.getElementById('authorize-button');
    authorizeButton.style.display = 'block';
    authorizeButton.onclick = bgPage.ext.authClick;
} else {

    // Authed and ready!
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
         // since only one tab should be active and in the current window at once
         // the return variable should only have one entry
        var url = tabs[0].url;
        var l = getLocation(url);

        // Add onchange to re-lookup data when different profile file selected
        var select = document.getElementById('webPropertyId');
        select.innerHTML = bgPage.ext.profileNameOptions;
        select.addEventListener('change', function (e) {
            var id = e.target.value;
            loadProfile(id, l);
        });

        // Do initial profile lookup
        loadProfile($(select)[0][0].value, l);

    });
}

/**
 * [loadProfile description]
 * @param  {[type]} id [description]
 * @param  {[type]} l  [description]
 */
function loadProfile (id, l) {
    if(bgPage.ext.debug) {bgPage.ext.logArgs([Array.prototype.slice.call(arguments)], 'Popup->loadProfile: Parameters');}

    // pagePath dimension constrains query to a specific page.
    var profile = "ga:" + id;
    var metrics = "ga:pageviews,ga:entrances,ga:bounces,ga:avgTimeOnPage";
    var dimensions = "ga:pagePath";

    bgPage.ext.queryReporting(profile, metrics, dimensions, function (resp) {
        matchPath(resp, l);
    });
}


/**
 * [matchPath description]
 * @param  {[type]} data [description]
 * @param  {[type]} l    [description]
 */
function matchPath (data, l) {
    if(bgPage.ext.debug) {bgPage.ext.logArgs([Array.prototype.slice.call(arguments)], 'Popup->matchPath: Parameters');}
    var path = l.pathname;
    for (var i = 0; i < data.rows.length; i++) {
        if (path === data.rows[i][0]) {
            displayMetrics(data.columnHeaders, data.rows[i]);
        }
    }
}

/**
 * [displayMetrics description]
 * @param  {[type]} headers [description]
 * @param  {[type]} data    [description]
 * @return {[type]}         [description]
 */
function displayMetrics (headers, data) {
     if(bgPage.ext.debug) {bgPage.ext.logArgs([Array.prototype.slice.call(arguments)], 'Popup->displayMetrics: Parameters');}

    // Profile info
    //document.getElementById('webPropertyId').innerHTML = data.profileInfo.webPropertyId;
    //document.getElementById('profileName').innerHTML = data.profileInfo.profileName;

    var pageViews = data[1];
    var bounceRate = function() {
        // Prevent infinity zero division
        if(!data[3] === 0) {
            return Math.round((data[2] / data[3]) * 100) / 100;
        }
        return 0;
    };
    var avgTimeOnPage = Math.round(data[4] * 100) / 100;

    // Metrics
    var html = "<li class='metric'><span class='title'>Page Views: </span>"+pageViews+"</li>" +
                     "<li class='metric'><span class='title'>Bounce Rate: </span>"+bounceRate()+"%</li>" +
                     "<li class='metric'><span class='title'>Avg. Time on Page: </span>"+avgTimeOnPage+" seconds</li>";
    document.getElementById('seo-metrics').innerHTML = html;
}

/**
 * [getLocation description]
 * @param  {[type]} href [description]
 * @return {[type]}      [description]
 */
function getLocation (href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
}

