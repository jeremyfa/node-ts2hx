
var fs = require('fs');
var ts2json = require('ts2json');
var _ = require('lodash');

var HXDumper = function(ast) {
    // Typescript AST
    this.ast = ast;

    // Context
    this.indent = 0;
    this.output = '';
    this.context = {};
    this.rootContext = {};
};


HXDumper.prototype.pushContext = function() {
    var newContext = _.clone(this.context);
    newContext.__parentContext = this.context;
    this.context = newContext;
};


HXDumper.prototype.popContext = function() {
    this.context = this.context.__parentContext;
};


HXDumper.prototype.addContextType = function(name, type) {
    this.context['type:'+name] = type;
};


HXDumper.prototype.addRootContextType = function(name, type) {
    this.rootContext['type:'+name] = type;
};


HXDumper.prototype.contextType = function(name) {
    if (this.thisPrefix && name.substring(0, 5) === 'this.') {
        name = this.thisPrefix + ':' + name.substring(5);
    }
    var type = this.context['type:'+name];
    if (type == null) {
        type = this.rootContext['type:'+name];
    }
    return type;
};


HXDumper.prototype.logKeys = function(input) {
    for (var key in input) {
        console.log(key);
    }
};


HXDumper.prototype.dump = function() {
    // Reset data
    this.indent = 0;
    this.output = '';
    this.context = {};
    this.rootContext = {};
    this.hasWrittenPackage = false;
    this.inStaticMethod = false;

    this.dumpSourceUnit(this.ast._sourceUnit);

    return this.output;
};


HXDumper.prototype.dumpSourceUnit = function(sourceUnit) {
    this.dumpModuleElements(sourceUnit.moduleElements);
};


HXDumper.prototype.dumpModuleElements = function(elements) {
    this.pushContext();

    var hasCustomModule = false;
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        if (element.moduleKeyword) {
            hasCustomModule = true;
            break;
        }
    }
    if (!hasCustomModule && !this.hasWrittenPackage) {
        this.hasWrittenPackage = true;
        this.write('package;');
        this.writeLineBreak();
        this.writeLineBreak();
    }

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        if (element.classKeyword) {
            this.dumpClass(element);
        }
        else if (element.moduleKeyword && !this.hasWrittenPackage) {
            this.hasWrittenPackage = true;
            this.dumpModule(element);
        }
        else if (element.interfaceKeyword) {
            this.dumpInterface(element);
        }
        else {
            var modifiers = this.modifiers(element);
            if (!modifiers.declare) {
                this.dumpValue(element);
                this.writeLineBreak();
            }
        }
    }
    this.popContext();
};


HXDumper.prototype.dumpModule = function(element) {
    this.writeIndentSpaces();
    this.write('package ');
    this.dumpValue(element.name);
    this.write(';');
    this.writeLineBreak();
    this.writeLineBreak();
    this.dumpModuleElements(element.moduleElements);
};


HXDumper.prototype.dumpInterface = function(element) {
    // Haxe interface
    this.writeIndentSpaces();
    this.write('interface ');
    this.write(this.extract(element.identifier));
    if (element.heritageClauses && element.heritageClauses.length) {
        this.dumpHeritageClauses(element.heritageClauses);
    }
    this.write(' ');
    var wasInInterface = this.inInterface;
    this.inInterface = true;
    this.dumpValue(element.body);
    this.inInterface = wasInInterface;
    this.writeLineBreak();
    this.writeLineBreak();
};


HXDumper.prototype.dumpHeritageClauses = function(heritageClauses) {
    var len = heritageClauses.length;

    if (len > 0) {
        this.write(' ');
    }

    for (var i = 0; i < len; i++) {
        var clause = heritageClauses[i];
        var keyword = this.extract(clause.extendsOrImplementsKeyword);
        var len2 = clause.typeNames.length;
        for (var j = 0; j < len2; j++) {
            this.write(keyword+' ');
            this.dumpValue(clause.typeNames[j]);
            if (j < len2 - 1 || i < len - 1) {
                this.write(' ');
            }
        }
    }
};


HXDumper.prototype.dumpClass = function(element) {
    var previousClassName = this.className;
    this.className = this.extract(element.identifier);

    if (element.typeParameterList) {
        // Generic?
        this.writeIndentedLine('@:generic');
    }

    // Indent spaces
    this.writeIndentSpaces();

    // Class keyword
    this.write('class ');

    // Class identifier
    this.write(this.extract(element.identifier));

    // Type parameter
    if (element.typeParameterList) {
        this.dumpTypeParameterList(element.typeParameterList);
    }

    if (element.heritageClauses) {
        this.dumpHeritageClauses(element.heritageClauses);
    }

    this.write(' {');

    // Add line break
    this.writeLineBreak();
    this.writeLineBreak();

    // Dump content
    this.indent++;
    if (element.classElements) {
        this.dumpClassElements(element.classElements);
    }
    this.indent--;

    // Add line
    this.writeIndentedLine('}');
    this.writeLineBreak();

    this.className = previousClassName;
};


HXDumper.prototype.dumpClassElements = function(elements) {
    // Compute getters and setters
    var accessors = {};
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.getKeyword && element.propertyName) {
            var name = this.extract(element.propertyName);
            accessors[name] = _.clone(element);
            accessors[name].hasGetter = 1;
        }
    }
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.setKeyword && element.propertyName) {
            var name = this.extract(element.propertyName);
            if (!accessors[name]) {
                accessors[name] = _.clone(element);
            }
            accessors[name].hasSetter = 1;
        }
    }

    // Dump elements
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        // Property with get/set
        if ((element.getKeyword || element.setKeyword) && element.propertyName) {
            var name = this.extract(element.propertyName);
            if (accessors[name]) {
                this.dumpClassPropertyFromAccessor(accessors[name]);
                delete accessors[name];
            }
        }

        if (element.variableDeclarator && element.variableDeclarator.propertyName) {
            // Class property
            this.dumpClassProperty(element);
        }
        else if (element.constructorKeyword) {
            // Class properties from constructor
            this.dumpClassPropertiesFromConstructor(element);

            // Class constructor
            this.dumpClassConstructor(element);
        }
        else if (element.callSignature) {
            // Class method
            this.dumpClassMethod(element);
        }
    }
};


