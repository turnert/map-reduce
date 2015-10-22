/* global describe, it, xdescribe, xit, expect, beforeEach */
import {MapReduce} from "./map-reduce";
import fs from 'fs';
import {Implementation} from "./implementation";
import {WordCountImplementation} from "./word-count-implementation";


describe('Map Reduce algorithm', function () {
	let implementation,
		mapReduce,
		methods = ['execute'],
		privateVariables = ['allData', 'numMapWorkers', 'allMapWorkers', 'numReduceWorkers', 'allReduceWorkers', 'reduceWorkersKilled', 'totalMapWorkers'],
		accessors = ['fs', 'spawn'],
		inputFileNames = ['./dest/input/test', './dest/input/anotherTest'],
		defaultOptions = {numMapWorkers: 2, numReduceWorkers: 2, mapWorkerFileName: './dest/scripts/basic-map.js', reduceWorkerFileName: './dest/scripts/basic-reduce.js'},
		mapWorkerFileName: './dest/scripts/word-count-map.js',
		reduceWorkerFileName: './dest/scripts/word-count-reduce.js',
		wordCountOptions = {numMapWorkers: 2, numReduceWorkers: 2, mapWorkerFileName: './dest/scripts/word-count-map.js', reduceWorkerFileName: './dest/scripts/word-count-reduce.js'};
	
	beforeEach(() => {
		implementation = new Implementation(defaultOptions);
		mapReduce = new MapReduce(implementation);
	});
	xit('should be a function', () => {
		expect(typeof MapReduce).toBe('function');
	});
	xit('should be a constructor', () => {
		expect(mapReduce instanceof MapReduce).toBeTruthy();
	});
	xdescribe('instances', () => {
		methods.forEach(method => {
			it('should have a ' + method + ' property', () => {
				expect(mapReduce[method]).toBeDefined();
			});
			it('should have a ' + method + ' function', () => {
				expect(typeof mapReduce[method]).toBe('function');
			});
		});
		it('should not have direct access to the privateVariables', () => {
			expect(mapReduce.privatVariables).toBeUndefined();
		});
		accessors.forEach(accessor => {
			it('should have a getter / setter named ' + accessor, () => {
				expect(mapReduce[accessor]).toBeDefined();			
			});
		});
		privateVariables.forEach(privateVariable => {
			it('should have a ' + privateVariable + ' private variable', () => {
				expect(mapReduce[privateVariable]).toBeUndefined();
			});
		});
	});
	describe('instance API', () => {
		describe('execute', () => {
			it('should return a promise', () => {
				let result = mapReduce.execute([]);
				
				expect(result instanceof Promise).toBeTruthy();
			});
			it('should return a promise that resolves to data', done => {
				mapReduce.execute(['./dest/input/test', './dest/input/anotherTest']).then(result => {
					expect(typeof result).toBeDefined();
					done();
				});
			});
			it('should return a promise that resolves to a string', done => {
				mapReduce.execute(inputFileNames).then(result => {
					console.log('spec result:', result);
					expect(typeof result).toBe('string');
					done();
				});
			});
			inputFileNames.forEach(fileName => {
				it('should return a promise that resolves to a string that includes the contents of ' + fileName, done => {
					mapReduce.execute(inputFileNames).then(result => {
						console.log('result:', result);
						fs.readFile(fileName, {encoding: 'utf8'}, (err, data) => {
							expect(err).toBeNull();
							data.split('\n').forEach(line => {
								expect(result.indexOf(line) >= 0).toBeTruthy();
							});
							done();
						});
					});
				});
			});
		});
	});
	describe('word count', () => {
		it('should return a promise', () => {
			let wordCountImplementation = new WordCountImplementation(wordCountOptions),
				alternateMapReduce = new MapReduce(wordCountImplementation);
				
			expect(alternateMapReduce.execute(inputFileNames) instanceof Promise).toBeTruthy();
		});
		it('should return a promise that resolves to an object', done => {
			let wordCountImplementation = new WordCountImplementation(wordCountOptions),
				alternateMapReduce = new MapReduce(wordCountImplementation);
				
			alternateMapReduce.execute(inputFileNames).then(result => {
				expect(typeof result).toBe('object');
				done();
			});
		});
		it('should contain an entry for every word read from the input', done => {
			let wordCountImplementation = new WordCountImplementation(wordCountOptions),
				alternateMapReduce = new MapReduce(wordCountImplementation);
				
			alternateMapReduce.execute(inputFileNames).then(result => {
				console.log('word count:', result);
				expect(Object.keys(result).length > 0).toBeTruthy();
				done();
			});
		});
	});
});