/* global describe, it, expect */
import wordCountReduce from './word-count-reduce';

describe('word count reduce', () => {
	let fork,
		reduce,
		dataToWrite;
		
	beforeEach(() => {
		fork = require('child_process').fork;
		reduce = fork('./dest/scripts/word-count-reduce.js', {silent: true});
		dataToWrite = 'hello:6\n';
	});
	
	it('should be an object', () => {
		expect(typeof wordCountReduce).toBe('object');
	});
	it('should have no exports', () => {
		expect(Object.keys(wordCountReduce).length).toBe(0);
	});
	it('should write the data written to stdin back to stdout once stdin has been closed', done => {
		reduce.stdout.setEncoding('utf8');
		
		reduce.stdout.on('data', data => {
			expect(data).toBe(dataToWrite);
			done();
		});
		
		reduce.stdin.write(dataToWrite, 'utf8', () => {
			reduce.stdin.end();
		});
	});
	it('should write an the word counts read from stdin to stdout once stdin has been closed', done => {
		let expectedOutput = 'hello:6\n';
		
		reduce.stdout.setEncoding('utf8');
		
		reduce.stdout.on('data', data => {
			expect(data.indexOf(expectedOutput) >= 0).toBeTruthy();
			done();
		});
		
		reduce.stdin.write(dataToWrite, 'utf8', () => {
			reduce.stdin.end();
		});
	});
	it('should aggregate the counts for all words read from stdin', done => {
		let dataToWrite = ['hello:6\n', 'hello:4\n'],
			expectedOutput = '10',
			writesFinished = [];
		
		reduce.stdout.setEncoding('utf8');
		
		reduce.stdout.on('data', data => {
			expect(data.indexOf(expectedOutput) > 0).toBeTruthy();
			done();
		});
		
		dataToWrite.forEach(datum => {
			let write = new Promise((resolve, reject) => {
				reduce.stdin.write(datum, 'utf8', () => {
					resolve(true);
				});
			});
			writesFinished.push(write);
		});
		
		Promise.all(writesFinished).then(result => {
			reduce.stdin.end();
		});
	});
	it('should exit when stdin is ended', done => {
		reduce.on('exit', () => {
			expect(true).toBeTruthy();
			done();	
		});
		
		reduce.stdin.end();
	});
});