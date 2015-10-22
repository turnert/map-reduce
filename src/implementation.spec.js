import {Implementation} from './implementation';

/* global describe, beforeEach, it, expect */

describe('basic implementation of map reduce', () => {
	let implementation,
		options = {
			numMapWorkers: 1,
			numReduceWorkers: 1,
			mapWorkerFileName: './dest/scripts/basic-map.js',
			reduceWorkerFileName: './dest/scripts/basic-reduce.js'
		},
		accessors = ['mapPartition', 'reducePartition', 'aggregate'],
		properties = ['asciiLowerCaseA', 'alphabetLength', 'mapWorkerFileName', 'reduceWorkerFileName', 'numMapWorkers', 'numReduceWorkers'];
	
	beforeEach(() => {
		implementation = new Implementation(options);
	});
	it('should be a function', () => {
		expect(typeof Implementation).toBe('function');
	});
	it('should be a constructor', () => {
		expect(implementation instanceof Implementation).toBeTruthy();
	});
	describe('instance', () => {
		accessors.forEach(accessor => {
			it('should be a getter', () => {
				expect(implementation[accessor]).toBeDefined();
			});
			it('should be a getter that returns a function', () => {
				expect(typeof implementation[accessor]).toBe('function');
			});
			it('should be a setter', () => {
				let newFunction = function () {
					return 6;
				};
				implementation[accessor] = newFunction;
				expect(implementation[accessor]).toBe(newFunction);
			});
			it('should not set a value that is not a function', () => {
				implementation[accessor] = '';
				expect(implementation[accessor]).not.toBe('');
			});
		});
		properties.forEach(property => {
			it('should be have a ' + property + ' property', () => {
				expect(implementation[property]).toBeDefined();
			});
		});
		describe('API', () => {
			let alternateOptions,
				alternateImplementation,
				numMapWorkers;
			beforeEach(() => {
				alternateOptions = {
					numMapWorkers: 3,
					numReduceWorkers: 4,
					mapWorkerFileName: './dest/scripts/basic-map.js',
					reduceWorkerFileName: './dest/scripts/basic-reduce.js'
				};
				alternateImplementation = new Implementation(alternateOptions);
				numMapWorkers = alternateOptions.numMapWorkers;
			});
			describe('mapPartition', () => {
				let data = ['kouldThisBeFirst', 'definitelyLast', 'thisIsFirst', 'zeta', 'aintFirst'],
					partitionedData = [['definitelyLast', 'aintFirst' ], ['kouldThisBeFirst'], ['thisIsFirst', 'zeta']];
				it('should return an array', () => {
					expect(Array.isArray(alternateImplementation.mapPartition(data))).
						toBeTruthy();
				});
				it('should return an array of length' + numMapWorkers, () => {
					expect(alternateImplementation.mapPartition(data).length).
						toBe(alternateOptions.numMapWorkers);
				});
				it('should partition the data into ' + numMapWorkers + ' arrays', () => {
					let partitionedData = alternateImplementation.mapPartition(data);
					
					partitionedData.forEach(data => {
						expect(Array.isArray(data)).toBeTruthy();
					});
				});
				it('should return the data correctly partitioned', () => {
					expect(alternateImplementation.mapPartition(data)).toEqual(partitionedData);
				});
			});
			describe('reducePartition', () => {
				let alternateImplementation;
				beforeEach(() => {
					alternateImplementation = new Implementation(alternateOptions);
				});
				it('should return a number', () => {
					let data = 'how';
					expect(typeof alternateImplementation.reducePartition(data)).toBe('number');
				});
				it('should return the same value for all letters if there is only one reduce worker', () => {
					let aData = 'about',
						zData = 'zebra';
					expect(implementation.reducePartition(aData)).toBe(implementation.reducePartition(zData));
				});
				it('should not return the same index for all letters if there is more than one reduce worker', () => {
					let aData = 'about',
						zData = 'zebra';
					expect(alternateImplementation.reducePartition(aData)).not.toBe(alternateImplementation.reducePartition(zData));
				});
				it('should ignore case', () => {
					let upperCaseData = 'How',
						lowerCaseData = 'how';
					expect(alternateImplementation.reducePartition(upperCaseData)).toBe(alternateImplementation.reducePartition(lowerCaseData));
				});
				it('should ignore non alphanumeric characters', () => {
					let nonAlphaNumericData = './how',
						alphaNumericData = 'how';
					expect(alternateImplementation.reducePartition(nonAlphaNumericData)).toBe(alternateImplementation.reducePartition(alphaNumericData));
				});
			});
			describe('aggregate', () => {
				it('should return a string', () => {
					expect(typeof implementation.aggregate('')).toBe('string');
				});
				it('should append the supplied string to the end of string currently stored', () => {
					let str = 'a';
					expect(implementation.aggregate(str).indexOf(str)).toBe(0);
				});
				it('should append the supplied stsring to the end of the string currently stored if used repeatedly', () => {
					let strsToAppend = ['a', 'b', 'c'];
					strsToAppend.forEach((strToAppend, i) => {
						expect(implementation.aggregate(strToAppend).indexOf(strToAppend)).toBe(i);
					});
				});
				it('should store the aggregated data internally as allData', () => {
					let  strsToAppend = ['a', 'b', 'c'];
					strsToAppend.forEach(strToAppend => {
						expect(implementation.aggregate(strToAppend)).toBe(implementation.allData);
					});
				});
			});
		});
	});
});