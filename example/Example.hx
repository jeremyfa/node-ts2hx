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

}

class ClassExampleSubclass extends ClassExample {

    private var additionalProperty:String;

    public function new() {
        super(0, 0, null, EnumExample.VALUE1, function() {
            trace("Subclass received ready callback");
        });
    }

}


//# lineMapping=3,2,4,3,5,4,6,5,7,6,8,7,11,10,12,11,13,12,14,13,15,14,16,15,18,17,19,18,20,19,21,20,23,22,24,22,26,24,27,24,30,26,32,28,34,28,38,31,41,33,43,35,45,35,47,36,50,39,52,41,54,44,56,47,58,49,60,52,62,55,64,58,66,61,68,64,70,64,72,65,73,66,75,70,77,71,78,72,81,76,83,76,85,77,87,81,89,81,91,81,93,81,95,80,100,84,101,85,102,88,103,90,104,92,105,93,106,95,107,97,108,98,109,103,110,104,111,106,112,108,113,109,115,112,117,116,118,118,119,120,120,121,121,124,122,125,123,127,125,128,126,129,127,132,128,133,129,134,130,135,131,138,132,139,133,142,134,143,135,144,136,145,137,146,138,147,139,150,140,151,141,152,142,153,143,154,144,162,145,163,146,164,147,165,148,166,149,169,150,170,151,171,152,172,153,173,154,176,155,177,156,178,157,179,158,180,159,184,160,187,161,189,162,191,163,192,164,193,165,196,166,197,167,198,168,200,169,203,170,206,171,207,172,208,173,209,174,212,175,211,176,213,177,212,178,214,179,217,180,216,181,218,182,219,183,220,185,222,186,224,188,226,189,227,190,217,191,228,192,231,193,231,194,233,195,236,196,238,197,240,198,242,199,243,200,244,203,253,204,254,205,257,206,260,207,263,208,265,209,269,210,270,211,272,212,276,213,280,214,281,215,285,216,286,217,287,218,288,219,289,220,290,221,291,222,292,223,292,224,292,228,295,230,296,231,297,232,298,233,299,235,301,237,303,239,306,241,308,242,309,243,310,244,311,247,314