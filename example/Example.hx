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

    static public function circInOut(t:Float):Float {
        return t <= .5 ? (Math.sqrt(1 - t * t * 4) - 1) / -2 : (Math.sqrt(1 - (t * 2 - 2) * (t * 2 - 2)) + 1) / 2;
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
        Ts2Hx.forEach(['item1', 'item2'], function(value) {
            trace(value);
        });
        Ts2Hx.forEach(['item1', 'item2'], function(value, i, theArray) {
            trace(i + ' -> ' + value + ' (in array: ' + theArray + ')');
        });
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
        var jsonValue:Dynamic = Ts2Hx.JSONparse('{"a":1, "b": ["c", "d", "e"]}');
        trace(jsonValue);
        var jsonString:String = Ts2Hx.JSONstringify(jsonValue);
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
                trace('JSON value: ' + Ts2Hx.getValue(jsonValue, key));
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
        Ts2Hx.setValue(dict, 'composed_' + this.version, 'valV');
        Ts2Hx.setValue(dict, this.version, 'test');
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

    public function anotherMethod(someArgument:Int):Void {
        if (this.instanceArrayOfIntegers[someArgument] > 2) {
            trace('Some log');
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


//# lineMapping=3,5,4,6,5,7,6,8,7,9,8,10,11,13,12,14,13,15,14,16,15,17,16,18,18,20,19,21,20,22,21,23,23,25,24,25,26,27,27,27,30,29,32,31,34,31,38,34,41,36,43,38,45,38,47,39,50,42,52,44,54,47,56,50,58,52,60,55,62,58,64,61,66,64,68,67,70,67,71,68,72,69,75,73,76,74,77,75,81,79,83,79,84,80,87,84,88,86,91,90,93,90,95,90,97,90,99,89,105,93,106,94,107,97,108,99,109,101,110,102,111,104,112,106,113,107,114,112,115,113,116,115,117,117,118,118,120,121,122,125,123,127,124,129,125,130,126,133,127,134,128,136,130,137,131,138,132,141,133,142,134,143,135,144,136,147,137,148,138,151,139,152,140,153,141,154,142,155,143,156,144,159,145,160,146,161,147,162,148,163,149,171,150,172,151,173,152,174,153,175,154,178,155,179,156,180,157,181,158,182,159,185,160,186,161,187,162,188,163,189,164,193,165,196,166,198,167,200,168,201,169,202,170,205,171,206,172,207,173,209,174,212,175,215,176,216,177,217,178,218,179,221,180,220,181,222,182,221,183,223,184,226,185,225,186,227,187,228,188,229,190,231,191,233,193,235,194,236,195,226,196,237,197,240,198,240,199,242,200,245,201,247,202,249,203,251,204,252,205,253,208,262,209,263,210,266,211,269,212,272,213,274,214,278,215,279,216,281,217,285,218,289,219,290,220,294,221,295,222,296,223,297,224,298,225,299,226,300,227,301,228,301,229,301,232,304,233,305,234,306,235,307,236,308,239,311,240,312,241,313,242,314,245,316,247,318,249,321,251,323,252,324,253,325,254,326,257,329