HXDumper.prototype.dumpClassProperty = function(element) {
    this.writeIndentSpaces();

    var modifiers = this.modifiers(element);

    // Static?
    var prefix = this.className+':';
    if (modifiers['static']) {
        this.write('static ');
        prefix += '@static:';
    }

    // Private or public?
    if (modifiers['private']) {
        this.write('private ');
    } else {
        this.write('public ');
    }

    this.write('var ');

    // Property name
    this.write(this.extract(element.variableDeclarator.propertyName));

    // Accessors?
    if (element.hasGetter || element.hasSetter) {
        this.write('(');
        if (element.hasGetter) {
            this.write('get');
        } else {
            this.write('never');
        }
        this.write(', ');
        if (element.hasSetter) {
            this.write('set');
        } else {
            this.write('never');
        }
        this.write(')')
    }

    // Type
    var didComputeType = false;
    if (element.variableDeclarator.typeAnnotation && element.variableDeclarator.typeAnnotation.type) {
        var type = this.type(element.variableDeclarator.typeAnnotation.type);
        if (type) {
            this.addRootContextType(prefix+this.extract(element.variableDeclarator.propertyName), type);
            this.write(':'+type);
            didComputeType = true;
        }
    }

    // Default value
    if (element.variableDeclarator.equalsValueClause && element.variableDeclarator.equalsValueClause.value) {

        // Compute type from value
        if (!didComputeType) {
            // Try to infer type from assignment if possible
            if (!didComputeType) {
                var type = this.typeFromValue(element.variableDeclarator.equalsValueClause.value);
                if (type != null) {
                    this.addRootContextType(prefix+this.extract(element.variableDeclarator.propertyName), type);
                    this.write(':'+type);
                    didComputeType = true;
                }
            }
        }

        this.write(' = ');
        this.dumpValue(element.variableDeclarator.equalsValueClause.value);
    }

    this.write(';');
    this.writeLineBreak();
    this.writeLineBreak();
};


HXDumper.prototype.dumpClassPropertyFromAccessor = function(element) {
    var typeAnnotation = null;
    if (element.getKeyword) {
        if (element.callSignature.typeAnnotation) {
            typeAnnotation = element.callSignature.typeAnnotation;
        }
        element = {
            variableDeclarator: {
                typeAnnotation: typeAnnotation,
                propertyName: element.propertyName,
                modifiers: element.modifiers
            },
            hasGetter: element.hasGetter,
            hasSetter: element.hasSetter
        };
    } else {
        if (element.callSignature.parameterList) {
            var parameters = element.callSignature.parameterList.parameters;
            if (parameters && parameters.length > 0) {
                if (parameters[0].typeAnnotation) {
                    typeAnnotation = parameters[0].typeAnnotation;
                }
            }
        }
        element = {
            variableDeclarator: {
                typeAnnotation: typeAnnotation,
                propertyName: element.propertyName,
                modifiers: element.modifiers
            },
            hasGetter: element.hasGetter,
            hasSetter: element.hasSetter
        };
    }
    this.dumpClassProperty(element);
};


HXDumper.prototype.dumpClassPropertiesFromConstructor = function(element) {
    if (element.callSignature && element.callSignature.parameterList && element.callSignature.parameterList.parameters) {
        var len = element.callSignature.parameterList.parameters.length;
        for (var i = 0; i < len; i++) {
            var parameter = element.callSignature.parameterList.parameters[i];
            if (parameter.modifiers) {
                var modifiers = this.modifiers(parameter);
                if (modifiers.private || modifiers.public) {
                    var statement = {
                        variableDeclarator: {
                            propertyName: parameter.identifier,
                            typeAnnotation: parameter.typeAnnotation
                        },
                        modifiers: parameter.modifiers
                    };

                    this.dumpClassProperty(statement);
                }
            }
        }
    }
};


HXDumper.prototype.dumpClassPropertiesAssignmentsFromConstructor = function(element) {
    if (element.callSignature && element.callSignature.parameterList && element.callSignature.parameterList.parameters) {
        var len = element.callSignature.parameterList.parameters.length;
        for (var i = 0; i < len; i++) {
            var parameter = element.callSignature.parameterList.parameters[i];
            if (parameter.modifiers) {
                var modifiers = this.modifiers(parameter);
                if (modifiers.private || modifiers.public) {
                    var identifier = this.extract(parameter.identifier);
                    this.writeIndentSpaces();
                    this.write('this.'+identifier+' = '+identifier+';');
                    this.writeLineBreak();
                }
            }
        }
    }
};


HXDumper.prototype.dumpClassConstructor = function(element) {
    this.pushContext();

    this.writeIndentSpaces();

    var modifiers = this.modifiers(element);

    var previousThisPrefix = this.thisPrefix;
    this.thisPrefix = this.className;

    // Static?
    this.previousInStaticMethod = this.inStaticMethod;
    if (modifiers['static']) {
        this.write('static ');
        this.thisPrefix += ':@static';

        this.inStaticMethod = true;
    } else {
        this.inStaticMethod = false;
    }

    // Private or public?
    if (modifiers['private']) {
        this.write('private ');
    } else {
        this.write('public ');
    }

    this.write('function new');

    this.dumpCallSignature(element.callSignature);

    if (element.block) {
        this.write(' {');
        this.writeLineBreak();
        this.indent++;
        this.pushContext();

        // Add class assignments from constructor signature
        this.dumpClassPropertiesAssignmentsFromConstructor(element);

        // Save output in case we need to add closures
        var previousOutput;
        if (!this.inClosure) {
            previousOutput = this.output;
            this.output = '';
            this.hasClosures = false;
        }

        // Function body
        if (element.block.statements) {
            this.dumpStatements(element.block.statements);
        }

        // Restore output
        if (!this.inClosure) {
            var statementsOutput = this.output;
            this.output = previousOutput;
            if (this.hasClosures) {
                // If the statements contain any closure, add __this binding
                this.writeIndentedLine('var __this = this;');
            }
        }

        // Add statements output
        this.write(statementsOutput);

        this.popContext();
        this.indent--;
        this.writeIndentedLine('}');
    }
    this.writeLineBreak();

    this.thisPrefix = previousThisPrefix;

    this.inStaticMethod = this.previousInStaticMethod;

    this.popContext();
};


