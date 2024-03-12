function proceedLookup(selectedText, outputLangMode = '1') {
	var url = "https://hvdic.thivien.net/transcript-query.json.php";
	return new Promise(function (resolve) {
		let data = new FormData();
		data.append('mode', 'trans');
		data.append('lang', outputLangMode);
		data.append('capitalize', '0');
		data.append('input', selectedText);

		fetch(url, {
			method: 'POST',
			body: data
		}).then(function (e) {
			return e.json();
		}).then(function (jsonData) {
			resolve({data: jsonData});
		});
	});
}

chrome.runtime.onMessage.addListener(function (message, sender, callback) {
	var cmd = message.cmd.toLowerCase();
	if (cmd === 'missing-info') {
		alert('Error: You have to configure your settings.')
		Promise.resolve("").then(result => callback(result));
	} else if (cmd === "hanviet-lookup") {
		if (message.hasOwnProperty('text')) {
			let hanvietPromise = proceedLookup(message.text);
			let pinyinPromise = proceedLookup(message.text, '2');

			Promise.all([hanvietPromise, pinyinPromise]).then(function (results) {
				let hanvietResult = results[0];
				let pinyinResult = results[1];

				callback({hanvietResult, pinyinResult})
			});
		}
	} else if (cmd === "word-not-found") {
		alert('The word you selected was not found.');
		Promise.resolve("").then(result => callback(result));
	} else if (cmd === "setting-saved") {
		alert('Your setting was saved.');
		Promise.resolve("").then(result => callback(result));
	}
	return true;
});

