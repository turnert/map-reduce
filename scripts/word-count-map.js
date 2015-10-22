let wordCount = {};

function performMap(data) {
	let allWords = data.split(/\s/);
	
	allWords.forEach(word => {
		word.replace(/\W/g, '').toLowerCase();
		wordCount[word] = wordCount[word] || 1;
	});
}

process.stdin.on('data', data => {
	var mappedData = performMap(data);
	
	Object.keys(mappedData).forEach(word => {
		process.stdout.write(word + ':' + mappedData[word], 'utf8');
	});
});

process.stdin.on('finish', () => {
	process.stdout.end();
	process.stdout.on('finish', () => {
		process.exit();
	});
});