'use strict';

var TypedError = require('error/typed');
var assert = require('assert');

var serialize = require('../serialize.js');

var TypeClassMismatch = TypedError({
    type: 'jsig.sub-type.type-class-mismatch',
    message: '@{line}: Got unexpected type class. ' +
        'Expected {expected} but got {actual}',
    expected: null,
    actual: null,
    loc: null,
    line: null
});

module.exports = SubTypeChecker;

function SubTypeChecker() {
}

SubTypeChecker.prototype.checkSubType =
function checkSubType(node, parent, child) {
    assert(node && node.type, 'ast node must have type');
    assert(parent && parent.type, 'parent must have a type');
    assert(child && child.type, 'child must have a type');

    if (parent.type === 'typeLiteral') {
        return this.checkTypeLiteralSubType(node, parent, child);
    } else if (parent.type === 'genericLiteral') {
        return this.checkGenericLiteralSubType(node, parent, child);
    } else if (parent.type === 'function') {
        return this.checkFunctionSubType(node, parent, child);
    } else if (parent.type === 'object') {
        return this.checkObjectSubType(node, parent, child);
    } else {
        throw new Error('not implemented sub type: ' + parent.type);
    }
};

/*eslint complexity: [2, 30]*/
SubTypeChecker.prototype.checkTypeLiteralSubType =
function checkTypeLiteralSubType(node, parent, child) {
    if (!parent.builtin) {
        throw new Error('not implemented, sub type for non-builtin');
    }

    if (parent.name === 'Any:ModuleExports') {
        return null;
    }

    if (child.type !== 'typeLiteral') {
        return reportTypeMisMatch(node, parent, child);
        // return new Error('[Internal] expected type literal');
    }

    var name = parent.name;
    if (name === 'Object') {
        if (child.name !== name) {
            return new Error('[Internal] Not an object');
        }
    } else if (name === 'Array') {
        if (child.name !== name) {
            return new Error('[Internal] Not an array');
        }
    } else if (name === 'String') {
        if (child.name !== name) {
            return reportTypeMisMatch(node, parent, child);
        }
    } else if (name === 'void') {
        if (child.name !== name) {
            return new Error('[Internal] Not a void');
        }
    } else if (name === 'Number') {
        if (child.name !== name) {
            return reportTypeMisMatch(node, parent, child);
        }
    } else {
        console.warn('wat', parent);
        throw new Error('NotImplemented');
    }
};

SubTypeChecker.prototype.checkGenericLiteralSubType =
function checkGenericLiteralSubType(node, parent, child) {
    if (child.type !== 'genericLiteral') {
        return reportTypeMisMatch(node, parent, child);
    }

    var err = this.checkSubType(node, parent.value, child.value);
    if (err) {
        return err;
    }

    if (parent.generics.length !== child.generics.length) {
        throw new Error('generics mismatch');
    }

    for (var i = 0; i < parent.generics.length; i++) {
        err = this.checkSubType(
            node, parent.generics[i], child.generics[i]
        );
        if (err) {
            return reportTypeMisMatch(node, parent, child);
        }
    }

    return null;
};

SubTypeChecker.prototype.checkFunctionSubType =
function checkFunctionSubType(node, parent, child) {
    if (child.type !== 'function') {
        return reportTypeMisMatch(node, parent, child);
    }

    var err = this.checkSubType(node, parent.result, child.result);
    if (err) {
        return err;
    }

    err = this.checkSubType(node, parent.thisArg, child.thisArg);
    if (err) {
        return err;
    }

    if (parent.args.length !== child.args.length) {
        throw new Error('[Internal] function args mismatch');
    }

    for (var i = 0; i < parent.args.length; i++) {
        err = this.checkSubType(node, parent.args[i], child.args[i]);
        if (err) {
            return err;
        }
    }

    return null;
};

SubTypeChecker.prototype.checkObjectSubType =
function checkObjectSubType(node, parent, child) {
    if (child.type !== 'object') {
        return reportTypeMisMatch(node, parent, child);
    }

    if (parent === child) {
        return null;
    }

    if (parent.keyValues.length !== child.keyValues.length) {
        throw new Error('[Internal] object key pairs mismatch');
    }

    var err;
    for (var i = 0; i < parent.keyValues.length; i++) {
        err = this.checkSubType(
            node, parent.keyValues[i].value, child.keyValues[i].value
        );
        if (err) {
            return err;
        }
    }

    return null;
};

function reportTypeMisMatch(node, parent, child) {
    return TypeClassMismatch({
        expected: serialize(parent._raw || parent),
        actual: serialize(child._raw || child),
        loc: node.loc,
        line: node.loc.start.line
    });
}