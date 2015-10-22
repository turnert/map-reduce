/* global describe, it, expect */
import basicMap from './basic-map';

describe('basic map', () => {
	it('should be an object', () => {
		expect(typeof basicMap).toBe('object');
	});
	it('should have no exports', () => {
		expect(Object.keys(basicMap).length).toBe(0)
	});
	it('should write the data written to stdin back to stdout', done => {
		let fork = require('child_process').fork,
			basicMap = fork('./dest/scripts/basic-map.js', {silent: true}),
			dataToWrite = 'Hello\n';
			
		basicMap.stdout.setEncoding('utf8');
		
		basicMap.stdout.on('data', data => {
			expect(data).toBe(dataToWrite);
			done();
		});
		
		basicMap.stdin.write(dataToWrite);
	});
	it('should exit when stdin is ended', done => {
		let fork = require('child_process').fork,
			basicMap = fork('./dest/scripts/basic-map.js', {silent: true});
			
		basicMap.on('exit', () => {
			expect(true).toBeTruthy();
			done();	
		});
		
		basicMap.stdin.end();
	});
});