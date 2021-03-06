fflux.js 
==========
[![Build Status](https://travis-ci.org/Kureev/fflux.svg?branch=master)](https://travis-ci.org/Kureev/fflux) [![Code Climate](https://codeclimate.com/github/Kureev/fflux/badges/gpa.svg)](https://codeclimate.com/github/Kureev/fflux) [![Test Coverage](https://codeclimate.com/github/Kureev/fflux/badges/coverage.svg)](https://codeclimate.com/github/Kureev/fflux)

Some time ago Facebook engineers released a specification describing [Flux](https://facebook.github.io/flux/) - one-way data flow architecture. After that, they released a Dispatcher constructor, but skipped store, actions and react view/controller-binding parts. In fflux.js I tried to supplement existing code to complete architecture with a tiny layer of the user-friendly API for it.

What is FFlux?
--------------
* Dispatcher, Store, React mixin + simple API to use them together
* Immutable state in the store (emit "change" event only if data has been really changed)
* 100% test covered code
* "A" class code quality (by @codeclimate)
* Detailed information about errors (by facebook's invariant)
* Very modular: use only those parts that you need

Installation
-------------
### npm

    npm install fflux

### bower

    bower install fflux

Dispatcher
-----------
To create a dispatcher:

```javascript
var dispatcher = new FFlux.Dispatcher();
```

It's very similar with facebook's realization (because it's based on it), but `register` method takes store instance instead of callback function:

```javascript
/**
 * Create store
 * @type {FFluxStore}
 */
var store = new FFlux.Store({ ... });

/**
 * Dispatch action to the system
 */
dispatcher.dispatch('SOME_ACTION', payload);
```

But as you see, nothing happens. The reason is that the store hasn't been registered in the dispatcher:

```javascript
dispatcher.register(store);
```

Now all dispatched events will be available in the action handlers.

Actions
-------
Actions are used for sending messages from different sources to dispatcher:

```javascript
dispatcher.dispatch('SOME_ACTION', payload);
```

Where `payload` is an usual JS object with event's payload.

Action Creators
---------------
Action Creators is an API middleware, all requests to the backend happends here.
By design it's just a javascript object:

```javascript
var ActionCreatorExample = {
  fetchData: function() {...},
  postData: function() {...},
  ...
};
```

Store
-----
Store instances should process and store applicatoin data(**they shouldn't fetch or push data!**). Basic store looks like this:

```javascript
/**
 * Handler for OTHER_ACTION
 * @param {object} data Payload
 * @return {void}
 */
function otherActionHandler(data) {
  console.log('Some other function has been called');
}

var store = new FFlux.Store({
  /**
   * In this property we declare list
   * of the actions we're interested in.
   *
   * For every of those actions we specify handler function. It can be independent
   * function like `otherActionHandler` or instance method like `someMethod`
   */
  actions: {
    'SOME_ACTION': 'someMethod'
    'OTHER_ACTION': otherActionHandler
  },

  /**
   * Handler for SOME_ACTION
   * @param {object} data Payload
   * @return {void}
   */
  someMethod: function(data) {
    console.log('Some method has been called');
  }
});
```

As you can see from the example above, you will have an actions property which provides you a possibility to use declarative style for describing handlers for different action types (looks like backbone's events, huh?). In every action handler you can use `waitFor` method as it's described on the [flux's dispatcher page](http://facebook.github.io/flux/docs/dispatcher.html#content):

```javascript
{
  /**
   * Some action's handler
   * @param {object} data Payload
   * @return {void}
   *
   * @description For invoke some function(s) only *after* other store
   * process action, we need to use `waitFor` method
   */
  someMethod: function(data) {
    /**
     * Now we have no idea if `storage` store already processed the data
     * But after calling `waitFor` we can be sure, that it's done
     */
    dispatcher.waitFor([storage]);
  }
}
```

You can register/unregister action handlers dynamicly after store initialization:

```javascript
var store = new FFlux.Store({...});

/**
 * Action handler function
 * @param {object} data Payload
 * @return {void}
 */
function actionHandler(data) {
  //...
}

/**
 * Register handler `actionHandler` for action `SOME_ACTION`
 */
store.registerAction('SOME_ACTION', actionHandler);

/**
 * Call `unregisterAction` for remove action handler
 */
store.unregisterAction('SOME_ACTION');
```

That's what we have in our flux stores!

View layer
------------------------------------------
Flux doesn't have any requirements for the view layer.
For the sake of the simplicity (and package size), I decided not to add any view layer and let programmers decide themselfs what to use. The only thing that fflux.js provides you - it's mixins for auto-binding to the stores:

```javascript
/**
 * Create some store
 */
var store = new FFlux.Store({...});

/**
 * React class to describe component
 */
var MyComponentClass = React.createClass({
  /**
   * Bind React view to listen `change` event of the `store`
   * @type {Array}
   */
  mixins: [FFlux.mixins.bind(store)],

  /**
   * After store emit `change` event
   * this function will be invoked
   * @return {void}
   */
  storeDidUpdate: function() {...},

  render: function() {...}
});

// Create React component (using 0.12.2 syntax)
var MyComponent = React.createElement(MyComponentClass);

/**
 * That's it, now you can render `MyComponent` and
 * as soon as `store` will emit `change` event, 
 * your component will be redrawn
 */
React.render(MyComponent, document.body);
``` 