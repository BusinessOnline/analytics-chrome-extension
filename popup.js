/**
 * Analytics Preview
 * @author  Stuart Runyan
 * @copyright 2013 BusinessOnline
 *
 * @see http://ga-dev-tools.appspot.com/explorer/
 */

var bgPage = chrome.extension.getBackgroundPage();
var popup = (function(){

    var linkObj;
    var startDate;
    var endDate;

    function _handleUrl (url) {
        linkObj = _getLinkObj(url);

        // Setup profile selection
        var select = document.getElementById('webPropertyId');
              select.innerHTML = bgPage.ext.profileNameOptions;
              select.addEventListener('change', function (e) {
                   var id = e.target.value;
                   _loadProfile(id);
               });

        // Add Date picker eventlisteners
        document.getElementById('start').addEventListener('focusout', function (e) {
            startDate = e.target.value;
            _loadProfile(document.getElementById('webPropertyId').value);
        });
        document.getElementById('end').addEventListener('focusout', function (e) {
            endDate = e.target.value;
            _loadProfile(document.getElementById('webPropertyId').value);
        });

        // Initial profile lookup
        _loadProfile(select.options[0].value);
    }

    function _loadProfile (id) {
        if(bgPage.ext.debug) {bgPage.ext.logArgs([Array.prototype.slice.call(arguments)], 'Popup->loadProfile: Parameters');}

        // pagePath dimension constrains query to a specific page.
        var profile = "ga:" + id,
              metrics = "ga:pageviews,ga:entrances,ga:bounces,ga:avgTimeOnPage",
              dimensions = "ga:pagePath";

        if (!startDate || !endDate) {
            // Default to last 30 days
            var today = new Date();
                  endDate = today.toISOString().split('T')[0];
            var past = new Date(today.setDate(today.getDate() - 30));
                  startDate = past.toISOString().split('T')[0];
        }

        bgPage.ext.queryReporting(profile, dimensions, metrics, startDate, endDate, function (resp) {
            if (resp && !resp.error) {
                _matchPath(resp);
            } else if (resp.error.code === 401) {
                _getAuth();
            }
        });
    }

    function _matchPath (resp) {
        if(bgPage.ext.debug) {bgPage.ext.logArgs([Array.prototype.slice.call(arguments)], 'Popup->matchPath: Parameters');}

        var path = linkObj.pathname;
        for (var i = 0; i < resp.rows.length; i++) {
            if (path === resp.rows[i][0]) {
                _displayMetrics(resp.rows[i]);
            }
        }
    }

    function _displayMetrics (row) {
        if(bgPage.ext.debug) {bgPage.ext.logArgs([Array.prototype.slice.call(arguments)], 'Popup->displayMetrics: Parameters');}

        var pageViews = row[1],
              bounceRate = function() {
                    // Prevent infinity zero division
                    if(row[3] !== 0) {
                        return Math.round((row[2] / row[3]) * 100) / 100;
                    }
                    return 0;
               },
               avgTimeOnPage = Math.round(row[4] * 100) / 100;

        // Metrics
        var html = "<li class='metric'><span class='title'>Page Views: </span>"+pageViews+"</li>" +
                         "<li class='metric'><span class='title'>Bounce Rate: </span>"+bounceRate()+"%</li>" +
                         "<li class='metric'><span class='title'>Avg. Time on Page: </span>"+avgTimeOnPage+" seconds</li>";

        document.getElementById('seo-metrics').innerHTML = html;
    }

    /**
     * _getLinkObj
     * @param  {String} url
     * @return {Object} a Returns an Anchor tag DOM element object
     */
    function _getLinkObj (url) {
        var a = document.createElement("a");
        a.href = url;
        return a;
    }

    /**
     * _getAuth Shows authorization button
     */
    function _getAuth () {
        var authorizeButton = document.getElementById('authorize-button');
        authorizeButton.style.display = 'block';
        authorizeButton.onclick = bgPage.ext.authClick;
    }

    return {
        handleUrl: _handleUrl
    };

}(bgPage));


// Check auth
if (!bgPage.ext.auth) {
    popup.getAuth();
} else {
    // Get active tab URL
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
        popup.handleUrl(tabs[0].url);
    });
}

