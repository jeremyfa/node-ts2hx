ts2hx
=====

Compile/Transpile typescript code to **ready-to-run** haxe code.

### Why?

I really like **Haxe** (http://haxe.org) and **openFL** (http://openfl.org) projects but I couldn't find a proper Haxe IDE on Mac that could suit my needs. However, Typescript is officially supported on IDEs like **Webstorm** (even on Mac!), making it very convenient to use. Then came the idea of writing a Typescript to Haxe transpiler. Typescript got ECMAScript roots and static typing which are pretty similar to Haxe.

Using ``ts2hx``, I am able to compile a **pixi.js**-based (http://pixijs.com) HTML5 app written in Typescript and make it work at **almost native speed** on mobile devices with **openFL** CPP target (yes, it becomes possible to compile Typescript to C++!). The only code that needs to be re-written in Haxe is the platform-specific code (use **openFL** API instead of **pixi.js** etc...). If all the platform-specific code is properly encapsuled in reusable classes, the rest of the code (all the app logic) can become 100% portable and compilable to **valid haxe code**.

That said, keep in mind this project is still **experimental**.

## How to use

Install package

``npm install ts2hx``

Example

```javascript
var ts2hx = require('ts2hx');

// Compile typescript code
var haxeCode = ts2hx([
    "class FooClass {",
    "    constructor(public name:string) {",
    "        console.log('Hello, my name is '+this.name);",
    "    }",
    "}"
].join("\n"));

// Log haxe output
process.stdout.write(haxeCode);
```

Expected output:

```haxe
package;

class FooClass {

    public var name:String;

    public function new(name:String) {
        this.name = name;
        trace('Hello, my name is ' + this.name);
    }

}
```

## Command Line Interface

You can install the cli command:

``npm install -g ts2hx``

Then run it:

``ts2hx someFile.ts > result.hx``

You can also build a full directory of typescript files (recommended):

``ts2hx --typescript dir/to/typescript/files --destination dir/to/compiled/haxe/files``

When building a full directory, **ts2hx** will be able to perform additional tasks:

 - Add ``override`` keyword on methods overriding a parent class method (when the parent class is in the project)
 
 - Add in the final directory a support file ``Ts2Hx.hx`` required in some cases to make transpiled files work fine.
 
 - Replace some compiled files with original haxe files if needed (using ``--haxe`` option), allowing to use alternative implementations of specific classes in Haxe.


## Compilation rules

When compiling a typescript file, **ts2hx** performs conversions to make the haxe code behave the same as its typescript counterpart.

### Core types

**Typescript**

```typescript
var foo:number = 1;
var bar:string = "Hello";
var baz:boolean = true;
var qux:any = { some: 'values' };
```

**Haxe**

```haxe
var foo:Float = 1;
var bar:String = "Hello";
var baz:Bool = true;
var qux:Dynamic = { some: 'values' };
```

### Integers

The ``Int`` type doesn't exist in typescript. However, it is still possible to transpile ``number`` to ``Int`` when transpiling thanks to type inference or a custom typescript interface ``integer``.

#### Add the  ``integer`` type in typescript

Add a typescript definition file to your project (integer.d.ts)

```
interface integer extends number {}
```

You can then use ``integer`` in your typescript code while still manipulating numbers in compiled javascript:

**Typescript**

```typescript
var foo:integer;
var bar:number;
```

**Haxe**

```haxe
var foo:Int;
var bar:Float;
```

#### Integers by type inference

If you really don't want to use ``integer`` interface, you can still create haxe ``Int`` using type inference:

**Typescript**

```typescript
var foo = 1;
var bar = 1.0;
```

**Haxe**

```haxe
var foo:Int = 1;
var bar:Float = 1.0;
```

### Enum

**Typescript**

```typescript
enum EnumExample {
    VALUE1,
    VALUE2,
    VALUE3,
    VALUE4,
    VALUE5
}
```

**Haxe**

```haxe
enum EnumExample {
    VALUE1;
    VALUE2;
    VALUE3;
    VALUE4;
    VALUE5;
}
```

### Switchs

The ``break`` keyword in ``switch`` statements doesn't exist in haxe. Fall-through cases are converted to comma-separated cases.

**Typescript**

```typescript
switch (value) {
    case 1:
    case 2:
        console.log('value is 1 or 2');
        break;
    case 3:
        console.log('value is 3');
        break;
    default:
        console.log('value is '+value);
}
```

**Haxe**

```haxe
switch (value) {
    case 1, 2:
        trace('value is 1 or 2');
    case 3:
        trace('value is 3');
    default:
        trace('value is ' + value);
}
```

### Interfaces

**Typescript**

```typescript
interface MyInterface {
    x:number;
    y:number;
    foo():void;
}
```

**Haxe**

```haxe
interface MyInterface {
    public var x:Float;
    public var y:Float;
    public function foo():Void;
}
```

### Classes

Classes are properly converted, including typescript-specific features like getters/setters or properties in constructor signature.

**Typescript**

```typescript
class FooClass extends BarClass, BazClass implements QuxInterface {

    private prop1:number;
    static prop2:number = 0;

    constructor(public prop3:number) {
        this.prop1 = 0;
    }

    get prop4():number {
        return this.prop1 + FooClass.prop2;
    }

    set prop4(value:number) {
        this.prop1 = value - FooClass.prop3;
    }

}
```

**Haxe**

```haxe
class FooClass extends BarClass extends BazClass implements QuxInterface {

    private var prop1:Float;

    static public var prop2:Float = 0;

    public var prop3:Float;

    public function new(prop3:Float) {
        this.prop3 = prop3;
        this.prop1 = 0;
    }

    public var prop4(get, set):Float;

    public function get_prop4():Float {
        return this.prop1 + FooClass.prop2;
    }

    public function set_prop4(value:Float):Float {
        this.prop1 = value - FooClass.prop3;
        return value;
    }

}
```

### Generics

Typescript generics are converted to haxe generics. The ``@:generic`` macro is added automatically in haxe code.

**Typescript**

```typescript
class GenericClassExample<T> {

    constructor(content:T) {
    }
    
}

class GenericClassExample2<T extends InterfaceA> {

    constructor(private content:T) {
    }
}
```

**Haxe**

```haxe
@:generic
class GenericClassExample<T> {

    public function new(content:T) {
    }

}

@:generic
class GenericClassExample2<T:InterfaceA> {

    private var content:T;

    public function new(content:T) {
        this.content = content;
    }

}
```

### Closures

Typescript's double-arrow closures are converted to Haxe, ensuring ``this`` is still referencing the parent context.

**Typescript**

```typescript
class Foo {

    public name:string = 'Foo';

    constructor() {

        var someClosure = () => {
            this.name += ' Bar';
        }

    }
}
```

**Haxe**

```haxe
class Foo {

    public var name:String = 'Foo';

    public function new() {
        var __this = this;
        var someClosure = function() {
            __this.name += ' Bar';
        }
    }

}
```

### Logs

``console.log`` becomes ``trace``

**Typescript**

```typescript
console.log('hello');
```

**Haxe**

```haxe
trace('hello');
```

### setTimeout/setInterval

``setTimeout`` and ``setInterval`` are converted to ``Ts2Hx.setTimeout`` and ``Ts2Hx.setInterval`` (requires **Ts2Hx.hx** support file).

**Typescript**

```typescript
setTimeout(function() {}, 1000);
setInterval(function() {}, 1000);
```

**Haxe**

```haxe
Ts2Hx.setTimeout(function() {}, 1000);
Ts2Hx.setInterval(function() {}, 1000);
```

### Objects

Typescript objects are converted to haxe anonymous structures. The ``delete`` keyword and brackets access are converted to their closest equivalent in haxe (requires **Ts2Hx.hx** support file).

**Typescript**

```typescript
var dict:any = {
    foo: 'bar',
    baz: 'qux'
};
dict['foo'] = 'baz';
dict.baz = 1234;
dict['foo' + dict.foo] = 'qux';
delete dict.baz;
```

**Haxe**

```haxe
var dict:Dynamic = {
    foo: 'bar',
    baz: 'qux'
};
dict.foo = 'baz';
dict.baz = 1234;
Ts2Hx.setValue(dict, 'foo' + dict.foo, 'qux');
Reflect.deleteField(dict, 'baz');
```

### For loops with incrementor

``for`` loops with incrementor don't exist in haxe. They are converted to ``while`` loops.

**Typescript**

```typescript
for (var i = 0, len = 12; i < len; i++) {
    console.log("for iteration #"+i);
}
```

**Haxe**

```haxe
var i:Int = 0, len:Int = 12;
while (i < len) {
    trace("for iteration #" + i);
    i++;
}
```

### For loops over object

``for`` loops can be used to iterate over an object's keys.

**Typescript**

```typescript
for (var key:string in someObject) {
    console.log('key: ' + key);
    console.log('value: ' + someObject[key]);
}
```

**Haxe**

```haxe
for (key in Reflect.fields(someObject)) {
    trace('key: ' + key);
    trace('value: ' + Ts2Hx.getValue(someObject, key));
}
```

### More examples

You can find more examples in the ``examples/`` directory, such as ``try``/``catch``, ``do``/``while`` etc...