HXDumper.prototype.dumpClassMethod = function(element) {
    this.pushContext();

    this.writeIndentSpaces();

    var modifiers = this.modifiers(element);

    var previousThisPrefix = this.thisPrefix;
    this.thisPrefix = this.className;

    // Override?
    if (modifiers['override']) {
        this.write('override ');
    }

    // Inline?
    if (modifiers['inline']) {
        this.write('inline ');
    }

    // Static?
    this.previousInStaticMethod = this.inStaticMethod;
    if (modifiers['static']) {
        this.write('static ');
        this.thisPrefix += ':@static';

        this.inStaticMethod = true;
    } else {
        this.inStaticMethod = false;
    }

    // Private or public?
    if (modifiers['private']) {
        this.write('private ');
    } else {
        this.write('public ');
    }

    this.write('function ');

    if (element.getKeyword) {
        this.write('get_');
    }
    else if (element.setKeyword) {
        this.write('set_');
    }

    this.write(this.extract(element.propertyName));

    this.dumpCallSignature(element.callSignature);

    // Type
    if (element.callSignature.typeAnnotation && element.callSignature.typeAnnotation.type) {
        var type = this.type(element.callSignature.typeAnnotation.type);
        if (type) {
            this.write(':'+type);
        }
    } else if (element.setKeyword) {
        if (element.callSignature.parameterList.parameters.length > 0) {
            var type = this.type(element.callSignature.parameterList.parameters[0].typeAnnotation.type);
            if (type) {
                this.write(':'+type);
            }
        }
    }

    if (element.block) {
        this.write(' {');
        this.writeLineBreak();
        this.indent++;
        this.pushContext();

        // Save output in case we need to add closures
        var previousOutput;
        if (!this.inClosure) {
            previousOutput = this.output;
            this.output = '';
            this.hasClosures = false;
        }

        // Function body
        if (element.block.statements) {
            this.dumpStatements(element.block.statements);
        }

        // Restore output
        if (!this.inClosure) {
            var statementsOutput = this.output;
            this.output = previousOutput;
            if (this.hasClosures) {
                // If the statements contain any closure, add __this binding
                this.writeIndentedLine('var __this = this;');
            }
        }

        // Add statements output
        this.write(statementsOutput);

        // Add setter return if needed
        if (element.setKeyword) {
            if (element.callSignature.parameterList.parameters.length > 0) {
                var name = element.callSignature.parameterList.parameters[0].identifier;
                if (name) {
                    this.writeIndentedLine('return '+this.extract(name)+';');
                }
            }
        }

        this.inStaticMethod = this.previousInStaticMethod;

        this.popContext();
        this.indent--;
        this.writeIndentedLine('}');
    }
    this.writeLineBreak();

    this.thisPrefix = previousThisPrefix;

    this.popContext();
};


HXDumper.prototype.dumpTypeParameterList = function(parameterList) {
    this.write('<');

    if (parameterList.typeParameters) {
        var len = parameterList.typeParameters.length;
        for (var i = 0; i < len; i++) {
            var input = parameterList.typeParameters[i];

            this.dumpValue(input);

            if (input.constraint) {
                if (input.constraint.extendsKeyword) {
                    this.write(':');
                }
                if (input.constraint.typeOrExpression) {
                    this.dumpValue(input.constraint.typeOrExpression);
                }
            }

            if (i < len - 1) {
                this.write(', ');
            }
        }
    }

    this.write('>');
};


HXDumper.prototype.dumpStatements = function(statements, dontFinishWithLineBreak) {
    var len = statements.length;
    for (var i = 0; i < len; i++) {
        var statement = statements[i];

        this.writeIndentSpaces();
        this.dumpValue(statement);
        if (!dontFinishWithLineBreak || i < len - 1) {
            this.writeLineBreak();
        }
    }
};


HXDumper.prototype.dumpCallSignature = function(signature) {
    if (signature.parameterList) {
        this.write('(');

        if (signature.parameterList.parameters) {
            this.dumpArguments(signature.parameterList.parameters);
        }

        this.write(')');
    }
};


HXDumper.prototype.dumpPropertyAssignments = function(assignments) {
    var len = assignments.length;
    for (var i = 0; i < len; i++) {
        var assign = assignments[i];
        this.writeIndentSpaces();
        this.dumpValue(assign.propertyName);
        this.write(': ');
        this.dumpValue(assign.expression);
        if (i < len - 1) {
            this.write(',');
        }
        this.writeLineBreak();
    }
};


