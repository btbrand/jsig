'use strict';

var TypedError = require('error/typed');

var Errors = {};

Errors.MissingFieldInConstr = TypedError({
    type: 'jsig.verify.missing-field-in-constructor',
    message: '@{line}: Expected the field: {fieldName} to be defined ' +
        'in constructor {funcName} but instead found: {otherField}.',
    fieldName: null,
    otherField: null,
    funcName: null,
    loc: null,
    line: null
});

Errors.TooManyArgsInFunc = TypedError({
    type: 'jsig.verify.too-many-function-args',
    message: '@{line}: Expected the function {funcName} to have exactly ' +
        '{expectedArgs} arguments but instead has {actualArgs}.',
    funcName: null,
    actualArgs: null,
    expectedArgs: null,
    loc: null,
    line: null
});

Errors.TooFewArgsInFunc = TypedError({
    type: 'jsig.verify.too-few-function-args',
    message: '@{line}: Expected the function {funcName} to have exactly ' +
        '{expectedArgs} arguments but instead has {actualArgs}.',
    funcName: null,
    actualArgs: null,
    expectedArgs: null,
    loc: null,
    line: null
});

Errors.TooManyArgsInNewExpression = TypedError({
    type: 'jsig.verify.too-many-args-in-new-expression',
    message: '@{line}: Expected the new call on constructor {funcName} to ' +
        'have exactly {expectedArgs} arguments but instead has {actualArgs}.',
    funcName: null,
    actualArgs: null,
    expectedArgs: null,
    loc: null,
    line: null
});

Errors.TooFewArgsInNewExpression = TypedError({
    type: 'jsig.verify.too-few-args-in-new-expression',
    message: '@{line}: Expected the new call on constructor {funcName} to ' +
        'have exactly {expectedArgs} arguments but instead has {actualArgs}.',
    funcName: null,
    actualArgs: null,
    expectedArgs: null,
    loc: null,
    line: null
});

Errors.NonExistantField = TypedError({
    type: 'jsig.verify.non-existant-field',
    message: '@{line}: Object {objName} does not have field {fieldName}.',
    fieldName: null,
    objName: null,
    loc: null,
    line: null
});

Errors.NonVoidReturnType = TypedError({
    type: 'jsig.verify.non-void-return-type',
    message: '@{line}: Expected function {funcName} to return ' +
        'void but found: {actual}.',
    expected: null,
    actual: null,
    funcName: null,
    loc: null,
    line: null
});

Errors.MissingReturnStatement = TypedError({
    type: 'jsig.verify.missing-return-statement',
    message: '@{line}: Expected function {funcName} to return ' +
        '{expected} but found no return statement.',
    expected: null,
    actual: null,
    funcName: null,
    loc: null,
    line: null
});

Errors.UnTypedFunctionFound = TypedError({
    type: 'jsig.verify.untyped-function-found',
    message: '@{line}: Expected the function {funcName} to have ' +
        'type but could not find one.',
    funcName: null,
    loc: null,
    line: null
});

Errors.CallingNewOnPlainFunction = TypedError({
    type: 'jsig.verify.calling-new-on-plain-function',
    message: '@{line}: Cannot call `new` on plain function {funcName}. ' +
        'The function type {funcType} is not a constructor.',
    funcName: null,
    funcType: null,
    loc: null,
    line: null
});

Errors.ConstructorMustBePascalCase = TypedError({
    type: 'jsig.verify.constructor-must-be-pascal-case',
    message: '@{line}: Constructor function {funcName} must be pascal case. ' +
        'Cannot call `new` on function type {funcType}.',
    funcName: null,
    funcType: null,
    loc: null,
    line: null
});

Errors.ConstructorThisTypeMustBeObject = TypedError({
    type: 'jsig.verify.constructor-this-type-must-be-object',
    message: '@{line}: Constructor {funcName} must have non-empty thisType. ' +
        'Cannot have non-object or empty object this ({thisType}).',
    funcName: null,
    thisType: null,
    loc: null,
    line: null
});

Errors.ConstructorMustReturnVoid = TypedError({
    type: 'jsig.verify.constructor-must-return-void',
    message: '@{line}: Constructor {funcName} must return void. ' +
        'Cannot return type: {returnType}.',
    funcName: null,
    returnType: null,
    loc: null,
    line: null
});

Errors.ReturnStatementInConstructor = TypedError({
    type: 'jsig.verify.return-statement-in-constructor',
    message: '@{line}: Constructor {funcName} has unexpected ' +
        'return statement. ' +
        'Expected no return but found type: {returnType}.',
    funcName: null,
    returnType: null,
    loc: null,
    line: null
});

Errors.UnionFieldAccess = TypedError({
    type: 'jsig.verify.accessing-field-on-union',
    message: '@{line}: Cannot read field {fieldName} of union. ' +
        'Expected an object type but found {unionType}.',
    fieldName: null,
    unionType: null,
    loc: null,
    line: null
});

module.exports = Errors;
