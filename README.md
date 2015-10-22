# MapReduceJS
A multithreaded approach of the map reduce algorithm in javascript.  This project started as interesting experiment.  Could a this algorithm be implemented in javascipt's single-threaded event loop?

## Getting Started
This project was written in ES2015 and transpiled to ES5 using babel and broccoli.  In order to get the most of this project, you'll want to create your own implementation of the map reduce algorithm.  Implementations should extend the Implementation class found in /src/implementation.js.  An example of an extended implementation is found in /src/word-count-implementation.js.  Functionality is added to an implementation by overwritting the _mapPartition, _reducePartition and _aggregate functions in the Implementation class.  By default, the _mapPartition and _reducePartition divide the input into alphabetical groups determined by the number of map child processes and reduce child processes respectively.

Once an implementation has been defined, new scripts must be added to the scripts folder.  These scripts define how the map child processes and reduce child processes will conduct their work.  Examples of a map child process and reduce child process can be seen /src/scripts/word-count-map.js and /src/scripts/word-count-reduce.js respectively.  These scripts are added to your implementation when creating a new instance of the class through the options object to the constructor.

## How To Use
Create a new implementation in /src:

```javascript
import {Implementation} from './implementation';

export class MyNewImplementation extends Implementation {
	constructor (options) {
		super(options);
		...
```
* options Object Constructor options
  * numMapWorkers Number map child processes the algorithm will create
  * numReduceWorkers Number reduce child processes the algorithm witll create
  * mapWorkerFileName String name of the script used to generate map child processes
  * reduceWorkerFileName String name of the script used to generate reduce child processes
  
  Create a new algorithm in /src:
  
  ```javascript
  import {MyNewImplementation} from './my-new-implementation';
  import {MapReduce} from './map-reduce';
  
  let myImplementation = new MyNewImplementation({
      numMapWorkers: 2,
      numReduceWorkers: 2,
      mapWorkerFileName: '/src/scripts/my-map-worker-file-name.js',
      reduceWorkerFileName: '/src/scripts/my-reduce-worker-file-name.js'
    }),
    myMapReduce = new MapReduce(myImplementation);
```

Create an array of file names that will act as the input to your algorithm, then the algorithm is executed on that array:

```javascript
myMapReduce.execute(input).then(result => {
  ...
```

Once your implementation and scripts have been written and tested, the entire project is transpiled back to es5 on the command line using `broccoli build dest` to build the dest folder with the corresponding files.  Your code can be run from the dest folder.