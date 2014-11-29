package;

class Ts2Hx {

    static private var _timeouts:Map<Int,haxe.Timer> = new Map<Int,haxe.Timer>();
    static private var _intervals:Map<Int,haxe.Timer> = new Map<Int,haxe.Timer>();
    static private var _nextTimerId:Int = 1;

    static public function getValue(obj:Dynamic, key:Dynamic):Dynamic {
        if (Std.is(obj, Array)) {
            return cast(obj, Array<Dynamic>)[Std.int(key)];
        } else {
            return Reflect.field(obj, cast(key, String));
        }
    }

    static public function setValue(obj:Dynamic, key:Dynamic, val:Dynamic):Dynamic {
        if (Std.is(obj, Array)) {
            cast(obj, Array<Dynamic>)[Std.int(key)] = val;
        } else {
            Reflect.setField(obj, cast(key, String), val);
        }
        return val;
    }

    static public function isTrueInt(aInt:Int):Bool {
        return aInt != 0 && aInt == aInt;
    }

    static public function isTrueFloat(aFloat:Float):Bool {
        return aFloat != 0.0 && aFloat == aFloat;
    }

    static public function isTrueString(aString:String):Bool {
        return aString != null && aString.length > 0;
    }

    static public function isTrue(obj:Dynamic):Bool {
        return (Reflect.isObject(obj) && (!Std.is(obj, String) || cast(obj, String).length > 0))
            || (Std.is(obj, Bool) && cast(obj, Bool) == true)
            || (Std.is(obj, Int) && isTrueInt(cast(obj, Int)))
            || (Std.is(obj, Float) && isTrueFloat(cast(obj, Float)));
    }

    static public function areEqual(obj1:Dynamic, obj2:Dynamic):Bool {
        return obj1 == obj2;
    }

    static public function setTimeout(fn:Dynamic, delay:Int):Int {
        var timerId:Int = _nextTimerId++;
        var timer:haxe.Timer = new haxe.Timer(delay);
        _timeouts.set(timerId, timer);
        timer.run = function() {
            fn();
            timer.stop();
            _timeouts.remove(timerId);
        };
        return timerId;
    }

    static public function clearTimeout(id:Int):Void {
        if (_timeouts.exists(id)) {
            var timer:haxe.Timer = _timeouts.get(id);
            _timeouts.remove(id);
            timer.stop();
        }
    }

    static public function setInterval(fn:Dynamic, interval:Int):Int {
        var timerId:Int = _nextTimerId++;
        var timer:haxe.Timer = new haxe.Timer(interval);
        _intervals.set(timerId, timer);
        timer.run = fn;
        return timerId;
    }

    static public function clearInterval(id:Int):Void {
        if (_intervals.exists(id)) {
            var timer:haxe.Timer = _intervals.get(id);
            _intervals.remove(id);
            timer.stop();
        }
    }
}
