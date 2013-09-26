/**
 * Analytics Preview
 * @author  Stuart Runyan
 * @copyright 2013 BusinessOnline
 *
 * Google Analytics JavaScript API
 * @required https://code.google.com/p/google-api-javascript-client/
 * @see https://developers.google.com/api-client-library/javascript/
 * @see https://developers.google.com/api-client-library/javascript/reference/referencedocs
 * @see https://code.google.com/apis/console
 * @see https://developers.google.com/apis-explorer/
 * @see http://ga-dev-tools.appspot.com/explorer/
 * @see  realtime beta https://developers.google.com/analytics/devguides/reporting/core/v3/changelog
 *
 * Chrome Extensions
 * @see  http://developer.chrome.com/extensions/getstarted.html
 */

//console.log('popup.js');

/*chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
  // Use the token.
  console.log(token);
});*/

var bgPage = chrome.extension.getBackgroundPage();

if (!bgPage.ext.auth) {
    var authorizeButton = document.getElementById('authorize-button');
    authorizeButton.style.display = 'block';
    authorizeButton.onclick = bgPage.ext.authClick;
} else {

    // Authed and ready!
    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
         // since only one tab should be active and in the current window at once
         // the return variable should only have one entry
         var url = arrayOfTabs[0].url;
         var l = getLocation(url);

         // Do initial profile lookup
         profileChange(bgPage.ext.lastIdMatch, l);

        // Add onchange to re-lookup data when different profile file selected
        var select = document.getElementById('webPropertyId');
        select.innerHTML = bgPage.ext.profileNameOptions;
        select.addEventListener('change', function (e) {
            var id = e.target.value;
            profileChange(id, l);
        });
    });

}


/*function matchHost (l) {
    var host = l.protocol + '//' + l.hostname + '/';
    var profileNameOptions;
    var lastIdMatch;

    // Iterate Profiles
    for (var a = 0, b = bgPage.ext.profiles.length; a < b; a++) {

        if (bgPage.ext.profiles[a].items) {

            // Iterate Profile Items
            for (var x = 0, y = bgPage.ext.profiles[a].items.length; x < y; x++) {

                // If item "websiteUrl" matches browser bar url
                if (host ===  bgPage.ext.profiles[a].items[x].websiteUrl) {

                    profileNameOptions += "<option value="+bgPage.ext.profiles[a].items[x].id+">"+bgPage.ext.profiles[a].items[x].name+"</option>";
                    lastIdMatch = bgPage.ext.profiles[a].items[x].id;

                }

            }
        }
    }

    profileChange(lastIdMatch, l);

    var select = document.getElementById('webPropertyId');
    select.innerHTML = profileNameOptions;
    select.addEventListener('change', function (e) {
        var id = e.target.value;
        profileChange(id, l);
    });

}*/


function profileChange (id, l) {
    console.log(id);
    console.log(l);
    // Use pagePath dimension to "filter" a specific page.
    var profile = "ga:" + id;
    var metrics = "ga:pageviews,ga:bounces,ga:pageLoadTime";
    var dimensions = "ga:pagePath";

    bgPage.ext.queryReporting(profile, metrics, dimensions, function (resp) {
        matchPath(resp, l);
    });
}


function matchPath (data, l) {
    console.log(data);
    var path = l.pathname;
    for (var i = 0; i < data.rows.length; i++) {
        if (path === data.rows[i][0]) {
            displayMetrics(data.columnHeaders, data.rows[i]);
        }
    }
}


function displayMetrics (headers, data) {
    // Profile info
    //document.getElementById('webPropertyId').innerHTML = data.profileInfo.webPropertyId;
    //document.getElementById('profileName').innerHTML = data.profileInfo.profileName;

    // Metrics
    var html = "<li>"+headers[1].name+": "+data[1]+"</li>" +
                     "<li>"+headers[2].name+": "+data[2]+"</li>" +
                     "<li>"+headers[3].name+": "+data[3]+"</li>";
    document.getElementById('analytics-overview').innerHTML = html;
}


function getLocation (href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
}

