/**
 * Analytics Preview
 * @author  Stuart Runyan
 * @copyright 2013 BusinessOnline
 *
 * Google Analytics JavaScript API
 * @required https://code.google.com/p/google-api-javascript-client/
 * @see  https://developers.google.com/api-client-library/javascript/
 * @see  https://developers.google.com/api-client-library/javascript/reference/referencedocs
 * @see https://code.google.com/apis/console
 * @see https://developers.google.com/apis-explorer/
 *
 * Chrome Extensions
 * @see  http://developer.chrome.com/extensions/getstarted.html
 */

var doc = document;
var app = {
    clientId: "",
    apiKey: "",
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    profiles: []
};

function init () {
    console.log('App Starting');
    gapi.client.setApiKey(app.apiKey);
    getAuth(function (auth) {
        getAccounts(function (accounts) {
            getWebProperties(accounts, function(properties) {
                getProfiles(properties, function(profile) {

                    // Capture profile information
                    app.profiles.push(profile);

                    // @todo Match hostname to profile url
                    // IF match: run queries and display results

                });
            });
        });
    });
}

function getAuth(callback){
    gapi.auth.authorize({client_id: app.clientId, scope: app.scope, immediate: true}, function (auth) {
        gapi.auth.setToken(auth);
        gapi.client.load('analytics', 'v3', function () {
            callback(auth);
        });
    });
}

function getAccounts(callback) {
    gapi.client.analytics.management.accounts.list().execute(function(resp) {
        callback(resp);
    });
}

function getWebProperties(accounts, callback) {
    for (var i = 0, l = accounts.result.items.length; i < l; i++) {
        var account = accounts.result.items[i].id;
        gapi.client.analytics.management.webproperties.list({'accountId': account}).execute(function (resp) {
            callback(resp);
        });
    }
}

function getProfiles(properties, callback) {
    for (var i = 0, l = properties.items.length; i < l; i++) {
        gapi.client.analytics.management.profiles.list({
            'accountId': properties.items[i].accountId,
            'webPropertyId': properties.items[i].id
        }).execute(function (resp) {
            callback(resp);
        });
    }
}

function queryActiveVisitors(profile, metrics) {
    gapi.client.analytics.data.realtime.get({
        'ids': profile,
        'metrics': metrics
    }).execute(function(resp){
        console.log(resp);
    });
}

function urlMatch() {
    for (var i = 0; i < app.webproperties.length; i++) {
        console.log(app.webproperties[i]);
        if (app.webproperties[i] === window.location.hostname) {
            console.log('Site match!!!');
        }
    }
}

