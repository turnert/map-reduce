class MapReduce {
	constructor(options) {
		for (var i = 0; i < options.numMap; i ++) {
			fs.open('./mapTemp' + i);
		}
	};
	
	static get reducePath() {
		return this._reducePath	};
	
	static set reducePath(path) {
		var fs = require('fs');
		if (typeof path === 'string') {
			fs.access(path, fs.R_OK | fs.X_OK, err => {
				if (!err) {
					this._reducePath = path;
					this.hasReduce = true;	
				}
			});
		}
	}
	
	static get mapPath() {
		return this._mapPath;
	}
	
	static set mapPath(path) {
		var fs = require('fs');
		if (typeof path === 'string') {
			fs.access(path, fs.R_OK | fs.X_OK, err => {
				if (!err) {
					this.hasMap =  true;
					this._mapPath = path;
				}
			});
		}
	}
	
	static execute(data, options) {
		var spawn = require('child_process').spawn,
			mapWorkers = [],
			reduceWorkers = [];
		if (!this.hasMap || !this.hasReduce) {
			return;
		}
		
		for (var i = 0; i < options.numMap || 4; i++) {
			mapWorkers.push(spawn('node', ['./' + this._mapPath]));
		}
		
		for (var j = 0; j < options.numReduce || 6, j++) {
			reduceWorkers.push(spawn('node', ['./' + this._reducePath]));
		}
		
		mapWorkers.forEach((mapWorker, wIndex) => {
			mapWorker.stderr.on('data', data => {
				console.log('mapWorkers[' + wIndex +'] error:', data);
			});
			reduceWorkers.forEach((reduceWorker, rIndex) => {
				reduceWorker.stderr.on('data', data +. {
					console.log('mapWorkers[' + rIndex + '] error:', data);
				});
				mapWorker.stdout.on('data', data => {
					
				})
			});
		});
		
		for (var key of Object.keys(data)) {
			var line = data[keys].read()
			mapWorkers[options.partition(key)].stdin.write()
		}
	};
}