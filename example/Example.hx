package;

enum EnumExample {
    VALUE1;
    VALUE2;
    VALUE3;
    VALUE4;
    VALUE5;
}

interface InterfaceA {
    public var x:Float;
    public var y:Float;
    public var size:SizeInterface;
    public function onReady():Void;
}

interface SizeInterface {
    public var width:Float;
    public var height:Float;
}

interface InterfaceB {
}

interface InterfaceC extends InterfaceA extends InterfaceB {
}

@:generic
class GenericClassExample<T> {

    public var content:T;

    public function new(content:T) {
        this.content = content;
    }

}

@:generic
class GenericClassExample2<T:InterfaceA> {

    private var content:T;

    public function new(content:T) {
        this.content = content;
        this.content.onReady();
    }

}

class ClassExample implements InterfaceC {

    static public var staticString:String = 'static property string value';

    static private var staticInteger:Int = 4;

    static public var staticFloat:Float = 4.0;

    public var instanceFloat:Float = 3 + 3 * 3;

    private var instanceBooleanPrivate:Bool = false;

    public var instanceArrayOfIntegers:Array<Int> = [1, 2, 3, 4, 5, 6];

    public var instanceArrayOfFloats:Array<InterfaceB> = [];

    public var instanceBoolean(get, set):Bool;

    public function get_instanceBoolean():Bool {
        trace('Did call getter of instanceBoolean');
        return this.instanceBooleanPrivate;
    }

    public function set_instanceBoolean(value:Bool):Bool {
        trace('Did call setter of instanceBoolean with value: ' + value);
        this.instanceBooleanPrivate = value;
        return value;
    }

    public var version(get, never):String;

    public function get_version():String {
        return '1.0';
    }

    public var x:Float;

    public var y:Float;

    public var size:SizeInterface;

    private var ready:Dynamic;

    public function new(x:Float, y:Float, size:SizeInterface, enumValue:EnumExample, ready:Dynamic) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.ready = ready;
        var __this = this;
        Ts2Hx.setTimeout(function() {
            __this.onReady();
        }, 1000);
        switch (enumValue) {
            case EnumExample.VALUE1, EnumExample.VALUE2:
                trace('enum value is 1 or 2');
            case EnumExample.VALUE3:
                trace('enum value is 3');
            default:
                trace('enum value is ' + enumValue);
        }
        try {
            if (x < 0) {
                throw 'x should be positive';
            } else if (y < 0) {
                throw 'y should be positive';
            }
        } catch (__e:Dynamic) {
            var e:String = cast(__e, String);
            trace("catched error: " + e);
        }
        var jsonValue:Dynamic = haxe.Json.parse('{"a":1, "b": ["c", "d", "e"]}');
        trace(jsonValue);
        var jsonString:String = haxe.Json.stringify(jsonValue);
        trace('JSON string: ' + jsonString);
        if (Ts2Hx.isTrue(jsonValue)) {
            trace('JSON value exists');
            if (Std.is(jsonValue, Array)) {
                trace("JSON value is an Array");
            } else {
                trace("JSON value is not an Array");
            }
        }
        if ((jsonString == null || jsonString.length == 0)) {
            trace('JSON string is not empty');
        } else {
            trace('JSON string is empty');
        }
        if (this.version == '1.0') {
            trace('Strict equality check passes');
        } else {
            trace('Strict equality doesn\'t pass');
        }
        if (Ts2Hx.areEqual(this.version, 1.0)) {
            trace('Non-strict equality check passes');
        } else {
            trace('Non-strict equality doesn\'t pass');
        }
        if (size != null) {
            trace('size is defined');
        } else {
            trace('size is undefined');
        }
        if (jsonValue != null) {
            for (key in Reflect.fields(jsonValue)) {
                trace('JSON key: ' + key);
                trace('JSON value: ' + Ts2Hx.get(jsonValue, key));
            }
        }
        var i1:Int = 0;
        while (i1 < 5) {
            trace("while iteration #" + i1);
            i1++;
        }
        var i2:Int = 6;
        do {
            trace("do-while iteration #" + i2);
        } while (i2-- > 0);
        var i3:Int = 0, len:Int = 12;
        while (i3 < len) {
            trace("for iteration #" + i3);
            i3++;
        }
        var i4:Int = 10;
        while (i4 >= 0) {
            if (i4 == 7) {
                i4--;
                trace("continue");
                continue;
            } else if (i4 == 3) {
                trace("break");
                break;
            }
            trace("for iteration #" + i4);
            i4--;
        }
        var dict:Dynamic = {
        };
        dict.key1 = 'val1';
        dict.key2 = 'val2';
        dict.key3 = 'val3';
        dict.subDict = {
            subKey1: 'subVal1',
            subKey2: 'subVal2'
        };
        Ts2Hx.set(dict, 'composed_' + this.version, 'valV');
        Ts2Hx.set(dict, this.version, 'test');
        trace('Dict:');
        trace(dict);
        Reflect.deleteField(dict, 'key2');
        Reflect.deleteField(dict, 'key3');
        var list:Array<Dynamic> = [1, 2, 3];
        list[1] = 'hello';
        var listIndex:Int = 0;
        list[listIndex] = 2;
        list.push(42);
        trace(list);
        var arrayValue1:Int = this.instanceArrayOfIntegers[0];
        var arrayValue2 = list[1];
        var arrayOfStrings:Array<String> = ['a', 'b', 'c'];
        var arrayOfStrings2:Array<String> = ['a', "b", 'c\'cc'];
        var arrayOfStrings3:Array<String> = ["a"];
        var array4:Array<Dynamic> = ["a", 4];
        var arrayOfInts:Array<Int> = [1, 2, 34543, 4];
        var arrayOfFloats:Array<Float> = [1, 2, 34543.0, 4];
        var arrayOfFloats2:Array<Float> = [1.43, 2.235, 34543.543, 4.0];
        var arrayOfAny:Array<Dynamic> = [1.43, 2.235, {
            a: 'b'
        }, 4.0];
    }

    public function onReady() {
        if (this.ready != null) {
            this.ready();
            this.ready = null;
        }
    }

}

class ClassExampleSubclass extends ClassExample {

    private var additionalProperty:String;

    public function new() {
        super(0, 0, null, EnumExample.VALUE1, function() {
            trace("Subclass received ready callback");
        });
    }

}

