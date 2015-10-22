import {Implementation} from './implementation';

/**
 * defines how data is aggregated specific to the word count algorithm
 * @param {String} data
 * @returns {Object} All aggregated data
 */

function wordCountAggregate (data) {
	data.split('\n').forEach(pair => {
		if (pair !== '') {
			let [word, count] = pair.split(':');

			this.allData[word] = this.allData[word] || 0;
			this.allData[word] = this.allData[word] + parseInt(count.replace(/\W/g, ''), 10);
		}
	});
	
	return this.allData;
}

export class WordCountImplementation extends Implementation {
	constructor (options) {
		super(options);
		
		this._aggregate = wordCountAggregate.bind(this);
		this.allData = {};
	}
}