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
    const CopyReflect = window.Reflect;
    const CopyError = window.Error;
    const CopyFunction = window.Function;
    const CopyObject = window.Object;
    const CopyEvent = window.Event;
    const CopyPointerEvent = window.PointerEvent;
    const CopyMouseEvent = window.MouseEvent;
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
    const ObjectFunction = "[object Function]";
    const StringObject = "function Object() { [native code] }";
    const ObjectPointerEvent = "[object PointerEvent]";
    const ClassPointerEvent = "#<PointerEvent>";
    const StringPointerEvent = "function PointerEvent() { [native code] }";

    // Firefox support
    const ObjectMouseEvent = "[object MouseEvent]"
    const StringMouseEvent = `function MouseEvent() {
    [native code]
}`;
    
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

    // Check if browser supports Error.prototype.stack;
    const StackSupport = toString2(CopyObject) === StringObject && toString3(CopyObject) === StringObject;

    function exist(value) {
        return typeof value !== "undefined";
    }
    
    button.onclick = function(event) {

        while (checksContainer.firstChild) {
            checksContainer.firstChild.remove();
        }

        // Again, we make Object.defineProperty suck
        const CopyConstructor = event.constructor;
        const CopyProto = event.__proto__;
        const CopyProtoConstructor = CopyProto.constructor;

        const checks = [
            {
                name: "event instanceof CopyObject",
                test() {
                    return event instanceof CopyObject;
                }
            },
            {
                name: "event instanceof CopyEvent",
                test() {
                    return event instanceof CopyEvent;
                }
            },
            {
                name: "event instanceof CopyPointerEvent",
                test() {
                    return event instanceof CopyPointerEvent || CopyConstructor === CopyMouseEvent;
                }
            },
            {
                name: "event instanceof CopyConstructor",
                test() {
                    return event instanceof CopyConstructor;
                }
            },
            {
                name: "event instanceof CopyProtoConstructor",
                test() {
                    return event instanceof CopyProtoConstructor;
                }
            },
            {
                name: "CopyConstructor instanceof CopyObject",
                test() {
                    return CopyConstructor instanceof CopyObject;
                }
            },
            {
                name: "CopyConstructor === CopyPointerEvent",
                test() {
                    return CopyConstructor === CopyPointerEvent || CopyConstructor === CopyMouseEvent;
                }
            },
            {
                name: "CopyObject !== CopyEvent",
                test() {
                    return CopyObject !== CopyEvent;
                }
            },
            {
                name: "CopyObject !== CopyPointerEvent",
                test() {
                    return CopyObject !== CopyPointerEvent;
                }
            },
            {
                name: "CopyEvent !== CopyPointerEvent",
                test() {
                    return CopyEvent !== CopyPointerEvent;
                }
            },
            {
                name: "delete event.isTrusted",
                test() {
                    return !(delete event.isTrusted);
                }
            },
            {
                name: "event.isTrusted === true",
                test() {
                    return event.isTrusted === true;
                }
            },
            {
                name: "Check for isTrusted getter",
                test() {
                    const getter = getOwnPropertyDescriptor(event, "isTrusted").get;
                    return typeof getter === "function";
                }
            },
            {
                name: "delete event.__proto__",
                test() {
                    return (delete event.__proto__);
                }
            },
            {
                name: "CopyProto === event.__proto__",
                test() {
                    return CopyProto === event.__proto__;
                }
            },
            {
                name: "CopyConstructor === CopyProtoConstructor",
                test() {
                    return CopyConstructor === CopyProtoConstructor;
                }
            },
            {
                name: "CopyObjectString.call(event) === '[object PointerEvent]'",
                test() {
                    const value = CopyObjectString.call(event);
                    return value === ObjectPointerEvent || value === ObjectMouseEvent;
                }
            },
            {
                name: "CopyObjectString.call(CopyConstructor) === '[object Function]'",
                test() {
                    return CopyObjectString.call(CopyConstructor) === ObjectFunction;
                }
            },
            {
                name: "CopyObjectString.call(CopyProtoConstructor) === '[object Function]'",
                test() {
                    return CopyObjectString.call(CopyProtoConstructor) === ObjectFunction;
                }
            },
            {
                name: "CopyFunctionString.call(CopyConstructor) === StringPointerEvent",
                test() {
                    const value = CopyFunctionString.call(CopyConstructor);
                    return value === StringPointerEvent || value === StringMouseEvent;
                }
            },
            {
                name: "CopyFunctionString.call(CopyProtoConstructor) === StringPointerEvent",
                test() {
                    const value = CopyFunctionString.call(CopyProtoConstructor);
                    return value === StringPointerEvent || value === StringMouseEvent;
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
                name: "toString1(event) === '[object PointerEvent]'",
                test() {
                    const value = toString1(event);
                    return value === ObjectPointerEvent || value === ObjectMouseEvent;
                }
            },
            {
                name: "toString1(CopyConstructor) === StringPointerEvent",
                test() {
                    const value = toString1(CopyConstructor);
                    return value === StringPointerEvent || value === StringMouseEvent;
                }
            },
            {
                name: "toString1(CopyProto) === '[object PointerEvent]'",
                test() {
                    const value = toString1(CopyProto);
                    return value === ObjectPointerEvent || value === ObjectMouseEvent;
                }
            },
            {
                name: "toString1(CopyProtoConstructor) === StringPointerEvent",
                test() {
                    const value = toString1(CopyProtoConstructor);
                    return value === StringPointerEvent || value === StringMouseEvent;
                }
            },
            {
                name: "toString2(event) === '[object PointerEvent]'",
                test() {
                    return !StackSupport || toString2(event) === ObjectPointerEvent;
                }
            },
            {
                name: "toString2(CopyConstructor) === StringPointerEvent",
                test() {
                    return !StackSupport || toString2(CopyConstructor) === StringPointerEvent;
                }
            },
            {
                name: "toString2(CopyProto) === '[object PointerEvent]'",
                test() {
                    return !StackSupport || toString2(CopyProto) === ObjectPointerEvent;
                }
            },
            {
                name: "toString2(CopyProtoConstructor) === StringPointerEvent",
                test() {
                    return !StackSupport || toString2(CopyProtoConstructor) === StringPointerEvent;
                }
            },
            {
                name: "toString3(event) === '#<PointerEvent>'",
                test() {
                    return !StackSupport || toString3(event) === ClassPointerEvent;
                }
            },
            {
                name: "toString3(CopyConstructor) === StringPointerEvent",
                test() {
                    return !StackSupport || toString3(CopyConstructor) === StringPointerEvent;
                }
            },
            {
                name: "toString3(CopyProto) === '#<PointerEvent>'",
                test() {
                    return !StackSupport || toString3(CopyProto) === ClassPointerEvent;
                }
            },
            {
                name: "toString3(CopyProtoConstructor) === StringPointerEvent",
                test() {
                    return !StackSupport || toString3(CopyProtoConstructor) === StringPointerEvent;
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
                name: "CopyConstructor and CopyProtoConstructor dispatchEvent check",
                test() {
                    try {
                        document.body.dispatchEvent(new CopyConstructor({}));
                        document.body.dispatchEvent(new CopyProtoConstructor({}));
                    } catch(err) {
                        return false;
                    }
                    return true;
                }
            },
            {
                name: "Error.prepareStackTrace check",
                test() {
                    const descriptors = getDescriptors(Error, "prepareStackTrace");
                    return descriptors.every(value => value === undefined);
                }
            }
        ];

        // Shuffle array of tests, to make hooks not depend on each other
        if (shuffleToggle.checked) shuffle(checks);

        // Count is important, we want to be sure that all checks are Passed
        let count = 0;
        for (const check of checks) {
            try {
                const isNative = check.test();
                const elem = document.createElement("div");
                elem.classList.add("check");
                elem.classList.add(isNative ? "native" : "fake");
                elem.textContent = (isNative ? "Passed: " : "Failed: ") + check.name;
                checksContainer.appendChild(elem);
                if (!isNative) return;
                count++;
            } catch (err) {
                console.log(err);
            }
        }

        if (count !== checks.length) return;
        const elem = document.createElement("div");
        elem.style.fontSize = "25px";
        elem.classList.add("check");
        elem.classList.add("native");
        elem.textContent = "Click event is Trusted!!!";
        checksContainer.appendChild(elem);

        // Tada, you have passed all checks
        // Event is real or it's well hidden
    }
    
    // I will click it for you :)
    button.click();

})();
