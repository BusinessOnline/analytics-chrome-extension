/**
 * Analytics Preview
 * @author  Stuart Runyan
 * @copyright 2013 BusinessOnline
 *
 * Google Analytics JavaScript API
 * @required https://code.google.com/p/google-api-javascript-client/
 *
 * Chrome Extensions
 * @see  http://developer.chrome.com/extensions/getstarted.html
 */

var ext = {
    auth: {},
    debug: true,
    resp: {},
    profiles: [],
    profileNameOptions: "",
    /**
     * [checkAuth Check if user has been authorized]
     * @param  {Function} callback Code to fire after authorization
     * @see  https://developers.google.com/analytics/solutions/articles/hello-analytics-api#query_profile
     */
    checkAuth: function (callback) {
        gapi.auth.authorize({client_id: config.clientId, scope: config.scope, immediate: true}, function (auth) {
            ext.loadClient(auth, callback);
        });
    },
    loadClient: function (auth, callback) {
        if (auth) {
            ext.auth = auth;
            gapi.auth.setToken(auth);
            gapi.client.load('analytics', 'v3', function () {
                callback(auth);
            });

        } else {
            ext.auth = false;
        }
    },
    authClick: function (callback) {
        gapi.auth.authorize({client_id: config.clientId, scope: config.scope, immediate:  false}, ext.loadClient);
    },
    getAccounts: function (callback) {
        gapi.client.analytics.management.accounts.list().execute(function(resp) {
            callback(resp);
        });
    },
    getWebProperties: function (accounts, callback) {
        for (var i = 0, l = accounts.result.items.length; i < l; i++) {
            var account = accounts.result.items[i].id;
            gapi.client.analytics.management.webproperties.list({'accountId': account}).execute(function (resp) {
                callback(resp);
            });
        }
    },
    getProfiles: function (properties, callback) {
        for (var i = 0, l = properties.items.length; i < l; i++) {
            gapi.client.analytics.management.profiles.list({
                'accountId': properties.items[i].accountId,
                'webPropertyId': properties.items[i].id
            }).execute(function (resp) {
                callback(resp);
            });
        }
    },
    queryRealTime: function (profile, metrics) {
        console.log('running query');
        gapi.client.analytics.data.realtime.get({
            'ids': profile,
            'metrics': metrics
        }).execute(function(resp){
            //console.log(resp);
        });
    },
    queryReporting: function (profile, metrics, dimensions, callback) {

        if(ext.debug) {
            console.log('queryReporting: Parameters');
            console.log(profile);
            console.log(metrics);
            console.log(dimensions);
            console.log(callback);
            console.log('==============================');
        }

        // Defaults to last 30 days
        var today = new Date();
        var endDate = today.toISOString().split('T');
        var past = new Date(today.setDate(today.getDate() - 30));
        var startDate = past.toISOString().split('T');

        gapi.client.analytics.data.ga.get({
            'ids': profile,
            'start-date': startDate[0],
            'end-date': endDate[0],
            'metrics': metrics,
            'dimensions': dimensions
        }).execute(function (resp) {
            if(ext.debug) {
                console.log('queryReporting: Response');
                console.log(resp);
                console.log('==============================');
            }
            callback(resp);
        });

    }
};


function init () {
    console.log('Extension Init');
    gapi.client.setApiKey(config.apiKey);
    ext.checkAuth(function (auth) {
        ext.getAccounts(function (accounts) {
            ext.getWebProperties(accounts, function(properties) {
                ext.getProfiles(properties, function(profile) {

                    // Capture profile information
                    ext.profiles.push(profile);

                });
            });
        });
    });
}


// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {

    //Show page action if not authed
    if (!ext.auth) {
        chrome.pageAction.show(tabId);
    }

    // Reset
    ext.profileNameOptions = "";

    // Iterate Profiles
    for (var a = 0, b = ext.profiles.length; a < b; a++) {

        if (ext.profiles[a].items) {

            // Iterate Profile Items
            for (var x = 0, y = ext.profiles[a].items.length; x < y; x++) {

                // If item "websiteUrl" matches browser bar url
                if (tab.url.indexOf(ext.profiles[a].items[x].websiteUrl) > -1 ) {

                    chrome.pageAction.show(tabId);

                    // Store on Ext object
                    ext.profileNameOptions += "<option value="+ext.profiles[a].items[x].id+">"+ext.profiles[a].items[x].name+"</option>";
                }

            }
        }
    }
}



// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);