HXDumper.prototype.dumpValue = function(input, options) {
    if (input.cachedText) {
        if (this.inClosure && input.cachedText === 'this' && !this.inStaticMethod) {
            this.write('__this');
        } else if (this.className && this.inStaticMethod && input.cachedText === 'this') {
            this.write(this.className);
        } else if (input.cachedText === 'String') {
            this.write('Std.string');
        } else if (input.cachedText === 'parseInt') {
            this.write('Std.parseInt');
        } else if (input.cachedText === 'parseFloat') {
            this.write('Std.parseFloat');
        } else if (input.cachedText === 'undefined') {
            this.write('null');
        } else {
            this.write(input.cachedText);
        }
    }
    else if (input.enumKeyword) {
        this.write('enum ');
        this.dumpValue(input.identifier);
        this.write(' {');
        this.indent++;
        if (input.enumElements) {
            var len = input.enumElements.length;
            for (var i = 0; i < len; i++) {
                this.writeLineBreak();
                this.writeIndentSpaces();
                var el = input.enumElements[i];
                this.dumpValue(el.propertyName);
                this.write(';');
            }
        }
        this.indent--;
        this.writeLineBreak();
        this.write('}');
        this.writeLineBreak();
    }
    else if (input.firstSemicolonToken && input.forKeyword) {
        if (input.variableDeclaration) {
            this.dumpVariableDeclaration(input.variableDeclaration);
            this.write(';');
            this.writeLineBreak();
            this.writeIndentSpaces();
        }
        if (input.initializer) {
            this.dumpValue(input.initializer);
            this.write(';');
            this.writeLineBreak();
            this.writeIndentSpaces();
        }
        this.write('while (');
        this.dumpCondition(input.condition);
        this.write(') ');
        var statement = _.clone(input.statement);
        if (!statement.openBraceToken) {
            this.write('{');
            this.indent++;
            this.pushContext();
            this.writeLineBreak();
            this.writeIndentSpaces();
        }
        statement.extraBottomStatement = input.incrementor;
        this.dumpValue(statement);
        if (!statement.closeBraceToken) {
            this.indent--;
            this.popContext();
            this.writeLineBreak();
            this.writeIndentSpaces();
            this.write('}');
        }
    }
    else if ((!options || !options.ignoreCondition) && this.isCondition(input)) {
        this.dumpCondition(input);
    }
    else if (input.operatorToken && this.extract(input.operatorToken) === 'instanceof') {
        this.write('Std.is(');
        this.dumpValue(input.left);
        this.write(', ');
        this.dumpValue(input.right);
        this.write(')');
    }
    else if (input.tryKeyword) {
        this.write('try ');
        this.dumpValue(input.block);
        if (input.catchClause) {
            this.write(' ');
            var hasNonDynamicType = false;
            var type = null;
            if (input.catchClause.typeAnnotation) {
                type = this.type(input.catchClause.typeAnnotation.type);
                if (type !== 'Dynamic') {
                    hasNonDynamicType = true;
                }
            }
            if (hasNonDynamicType) {
                this.write('catch (__'+this.extract(input.catchClause.identifier)+':Dynamic) ');
                var block = _.clone(input.catchClause.block);
                block.extraTopStatement = {
                    cachedText: ('var ' + this.extract(input.catchClause.identifier)
                        + ':' + type
                        + ' = cast(__' + this.extract(input.catchClause.identifier) + ', ' + type + ')')
                };
                this.dumpValue(block);
            }
            else {
                this.write('catch ('+this.extract(input.catchClause.identifier)+':Dynamic) ');
                this.dumpValue(input.catchClause.block);
            }
        }
        if (input.finallyClause) {
            this.write(' ');
            this.write('finally ');
            this.dumpValue(input.finallyClause.block);
        }
    }
    else if (input.switchKeyword) {
        this.write('switch (');
        this.dumpValue(input.expression);
        this.write(') {');
        this.indent++;
        if (input.switchClauses) {
            var len = input.switchClauses.length;
            var hasStartedCase = false;
            for (var i = 0; i < len; i++) {
                var clause = input.switchClauses[i];
                if (!hasStartedCase) {
                    this.writeLineBreak();
                    this.writeIndentSpaces();
                    if (clause.caseKeyword) {
                        this.write('case ');
                        this.dumpValue(clause.expression);
                    } else {
                        this.write('default');
                    }
                    hasStartedCase = true;
                }
                else {
                    this.write(', ');
                    this.dumpValue(clause.expression);
                }
                if (clause.statements && clause.statements.length) {
                    this.write(':');
                    var statements = [];
                    var len2 = clause.statements.length;
                    for (var j = 0; j < len2; j++) {
                        var statement = clause.statements[j];
                        if (statement.breakKeyword) {
                            hasStartedCase = false;
                        } else {
                            statements.push(statement);
                        }
                    }
                    this.writeLineBreak();
                    this.indent++;
                    this.pushContext();
                    this.dumpStatements(statements, true);
                    this.popContext();
                    this.indent--;
                }
            }
        }
        this.indent--;
        this.writeLineBreak();
        this.writeIndentSpaces();
        this.write('}')
    }
    else if (input.deleteKeyword && input.expression && input.expression.expression && (input.expression.argumentExpression || input.expression.name)) {
        this.write('Reflect.deleteField(');
        this.dumpValue(input.expression.expression);
        this.write(', ');
        if (input.expression.argumentExpression) {
            this.dumpValue(input.expression.argumentExpression);
        } else {
            this.write('\'');
            this.dumpValue(input.expression.name);
            this.write('\'');
        }
        this.write(')');
    }
    else if (this.isReferencingStructureOrArrayKey(input) && !input.canBeDumpedAsArrayKeyReference) {
        if (this.isReferencingStructureKeyWithString(input)) {
            var arg = this.extract(input.argumentExpression);
            var id = arg.substring(1, arg.length-1);
            input = _.clone(input);
            delete input.argumentExpression;
            delete input.openBracketToken;
            delete input.closeBracketToken;
            input.dotToken = {cachedText: '.'};
            input.identifier = {cachedText: id};
            this.dumpValue(input);
        }
        else if (this.isPerformingArrayAccessWithInteger(input)) {
            input = _.clone(input);
            input.canBeDumpedAsArrayKeyReference = true;
            this.dumpValue(input);
        }
        else if (this.isPerformingArrayAccess(input)) {
            input = _.clone(input);
            input.canBeDumpedAsArrayKeyReference = true;
            if (!this.isPerformingArrayAccessWithIntegerIdentifier(input)) {
                input.shouldBeDumpedAsCastedArrayKeyReference = true;
            }
            this.dumpValue(input);
        }
        else {
            var obj = this.value(input.expression);
            var key = this.value(input.argumentExpression);
            this.write('Ts2Hx.getValue('+obj+', '+key+')');
        }
    }
    else if (this.isReferencingStructureOrArrayKeyAssignment(input) && !input.canBeDumpedAsArrayKeyReference) {
        if (input.left && this.isPerformingArrayAccessWithInteger(input.left)) {
            input = _.clone(input);
            input.canBeDumpedAsArrayKeyReference = true;
            this.dumpValue(input);
        }
        else if (input.left && this.isPerformingArrayAccess(input.left)) {
            input = _.clone(input);
            input.canBeDumpedAsArrayKeyReference = true;
            if (!this.isPerformingArrayAccessWithIntegerIdentifier(input)) {
                input.shouldBeDumpedAsCastedArrayKeyReference = true;
            }
            this.dumpValue(input);
        }
        else {
            var obj = this.value(input.left.expression);
            var key = this.value(input.left.argumentExpression);
            var val = this.value(input.right);
            this.write('Ts2Hx.setValue('+obj+', '+key+', '+val+')');
        }
    }
    else if (this.isExpressionInParens(input)) {
        this.write(this.extract(input.openParenToken));
        this.dumpValue(input.expression);
        this.write(this.extract(input.closeParenToken));
    }
    else {
        if (input.returnKeyword) {
            this.write('return ');
        }
        if (input.throwKeyword) {
            this.write('throw ');
        }
        if (input.newKeyword) {
            this.write('new ');
        }
        if (input.continueKeyword) {
            this.write('continue');
        }
        if (input.breakKeyword) {
            this.write('break');
        }
        if (input.whileKeyword) {
            if (input.doKeyword) {
                this.write('do');
            } else {
                this.write('while ');
            }
        }
        if (input.forKeyword) {
            this.write('for ');
        }
        if (input.equalsGreaterThanToken && input.callSignature) {
            this.hasClosures = true;
            this.write('function');
        }
        else if (input.functionKeyword) {
            this.write('function');
            if (input.identifier) {
                this.write(' ');
                this.write(this.extract(input.identifier));
            }
        }
        if (this.inInterface && input.propertyName) {
            if (input.callSignature) {
                this.write('public function ');
            } else {
                this.write('public var ');
            }
        }
        if (input.propertyName) {
            this.write(this.extract(input.propertyName));
        }
        if (input.callSignature) {
            this.dumpCallSignature(input.callSignature);

            if (input.callSignature.typeAnnotation) {
                var type = this.type(input.callSignature.typeAnnotation.type);
                if (type) {
                    this.write(':'+type);
                }
            }

            if (!this.inInterface) {
                this.write(' ');
            }
        }
        if (input.equalsGreaterThanToken && !input.callSignature) {
            this.write(' => ');
        }
        if (input.block) {
            if (input.equalsGreaterThanToken && input.callSignature) {
                if (!this.inClosure) {
                    this.inClosure = true;
                    this.dumpValue(input.block);
                    this.inClosure = false;
                } else {
                    this.dumpValue(input.block);
                }
            }
            else {
                this.dumpValue(input.block);
            }
            if (input.identifier && input.functionKeyword) {
                this.writeLineBreak();
            }
        }
        if (input.openBraceToken) {
            this.write('{');
            this.indent++;
            this.pushContext();
            this.writeLineBreak();
        }
        if (input.extraTopStatement) {
            this.writeIndentSpaces();
            this.dumpValue(input.extraTopStatement);
            this.write(';');
            this.writeLineBreak();
        }
        if (input.typeMembers) {
            this.dumpTypeMembers(input.typeMembers);
        }
        if (input.propertyAssignments) {
            this.dumpPropertyAssignments(input.propertyAssignments);
        }
        if (input.elseKeyword) {
            this.write('else');
        }
        if (input.ifKeyword) {
            this.write('if ');
        }
        if (!input.doKeyword) {
            if (input.openParenToken) {
                this.write('(');
            }
            if (input.condition) {
                this.dumpCondition(input.condition);
            }
        }
        if (input.variableDeclaration) {
            if (input.forKeyword && input.inKeyword) {
                var variableDeclarators = input.variableDeclaration.variableDeclarators;
                if (!variableDeclarators && input.variableDeclaration.variableDeclarator) {
                    variableDeclarators = [input.variableDeclaration.variableDeclarator];
                }

                if (variableDeclarators.length > 0) {
                    var declarator = variableDeclarators[0];

                    // Property name
                    var name = this.extract(declarator.propertyName);
                    this.write(name);
                }
            } else {
                this.dumpVariableDeclaration(input.variableDeclaration);
            }
        }
        if (input.lessThanToken && input.type && input.greaterThanToken) {
            this.write('cast(');
        }
        if (input.type && !input.lessThanToken && !input.greaterThanToken) {
            this.write(this.type(input.type));
        }
        if (input.questionToken) {
            this.write('?');
        }
        if (input.left) {
            this.dumpValue(input.left);
        }
        if (input.operand) {
            if (input.operatorToken && input.operand._fullStart > input.operatorToken._fullStart) {
                this.write(this.extract(input.operatorToken));
            }
            this.dumpValue(input.operand);
        }
        if (input.inKeyword) {
            this.write(' in ');
        }
        if (input.underlyingToken) {
            this.write(this.extract(input.underlyingToken));
        }
        if (input.expression) {
            if (input.forKeyword && input.inKeyword) {
                this.write('Reflect.fields(');
                this.dumpValue(input.expression);
                this.write(')');
            } else if (input.expression.expression && this.extract(input.expression.expression) === 'console') {
                if (input.expression.dotToken && this.extract(input.expression.name) === 'log') {
                    this.write('trace');
                } else {
                    this.dumpValue(input.expression);
                }
            } else if (input.expression.expression && this.extract(input.expression.expression) === 'JSON') {
                if (input.expression.dotToken) {
                    this.write('haxe.Json.' + this.extract(input.expression.name));
                } else {
                    this.dumpValue(input.expression);
                }
            } else {
                var expression = this.extract(input.expression);
                if (expression === 'setTimeout' || expression === 'setInterval' || expression === 'clearTimeout' || expression === 'clearInterval') {
                    this.write('Ts2Hx.'+expression);
                } else {
                    this.dumpValue(input.expression);
                }
            }
        }
        if (input.dotToken) {
            this.write(this.extract(input.dotToken));
        }
        if (input.operatorToken) {
            var value = this.extract(input.operatorToken);
            if (value === ',') {
                this.write(', ');
            } else if (input.operand) {
                if (input.operand._fullStart < input.operatorToken._fullStart) {
                    this.write(value);
                }
            } else {
                this.write(' '+value+' ');
            }
        }
        if (input.identifier && !input.functionKeyword) {
            this.write(this.extract(input.identifier));
        }
        if (input.name) {
            this.write(this.extract(input.name));
        }
        if (input.typeParameterList) {
            this.dumpTypeParameterList(input.typeParameterList);
        }
        if (input.right) {
            this.dumpValue(input.right);
        }
        if (input.openBracketToken) {
            this.write(this.extract(input.openBracketToken));
        }
        if (input.argumentExpression) {
            if (input.shouldBeDumpedAsCastedArrayKeyReference) {
                this.write('cast(');
                this.dumpValue(input.argumentExpression);
                this.write(', Int)');
            } else {
                this.dumpValue(input.argumentExpression);
            }
        }
        if (input.expressions) {
            this.dumpExpressions(input.expressions);
        }
        if (input.closeBracketToken) {
            this.write(this.extract(input.closeBracketToken));
        }
        if (input.argumentList) {
            if (input.argumentList.openParenToken) {
                this.write(this.extract(input.argumentList.openParenToken));
            }
            if (input.argumentList.arguments) {
                this.dumpArguments(input.argumentList.arguments);
            }
            if (input.argumentList.closeParenToken) {
                this.write(this.extract(input.argumentList.closeParenToken));
            }
        }
        if (input.typeAnnotation) {
            if (input.typeAnnotation.colonToken) {
                this.write(':');
                if (input.typeAnnotation.type) {
                    this.write(this.type(input.typeAnnotation.type));
                }
            }
        }
        if (input.equalsValueClause) {
            if (input.equalsValueClause.equalsToken) {
                this.write(' = ');

                if (input.equalsValueClause.value) {
                    this.dumpValue(input.equalsValueClause.value);
                }
            }
        }
        if (input.closeParenToken && !input.doKeyword) {
            this.write(')');
        }
        if (input.statement) {
            this.write(' ');
            this.dumpValue(input.statement);
        }
        if (input.statements) {
            this.dumpStatements(input.statements);
        }
        if (input.greaterThanToken && input.type && input.greaterThanToken) {
            this.write(', ');
            this.write(this.type(input.type));
            this.write(')');
        }
        if (input.extraBottomStatement) {
            if (input.closeBraceToken) {
                this.writeIndentSpaces();
                this.dumpValue(input.extraBottomStatement);
                this.write(';');
                this.writeLineBreak();
            } else {
                this.write(';');
                this.writeLineBreak();
                this.writeIndentSpaces();
                this.dumpValue(input.extraBottomStatement);
            }
        }
        if (input.closeBraceToken) {
            this.indent--;
            this.popContext();
            this.writeIndentSpaces();
            this.write('}');
        }
        if (input.elseClause) {
            this.write(' ');
            this.dumpValue(input.elseClause);
        }
        if (input.doKeyword && input.whileKeyword) {
            this.write(' while ');
            if (input.openParenToken) {
                this.write('(');
            }
            if (input.condition) {
                this.dumpCondition(input.condition);
            }
            if (input.closeParenToken) {
                this.write(')');
            }
        }
        if (input.semicolonToken) {
            this.write(';');
        }
    }
};


