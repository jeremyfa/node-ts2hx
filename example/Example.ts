
enum EnumExample {
    VALUE1,
    VALUE2,
    VALUE3,
    VALUE4,
    VALUE5
}

interface InterfaceA {
    x: number;
    y: number;
    size: SizeInterface;
    onReady():void;
}

interface SizeInterface {
    width: number;
    height: number;
}

interface InterfaceB {}

interface InterfaceC extends InterfaceA, InterfaceB {}

class GenericClassExample<T> {

    constructor(public content:T) {
        // Content will be saved as property
    }
}

class GenericClassExample2<T extends InterfaceA> {

    constructor(private content:T) {
        // Content will be saved as property
        this.content.onReady();
    }
}

class ClassExample implements InterfaceC {

    // Static property, string
    static staticString:string = 'static property string value';

    // Private static property, inferred integer
    private static staticInteger = 4;
    // Explicitly public static property, inferred float
    public static staticFloat = 4.0;

    // Public property, explicit number (float)
    public instanceFloat:number = 3 + 3 * 3;

    // Private property, boolean
    private instanceBooleanPrivate:boolean = false;

    // Public property, inferred array of integers
    public instanceArrayOfIntegers = [1, 2, 3, 4, 5, 6];

    // Public property, explicit array of floats
    public instanceArrayOfFloats:Array<InterfaceB> = [];

    // Getter example
    public get instanceBoolean():boolean {
        console.log('Did call getter of instanceBoolean');
        return this.instanceBooleanPrivate;
    }

    // Setter example
    public set instanceBoolean(value:boolean) {
        console.log('Did call setter of instanceBoolean with value: '+value);
        this.instanceBooleanPrivate = value;
    }

    // Getter without setter example
    public get version():string {
        return '1.0';
    }

    // Example with ternary operator
    public static circInOut(t:number):number
    {
        return t <= .5 ? (Math.sqrt(1 - t * t * 4) - 1) / -2 : (Math.sqrt(1 - (t * 2 - 2) * (t * 2 - 2)) + 1) / 2;
    }

