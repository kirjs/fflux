'use strict';

var FFlux = require('../src/index.js');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

chai.use(require('chai-spies'));

describe('FFlux store functions', function() {

    var store = new FFlux.Store();

    it('emitChange', function() {
        var spy = chai.spy();

        store.on('change', spy);

        store.emitChange();

        expect(spy).to.have.been.called.once();
    });

    it('setState', function() {
        var spy = chai.spy();

        store.on('change', spy);

        store.setState({
            a: 10,
            b: 20
        });

        expect(store.state.get('a')).to.be.equal(10);
        expect(store.state.get('b')).to.be.equal(20);
        
        expect(spy).to.have.been.called.once();

        store.setState({
            a: 10
        });

        expect(spy).to.have.been.called.once();
    });

    it('replaceState', function() {
        store.replaceState({
            a: 50,
            b: 60
        });

        expect(store.state.get('a')).to.be.equal(50);
        expect(store.state.get('b')).to.be.equal(60);
    });

    it('(un)registerAction', function() {
        var actionName = 'STORE_TEST';
        var savedActions = store.getActions();

        // Register action to store
        store.registerAction(actionName, function() {});
        // Check if the `actions` hash have been changed
        assert(savedActions !== store.getActions());

        // You can't re-register existing action
        expect(store.registerAction.bind(store, actionName, function() {})).to.throw(Error);
            
        // Unregister the action
        store.unregisterAction(actionName);

        // Check if it's back to the default state
        assert(JSON.stringify(savedActions) === JSON.stringify(store.getActions()));
    });
    
});