HXDumper.prototype.isCondition = function(input) {
    if (input.left && input.right && input.operatorToken) {
        var operator = this.extract(input.operatorToken);
        if (operator === '===' || operator === '!==' || operator === '!=' || operator === '==' || operator === '>' || operator === '<' || operator === '>=' || operator === '<=') {
            return true;
        }
    }
    return false;
};


HXDumper.prototype.dumpCondition = function(condition) {

    // Convert strict operators
    var operator = null;
    var hasStrictOperator = true;
    if (condition.operatorToken) {
        operator = this.extract(condition.operatorToken);
        if (operator === '===') {
            condition = _.clone(condition);
            condition.operatorToken = { cachedText: '==' };
        }
        else if (operator === '!==') {
            condition = _.clone(condition);
            condition.operatorToken = { cachedText: '!=' };
        }
        else if (operator === '!=' || operator === '==') {
            hasStrictOperator = false;
        }
    }

    // Check the argument expression
    if (!condition.right) {
        var arg = null;
        var conditionWithoutOperator = null;
        if (operator === '!' && condition.operand) {
            conditionWithoutOperator = _.clone(condition);
            delete conditionWithoutOperator.operatorToken;
            arg = this.value(conditionWithoutOperator, {ignoreCondition: true});
        } else {
            arg = this.value(condition, {ignoreCondition: true});
        }
        arg = this.removeParens(arg);

        if (this.isIdentifier(arg, true)) {
            var type = this.contextType(arg);
            if (type != null) {
                if (type === 'Bool') {
                    return this.dumpValue(condition, {ignoreCondition: true});
                }
                else if (type === 'Int' || type === 'Float') {
                    if (operator === '!') {
                        this.write('(');
                        this.write(arg);
                        this.write(' == 0 || ');
                        this.write(arg);
                        this.write(' != ');
                        this.write(arg);
                        this.write(')');
                    } else {
                        this.write('(');
                        this.write(arg);
                        this.write(' != 0 && ');
                        this.write(arg);
                        this.write(' == ');
                        this.write(arg);
                        this.write(')');
                    }
                    return;
                }
                else if (type === 'String') {
                    if (operator === '!') {
                        this.write('(');
                        this.write(arg);
                        this.write(' != null && ');
                        this.write(arg);
                        this.write('.length > 0');
                        this.write(')');
                    } else {
                        this.write('(');
                        this.write(arg);
                        this.write(' == null || ');
                        this.write(arg);
                        this.write('.length == 0');
                        this.write(')');
                    }
                    return;
                }
                else if (type === 'Dynamic') {
                    if (operator === '!') {
                        this.write('!');
                    }
                    this.write('Ts2Hx.isTrue(');
                    this.write(arg);
                    this.write(')');
                    return;
                }
                else {
                    if (operator === '!') {
                        return this.dumpValue({
                            left: { cachedText: arg },
                            operatorToken: { cachedText: '==' },
                            right: { cachedText: 'null' }
                        }, {ignoreCondition: true});
                    } else {
                        return this.dumpValue({
                            left: { cachedText: arg },
                            operatorToken: { cachedText: '!=' },
                            right: { cachedText: 'null' }
                        }, {ignoreCondition: true});
                    }
                }
            } else {
                if (operator === '!') {
                    this.write('!');
                }
                this.write('Ts2Hx.isTrue(');
                this.write(arg);
                this.write(')');
                return;
            }
        } else {
            if (operator === '!') {
                this.write('!');
            }
            if (this.isFunctionCall(condition)) {
                this.write(arg);
            } else {
                this.write('Ts2Hx.isTrue(');
                this.write(arg);
                this.write(')');
            }
            return;
        }
    } else {
        if (hasStrictOperator) {
            return this.dumpValue(condition, {ignoreCondition: true});
        } else {
            var right = this.removeParens(this.value(condition.right));
            if (right === 'null') {
                return this.dumpValue({
                    left: condition.left,
                    operatorToken: condition.operatorToken,
                    right: { cachedText: 'null' }
                }, {ignoreCondition: true});
            } else {
                if (operator === '!=') {
                    this.write('!');
                }
                this.write('Ts2Hx.areEqual(');
                this.dumpValue(condition.left);
                this.write(', ');
                this.dumpValue(condition.right);
                this.write(')');
            }
            return;
        }
    }

    return this.dumpValue(condition, {ignoreCondition: true});
};


