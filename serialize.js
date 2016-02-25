'use strict';

var extend = require('xtend');

var serializers = {
    program: serializeProgram,
    typeDeclaration: serializeTypeDeclaration,
    assignment: serializeAssignment,
    'import': serializeImportStatement,
    object: serializeObject,
    unionType: serializeUnion,
    intersectionType: serializeIntersection,
    typeLiteral: serializeLiteral,
    keyValue: serializeKeyValue,
    valueLiteral: serializeValue,
    function: serializeFunctionType,
    genericLiteral: serializeGeneric,
    tuple: serializeTuple
};

module.exports = serialize;

function serialize(ast, opts) {
    opts = opts || { indent: 0, lineStart: 0 };

    if (ast._raw) {
        return serialize(ast._raw, opts);
    }

    var fn = serializers[ast.type];

    if (!fn) {
        throw new Error('unknown ast type: ' + ast.type);
    }

    return fn(ast, opts);
}

function serializeProgram(node, opts) {
    return node.statements.map(function s(n) {
        return serialize(n, opts);
    }).join('\n\n');
}

function serializeTypeDeclaration(node, opts) {
    var generics = node.generics.length ?
        '<' + node.generics.map(function s(n) {
            return serialize(n, opts);
        }).join(', ') + '>' : '';
    var str = 'type ' + node.identifier + generics + ' : ';

    return str + serialize(node.typeExpression, extend(opts, {
        lineStart: str.length
    }));
}

function serializeAssignment(node, opts) {
    return node.identifier + ' : ' +
        serialize(node.typeExpression, opts);
}

function serializeImportStatement(node, opts) {
    return 'import { ' + node.types.map(function s(n) {
        return serialize(n, opts);
    }).join(', ') + ' } from "' + node.dependency + '"';
}

function serializeLabel(node) {
    return node.label ?
        node.label + (node.optional ? '?' : '') + ': ' :
        '';
}

function serializeObject(node, opts) {
    var keyValues = node.keyValues;

    if (keyValues.length === 0) {
        return serializeLabel(node, opts) + '{}';
    }

    /* heuristic. Pretty print single key, value on one line */
    if (keyValues.length <= 1) {
        var content = serializeLabel(node, opts) + '{ ' +
            keyValues.map(function s(n) {
                return serialize(n);
            }).join(', ') + ' }';

        if (content.length < 65 &&
            content.indexOf('\n') === -1
        ) {
            return content;
        }
    }

    return serializeLabel(node, opts) + '{\n' +
        keyValues.map(function s(n) {
            return serialize(n, extend(opts, {
                indent: opts.indent + 1
            }));
        }).join(',\n') + '\n' + spaces(opts.indent) + '}';
}

function prettyFormatList(labelStr, tokens, seperator, opts) {
    var list = tokens.reduce(function buildPart(parts, token) {
        var lastIndex = parts.length - 1;
        var last = parts[lastIndex];
        var len = (last + token + seperator).length;

        if (opts.lineStart) {
            len += opts.lineStart;
        }

        if (len < 65) {
            parts[lastIndex] += token + seperator;
            return parts;
        }

        if (opts.lineStart) {
            opts.lineStart = 0;
        }

        parts[parts.length] = spaces(opts.indent + 1) +
            trimLeft(token) + seperator;
        return parts;
    }, ['']);
    var str = labelStr + list.join('\n');
    // remove extra {seperator} at the end
    return str.substr(0, str.length - 1);
}

function serializeUnion(node, opts) {
    var labelStr = serializeLabel(node);
    var nodes = node.unions.map(function s(n) {
        return serialize(n, opts);
    });
    var str = labelStr + nodes.join(' | ');

    /* heuristic. Split across multiple lines if too long */
    if (str.split('\n')[0].length > 65) {
        str = prettyFormatList(labelStr, nodes, ' | ', opts);
    }

    return str;
}

function serializeIntersection(node, opts) {
    var labelStr = serializeLabel(node);
    var nodes = node.intersections.map(function s(n) {
        return serialize(n, opts);
    });
    var str = labelStr + nodes.join(' & ');

    /* heuristic. Split across multiple lines if too long */
    if (str.split('\n')[0].length > 65) {
        str = prettyFormatList(labelStr, nodes, ' & ', opts);
    }

    return str;
}

function serializeLiteral(node, opts) {
    return serializeLabel(node, opts) + node.name;
}

function serializeKeyValue(node, opts) {
    return spaces(opts.indent) + node.key +
        (node.optional ? '?' : '') + ': ' +
        serialize(node.value, opts);
}

function serializeValue(node, opts) {
    return serializeLabel(node, opts) + node.value;
}

function serializeFunctionType(node, opts) {
    var str = serializeLabel(node, opts) + '(';
    var argNodes = node.args.slice();

    if (node.thisArg) {
        argNodes.unshift(node.thisArg);
    }

    var argStrs = argNodes.map(function s(n) {
        return serialize(n, opts);
    });
    var argStr = argStrs.join(', ');

    if (argStrs.join(', ').split('\n')[0].length > 65) {
        var offset = '\n' + spaces(opts.indent + 1);
        argStrs = argNodes.map(function s(n) {
            return serialize(n, extend(opts, {
                indent: opts.indent + 1
            }));
        });
        argStr = offset + argStrs.join(',' + offset) + '\n';
        argStr += spaces(opts.indent);
    }

    str += argStr + ') => ' +
        serialize(node.result, opts);

    return str;
}

function serializeGeneric(node, opts) {
    return serializeLabel(node, opts) +
        serialize(node.value, opts) +
        '<' + node.generics.map(function s(n) {
            return serialize(n, opts);
        }).join(', ') + '>';
}

function serializeTuple(node, opts) {
    return serializeLabel(node, opts) +
        '[' + node.values.map(function s(n) {
            return serialize(n, opts);
        }).join(', ') + ']';
}

function spaces(n) {
    n = n * 4;
    var str = '';
    for (var i = 0; i < n; i++) {
        str += ' ';
    }
    return str;
}

function trimLeft(str) {
    return str.replace(/^\s+/, '');
}
