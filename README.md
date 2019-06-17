## Prime JavaScript

Prime JS is an Object Oriented namespaced JavaScript library.
Welcome to the Prime JavaScript Framework. Visit the project [website](http://inversoft.github.io/prime.js) or the [wiki](https://github.com/inversoft/prime.js/wiki) for additional information.

**Note:** This project uses the Savant build tool, for more information checkout the [savant-core](https://github.com/inversoft/savant-core) project.

## Downloading
Released versions can be downloaded from the Savant Repository.
 
 * http://savant.inversoft.org/org/inversoft/prime/prime.js/

## Setup
```bash
npm install -g gulp
npm install
```

## Build
```bash
gulp
```

## Testing

```bash
gulp test
```

If you just want to know if the tests complete successfully you can call `gulp fastTest` instead.
This will run all 4 variations of prime.js in parallel and cuts time down to ~25% of of the slow test.
The drawback is it won't be clear which file had the exception if something goes wrong.


## Build output

Builds for EcmaScript5 for wide browser support and EcmaScript6 are provided

```bash
./build/Prime.css
./build/Prime.ts
./build/PrimeES6.js
```