HXDumper.prototype.isExpressionInParens = function(input) {
    var numberOfKeys = 0;
    if (input.openParenToken && input.expression && input.closeParenToken) {
        for (var key in input) {
            if (input[key]) numberOfKeys++;
        }
        return numberOfKeys === 3;
    }
    return false;
};


HXDumper.prototype.removeParens = function(input) {
    while (input.length > 2 && input.charAt(0) === '(' && input.charAt(input.length-1) === ')') {
        input = input.substr(1, input.length-2);
    }
    return input;
};


HXDumper.prototype.isReferencingStructureOrArrayKey = function(input) {
    if (input.openBracketToken && input.closeBracketToken && input.argumentExpression) {
        return true;
    }
    return false;
};


HXDumper.prototype.isReferencingStructureOrArrayKeyAssignment = function(input) {
    if (input.left && input.operatorToken && input.right) {
        if (this.extract(input.operatorToken) === '=') {
            if (this.isReferencingStructureOrArrayKey(input.left) && !this.isReferencingStructureKeyWithString(input.left) && !this.isPerformingArrayAccessWithInteger(input.left)) {
                return true;
            }
        }
    }
    return false;
};


HXDumper.prototype.isReferencingStructureKeyWithString = function(input) {
    if (input.openBracketToken && input.closeBracketToken && input.argumentExpression) {
        var arg = this.extract(input.argumentExpression);
        if (arg != null && arg.length > 3) {
            if (arg.charAt(arg.length-1) == arg.charAt(0))
            if (arg.charAt(0) == '\'' || arg.charAt(0) == '"') {
                var id = arg.substring(1, arg.length-1);
                if (this.isIdentifier(id)) {
                    return true;
                }
            }
        }
    }
    return false;
};


