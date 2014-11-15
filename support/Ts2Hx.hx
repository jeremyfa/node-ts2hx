package;

class Ts2Hx {

    static private var _timeouts:Map<Int,haxe.Timer> = new Map<Int,haxe.Timer>();
    static private var _intervals:Map<Int,haxe.Timer> = new Map<Int,haxe.Timer>();
    static private var _nextTimerId:Int = 1;

    static public function get(obj:Dynamic, key:Dynamic):Dynamic {
        return (Std.is(obj, Array) ? cast(obj, Array<Dynamic>)[cast(key, Int)] : Reflect.field(obj, cast(key, String));
    }

    static public function set(obj:Dynamic, key:Dynamic, val:Dynamic):Dynamic {
        return (Std.is(obj, Array) ? cast(obj, Array<Dynamic>)[cast(key, Int)] = val : Reflect.setField(obj, cast(key, String), val);
    }

    static public function isTrueInt(aInt:Int) {
        return aInt != 0 && aInt == aInt;
    }

    static public function isTrueFloat(aFloat:Float) {
        return aFloat != 0.0 && aFloat == aFloat;
    }

    static public function isTrueString(aString:string) {
        return aString != null && aString.length > 0;
    }

    static public function isTrue(obj:Dynamic) {
        return (Std.isObject(obj) && (!Std.is(obj, String) || cast(aString, String).length > 0)) || (Std.is(obj, Bool) && cast(obj, Bool) == true) || (Std.is(obj, Int) && isTrueInt(cast(obj, Int)) || (Std.is(obj, Float) && isTrueFloat(cast(obj, Float)));
    }

    static public function areEqual(obj1:Dynamic, obj2:Dynamic) {
        return obj1 == obj2;
    }

    static public function setTimeout(fn:Dynamic->Dynamic, delay:Int):Int {
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
            var timer:haxe.Timer = _timers.get(id);
            _timeouts.remove(id);
            timer.stop();
        }
    }

    static public function setInterval(fn:Dynamic->Dynamic, interval:Int):Int {
        var timerId:Int = _nextTimerId++;
        var timer:haxe.Timer = new haxe.Timer(interval);
        _intervals.set(timerId, timer);
        timer.run = fn;
        return timerId;
    }

    static public function clearInterval(id:Int):Void {
        if (_intervals.exists(id)) {
            var timer:haxe.Timer = _timers.get(id);
            _intervals.remove(id);
            timer.stop();
        }
    }
}
