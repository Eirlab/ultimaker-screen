"use strict";

export {get, post, put};

/**
 * Common function allow you to get json on an url
 * @param url - url to get
 * @returns {Promise<string>} if response is ok, a http error else
 */
async function get(url) {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    const response = await fetch(url, {
        mode: 'cors',
        method: 'GET',
        headers: headers,
    })
        .catch(function () {
            console.log({"Error": "Can't fetch URL"})
        })
    return await response.json()
}

/**
 * Common function allow you to post json on an url
 * @param url - url to post
 * @param data - data to post
 * @returns {Promise<json>} if response is ok, a http error else
 */
async function post(url, data) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*')
    const response = await fetch(url, {
        mode: 'cors',
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
        .catch(function () {
            return "error"
        })
    return await response.json()
}

async function put(url, data) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*')
    const response = await fetch(url, {
        mode: 'cors',
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data)
    })
        .catch(function () {
            return "error"
        })
    return await response.json()
}