HXDumper.prototype.isPerformingArrayAccessWithInteger = function(input) {
    if (input.openBracketToken && input.closeBracketToken && input.argumentExpression) {
        var arg = this.extract(input.argumentExpression);
        if (this.isInteger(arg)) {
            return true;
        }
    }
    return false;
};


HXDumper.prototype.isPerformingArrayAccess = function(input) {
    if (input.openBracketToken && input.closeBracketToken && input.argumentExpression) {
        // Check the argument expression
        var arg = this.value(input.argumentExpression);
        if (this.isIdentifier(arg, true)) {
            var type = this.contextType(arg);
            if (type === 'Int' || type === 'Float') {
                return true;
            }
        }

        // Check the subject type
        var subject = this.value(input.expression);
        if (this.isIdentifier(subject, true)) {
            var type = this.contextType(subject);
            if (type != null && type.substring(0, 6) === 'Array<') {
                return true;
            }
        }
    }
    return false;
};


HXDumper.prototype.isPerformingArrayAccessWithIntegerIdentifier = function(input) {
    if (input.openBracketToken && input.closeBracketToken && input.argumentExpression) {
        // Check the argument expression
        var arg = this.value(input.argumentExpression);
        if (this.isIdentifier(arg)) {
            var type = this.contextType(arg);
            if (type === 'Int') {
                return true;
            }
        }
    }
    return false;
};


HXDumper.prototype.dumpExpressions = function(expressions) {
    var len = expressions.length;

    for (var i = 0; i < len; i++) {
        var expr = expressions[i];
        this.dumpValue(expr);
        if (i < len - 1) {
            this.write(', ');
        }
    }
};


HXDumper.prototype.dumpTypeMembers = function(typeMembers) {
    var len = typeMembers.length;

    for (var i = 0; i < len; i++) {
        this.writeIndentSpaces();
        this.dumpValue(typeMembers[i]);

        this.write(';');

        this.writeLineBreak();
    }
};


HXDumper.prototype.dumpArguments = function(arguments) {
    var len = arguments.length;

    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        this.dumpValue(arg);
        if (i < len - 1) {
            this.write(', ');
        }
    }
};


HXDumper.prototype.dumpVariableDeclaration = function(element) {
    this.write('var ');

    var variableDeclarators = element.variableDeclarators;
    if (!variableDeclarators && element.variableDeclarator) {
        variableDeclarators = [element.variableDeclarator];
    }

    for (var i = 0; i < variableDeclarators.length; i++) {
        var declarator = variableDeclarators[i];

        // Property name
        var name = this.extract(declarator.propertyName);
        this.write(name);

        // Type
        var didComputeType = false;
        if (declarator.typeAnnotation && declarator.typeAnnotation.type) {
            var type = this.type(declarator.typeAnnotation.type);
            if (type != null) {
                this.addContextType(name, type);
                this.write(':'+type);
                didComputeType = true;
            }
        }

        // Assigned value
        if (declarator.equalsValueClause && declarator.equalsValueClause.value) {
            // Try to infer type from assignment if possible
            if (!didComputeType) {
                var type = this.typeFromValue(declarator.equalsValueClause.value);
                if (type != null) {
                    this.addContextType(name, type);
                    this.write(':'+type);
                    didComputeType = true;
                }
            }

            this.write(' = ');
            this.dumpValue(declarator.equalsValueClause.value);
        }

        if (i < variableDeclarators.length - 1) {
            this.write(', ');
        }
    }
};


HXDumper.prototype.type = function(input) {
    if (input.cachedText) {
        var rawType = input.cachedText;
        if (rawType === 'string') return 'String';
        if (rawType === 'integer' || rawType === 'int') return 'Int';
        if (rawType === 'bool' || rawType === 'boolean') return 'Bool';
        if (rawType === 'float' || rawType === 'number') return 'Float';
        if (rawType === 'void') return 'Void';
        if (rawType === 'any') return 'Dynamic';
        if (rawType === 'Array') return 'Array<Dynamic>';
        if (rawType === 'Function') return 'Dynamic';
        return rawType;
    }
    else if (input.left && input.dotToken && input.right) {
        return this.type(input.left) + '.' + this.type(input.right);
    }
    else if (input._fullSart && input._fullWidth) {
        return this.extract(input);
    }
    else if (input.name) {
        var typeName = this.type(input.name);
        if (input.typeArgumentList && input.typeArgumentList.typeArguments) {
            if (typeName === 'Array<Dynamic>') {
                typeName = 'Array';
            }
            typeName += '<';
            var len = input.typeArgumentList.typeArguments.length;
            for (var i = 0; i < len; i++) {
                typeName += this.type(input.typeArgumentList.typeArguments[i]);
                if (i < len - 1) {
                    typeName += ', ';
                }
            }
            typeName += '>';
        }
        return typeName;
    }
    else {
        return 'Dynamic';
    }
};


