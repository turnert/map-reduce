/* global process */

let aggregatedData = {};

function performReduce (data) {
	[word, count] = data.split(':');
	aggregatedData[word] = aggregatedData[word] || 0;
	aggregatedData[word] += count;
	return aggregatedData;
}

function writeNext(remainingData) {
	let dataToWrite;
	if (remainingData.length > 0) {
		dataToWrite = remainingData.shift();
		process.stdout.write(dataToWrite, 'utf8', () => {
			writeNext(remainingData);
		});
	}
}

process.stdin.setEncoding('utf8');

process.stdin.on('data', data => {
	performReduce(data),
});

process.stdin.on('finish', () => {
	writeNext(aggregatedData);
	process.stdout.end();
	process.stdout.on('finish', () => {
		process.exit();
	});
});