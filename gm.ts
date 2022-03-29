interface GMFromIdsArgument {
    [index: string]: string | null
}
interface GMNewItemOptions {
    [index: string]: string | number | boolean | null;
}

interface GMRequestHeaders {
    "content-type"?: string;
    [index: string]: string | undefined;
}
interface GMRequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: GMRequestHeaders;
    q?: Record<string, any>;
    accept_codes?: number[];
    json?: boolean;
    body?: any;
    bodyq?: Record<string, any>;
    timeout?: number;
}
interface GMRequestReturn<Type> {
    status: (0 | 1);
    error?: string;
    http_status: number;
    http_status_text: string;
    headers: GMRequestHeaders | null;
    res: Type | null | string;
}
type GMFlagChangeArgument = (string | string[])
class GMFlags {
    flag_values: Record<string, number>;
    flags: number;
    cname: string | null = null;
    version: string | null = null

    constructor(vals: Record<string,number>,flags_?: number) {
        this.flag_values = {};
        for (let n in vals) {
            this.flag_values[n] = (1 << vals[n]);
        }
        if (flags_ && typeof flags_ == "number") { this.flags = flags_; } else { this.flags = 0;}
    }

    add(flag: GMFlagChangeArgument): boolean {
        if (Array.isArray(flag)) {
            return flag.every((f) => this.add(f));
        } else {
            if (!(flag in this.flag_values)) return false;
            this.flags |= this.flag_values[flag];
            return true
        }
    }

    has(flag: GMFlagChangeArgument): boolean {
        if (Array.isArray(flag)) {
            return flag.every(f => this.has(f));
        }
        if (!(flag in this.flag_values)) return false;
        let n = this.flag_values[flag];
        return ((this.flags & n) === n);
    }

    remove(flag: GMFlagChangeArgument): boolean {
        if (Array.isArray(flag)) {
            return flag.every(f => this.remove(f));
        }
        if (!(flag in this.flag_values)) return false;
        this.flags &= ~this.flag_values[flag];
        return true;
    }

    array(): string[] {
        let r: string[] = [];
        for (let f in this.flag_values) {
            let n = this.flag_values[f];
            if ((this.flags & n) === n) r.push(f);
        }
        return r;
    }