HXDumper.prototype.typeFromValue = function(input) {
    var value = this.removeParens(this.value(input));
    if (this.isHexaInteger(value) || this.isInteger(value)) {
        return 'Int';
    }
    else if (this.isFloat(value)) {
        return 'Float';
    }
    else if (this.isString(value)) {
        return 'String';
    }
    else if (this.isBool(value)) {
        return 'Bool';
    }
    else if (this.isArray(value)) {
        if (this.isArrayOfIntegers(value)) {
            return 'Array<Int>';
        }
        else if (this.isArrayOfFloats(value)) {
            return 'Array<Float>';
        }
        else if (this.isArrayOfBools(value)) {
            return 'Array<Bool>';
        }
        else if (this.isArrayOfStrings(value)) {
            return 'Array<String>';
        }
        return 'Array<Dynamic>';
    }
    else if (this.isIdentifier(value, true)) {
        return this.contextType(value);
    }
    else {
        var arrayAccessPrefix = this.arrayAccessPrefix(value);
        if (arrayAccessPrefix != null) {
            var arrayType = this.contextType(arrayAccessPrefix);
            if (arrayType.substring(0, 6) === 'Array<' && arrayType !== 'Array<Dynamic>') {
                // Get type from array value type
                return arrayType.substring(6, arrayType.length - 1);
            }
        }
    }
    return null;
};


HXDumper.prototype.extract = function(input) {
    if (input.cachedText) {
        return input.cachedText;
    }
    else if (input._fullSart && input._fullWidth) {
        return this.ast.text.value.substr(input._fullStart, input._fullWidth).trim();
    }
    return null;
};


HXDumper.prototype.writeIndentSpaces = function(steps) {
    this.write(this.indentSpaces(steps));
};


HXDumper.prototype.writeLineBreak = function() {
    this.write("\n");
};


HXDumper.prototype.writeIndentedLine = function(str) {
    this.writeIndentSpaces();
    this.write(str);
    this.writeLineBreak();
};


HXDumper.prototype.write = function(str) {
    this.output += str;
};


HXDumper.prototype.indentSpaces = function(steps) {
    if (steps == null) {
        steps = this.indent;
    }
    var spaces = '';
    for (var i = 0; i < steps; i++) {
        spaces += '    ';
    }
    return spaces;
};


HXDumper.prototype.modifiers = function(element) {
    var modifiers = {};

    // Explicit modifiers
    if (element.modifiers && element.modifiers.length) {
        for (var i = 0; i < element.modifiers.length; i++) {
            var rawModifier = element.modifiers[i];
            var modifier = this.extract(rawModifier);
            if (this.isIdentifier(modifier)) {
                modifiers[modifier] = 1;
            }
        }
    }

    // Modifiers as comment preceding signature/modifiers (not TypeScript compatible modifiers)
    var elementStart = -1;
    if (element.propertyName && element.propertyName._fullStart) {
        elementStart = element.propertyName._fullStart;
    }
    if (elementStart > 0) {
        var pos = elementStart;
        while (this.ast.text.value.charAt(pos) !== "\n" && pos > 0) {
            pos--;
        }
        var subject = this.ast.text.value.substring(pos, elementStart);
        startIndex = subject.indexOf('/*');
        endIndex = subject.indexOf('*/');
        if (startIndex !== -1 && endIndex > startIndex) {
            subject = subject.substring(startIndex+2, endIndex).trim();
            var keywords = subject.split(' ');
            for (var k = 0; k < keywords.length; k++) {
                var keyword = keywords[k];
                if (keyword === 'override') {
                    modifiers[keyword] = 1;
                }
                else if (keyword === 'inline') {
                    modifiers[keyword] = 1;
                }
            }
        }
    }

    return modifiers;
};


HXDumper.prototype.arrayAccessPrefix = function(input) {
    var len = input.length;
    var start = input.lastIndexOf('[')
    if (input.charAt(len-1) === ']' && start > 0) {
        return input.substring(0, start);
    }
    return null;
};


HXDumper.prototype.isIdentifier = function(str, acceptThis) {
    var lowerCase = str.toLowerCase();
    if (lowerCase === "true" || lowerCase === "false") {
        return false;
    }
    if (acceptThis) {
        return /^(this\.)?[a-zA-Z][a-zA-Z0-9]*$/.test(str);
    } else {
        return /^[a-zA-Z][a-zA-Z0-9]*$/.test(str);
    }
};


HXDumper.prototype.isFunctionCall = function(input) {
    if (input.argumentList || (input.expression && input.expression.argumentList)) {
        return true;
    }
    return false;
};


HXDumper.prototype.isInteger = function(str) {
    return /^[0-9]+$/.test(str);
};


HXDumper.prototype.isHexaInteger = function(str) {
    return /^0x[0-9a-fA-F]+$/.test(str);
};


HXDumper.prototype.isFloat = function(str) {
    return /^[0-9]*\.[0-9]+$/.test(str);
};


HXDumper.prototype.isString = function(str) {
    return /^"(?:[^"\\]|\\.)*"$/.test(str) || /^'(?:[^'\\]|\\.)*'$/.test(str);
};


HXDumper.prototype.isBool = function(str) {
    var lowerCase = str.toLowerCase();
    return lowerCase == 'true' || lowerCase == 'false';
};


HXDumper.prototype.isArray = function(str) {
    return str.length > 1 && str.charAt(0) === '[' && str.charAt(str.length-1) === ']';
};


HXDumper.prototype.isArrayOfIntegers = function(str) {
    return /^\[([0-9]+)?(\s*,\s*[0-9]+)*\]$/.test(str);
};


HXDumper.prototype.isArrayOfFloats = function(str) {
    return /^\[([0-9]*(\.[0-9]+)?)?(\s*,\s*[0-9]*(\.[0-9]+)?)*\]$/.test(str);
};


HXDumper.prototype.isArrayOfBools = function(str) {
    return /^\[(true|false)?(\s*,\s*(true|false))*\]$/i.test(str);
};


HXDumper.prototype.isArrayOfStrings = function(str) {
    return /^\[((?:"(?:[^"\\]|\\.)*")|(?:'(?:[^'\\]|\\.)*'))?(\s*,\s*((?:"(?:[^"\\]|\\.)*")|(?:'(?:[^'\\]|\\.)*')))*\]$/.test(str);
};


HXDumper.prototype.value = function(input, options) {
    var previousOutput = this.output;
    this.output = '';
    this.dumpValue(input, options);
    var value = this.output;
    this.output = previousOutput;
    return value;
};


// Export function
module.exports = function(source) {
    // Get typescript source as string
    source = String(source);

    // Convert it to JSON AST
    json = ts2json(source);

    // Uncomment to write JSON AST to disk. Useful for debug.
    //fs.writeFileSync(__dirname+'/example.json', JSON.stringify(json, null, 4));

    // Then compile the AST to Haxe code
    var result = new HXDumper(json).dump();

    // Return result
    return result;
};
