'use strict';

/*eslint no-console: 0*/
var console = require('console');

var isModuleExports = require('./lib/is-module-exports.js');
var verifiers = require('./verifiers.js');
var JsigAST = require('../ast.js');
var readJSigAST = require('./lib/read-jsig-ast.js');
var HeaderFile = require('./header-file.js');

var fileExtRegex = /.js$/;
var requireType = JsigAST.functionType({
    args: [JsigAST.literal('String')],
    result: JsigAST.literal('Any')
});
requireType.isNodeRequireToken = true;

var moduleType = JsigAST.object({
    exports: JsigAST.literal('Any')
});
moduleType.isNodeModuleToken = true;

module.exports = ProgramMeta;

function ProgramMeta(ast, fileName) {
    this.ast = ast;
    this.fileName = fileName;

    this.identifiers = {};
    this.type = 'program';

    this.moduleExportsNode = null;
    this.moduleExportsType = null;

    this.currentScope = new FileMeta(this);
    this.currentScope.addVar('require', requireType);
    this.currentScope.addVar('module', moduleType);

    this.errors = [];
    this.fatalError = false;

    this.headerFile = null;
}

ProgramMeta.prototype.getVar = function getVar(id) {
    return this.identifiers[id];
};

ProgramMeta.prototype.verify = function verify() {
    var node = this.ast;

    this.verifyNode(node);
};

ProgramMeta.prototype.verifyNode = function verifyNode(node) {
    if (this.fatalError) {
        return null;
    }

    var verifyFn = verifiers[node.type];
    if (verifyFn) {
        return verifyFn(node, this);
    } else {
        console.warn('!! skipping verifyNode', node.type);
    }
};

ProgramMeta.prototype.setModuleExportsNode =
function setModuleExportsNode(astNode) {
    var moduleExports = null;
    for (var i = 0; i < astNode.body.length; i++) {
        if (isModuleExports(astNode.body[i])) {
            moduleExports = astNode.body[i];
        }
    }

    if (moduleExports) {
        this.moduleExportsNode = moduleExports.expression.right;
    }
};

ProgramMeta.prototype.addError = function addError(error) {
    this.errors.push(error);
};

/*
Each program has a mandatory header file. This contains
type definitions for a subset of the program.

*/
ProgramMeta.prototype.loadHeaderFile =
function loadHeaderFile() {
    var headerFileName = this.fileName.replace(fileExtRegex, '.hjs');

    var res = readJSigAST(headerFileName);
    if (res.error) {
        this.errors.push(res.error);
        this.fatalError = true;
        return;
    }

    this.headerFile = new HeaderFile(res.value);

    var assignments = this.headerFile.getAssignments();
    for (var i = 0; i < assignments.length; i++) {
        var expr = assignments[i];

        this.currentScope.addVar(expr.identifier, expr.typeExpression);
    }
};

ProgramMeta.prototype.enterFunctionScope =
function enterFunctionScope(funcNode, typeDefn) {
    var funcScope = new FunctionMeta(this, funcNode.id.name);

    for (var i = 0; i < funcNode.params.length; i++) {
        var param = funcNode.params[i];
        var argType = typeDefn.args[i];

        funcScope.addVar(param.name, argType);
    }

    if (funcScope.isConstructor) {
        funcScope.thisValueType = typeDefn.result;
    } else {
        funcScope.returnValueType = typeDefn.result;
    }
    this.currentScope = funcScope;
};

ProgramMeta.prototype.exitFunctionScope =
function exitFunctionScope() {
    var funcScope = this.currentScope;

    if (funcScope.isConstructor) {
        // TODO: verify return.
        console.warn('!! Must check hidden class.');
    } else {
        // TODO: verify return.
        console.warn('!! Must check a return');
    }

    this.currentScope = this.currentScope.parent;
};

function FileMeta(parent) {
    this.parent = parent;

    this.identifiers = Object.create(null);
    this.type = 'file';
}

FileMeta.prototype.addVar =
function addVar(id, typeDefn) {
    this.identifiers[id] = {
        type: 'variable',
        defn: typeDefn
    };
};

FileMeta.prototype.getVar = function getVar(id) {
    return this.identifiers[id] || this.parent.getVar(id);
};

function FunctionMeta(parent, funcName) {
    this.parent = parent;

    this.identifiers = Object.create(null);
    this.type = 'function';

    this.funcName = funcName;
    this.returnValueType = null;
    this.thisValueType = null;
    this.isConstructor = funcName[0].toUpperCase() === funcName[0];
}

FunctionMeta.prototype.addVar =
function addVar(id, typeDefn) {
    this.identifiers[id] = {
        type: 'variable',
        defn: typeDefn
    };
};

FunctionMeta.prototype.getVar = function getVar(id) {
    return this.identifiers[id] || this.parent.getVar(id);
};
