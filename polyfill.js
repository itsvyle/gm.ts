(function () {
    //https://dprox--lfny.repl.co/image?url=https%3A%2F%2Fstackoverflow.com%2Fquestions%2F11381673%2Fdetecting-a-mobile-browser
    window.isMobile = function () {
        var match = window.matchMedia || window.msMatchMedia;
        if (match) {
            var mq = match("(pointer:coarse)");
            return mq.matches;
        }
        return false;
    };
    // =========================== IMPORTING METHODS FOR OLD BROWSERS ===========================

    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (!Object.keys) {
        Object.keys = (function () {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ],
                dontEnumsLength = dontEnums.length;

            return function (obj) {
                if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }

    // Production steps of ECMA-262, Edition 5, 15.4.4.17
    // Reference: https://es5.github.io/#x15.4.4.17
    if (!Array.prototype.some) {
        Array.prototype.some = function (fun, thisArg) {
            'use strict';

            if (this == null) {
                throw new TypeError('Array.prototype.some called on null or undefined');
            }

            if (typeof fun !== 'function') {
                throw new TypeError();
            }

            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(thisArg, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    // =========================== NODE.REMOVE() ===========================
    (function (arr) {
        arr.forEach(function (item) {
            if (item.hasOwnProperty('remove')) {
                return;
            }
            Object.defineProperty(item, 'remove', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function remove() {
                    this.parentNode.removeChild(this);
                }
            });
        });
    })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
    if (!Date.prototype.toISOString) {
        (function () {

            function pad(number) {
                if (number < 10) {
                    return '0' + number;
                }
                return number;
            }

            Date.prototype.toISOString = function () {
                return this.getUTCFullYear() +
                    '-' + pad(this.getUTCMonth() + 1) +
                    '-' + pad(this.getUTCDate()) +
                    'T' + pad(this.getUTCHours()) +
                    ':' + pad(this.getUTCMinutes()) +
                    ':' + pad(this.getUTCSeconds()) +
                    '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
                    'Z';
            };

        })();
    }

    // Polyfill for Date.parse
    Date.parse = Date.parse || function (
        a // ISO Date string
    ) {
        // turn into array, cutting the first character of the Month
        a = a.split(/\W\D?/);
        // create a new date object
        return new Date(
            // year
            a[3],
            // month (starting with zero) 
            // we got only the second and third character, so we find it in a string
            // Jan => an => 0, Feb => eb => 1, ...
            "anebarprayunulugepctovec".search(a[1]) / 2,
            // day
            a[2],
            // hour
            a[4],
            // minute
            a[5],
            // second
            a[6]
        );
    };
    // =========================== OBJECT.ASSIGN() ===========================
    if (typeof (Object.assign) !== 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) { // .length of function is 2
                'use strict';
                if (target === null || target === undefined) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource !== null && nextSource !== undefined) {
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }

    if (!Function.prototype.bind) (function () {
        var slice = Array.prototype.slice;
        Function.prototype.bind = function () {
            var thatFunc = this, thatArg = arguments[0];
            var args = slice.call(arguments, 1);
            if (typeof thatFunc !== 'function') {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError('Function.prototype.bind - ' +
                    'what is trying to be bound is not callable');
            }
            return function () {
                var funcArgs = args.concat(slice.call(arguments))
                return thatFunc.apply(thatArg, funcArgs);
            };
        };
    })();
	/*
    //  Yes, it does work with `new (funcA.bind(thisArg, args))`
    if (!Function.prototype.bind) (function(){
        var ArrayPrototypeSlice = Array.prototype.slice;
        Function.prototype.bind = function(otherThis) {
            if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }
            var baseArgs= ArrayPrototypeSlice.call(arguments, 1),
                baseArgsLength = baseArgs.length,
                fToBind = this,
                fNOP    = function() {},
                fBound  = function() {
                baseArgs.length = baseArgsLength; // reset to default base arguments
                baseArgs.push.apply(baseArgs, arguments);
                return fToBind.apply(
                        fNOP.prototype.isPrototypeOf(this) ? this : otherThis, baseArgs
                );
                };
            if (this.prototype) {
            // Function.prototype doesn't have a prototype property
            fNOP.prototype = this.prototype;
            }
            fBound.prototype = new fNOP();
            return fBound;
        };
    })();*/

    //=========================== ARRAY.MAP() ===========================
    if (!Array.prototype.map) {
        Array.prototype.map = function (callback, thisArg) {
            var T, A, k;

            if (this == null) {
                throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof (callback) !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }
            if (thisArg) { callback = callback.bind(thisArg); }
            if (arguments.length > 1) {
                T = arguments[1];
            }
            A = new Array(len);
            k = 0;

            while (k < len) {

                var kValue, mappedValue;
                if (k in O) {
                    kValue = O[k];
                    mappedValue = callback.call(T, kValue, k, O);
                    A[k] = mappedValue;
                }
                k++;
            }
            return A;
        };
    }

    // =========================== ARRAY.indexObject ===========================
    if (!Array.prototype.indexObject) {
        Array.prototype.indexObject = function (item, fields) {
            if (!fields) {
                throw "'fields' must be an array";
            }
            if (!Array.isArray(fields)) { fields = [fields]; }
            if (item === null || item === undefined) {
                return this.length - 1;
            }
            if (typeof (item) !== "object") {
                throw "'item' must be an object";
            }
            var a, b, c, ite, key, field, res, rev, val;
            a = 0;
            b = this.length;
            var par = this;

            var fi = function (ifields, it) {
                field = fields[ifields];
                key = typeof (field) === 'string' ? field : field.name;
                val = item[key];
                key = it[key];
                if (typeof (field.primer) !== "undefined") {
                    key = field.primer(key);
                    val = field.primer(val);
                }
                var last = (ifields > fields.length - 2);
                if (key === val) {
                    if (last) {
                        return c;
                    }
                    return fi(ifields + 1, it)
                } else if (key < val) {
                    a = c + 1
                } else {
                    b = c
                }
                return null;
            };

            while (b - a > 0) {
                c = Math.floor((a + b) / 2);
                ite = this[c];
                fi(0, ite);
            }
            return b;

        };
    }
    // =========================== ARRAY.EVERY ===========================
    if (!Array.prototype.every) {
        Array.prototype.every = function (callbackfn, thisArg) {
            var T, k;
            if (this == null) {
                throw ('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof (callbackfn) !== 'function') {
                throw ("type error");
            }
            if (arguments.length > 1) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    var testResult;
                    kValue = O[k];
                    if (T) {
                        testResult = callbackfn.call(T, kValue, k, O);
                    } else {
                        testResult = callbackfn(kValue, k, O);
                    }
                    if (!testResult) {
                        return false;
                    }
                }
                k++;
            }
            return true;
        };
    };

    // =========================== ARRAY.FIND ===========================
    // https://tc39.github.io/ecma262/#sec-array.prototype.find
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function (predicate) {
                if (this == null) {
                    throw TypeError('"this" is null or not defined');
                }
                var o = Object(this);
                var len = o.length >>> 0;
                if (typeof predicate !== 'function') {
                    throw TypeError('predicate must be a function');
                }
                var thisArg = arguments[1];
                var k = 0;

                while (k < len) {
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    k++;
                }

                return undefined;
            },
            configurable: true,
            writable: true
        });
    }

    // =========================== NODE.REPLACEWITH() ===========================
    var ReplaceWithPolyfill = function () {
        'use-strict'; // For safari, and IE > 10
        var parent = this.parentNode, i = arguments.length, currentNode;
        if (!parent) return;
        if (!i) // if there are no arguments
            parent.removeChild(this);
        while (i--) { // i-- decrements i and returns the value of i before the decrement
            currentNode = arguments[i];
            if (typeof currentNode !== 'object') {
                currentNode = this.ownerDocument.createTextNode(currentNode);
            } else if (currentNode.parentNode) {
                currentNode.parentNode.removeChild(currentNode);
            }
            // the value of "i" below is after the decrement
            if (!i) // if currentNode is the first argument (currentNode === arguments[0])
                parent.replaceChild(currentNode, this);
            else // if currentNode isn't the first
                parent.insertBefore(currentNode, this.nextSibling);
        }
    }
    if (!Element.prototype.replaceWith)
        Element.prototype.replaceWith = ReplaceWithPolyfill;
    if (!CharacterData.prototype.replaceWith)
        CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
    if (!DocumentType.prototype.replaceWith)
        DocumentType.prototype.replaceWith = ReplaceWithPolyfill;


    // =========================== OBJECT.VALUES ===========================
    (function () {
        if (!Object.values) {
            Object.values = function (obj) {
                return Object.keys(obj).map(function (e) {
                    return obj[e];
                });
            };
        }
    })();

    // =========================== STRING.ENDSWITH / STRING.STARTSWITH ===========================
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.lastIndexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    // =========================== STRING/ARRAY .INCLUDES() ===========================
    if (!String.prototype.includes) {
        String.prototype.includes = function (search, start) {
            'use strict';

            if (search instanceof RegExp) {
                throw TypeError('first argument must not be a RegExp');
            }
            if (start === undefined) { start = 0; }
            return this.indexOf(search, start) !== -1;
        };
    }
    if (!Array.prototype.includes) {
        Array.prototype.includes = function (search, start) {
            'use strict';

            if (search instanceof RegExp) {
                throw TypeError('first argument must not be a RegExp');
            }
            if (start === undefined) { start = 0; }
            return this.indexOf(search, start) !== -1;
        };
    }

    if (!String.prototype.replaceAll) {
        String.prototype.replaceAll = function (search, replace) {
            return this.split(search).join(replace);
        };
    }
})();