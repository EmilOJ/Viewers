import { Meteor } from "meteor/meteor";
import URL from 'url-parse';
import 'isomorphic-fetch';

async function makeRequest(url, options) {
    const parsed = new URL(url);

    let requestOpt = {
        method: 'GET',
        headers: {}
    };

    // TODO: Clean this up
    const accessToken = false //Meteor.user().services.keycloak.accessToken;
    if (accessToken) {
        requestOpt.headers = {
            Authorization: `Bearer ${accessToken}`
        };
    } else if (requestOpt.auth) {
        requestOpt.headers = {
            Authorization: requestOpt.auth
        };
    }

    if (options.headers) {
        Object.keys(options.headers).forEach(key => {
            requestOpt.headers[key] = options.headers[key];
        });
    }

    return new Promise((resolve, reject) => {
        // TODO: Kept getting weird build errors from RegExp
        const isAbsolute = parsed.href.indexOf('http://') === 0 || parsed.href.indexOf('https://');

        let url = parsed.href;

        if (isAbsolute === false) {
            url = Meteor.absoluteUrl(parsed.href);
        }

        fetch(url, requestOpt).then((response) => {
            if (response.status >= 400) {
                reject(new Error(response.status));
            }

            if (response.status === 204) {
                resolve([]);
            } else {
                // TODO: Handle 204 no content
                resolve(response);
            }
        }, (error) => {
            console.error('There was an error in the DICOMWeb Server');

            reject(new Error(error));
        });
    });
}

export default makeRequest;
