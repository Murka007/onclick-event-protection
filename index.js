(function() {

    const button = document.getElementById("btn");
    const checksContainer = document.getElementById("checks-container");
    const shuffleToggle = document.getElementById("toggleShuffle");

    const isShuffle = !!JSON.parse(localStorage.getItem("isShuffle"));
    shuffleToggle.checked = isShuffle;
    shuffleToggle.onchange = function(event) {
        localStorage.setItem("isShuffle", event.target.checked);
    }
    
    // Copies of methods, so Object.defineProperty will have less power
    const CopyProxy = window.Proxy;
    const CopyReflect = window.Reflect;
    const CopyError = window.Error;
    const CopyFunction = window.Function;
    
    const CopyObject = window.Object;
    const CopyEvent = window.Event;
    const CopyUIEvent = window.UIEvent;
    const CopyMouseEvent = window.MouseEvent;
    const CopyPointerEvent = window.PointerEvent;

    const CopyObjectString = CopyObject.prototype.toString;
    const CopyFunctionString = CopyFunction.prototype.toString;
    
    const ObjectKeys = CopyObject.keys;
    const ObjectValues = CopyObject.values;
    const ObjectEntries = CopyObject.entries;
    
    const getOwnPropertyNames = CopyObject.getOwnPropertyNames;
    const getOwnPropertySymbols = CopyObject.getOwnPropertySymbols;
    const getOwnPropertyDescriptor = CopyObject.getOwnPropertyDescriptor;
    const getOwnPropertyDescriptors = CopyObject.getOwnPropertyDescriptors;
    const ReflectGetOwnPropertyDescriptor = CopyReflect.getOwnPropertyDescriptor;
    
    const prepareStackTrace = CopyError.prepareStackTrace;
    const dispatchEvent = document.body.dispatchEvent;
    const ObjectFunction = "[object Function]";
    const StringObject = "function Object() { [native code] }";

    const ObjectMouseEvent = "[object MouseEvent]";
    const ObjectPointerEvent = "[object PointerEvent]";
    const ClassPointerEvent = "#<PointerEvent>";

    const StringMouseEvent = `function MouseEvent() {\n    [native code]\n}`;
    const StringPointerEvent = "function PointerEvent() { [native code] }";
    
    // slice polyfill, to prevent from hooking String.prototype.slice
    // doesn't work for negative numbers
    function slice(string, start, end) {
        let output = "";
        for (let i=0;i<string.length;i++) {
            if (i >= start && i < end) {
                output += string[i];
            }
        }
        return output;
    }
    
    // indexOf polyfill, to prevent from hooking String.prototype.indexOf
    function indexOf(string, substring, fromIndex = 0) {
        if (substring === "") {
            if (fromIndex > string.length) return string.length;
            if (fromIndex < 0) return 0;
            return fromIndex;
        }
        if (substring.length >= string.length) return substring === string ? 0 : -1;

        for (let i = fromIndex; i < string.length; i++) {
            if (substring[0] !== string[i] || substring[substring.length - 1] !== string[i + substring.length - 1]) {
                continue;
            }

            let foundSubstring = true;
            for (let j = 1; j < substring.length - 1; j++) {
                if (substring[j] !== string[i + j]) {
                    foundSubstring = false;
                    break;
                }
            }

            if (!foundSubstring) continue;
            return i;
        }
        return -1;
    }

    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
    
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]
            ];
        }
        return array;
    }

    function toString1(value) {
        return value.toString();    
    }

    function toString2(value) {
        const error = new CopyError(value).stack;
        return slice(error, 7, indexOf(error, "\n    at"));
    }

    function toString3(value) {
        try {
            value in 0;
        } catch (error) {
            const stack = error.stack;
            const index1 = indexOf(stack, "'", 40) + 1;
            const index2 = indexOf(stack, "' in 0");
            return slice(stack, index1, index2);
        }
    }

    function toString4(value) {
        return CopyFunctionString.call(value);
    }

    function toString5(value) {
        return CopyObjectString.call(value);
    }

    // Check if browser supports Error.prototype.stack;
    const StackSupport = toString2(CopyObject) === StringObject && toString3(CopyObject) === StringObject;
    function checkString(method, value, strings) {
        const result = strings.some(str => method(value) === str);
        if (method === toString2 || method === toString3) {
            return !StackSupport || result;
        }
        return result;
    }

    // 3 different ways to get descriptors
    function getDescriptors(object, key) {
        const d1 = getOwnPropertyDescriptor;
        const d2 = getOwnPropertyDescriptors;
        const d3 = ReflectGetOwnPropertyDescriptor;
        const descriptors = [];
        if (exist(d1)) descriptors[descriptors.length] = d1(object, key);
        if (exist(d2)) descriptors[descriptors.length] = d2(object)[key];
        if (exist(d3)) descriptors[descriptors.length] = d3(object, key);
        return descriptors;
    }

    function exist(value) {
        return typeof value !== "undefined";
    }

    function has(object, key) {
        return (typeof object === "object") && (key in object) && object.hasOwnProperty(key);
    }

    function arrayEquals(arr1, arr2) {
        return arr1.length === arr2.length && arr1.every((value, i) => value === arr2[i]);
    }
    
    button.onclick = function(event) {

        while (checksContainer.firstChild) {
            checksContainer.firstChild.remove();
        }

        // Again, we make Object.defineProperty suck
        const CopyConstructor = event.constructor;
        const CopyProto = event.__proto__;
        const CopyProtoConstructor = CopyProto.constructor;
        const ConstructorArray = [CopyObject, CopyEvent, CopyUIEvent, CopyMouseEvent, CopyPointerEvent];

        const checks = [
            {
                name: "event instanceof ConstructorArray",
                test() {
                    const expected1 = [true, true, true, true, true];
                    const expected2 = [true, true, true, true, false];
                    const test = ConstructorArray.map(value => (event instanceof value));
                    return arrayEquals(test, expected1) || arrayEquals(test, expected2);
                }
            },
            {
                name: "CopyConstructor instanceof ConstructorArray",
                test() {
                    const expected = [true, false, false, false, false];
                    const test = ConstructorArray.map(value => (CopyConstructor instanceof value));
                    return arrayEquals(test, expected);
                }
            },
            {
                name: "CopyProto instanceof ConstructorArray",
                test() {
                    const expected1 = [true, true, true, true, false];
                    const expected2 = [true, true, true, false, false]; // firefox support
                    const test = ConstructorArray.map(value => (CopyProto instanceof value));
                    return arrayEquals(test, expected1) || arrayEquals(test, expected2);
                }
            },
            {
                name: "CopyProtoConstructor instanceof ConstructorArray",
                test() {
                    const expected = [true, false, false, false, false];
                    const test = ConstructorArray.map(value => (CopyProtoConstructor instanceof value));
                    return arrayEquals(test, expected);
                }
            },
            {
                name: "event === ConstructorArray",
                test() {
                    const expected = [false, false, false, false, false];
                    const test = ConstructorArray.map(value => (event === value));
                    return arrayEquals(test, expected);
                }
            },
            {
                name: "CopyConstructor === ConstructorArray",
                test() {
                    const expected1 = [false, false, false, false, true];
                    const expected2 = [false, false, false, true, false]; // firefox support
                    const test = ConstructorArray.map(value => (CopyConstructor === value));
                    return arrayEquals(test, expected1) || arrayEquals(test, expected2);
                }
            },
            {
                name: "CopyProto === ConstructorArray",
                test() {
                    const expected = [false, false, false, false, false];
                    const test = ConstructorArray.map(value => (CopyProto === value));
                    return arrayEquals(test, expected);
                }
            },
            {
                name: "CopyProtoConstructor === ConstructorArray",
                test() {
                    const expected1 = [false, false, false, false, true];
                    const expected2 = [false, false, false, true, false]; // firefox support
                    const test = ConstructorArray.map(value => (CopyProtoConstructor === value));
                    return arrayEquals(test, expected1) || arrayEquals(test, expected2);
                }
            },
            {
                name: "Constructors shouldn't equal each other",
                test() {
                    for (const value of ConstructorArray) {
                        const list = ConstructorArray.slice();
                        list.splice(list.indexOf(value), 1);
                        const equals = list.every(item => item === value);
                        if (equals) return false;
                    }
                    return true;
                }
            },
            {
                name: "delete event.isTrusted",
                test() {
                    const prev = event.isTrusted;
                    const deleteError = !(delete event.isTrusted);
                    return deleteError && event.isTrusted === prev;
                }
            },
            {
                name: "event.isTrusted assignment check",
                test() {
                    const prev = event.isTrusted;
                    event.isTrusted = null;
                    return event.isTrusted === prev;
                }
            },
            {
                name: "event.isTrusted === true",
                test() {
                    return event.isTrusted === true;
                }
            },
            {
                name: "Check for isTrusted descriptors",
                test() {
                    const descriptors = getDescriptors(event, "isTrusted");
                    return descriptors.every(desc => {
                        const setter = has(desc, "set") && desc.set === undefined;
                        const getter = has(desc, "get") && typeof desc.get === "function";
                        return setter && getter;
                    })
                }
            },
            {
                name: "delete event.__proto__",
                test() {
                    const prev = event.__proto__;
                    delete event.__proto__;
                    return event.__proto__ === prev;
                }
            },
            {
                name: "CopyConstructor and CopyProtoConstructor 1 argument required check",
                test() {
                    try {
                        new CopyConstructor();
                        new CopyProtoConstructor();
                    } catch(err) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "CopyConstructor and CopyProtoConstructor 'new' operator check",
                test() {
                    try {
                        CopyConstructor({});
                        CopyProtoConstructor({});
                    } catch(err) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "CopyConstructor and CopyProtoConstructor dispatchEvent check",
                test() {
                    try {
                        dispatchEvent(new CopyConstructor({}));
                        dispatchEvent(new CopyProtoConstructor({}));
                    } catch(err) {
                        return false;
                    }
                    return true;
                }
            },
            {
                name: "ObjectKeys(event).length === 1",
                test() {
                    return ObjectKeys(event).length === 1;
                }
            },
            {
                name: "ObjectValues(event).length === 1",
                test() {
                    return !exist(ObjectValues) || ObjectValues(event).length === 1;
                }
            },
            {
                name: "ObjectEntries(event).length === 1",
                test() {
                    return !exist(ObjectEntries) || ObjectEntries(event).length === 1;
                }
            },
            {
                name: "getOwnPropertyNames(event).length === 1",
                test() {
                    return !exist(getOwnPropertyNames) || getOwnPropertyNames(event).length === 1;
                }
            },
            {
                name: "getOwnPropertySymbols(event).length === 0",
                test() {
                    return !exist(getOwnPropertySymbols) || getOwnPropertySymbols(event).length === 0;
                }
            },
            {
                name: "ObjectKeys(getOwnPropertyDescriptors(event)).length === 1",
                test() {
                    return !exist(getOwnPropertyDescriptors) || ObjectKeys(getOwnPropertyDescriptors(event)).length === 1;
                }
            },
            {
                name: "toString1(event) === ObjectPointerEvent",
                test() {
                    return checkString(toString1, event, [ObjectMouseEvent, ObjectPointerEvent]);
                }
            },
            {
                name: "toString1(CopyConstructor) === StringPointerEvent",
                test() {
                    return checkString(toString1, CopyConstructor, [StringMouseEvent, StringPointerEvent]);
                }
            },
            {
                name: "toString1(CopyProto) === ObjectPointerEvent",
                test() {
                    return checkString(toString1, CopyProto, [ObjectMouseEvent, ObjectPointerEvent]);
                }
            },
            {
                name: "toString1(CopyProtoConstructor) === StringPointerEvent",
                test() {
                    return checkString(toString1, CopyProtoConstructor, [StringMouseEvent, StringPointerEvent]);
                }
            },
            
            {
                name: "toString2(event) === ObjectPointerEvent",
                test() {
                    return checkString(toString2, event, [ObjectPointerEvent]);
                }
            },
            {
                name: "toString2(CopyConstructor) === StringPointerEvent",
                test() {
                    return checkString(toString2, CopyConstructor, [StringPointerEvent]);
                }
            },
            {
                name: "toString2(CopyProto) === ObjectPointerEvent",
                test() {
                    return checkString(toString2, CopyProto, [ObjectPointerEvent]);
                }
            },
            {
                name: "toString2(CopyProtoConstructor) === StringPointerEvent",
                test() {
                    return checkString(toString2, CopyProtoConstructor, [StringPointerEvent]);
                }
            },
            
            {
                name: "toString3(event) === ClassPointerEvent",
                test() {
                    return checkString(toString3, event, [ClassPointerEvent]);
                }
            },
            {
                name: "toString3(CopyConstructor) === StringPointerEvent",
                test() {
                    return checkString(toString3, CopyConstructor, [StringPointerEvent]);
                }
            },
            {
                name: "toString3(CopyProto) === ClassPointerEvent",
                test() {
                    return checkString(toString3, CopyProto, [ClassPointerEvent]);
                }
            },
            {
                name: "toString3(CopyProtoConstructor) === StringPointerEvent",
                test() {
                    return checkString(toString3, CopyProtoConstructor, [StringPointerEvent]);
                }
            },
            
            {
                name: "toString4(CopyConstructor) === StringPointerEvent",
                test() {
                    return checkString(toString4, CopyConstructor, [StringMouseEvent, StringPointerEvent]);
                }
            },
            {
                name: "toString4(CopyProtoConstructor) === StringPointerEvent",
                test() {
                    return checkString(toString4, CopyProtoConstructor, [StringMouseEvent, StringPointerEvent]);
                }
            },

            {
                name: "toString5(event) === ObjectPointerEvent",
                test() {
                    return checkString(toString5, event, [ObjectMouseEvent, ObjectPointerEvent]);
                }
            },
            {
                name: "toString5(CopyConstructor) === ObjectPointerEvent",
                test() {
                    return checkString(toString5, CopyConstructor, [ObjectFunction]);
                }
            },
            {
                name: "toString5(CopyProto) === ObjectPointerEvent",
                test() {
                    return checkString(toString5, CopyProto, [ObjectMouseEvent, ObjectPointerEvent]);
                }
            },
            {
                name: "toString5(CopyProtoConstructor) === ObjectPointerEvent",
                test() {
                    return checkString(toString5, CopyProtoConstructor, [ObjectFunction]);
                }
            },
            
            {
                name: "prepareStackTrace === undefined",
                test() {
                    return prepareStackTrace === undefined;
                }
            },
            {
                name: "Error.prepareStackTrace descriptors",
                test() {
                    const descriptors = getDescriptors(Error, "prepareStackTrace");
                    return descriptors.every(value => value === undefined);
                }
            },
            {
                name: "toString2(prepareStackTrace) === ''",
                test() {
                    return checkString(toString2, prepareStackTrace, ['']);
                }
            },
            {
                name: "toString3(prepareStackTrace) === 'undefined'",
                test() {
                    return checkString(toString3, prepareStackTrace, ['undefined']);
                }
            },
            {
                name: "toString4(prepareStackTrace) check",
                test() {
                    try {
                        toString4(prepareStackTrace);
                    } catch(err) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "toString5(prepareStackTrace) === '[object Undefined]'",
                test() {
                    return toString5(prepareStackTrace) === '[object Undefined]';
                }
            }
        ];

        // Shuffle array of tests, to make hooks not depend on each other
        if (shuffleToggle.checked) shuffle(checks);

        // Count is important, we want to be sure that all checks are Passed
        let count = 0;
        for (let i=0;i<checks.length;i++) {
            const check = checks[i];
            let isNative = null;
            try {
                isNative = check.test();
            } catch (err) {console.log(err.stack);}

            const elem = document.createElement("div");
            elem.classList.add("check");
            elem.classList.add(isNative ? "native" : "fake");
            elem.textContent = (i + 1 + " ") + (isNative ? "Passed: " : "Failed: ") + check.name;
            checksContainer.appendChild(elem);
            if (isNative) count++;
        }

        const isOK = count === checks.length;
        const elem = document.createElement("div");
        elem.style.fontSize = "25px";
        elem.classList.add("check");
        elem.classList.add(isOK ? "native" : "fake");
        elem.textContent = "Click event is " + (isOK ? "Trusted!!!" : "FAKE!!!");
        checksContainer.appendChild(elem);

        // Tada, you have passed all checks
        // Event is real or it's well hidden
    }
    
    // I will click it for you :)
    button.click();

})();
