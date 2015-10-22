/* global describe, it, expect */
import wordCountMap from './word-count-map';

describe('word count map', () => {
	it('should be an object', () => {
		expect(typeof wordCountMap).toBe('object');
	});
	it('should have no exports', () => {
		expect(Object.keys(wordCountMap).length).toBe(0)
	});
	it('should write a string to standard out', done => {
		let fork = require('child_process').fork,
			map = fork('./dest/scripts/word-count-map.js', {silent: true}),
			dataToWrite = 'Hello\n';
			
		map.stdout.setEncoding('utf8');
		
		map.stdout.on('data', data => {
			expect(typeof data).toBe('string');
			done();
		});
		
		map.stdin.write(dataToWrite, 'utf8');
		map.stdin.end();
	});
	it('should write a string to standard out that contains two values separated by a semi colon', done => {
		let fork = require('child_process').fork,
			map = fork('./dest/scripts/word-count-map.js', {silent: true}),
			dataToWrite = 'Hello\n';
			
		map.stdout.setEncoding('utf8');
		
		map.stdout.on('data', data => {
			expect(data.indexOf(':') > 0).toBeTruthy();
			done();
		});
		
		map.stdin.write(dataToWrite, 'utf8');
		map.stdin.end();
	});
	it('should write a string to standard out that contains the words written to standard in', done => {
		let fork = require('child_process').fork,
			map = fork('./dest/scripts/word-count-map.js', {silent: true}),
			dataToWrite = 'Hello\n',
			expectedOutput = 'hello';
			
		map.stdout.setEncoding('utf8');
		
		map.stdout.on('data', data => {
			expect(data.indexOf(expectedOutput) >= 0).toBeTruthy();
			done();
		});
		
		map.stdin.write(dataToWrite, 'utf8');
		map.stdin.end();
	});
	it('should write a string to standard out that contains the number of times a word was read from standard in', done => {
		let fork = require('child_process').fork,
			map = fork('./dest/scripts/word-count-map.js', {silent: true}),
			dataToWrite = 'Hello hello\n',
			expectedOutput = '2';
			
		map.stdout.setEncoding('utf8');
		
		map.stdout.on('data', data => {
			expect(data.indexOf(expectedOutput) >= 0).toBeTruthy();
			done();
		});
		
		map.stdin.write(dataToWrite, 'utf8');
		map.stdin.end();
	});
	it('should exit when stdin is ended', done => {
		let fork = require('child_process').fork,
			map = fork('./dest/scripts/word-count-map.js', {silent: true});
			
		map.on('exit', () => {
			expect(true).toBeTruthy();
			done();	
		});
		
		map.stdin.end();
	});
});