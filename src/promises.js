export function promiseTimeout(ms, promise){
	// Create a promise that rejects in <ms> milliseconds
	let timeout = new Promise((resolve, reject) => {
		let id = setTimeout(() => {
			clearTimeout(id);
			reject('Init request timed out in '+ ms + 'ms.')
		}, ms)
	})
	// Returns a race between our timeout and the passed in promise
	return Promise.race([
		promise,
		timeout
	])
}

// sleep time expects milliseconds
export function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
