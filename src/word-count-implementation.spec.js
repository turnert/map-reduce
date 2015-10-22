import {WordCountImplementation} from './word-count-implementation';
import {Implementation} from './implementation';

/* global describe, expect, it */

describe('word count implementation', () => {
	let wordCountImplementation,
		accessors = ['mapPartition', 'reducePartition', 'aggregate'],
		properties = ['asciiLowerCaseA', 'alphabetLength', 'mapWorkerFileName', 'reduceWorkerFileName', 'numMapWorkers', 'numReduceWorkers'];
	
	beforeEach(() => {
		let options = {
			numMapWorkers: 4,
			numReduceWorkers: 6,
			mapWorkerFileName: './dest/scripts/word-count-map.js',
			reduceWorkerFileName: './dest/scripts/word-count-reduce.js'
		}
		wordCountImplementation = new WordCountImplementation(options);
	});
	it('should be a function', () => {
		expect(typeof WordCountImplementation).toBe('function');
	});
	it('should be a constructor', () => {
		expect(wordCountImplementation instanceof WordCountImplementation).toBeTruthy();
	});
	it('should extend implementation', () => {
		expect(wordCountImplementation instanceof Implementation).toBeTruthy();
	});
	describe('instances', () => {
		accessors.forEach(accessor => {
			it('should have a ' + accessor + ' function', () => {
				expect(typeof wordCountImplementation[accessor]).toBe('function');
			});
		});
		properties.forEach(property => {
			it('should have a ' + property + ' property', () => {
				expect(wordCountImplementation[property]).toBeDefined();
			});
		});
		describe('API', () => {
			describe('aggregate', () => {
				it('should accept a string as argument and return an object', () => {
					expect(typeof wordCountImplementation.aggregate('a:1\n')).toBe('object');
				});
				it('should return an object that contains the word read from input as a key', () => {
					let wordCounts = wordCountImplementation.aggregate('a:1\n');
					
					expect(wordCounts.a).toBeDefined();
				});
				it('should return an object that counts the number of times a word was read from input', () => {
					let wordCounts = wordCountImplementation.aggregate('a:1\n');
					
					expect(wordCounts.a).toBe(1);
				});
				it('should aggregate all counts for words read from the input', () => {
					let wordCounts;
					
					wordCountImplementation.aggregate('a:1');
					wordCounts = wordCountImplementation.aggregate('a:2');
					
					expect(wordCounts.a).toBe(3);
				});
				it('should add the data passed into this function even when called multiple times', () => {
					wordCountImplementation.aggregate('a:1\n');
					wordCountImplementation.aggregate('b:2\n');
					expect(Object.keys(wordCountImplementation.aggregate('c:3\n')).length).toBe(3);
				});
				it('should accept multiple inputs concatenated together', () => {
					let wordCounts = wordCountImplementation.aggregate('a:1\nb:2\nc:3\n');
					expect(Object.keys(wordCounts).length).toBe(3);
				});
			});
		});
	});
});