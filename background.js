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
 *
 * Chrome Extensions
 * @see  http://developer.chrome.com/extensions/getstarted.html
 */

//console.log('background.js');

var ext = {
    auth: {},
    resp: {},
    profiles: [],
    profileNameOptions: "",
    lastIdMatch: 0,
    /**
     * [checkAuth Check if user has been authorized]
     * @param  {Function} callback Code to fire after authorization
     * @see  https://developers.google.com/analytics/solutions/articles/hello-analytics-api#query_profile
     */
    checkAuth: function (callback) {
        gapi.auth.authorize({client_id: config.clientId, scope: config.scope, immediate: true}, function (auth) {
            ext.loadClient(auth, callback);
            //ext.auth = auth;
        });
    },
    loadClient: function (auth, callback) {
        if (auth) {
            console.log("Authed");
            ext.auth = auth;

            gapi.auth.setToken(auth);
            gapi.client.load('analytics', 'v3', function () {

                //ToDo: think I need to use a popup view: http://developer.chrome.com/extensions/extension.html#method-getViews

                //var authorizeButton = document.getElementById('authorize-button');
                //authorizeButton.style.visibility = 'hidden';
                callback(auth);
            });

        } else {
            console.log('not authed');
            ext.auth = false;

            //var authorizeButton = document.getElementById('authorize-button');
            //authorizeButton.style.visibility = '';
            //authorizeButton.onclick = ext.authClick(callback);
            //var views = chrome.extension.getViews({type:"popup"});
            //console.log(views);
        }
    },
    authClick: function (callback) {
        gapi.auth.authorize({client_id: config.clientId, scope: config.scope, immediate:  false}, function (auth) {
            ext.loadClient(auth, callback);
        });
        //return false;
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
            console.log(resp);
        });
    },
    queryReporting: function (profile, metrics, dimensions, callback) {
        //console.log('running query');
        gapi.client.analytics.data.ga.get({
            'ids': profile,
            'start-date': "2013-07-01",
            'end-date': "2013-07-28",
            'metrics': metrics,
            'dimensions': dimensions
        }).execute(function (resp) {
            //console.log(resp);
            //ext.resp = resp;
            callback(resp);
        });
    },
    profileChange: function () {
        //
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
    ext.profileNameOptions = "";
    //console.log(chrome.extension.getViews({type: "popup"}));

    //var profileNameOptions;
    //var lastIdMatch;

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
                    ext.lastIdMatch = ext.profiles[a].items[x].id;

                }

            }
        }
    }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

