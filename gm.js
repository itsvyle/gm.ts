var GMFlags = /** @class */ (function () {
    function GMFlags(vals, flags_) {
        this.flag_values = {};
        for (var n in vals) {
            this.flag_values[n] = (1 << vals[n]);
        }
        if (flags_ && typeof flags_ == "number")
            this.flags = flags_;
    }
    return GMFlags;
}());
var gm = new /** @class */ (function () {
    function class_1() {
    }
    class_1.prototype.onload = function (clb) {
        window.addEventListener("load", clb);
    };
    class_1.prototype.fromIds = function (o) {
        var r = {};
        for (var n in o) {
            var id = o[n];
            if (!id || typeof (id) != "string") {
                id = n;
            }
            r[n] = document.getElementById(id);
        }
        return r;
    };
    class_1.prototype.base = function (id) {
        if (id === void 0) { id = "base"; }
        if (!id)
            return null;
        var b = document.getElementById(id);
        if (!b)
            return null;
        return gm.JSONParse(b.innerHTML);
    };
    class_1.prototype.JSONParse = function (t) {
        try {
            return JSON.parse(t);
        }
        catch (err) {
            return null;
        }
    };
    class_1.prototype.newItem = function (itemType, opts, appendTo) {
        if (opts === void 0) { opts = {}; }
        if (typeof opts == "string") {
            opts = { className: opts };
        }
        else if (opts === null) {
            opts = {};
        }
        var o = document.createElement(itemType);
        for (var k in opts) {
            if (k in o) {
                // @ts-ignore
                o[k] = opts[k];
            }
            else {
                // @ts-ignore
                o.setAttribute(k, opts[k]);
            }
        }
        if (appendTo) {
            appendTo.appendChild(o);
        }
        return o;
    };
    class_1.prototype.shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    };
    class_1.prototype.formatNumber = function (n) {
        return String(n).replace(/(.)(?=(\d{3})+$)/g, '$1,');
    };
    class_1.prototype.request = function (url, opts, clb_) {
        if (!opts) {
            opts = {};
        }
        var r;
        r = {
            status: 0,
            http_status: -1,
            http_status_text: "unknown",
            headers: null,
            res: null
        };
        var returned = false;
        var clb = function (l) { if (!returned) {
            clb_(l);
            returned = true;
        } };
        var xhttp;
        // @ts-ignore
        if (window.XMLHttpRequest) {
            // code for modern browsers
            xhttp = new XMLHttpRequest();
        }
        else {
            // code for old IE browsers
            // @ts-ignore
            xhttp = (new ActiveXObject("Microsoft.XMLHTTP"));
        }
        if (!opts.headers) {
            opts.headers = {};
        }
        if (opts.q) {
            url += "?" + gm.buildQuery(opts.q);
        }
        if (!opts.accept_codes)
            opts.accept_codes = [200];
        xhttp.onerror = function () {
            r.status = 0;
            r.error = "Error making request";
            clb(r);
            return xhttp.abort();
        };
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                r.http_status = this.status;
                r.http_status_text = this.statusText;
                r.headers = {};
                var hs = this.getAllResponseHeaders().trim().split(/[\r\n]+/);
                hs.forEach(function (line) {
                    var parts = line.split(': ');
                    var header = parts.shift().toLowerCase();
                    var value = parts.join(': ');
                    // @ts-ignore
                    r.headers[header] = value;
                });
                if (opts.accept_codes && opts.accept_codes.indexOf(this.status) === -1) {
                    r.status = 0;
                    r.error = "Error making request(" + String(this.status) + ": " + this.responseText + ")";
                    if (opts.json) {
                        var t = gm.JSONParse(this.responseText);
                        if (t === null) {
                            r.res = this.responseText;
                        }
                        else {
                            r.res = t;
                        }
                        t = null;
                    }
                    else {
                        r.res = this.responseText;
                    }
                    return clb(r);
                }
                // here, request was successfull
                if (opts.json) {
                    var t = gm.JSONParse(this.responseText);
                    if (t === null) {
                        r.status = 0;
                        r.error = "Error parsing response to JSON";
                        r.res = this.responseText;
                    }
                    else {
                        r.res = t;
                    }
                }
                else {
                    r.res = this.responseText;
                }
                r.status = 1;
                return clb(r);
            }
        };
        xhttp.ontimeout = function () {
            r.status = 0;
            r.error = "Request timeout";
            clb(r);
            return xhttp.abort();
        };
        if (opts.bodyq) {
            opts.body = gm.buildQuery(opts.bodyq);
            if (!opts.headers['content-type']) {
                opts.headers['content-type'] = "application/x-www-form-urlencoded";
            }
        }
        if (opts.body && typeof opts.body === "object") {
            try {
                opts.body = JSON.stringify(opts.body);
                if (!opts.headers['content-type']) {
                    opts.headers['content-type'] = "application/json";
                }
            }
            catch (err) {
                console.error(err);
                opts.body = null;
            }
        }
        if (opts.timeout) {
            xhttp.timeout = opts.timeout;
        }
        if (!opts.method) {
            opts.method = "GET";
        }
        xhttp.open(opts.method, url, true);
        if (!opts.headers['content-type']) {
            opts.headers['content-type'] = "application/x-www-form-urlencoded";
        }
        for (var h in opts.headers) {
            xhttp.setRequestHeader(h, opts.headers[h]);
        }
        if (opts.body) {
            xhttp.send(opts.body);
        }
        else {
            xhttp.send();
        }
    };
    class_1.prototype.requestPromise = function (url, opts) {
        //return new Promise<GMRequestReturn<ResType>>(function (resolve, reject) {
        //    gm.request(url, opts, function (r: GMRequestReturn<ResType>) {
        //        if (r.status === 1) { resolve(r); } else { reject(r); }
        //    });
        //});
        return null;
    };
    class_1.prototype.buildQuery = function (args) {
        var ret = "";
        var v;
        for (var n in args) {
            v = args[n];
            if (v === null || v === undefined) {
                continue;
            }
            if (typeof (v) == "object" || Array.isArray(v)) {
                v = JSON.stringify(v);
            }
            if (typeof (v) == "number") {
                v = String(v);
            }
            if (typeof (v) == "boolean") {
                if (v === true) {
                    v = "1";
                }
                else {
                    v = "0";
                }
            }
            v = encodeURIComponent(v);
            if (ret != "") {
                ret += "&";
            }
            ret += encodeURIComponent(n) + "=" + v;
        }
        return ret;
    };
    return class_1;
}())();
//# sourceMappingURL=gm.js.map