/**
 * Analytics Preview
 * @author  Stuart Runyan
 * @copyright 2013 BusinessOnline
 *
 * @see http://ga-dev-tools.appspot.com/explorer/
 */

var bgPage = chrome.extension.getBackgroundPage();



if (!bgPage.ext.auth) {
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


function loadProfile (id, l) {
    // pagePath dimension constrains query to a specific page.
    var profile = "ga:" + id;
    var metrics = "ga:pageviews,ga:entrances,ga:bounces,ga:avgTimeOnPage";
    var dimensions = "ga:pagePath";

    bgPage.ext.queryReporting(profile, metrics, dimensions, function (resp) {
        matchPath(resp, l);
    });
}


function matchPath (data, l) {
    //console.log(data);
    var path = l.pathname;
    for (var i = 0; i < data.rows.length; i++) {
        if (path === data.rows[i][0]) {
            displayMetrics(data.columnHeaders, data.rows[i]);
        }
    }
}


function displayMetrics (headers, data) {

    if(bgPage.ext.debug) {
        console.log('displayMetrics: Parameters');
        console.log(headers);
        console.log(data);
        console.log('==============================');
    }

    // Profile info
    //document.getElementById('webPropertyId').innerHTML = data.profileInfo.webPropertyId;
    //document.getElementById('profileName').innerHTML = data.profileInfo.profileName;

    var pageViews = data[1];
    var bounceRate = function() {
        if(!data[3] === 0) {
            return Math.round((data[2] / data[3]) * 100) / 100;
        }
        return 0;
    }
    var avgTimeOnPage = Math.round(data[4] * 100) / 100;

    // Metrics
    var html = "<li class='metric'><span class='title'>Page Views: </span>"+pageViews+"</li>" +
                     "<li class='metric'><span class='title'>Bounce Rate: </span>"+bounceRate()+"%</li>" +
                     "<li class='metric'><span class='title'>Avg. Time on Page: </span>"+avgTimeOnPage+" seconds</li>";
    document.getElementById('seo-metrics').innerHTML = html;
}


function getLocation (href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
}

