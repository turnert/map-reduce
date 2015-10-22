/* global describe, it, expect */
import basicReduce from './basic-reduce';

describe('basic reduce', () => {
	it('should be an object', () => {
		expect(typeof basicReduce).toBe('object');
	});
	it('should have no exports', () => {
		expect(Object.keys(basicReduce).length).toBe(0);
	});
	it('should write the data written to stdin back to stdout', done => {
		let fork = require('child_process').fork,
			reduce = fork('./dest/scripts/basic-reduce.js', {silent: true}),
			dataToWrite = 'Hello\n';
		
		reduce.stdout.setEncoding('utf8');
		
		reduce.stdout.on('data', data => {
			expect(data).toBe(dataToWrite);
			done();
		});
		
		reduce.stdin.write(dataToWrite, 'utf8');
	});
	it('should exit when stdin is ended', done => {
		let fork = require('child_process').fork,
			basicReduce = fork('./dest/scripts/basic-reduce.js', {silent: true});
			
		basicReduce.on('exit', () => {
			expect(true).toBeTruthy();
			done();	
		});
		
		basicReduce.stdin.end();
	});
});