    object(): Record<string, boolean> {
        let r: Record<string, boolean> = {};
        for (let f in this.flag_values) {
            let n = this.flag_values[f];
            r[f] = (this.flags & n) === n;
        }
        return r;
    }
    setFlags(f: number): void {
        this.flags = f;
    }
    set(flag, val): boolean {
        return (val === true) ? this.add(flag) : this.remove(flag);
    }
    fromObject(o: Record<string, boolean>): boolean {
        return Object.keys(o).every(k => this.set(k, o[k]));
    }
}
const gm = new class {
    Flags: typeof GMFlags;
    
    constructor() {
        this.Flags = GMFlags;
    }

    onload(clb: (e?: Event) => any): void {
        window.addEventListener("load", clb);
    }

    fromIds(o: Record<string, string> | null): Record<string, (HTMLElement | null)> {
        let r: Record<string, HTMLElement | null> = {};
        for (var n in o) {
            var id: string | null = o[n];
            if (!id || typeof (id) != "string") { id = n; }
            r[n] = document.getElementById(id);
        }
        return r;
    }
    base<ReturnType>(id: string = "base"): (ReturnType | null) {
        if (!id) return null;
        let b = <HTMLElement>document.getElementById(id);
        if (!b) return null;
        return <ReturnType>gm.JSONParse(b.innerHTML);
    }

    JSONParse(t: string): (Object | null) {
        try { return JSON.parse(t); } catch (err) { return null; }
    }

    newItem(itemType: string, opts: GMNewItemOptions | string | null = {}, appendTo?: (HTMLElement | null)): HTMLElement {
        if (typeof opts == "string") { opts = { className: opts }; } else if (opts === null) { opts = {}; }
        let o: HTMLElement = <HTMLElement>document.createElement(itemType);
        for (let k in opts) {
            if (k in o) {
                // @ts-ignore
                o[k] = opts[k];
            } else {
                // @ts-ignore
                o.setAttribute(k, opts[k]);
            }
        }
        if (appendTo) {
            appendTo.appendChild(o);
        }
        return o;
    }

    shuffle(array: any[]): any[] {
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
    }

    formatNumber(n: number): string {
        return String(n).replace(/(.)(?=(\d{3})+$)/g, '$1,');
    }

    request<ResType>(url: string, opts: GMRequestOptions, clb_: (r: GMRequestReturn<ResType>) => any): void {
        if (!opts) { opts = {}; }
        var r: GMRequestReturn<ResType>;
        r = {
            status: 0,
            http_status: -1,
            http_status_text: "unknown",
            headers: null,
            res: null
        };
        var returned = false;
        var clb = (l: GMRequestReturn<ResType>) => { if (!returned) { clb_(l); returned = true; } };

        var xhttp: XMLHttpRequest;
        // @ts-ignore
        if (window.XMLHttpRequest) {
            // code for modern browsers
            xhttp = new XMLHttpRequest();
        } else {
            // code for old IE browsers
            // @ts-ignore
            xhttp = <XMLHttpRequest>(new ActiveXObject("Microsoft.XMLHTTP"));
        }
        if (!opts.headers) { opts.headers = {}; }

        if (opts.q) { url += "?" + gm.buildQuery(opts.q); }
        if (!opts.accept_codes) opts.accept_codes = [200];
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
                    var header = (<string>parts.shift()).toLowerCase();
                    var value = parts.join(': ');
                    // @ts-ignore
                    r.headers[header] = value;
                });
                if (opts.accept_codes && opts.accept_codes.indexOf(this.status) === -1) {
                    r.status = 0;
                    r.error = "Error making request(" + String(this.status) + ": " + this.responseText + ")";
                    if (opts.json) {
                        let t: (Object | null) = gm.JSONParse(this.responseText);
                        if (t === null) {
                            r.res = this.responseText;
                        } else {
                            r.res = <ResType>t;
                        }
                        t = null;
                    } else {
                        r.res = this.responseText;
                    }
                    return clb(r);
                }
                // here, request was successfull
                if (opts.json) {
                    let t: (Object | null) = gm.JSONParse(this.responseText);
                    if (t === null) {
                        r.status = 0;
                        r.error = "Error parsing response to JSON";
                        r.res = this.responseText;
                    } else {
                        r.res = <ResType>t;
                    }
                } else {
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
            if (!opts.headers['content-type']) { opts.headers['content-type'] = "application/x-www-form-urlencoded"; }
        }
        if (opts.body && typeof opts.body === "object") {
            try {
                opts.body = JSON.stringify(opts.body);
                if (!opts.headers['content-type']) { opts.headers['content-type'] = "application/json"; }
            } catch (err) {
                console.error(err);
                opts.body = null;
            }
        }
        if (opts.timeout) {
            xhttp.timeout = opts.timeout;
        }
        if (!opts.method) { opts.method = "GET"; }
        xhttp.open(opts.method, url, true);


        if (!opts.headers['content-type']) {
            opts.headers['content-type'] = "application/x-www-form-urlencoded";
        }
        for (var h in opts.headers) {
            xhttp.setRequestHeader(h, <string>opts.headers[h]);
        }
        if (opts.body) {
            xhttp.send(opts.body);
        } else {
            xhttp.send();
        }

    }

    requestPromise<ResType>(url: string, opts: GMRequestOptions): (Promise<GMRequestReturn<ResType>> | null) {
        //return new Promise<GMRequestReturn<ResType>>(function (resolve, reject) {
        //    gm.request(url, opts, function (r: GMRequestReturn<ResType>) {
        //        if (r.status === 1) { resolve(r); } else { reject(r); }
        //    });
        //});
        return null;
    }

    buildQuery(args: Record<string, any>): string {
        var ret = ""; var v: any;
        for (var n in args) {
            v = args[n];
            if (v === null || v === undefined) { continue; }
            if (typeof (v) == "object" || Array.isArray(v)) { v = JSON.stringify(v); }
            if (typeof (v) == "number") { v = String(v); }
            if (typeof (v) == "boolean") { if (v === true) { v = "1"; } else { v = "0"; } }
            v = encodeURIComponent(v);
            if (ret != "") { ret += "&"; }
            ret += encodeURIComponent(n) + "=" + v;
        }
        return ret;
    }
}();