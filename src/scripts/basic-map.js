/* global process */
function performMap (data) {
	return [data];
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', data => {
	let mappedData = performMap(data);
	
	mappedData.forEach(datum => {
		process.stdout.write(datum, 'utf8');
	});
});

process.stdin.on('finish', () => {
	process.stdout.end();
	process.stdout.on('finish', () => {
		process.exit();
	});
});