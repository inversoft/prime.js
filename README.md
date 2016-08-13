## Prime JavaScript

Prime JS is an Object Oriented namespaced JavaScript library.
Welcome to the Prime JavaScript Framework. Visit the project [website](http://inversoft.github.io/prime.js) or the [wiki](https://github.com/inversoft/prime.js/wiki) for additional information.

**Note:** This project uses the Savant build tool, for more information checkout the [savant-core](https://github.com/inversoft/savant-core) project.

## Release Notes

### 0.35.0

This version changed a number of APIs that will require you to update you code to use Prime.js correctly. Here's the list of things that changed:

* Prime.js no longer handles any `context` references. You are now responsible for managing `this` references in your functions.
* All `addEventListeners` functions no longer take the `context` reference. Use `Function.bind()` instead.
* Renamed `Prime.Document.Element.parent()` to `Prime.Document.Element.getParent()` to follow our naming convention.
* Renamed `Prime.Document.queryByID()` to `Prime.Document.queryById()` to follow our naming convention.
* Renamed `Prime.Document.getID()` to `Prime.Document.getId()` to follow our naming convention.
* Renamed `Prime.Document.setID()` to `Prime.Document.setId()` to follow our naming convention.
* Added `Prime.Utils.bindAll()` to assist with managing the `this` reference inside objects.
* Removed `Prime.Utils.proxy()` handling that allows event listeners to return `true` or `false` to propagate events. You now need to use the `Event` object to manage how events are propagated and bubbled or use our helper method.
* Added `Prime.Utils.stopEvent(event)` function to assist in stopping events from propagating or bubbling. 