    // Constructor with parameters that become properties
    constructor(public x:number, public y:number, public size:SizeInterface, enumValue:EnumExample, private ready:Function) {

        // Example of closure in setTimeout()
        setTimeout(() => {
            // 'this' keyword inside closure is
            // the same as the parent context class
            this.onReady();
        }, 1000);

        // Foreach example over array
        ['item1', 'item2'].forEach(function(value) {
            console.log(value);
        });

        // Foreach example over array with more arguments
        ['item1', 'item2'].forEach(function(value, i, theArray) {
            console.log(i + ' -> ' + value + ' (in array: ' + theArray + ')');
        });

        // Example of switch, on enum
        // In haxe, fall-through cases will be merged in one
        // and break occurences will be removed
        switch (enumValue) {
            case EnumExample.VALUE1:
            case EnumExample.VALUE2:
                console.log('enum value is 1 or 2');
                break;
            case EnumExample.VALUE3:
                console.log('enum value is 3');
                break;
            default:
                console.log('enum value is '+enumValue);
        }

        // Try/catch example
        try {
            // Condition example
            if (x < 0) {
                // Throw example
                throw 'x should be positive';
            }
            else if (y < 0) {
                // Throw example
                throw 'y should be positive';
            }

        } catch (e:string) {
            console.log("catched error: "+e);
        }

        // JSON example
        var jsonValue:any = JSON.parse('{"a":1, "b": ["c", "d", "e"]}');
        console.log(jsonValue);
        var jsonString:string = JSON.stringify(jsonValue);
        console.log('JSON string: '+jsonString);

        // Single value condition
        if (jsonValue) {
            console.log('JSON value exists');

            // Instanceof example
            if (jsonValue instanceof Array) {
                console.log("JSON value is an Array");
            } else {
                console.log("JSON value is not an Array");
            }
        }

        // Single value condition on string variable
        if (jsonString) {
            console.log('JSON string is not empty');
        } else {
            console.log('JSON string is empty');
        }

        // Strict equality example
        // Note:
        //   Comparing 2 incompatible types
        //   may cause compilation errors in haxe.
        //   However, this is the most efficient way
        //   to compare two variables of the same types
        if (this.version === '1.0') {
            console.log('Strict equality check passes');
        } else {
            console.log('Strict equality doesn\'t pass');
        }

        // Non-strict equality example
        if (this.version == 1.0) {
            console.log('Non-strict equality check passes');
        } else {
            console.log('Non-strict equality doesn\'t pass');
        }

        // Check if variable is defined
        if (size != null) {
            console.log('size is defined');
        } else {
            console.log('size is undefined');
        }

        // 'undefined' keyword is also valid,
        // even though it is equivalent to null in haxe
        if (jsonValue != undefined) {

            // Iterate over json keys
            for (var key:string in jsonValue) {
                // Log key
                console.log('JSON key: ' + key);
                // Log value (using brackets access)
                console.log('JSON value: ' + jsonValue[key]);
            }
        }

        // Iterate using while
        var i1 = 0;
        while (i1 < 5) {
            console.log("while iteration #"+i1);

            // Single-operand operators are
            // valid: n++, ++n, n-- etc...
            i1++;
        }

        // Iterate using do while
        var i2 = 6;
        do {
            console.log("do-while iteration #"+i2);
        } while (i2-- > 0);

        // Iterate with for
        for (var i3 = 0, len = 12; i3 < len; i3++) {
            console.log("for iteration #"+i3);
        }

        // Iterate with for with continue/break example
        for (var i4 = 10; i4 >= 0; i4--) {
            if (i4 === 7) {
                i4--;
                console.log("continue");
                continue;
            }
            else if (i4 === 3) {
                console.log("break");
                break;
            }
            console.log("for iteration #"+i4);
        }

        // Initialize dictionary/object
        var dict:any = {};

        // Assign key using string
        dict['key1'] = 'val1';

        // Assign keys using identifier
        dict.key2 = 'val2';
        dict.key3 = 'val3';

        // Assign dict inside dict
        dict.subDict = {
            subKey1: 'subVal1',
            subKey2: 'subVal2'
        };

        // Assign composed key
        dict['composed_' + this.version] = 'valV';

        // Assign key using variable
        dict[this.version] = 'test';

        // Log dict
        console.log('Dict:');
        console.log(dict);

        // Delete key2 using identifier
        delete dict.key2;

        // Delete key3 using string
        delete dict['key3'];

        // Create array ('Array' type is equivalent to 'Array<any>')
        var list:Array = [1, 2, 3];

        // Replace value at index
        list[1] = 'hello';

        // Use index from existing variable
        var listIndex = 0;
        list[listIndex] = 2;

        // Add value
        list.push(42);

        // Log array
        console.log(list);

        // Get some value from arrays
        // (and see how type is inferred)
        var arrayValue1 = this.instanceArrayOfIntegers[0];
        var arrayValue2 = list[1];

        // Initialize various arrays to see how
        // it is compiled and how types are inferred
        var arrayOfStrings = ['a', 'b', 'c'];
        var arrayOfStrings2 = ['a', "b", 'c\'cc'];
        var arrayOfStrings3 = ["a"];
        var array4 = ["a", 4];
        var arrayOfInts = [1, 2, 34543, 4];
        var arrayOfFloats = [1, 2, 34543.0, 4];
        var arrayOfFloats2 = [1.43, 2.235, 34543.543, 4.0];
        var arrayOfAny = [1.43, 2.235, {a: 'b'}, 4.0];
    }

    onReady() {
        if (this.ready != null) {
            this.ready();
            this.ready = null;
        }
    }

    anotherMethod(someArgument:integer):void {
        if (this.instanceArrayOfIntegers[someArgument] > 2) {
            console.log('Some log');
        }
    }
}

// Example of inheritance
class ClassExampleSubclass extends ClassExample {

    private additionalProperty:string;

    constructor() {
        super(0, 0, null, EnumExample.VALUE1, function() {
            console.log("Subclass received ready callback");
        });
    }

}
