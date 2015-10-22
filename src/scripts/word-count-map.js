import fs from 'fs';
let wordCount = {},
	reduceIndexMap = {},
	reduceFds = [],
	implementation;

/**
 * removes all non-alphanumeric characters from a string
 * @param {String} word
 * @return A string with all non-alphanumeric characters removed
 */

function stripNonAlphaNumeric (word) {
	return word.replace(/\W/g, '');
}

// function reducePartitionIndex (word) {
// 	let letter = word.charAt(0);

// 	return reduceIndexMap[letter] >= 0 ? parseInt(reduceIndexMap[letter], 10) : (reduceFds.length - 1);
// }

/**
 * converts data read by the process into a form that can be used by the algorithm
 * @param {String} data Read from standard in
 */

function performMap(data) {
	let allWords = data.split(/\s/);
	
	allWords.forEach(word => {
		let alphaNumericLowerCase = stripNonAlphaNumeric(word).toLowerCase();
		if (alphaNumericLowerCase !== '') {
			wordCount[alphaNumericLowerCase] = wordCount[alphaNumericLowerCase] || 0;
			wordCount[alphaNumericLowerCase] += 1;
		}
	});
}

process.stdin.setEncoding('utf8');

process.stdin.on('data', data => {
	performMap(data);
});

process.stdin.on('finish', () => {
	Object.keys(wordCount).forEach(word => {
		process.stdout.write(word + ':' + wordCount[word] + '\n', 'utf8');
	});
	process.stdout.end();
	process.stdout.on('finish', () => {
		process.exit();
	});
});