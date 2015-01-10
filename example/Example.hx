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

}

class ClassExampleSubclass extends ClassExample {

    private var additionalProperty:String;

    public function new() {
        super(0, 0, null, EnumExample.VALUE1, function() {
            trace("Subclass received ready callback");
        });
    }

}


//# lineMapping=3,2,4,3,5,4,6,5,7,6,8,7,11,10,12,11,13,12,14,13,15,14,16,15,18,17,19,18,20,19,21,20,23,22,24,22,26,24,27,24,30,26,32,28,34,28,38,31,41,33,43,35,45,35,47,36,50,39,52,41,54,44,56,47,58,49,60,52,62,55,64,58,66,61,68,64,70,64,71,65,72,66,75,70,76,71,77,72,81,76,83,76,84,77,87,81,88,83,91,87,93,87,95,87,97,87,99,86,105,90,106,91,107,94,108,96,109,98,110,99,111,101,112,103,113,104,114,109,115,110,116,112,117,114,118,115,120,118,122,122,123,124,124,126,125,127,126,130,127,131,128,133,130,134,131,135,132,138,133,139,134,140,135,141,136,144,137,145,138,148,139,149,140,150,141,151,142,152,143,153,144,156,145,157,146,158,147,159,148,160,149,168,150,169,151,170,152,171,153,172,154,175,155,176,156,177,157,178,158,179,159,182,160,183,161,184,162,185,163,186,164,190,165,193,166,195,167,197,168,198,169,199,170,202,171,203,172,204,173,206,174,209,175,212,176,213,177,214,178,215,179,218,180,217,181,219,182,218,183,220,184,223,185,222,186,224,187,225,188,226,190,228,191,230,193,232,194,233,195,223,196,234,197,237,198,237,199,239,200,242,201,244,202,246,203,248,204,249,205,250,208,259,209,260,210,263,211,266,212,269,213,271,214,275,215,276,216,278,217,282,218,286,219,287,220,291,221,292,222,293,223,294,224,295,225,296,226,297,227,298,228,298,229,298,232,301,233,302,234,303,235,304,236,305,239,307,241,309,243,312,245,314,246,315,247,316,248,317,251,320