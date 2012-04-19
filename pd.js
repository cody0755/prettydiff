﻿/*prettydiff.com api.topcoms: true*/
/*global document, localStorage, window, prettydiff, XMLHttpRequest, location*/
var exports = "",
    pd = {},

    //test for localStorage and assign the result of the test
    ls = (typeof localStorage === "object" && localStorage !== null) ? true : false,
    _gaq = _gaq || [],
    bounce = true,
    $$ = function (x) {
        "use strict";
        if (typeof document.getElementById === "undefined") {
            return;
        }
        return document.getElementById(x);
    },

    //o Stores a reference to everything that is needed from the DOM
    o = {
        au: $$("ctype-auto"),
        ba: $$("beau-tab"),
        bb: $$("modebeautify"),
        bc: $$("beau-char"),
        bd: $$("Beautify"),
        bf: $$("bforce_indent-no"),
        bg: $$("bforce_indent-yes"),
        bi: $$("beautyinput"),
        bl: $$("baselabel"),
        bn: $$("beau-line"),
        bo: $$("baseText"),
        bq: $$("beau-quan"),
        bs: $$("beau-space"),
        bt: $$("diffBase"),
        bx: $$("beautyoutput"),
        bw: $$("beau-other"),
        bz: $$("bo"),
        ch: $$("csvchar"),
        cn: 4,
        cv: $$("ctype-csv"),
        cz: " ",
        da: $$("diff-tab"),
        db: $$("diffbeautify"),
        dc: $$("diff-char"),
        dd: $$("modediff"),
        df: $$("dforce_indent-no"),
        dg: $$("dforce_indent-yes"),
        dm: $$("diffscolony"),
        dn: $$("diffscolonn"),
        dp: $$("diffwide"),
        dq: $$("diff-quan"),
        dr: $$("diffquotey"),
        ds: $$("diff-space"),
        dt: $$("difftall"),
        du: $$("diffcontentn"),
        dw: $$("diff-other"),
        dx: $$("diffcontenty"),
        dy: $$("diffquoten"),
        dz: $$("diff-line"),
        hd: $$("htmld-yes"),
        he: $$("htmld-no"),
        hm: $$("htmlm-yes"),
        hn: $$("htmlm-no"),
        ht: $$("htmlspecific"),
        hy: $$("html-yes"),
        hz: $$("html-no"),
        id: $$("inscriptd-yes"),
        ie: $$("inscriptd-no"),
        is: $$("inscript-yes"),
        it: $$("inscript-no"),
        iy: $$("incomment-yes"),
        iz: $$("incomment-no"),
        jd: $$("jsindentd-all"),
        je: $$("jsindentd-knr"),
        js: $$("jsindent-all"),
        jt: $$("jsindent-knr"),
        mb: $$("topcoms-no"),
        mc: $$("topcoms-yes"),
        md: $$("Minify"),
        mi: $$("minifyinput"),
        ml: $$("minifyinputlines"),
        mm: $$("modeminify"),
        mn: $$("minifywindiff"),
        mo: $$("minifyoutputsize"),
        mr: $$("minifywinratiosize"),
        ms: $$("minifyinputsize"),
        mt: $$("minifyratiosize"),
        mu: $$("minifyunixdiff"),
        mw: $$("minifywinsize"),
        mx: $$("minifyoutput"),
        nl: $$("newlabel"),
        nt: $$("diffNew"),
        nx: $$("newText"),
        nz: $$("no"),
        op: $$("options"),
        ps: $$("diff-save"),
        pt: $$("ctype-text"),
        re: $$("diffreport"),
        rf: $$("diffreportbody"),
        rg: $$("beaureport"),
        rh: $$("beaureportbody"),
        ri: $$("minreport"),
        rj: $$("minreportbody"),
        rk: $$("statreport"),
        rl: $$("statreportbody"),
        sh: $$("hideOptions"),
        to: $$("top"),
        bcv: "",
        dcv: "",
        dqp: $$("diffquanp"),
        dqt: $$("difftypep"),
        htd: $$("htmlspecificd"),
        ind: $$("scriptindentd"),
        ins: $$("scriptindent"),
        stvisit: $$("stvisit"),
        stusage: $$("stusage"),
        stfdate: $$("stfdate"),
        stavday: $$("stavday"),
        stcouse: $$("stcouse"),
        stdiff: $$("stdiff"),
        stbeau: $$("stbeau"),
        stminn: $$("stminn"),
        stmarkup: $$("stmarkup"),
        stjs: $$("stjs"),
        stcss: $$("stcss"),
        stcsv: $$("stcsv"),
        sttext: $$("sttext"),
        bops: $$("beauops"),
        csvp: $$("csvcharp"),
        disp: $$("displayOps"),
        dops: $$("diffops"),
        lang: "auto",
        mops: $$("miniops"),
        stat: {
            visit: 0,
            usage: 0,
            fdate: "",
            avday: "1",
            diff: 0,
            beau: 0,
            minn: 0,
            markup: 0,
            js: 0,
            css: 0,
            csv: 0,
            text: 0,
            pdate: ""
        },
        context: $$("contextSize"),
        inline: $$("inline"),
        sideby: $$("sidebyside"),
        option: $$("option_comment"),
        zindex: 10
    },

    //recycle bundles arguments in preparation for executing prettydiff
    recycle = function (e) {
        "use strict";
        var api = {},
            output = [],
            domain = /^(https?:\/\/|file:\/\/\/)/,
            event = e || window.event,
            lang = "",
            lango = {},
            stat = [];

        //do not execute from shift, alt, home, end, or arrow keys
        if (typeof event === "object" && event.type === "keyup" && (event.altKey || event.ctrlKey || event.shiftKey || event.keyCode === 16 || event.keyCode === 18 || event.keyCode === 35 || event.keyCode === 36 || event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40)) {
            return;
        }
        if (ls) {
            o.stat.usage += 1;
            o.stusage.innerHTML = o.stat.usage;
        }

        //set defaults for all arguments
        api.comments = "indent";
        api.content = false;
        api.diff = "";
        api.diffview = "sidebyside";
        api.force_indent = false;
        api.html = false;
        api.insize = 4;
        api.indent = "";
        api.lang = "auto";
        api.mode = "beautify";
        api.quote = false;
        api.semicolon = false;
        api.style = "indent";
        api.topcoms = false;

        //gather updated dom nodes
        o.bb = $$("modebeautify");
        o.jd = $$("jsindentd-all");
        o.js = $$("jsindent-all");
        o.ch = $$("csvchar");
        o.cv = $$("ctype-csv");
        o.dd = $$("modediff");
        o.mm = $$("modeminify");
        o.pt = $$("ctype-text");
        o.dx = $$("diffcontenty");
        o.sh = $$("hideOptions");
        api.csvchar = o.ch.value;
        if (o.cv.checked === true) {
            api.lang = "csv";
        } else if (o.pt.checked === true) {
            api.lang = "text";
        }

        //determine operations based upon mode of operations
        if (o.bb.checked) {
            o.hy = $$("html-yes");
            o.ba = $$("beau-tab");
            o.bn = $$("beau-line");
            o.bw = $$("beau-other");
            o.bc = $$("beau-char");
            o.bi = $$("beautyinput");
            o.bq = $$("beau-quan");
            o.is = $$("inscript-yes");
            o.iz = $$("incomment-no");
            o.bg = $$("bforce_indent-yes");
            if (o.bg.checked) {
                api.force_indent = true;
            }
            if (o.ba.checked) {
                o.cz = "\t";
            } else if (o.bn.checked) {
                o.cz = "\n";
            } else if (o.bw.checked) {
                o.cz = o.bc.value;
            } else {
                o.cz = " ";
            }
            api.inchar = o.cz;
            if (!isNaN(o.bq.value)) {
                o.cn = Number(o.bq.value);
                api.insize = o.cn;
            }
            if (o.it.checked) {
                api.style = "noindent";
            }
            if (o.hy.checked) {
                api.html = "html-yes";
            }
            if (o.iz.checked) {
                api.comments = "noindent";
            }
            if (o.js.checked) {
                api.indent = "allman";
            }
            api.source = o.bi.value;
            api.mode = "beautify";
            if (ls) {
                localStorage.setItem("bi", api.source);
            }
        } else if (o.mm.checked) {
            o.hm = $$("htmlm-yes");
            o.mc = $$("topcoms-yes");
            o.mi = $$("minifyinput");
            if (o.hm.checked) {
                api.html = "html-yes";
            }
            if (o.mc.checked) {
                api.topcoms = true;
            }
            api.source = o.mi.value;
            api.mode = "minify";
            if (ls) {
                localStorage.setItem("mi", api.source);
            }
        } else if (o.dd) {
            o.context = $$("contextSize");
            o.inline = $$("inline");
            o.bl = $$("baselabel");
            o.nl = $$("newlabel");
            o.hd = $$("htmld-yes");
            o.bo = $$("baseText");
            o.nx = $$("newText");
            o.dn = $$("diffscolonn");
            o.dy = $$("diffquoten");
            o.da = $$("diff-tab");
            o.dw = $$("diff-other");
            o.dz = $$("diff-line");
            o.dc = $$("diff-char");
            o.dq = $$("diff-quan");
            o.du = $$("diffcontentn");
            o.id = $$("inscriptd-yes");
            o.ps = $$("diff-save");
            o.dg = $$("dforce_indent-yes");
            api.difflabel = o.nl.value;
            api.sourcelabel = o.bl.value;
            if (o.dg.checked) {
                api.force_indent = true;
            }
            if (o.du.checked) {
                api.content = true;
            }
            if (o.da.checked) {
                o.cz = "\t";
            } else if (o.dz.checked) {
                o.cz = "\n";
            } else if (o.dw.checked.checked) {
                o.cz = o.dc.value;
            } else {
                o.cz = " ";
            }
            api.inchar = o.cz;
            if (!isNaN(o.dq.value)) {
                o.cn = Number(o.dq.value);
                api.insize = o.cn;
            }
            if (!o.id.checked) {
                api.style = "noindent";
            }
            if (o.hd.checked) {
                api.html = "html-yes";
            }
            if (o.dy.checked) {
                api.quote = true;
            }
            if (o.dn.checked) {
                api.semicolon = true;
            }
            if (o.inline.checked) {
                api.diffview = "inline";
            }
            if (isNaN(o.context.value)) {
                o.context.value = "";
                api.context = "";
            }
            if (o.jd.checked) {
                api.indent = "allman";
            }
            if (o.bo.value === "" || o.bo.value === "Error: source code is missing.") {
                o.bo.value = "Error: source code is missing.";
                return;
            }
            if (o.nx.value === "" || o.nx.value === "Error: diff code is missing.") {
                o.nx.value = "Error: diff code is missing.";
                return;
            }
            api.source = o.bo.value;
            api.diff = o.nx.value;
            api.mode = "diff";
            if (ls) {
                localStorage.setItem("bo", api.source);
                localStorage.setItem("nx", api.diff);
                localStorage.setItem("bl", api.sourcelabel);
                localStorage.setItem("nl", api.difflabel);
            }
            if (domain.test(api.diff) && (typeof XMLHttpRequest === "function" || typeof XMLHttpRequest === "object" || typeof ActiveXObject === "function")) {
                (function () {
                    var a = (api.diff.indexOf("file:///") === 0) ? api.diff.split(":///")[1] : api.diff.split("://")[1],
                        b = a ? a.indexOf("/") : 0,
                        c,
                        xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
                    if (location && location.href) {
                        c = location.href.split("://")[0];
                    }
                    if (!a || c !== api.diff.split("://")[0]) {
                        return;
                    }
                    if (b !== 0 && b !== -1) {
                        xhr.open("GET", "proxy.php?x=" + api.diff.replace(/(\s*)$/, "").replace(/%26/g, "&").replace(/%3F/, "?"), false);
                        xhr.send();
                        if (xhr.status === 200 || xhr.status === 0) {
                            api.diff = xhr.responseText;
                        }
                    }
                }());
            }
        }
        if (domain.test(api.source) && (typeof XMLHttpRequest === "function" || typeof XMLHttpRequest === "object" || typeof ActiveXObject === "function")) {
            (function () {
                var a = (api.source.indexOf("file:///") === 0) ? api.source.split(":///")[1] : api.source.split("://")[1],
                    b = a ? a.indexOf("/") : 0,
                    c,
                    xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
                if (location && location.href) {
                    c = location.href.split("://")[0];
                }
                if (!a || c !== api.source.split("://")[0]) {
                    return;
                }
                if (b !== 0 && b !== -1) {
                    xhr.open("GET", "proxy.php?x=" + api.source.replace(/(\s*)$/, "").replace(/%26/g, "&").replace(/%3F/, "?"), false);
                    xhr.send();
                    if (xhr.status === 200 || xhr.status === 0) {
                        api.source = xhr.responseText;
                    }
                }
            }());
        }

        //this is where prettydiff is executed
        output = prettydiff(api);
        o.zindex += 1;
        if (o.bb.checked) {
            o.bx.value = output[0];
            if (o.sh.innerHTML === "Maximize inputs") {
                o.rh.innerHTML = output[1];
                o.rg.style.zIndex = o.zindex;
                o.rg.style.display = "block";
            }
            if (ls) {
                localStorage.setItem("bi", o.bi.value);
                o.stat.beau += 1;
                o.stbeau.innerHTML = o.stat.beau;
            }
        } else if (o.dd && o.dd.checked) {
            if (/^(<p><strong>Error:<\/strong> Please try using the option labeled ((&lt;)|<)em((&gt;)|>)Plain Text \(diff only\)((&lt;)|<)\/em((&gt;)|>)\.)/.test(output[0])) {
                o.rf.innerHTML = "<p><strong>Error:</strong> Please try using the option labeled <em>Plain Text (diff only)</em>. <span style='display:block'>The input does not appear to be markup, CSS, or JavaScript.</span></p>";
            } else if (o.ps && o.ps.checked) {
                output[2] = output[1] + "<p>This is the generated diff output. Please copy the text output, paste into a text file, and save as a &quot;.html&quot; file.</p><textarea rows='40' cols='80' id='textreport'>";
                output[0] = "<?xml version='1.0' encoding='UTF-8' ?><!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'><html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en'><head><title>Pretty Diff - The difference tool</title><meta name='robots' content='index, follow'/> <meta name='DC.title' content='Pretty Diff - The difference tool'/> <link rel='canonical' href='http://prettydiff.com/' type='application/xhtml+xml'/><meta http-equiv='Content-Type' content='application/xhtml+xml;charset=UTF-8'/><meta http-equiv='Content-Style-Type' content='text/css'/><style type='text/css'>body{background-color:#a8b8c8;color:#000;font-family:'Arial';font-size:10px;}button{display:block;font-size:2em;font-weight:bold;margin:1em auto;padding:1em 2em;}button:hover{background:#ccf;}button:active{background:#c00;}h1{font-size:2em;}h1 span{color:#c00;font-size:.5em;}p{clear:both;font-size:1.2em;margin-top:.2em;}#diffoutput{width:100%;}p em{color:#c00;font-weight:bold;}table.diff{border-collapse:collapse;border:.1em solid darkgray;font-size:1em;white-space:pre;}table.diff tbody{font-family:'Courier New',Courier,'Lucida Console',monospace;font-size:1.1em;}table.diff tbody th{font-family:verdana,arial,'Bitstream Vera Sans',helvetica,sans-serif;background:#eed;font-weight:normal;border:.1em solid #bbc;color:#886;padding:.5em .6em 0em 2.4em;text-align:right;vertical-align:top;}table.diff thead{border-bottom:.1em solid #bbc;background:#efefef;font-family:Verdana;}table.diff thead th.texttitle{text-align:left;}table.diff tbody td{letter-spacing:.1em;padding:.5em .5em 0em .5em;vertical-align:top;}table.diff tbody td em{font-style:normal;padding:.05em 0em;margin:0-.09em;}table.diff .empty{background-color:#ddd;}table.diff .replace{background-color:#fd8;}table.diff .replace em{background-color:#ffd;border:.1em solid #963;color:#630;}table.diff .delete{background-color:#e99;}table.diff .delete em{background-color:#fdd;border:.1em solid #700;color:#600;}table.diff .equal{background-color:#fff;}table.diff .skip{background-color:#efefef;border:.1em solid #aaa;border-right:.1em solid #bbc;}table.diff .insert{background-color:#9e9;}table.diff .insert em{background-color:#efc;border:1px solid #070;color:#050;}table.diff th.author{text-align:right;border-top:.1em solid #bbc;background:#efefef;}@media print{html{font-size:.8em;}html table.diff{font-size:.8em;white-space:normal;}}</style></head><body><h1><a href='http://prettydiff.com/'>Pretty Diff - The difference tool</a></h1>" + output[1] + "<p>Accessibility note. &lt;em&gt; tags in the output represent character differences per lines compared.</p>" + output[0] + "</body></html>";
                o.rf.innerHTML = output[2] + output[0].replace(/\&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;") + "</textarea>";
            } else {
                o.rf.innerHTML = output[1] + output[0];
            }
            o.re.style.zIndex = o.zindex;
            o.re.style.display = "block";
            if (o.re.getElementsByTagName("p")[0].style.display === "none") {
                pd.minimize(o.re.getElementsByTagName("button")[1]);
            }
            if (ls) {
                localStorage.setItem("bo", o.bo.value);
                localStorage.setItem("nx", o.nx.value);
                localStorage.setItem("bl", o.bl.value);
                localStorage.setItem("nl", o.nl.value);
                o.stat.diff += 1;
                o.stdiff.innerHTML = o.stat.diff;
            }
        } else if (o.mm.checked) {
            o.mx.value = output[0];
            if (o.sh.innerHTML === "Maximize inputs") {
                o.rj.innerHTML = output[1];
                o.ri.style.zIndex = o.zindex;
                o.ri.style.display = "block";
            }
            if (ls) {
                localStorage.setItem("mi", o.mi.value);
                o.stat.minn += 1;
                o.stminn.innerHTML = o.stat.minn;
            }
        }
        if (ls) {
            if (o.au.checked && typeof output[1] === "string") {
                lango = (/Language set to <strong>auto<\/strong>\. Presumed language is <em>\w+<\/em>\./).exec(output[1]);
                if (lango !== null) {
                    lang = lango.toString();
                    lang = lang.substring(lang.indexOf("<em>") + 4, lang.indexOf("</em>"));
                    if (lang === "JavaScript" || lang === "JSON") {
                        o.stat.js += 1;
                        o.stjs.innerHTML = o.stat.js;
                    } else if (lang === "CSS") {
                        o.stat.css += 1;
                        o.stcss.innerHTML = o.stat.css;
                    } else if (lang === "HTML" || lang === "markup") {
                        o.stat.markup += 1;
                        o.stmarkup.innerHTML = o.stat.markup;
                    }
                    o.lang = lang;
                }
            } else if (o.cv.checked) {
                o.stat.csv += 1;
                o.stcsv.innerHTML = o.stat.csv;
                o.lang = "csv";
            } else if (o.pt.checked) {
                o.stat.text += 1;
                o.sttext.innerHTML = o.stat.text;
                o.lang = "text";
            }
            stat.push(o.stat.visit);
            stat.push(o.stat.usage);
            stat.push(o.stat.fdate);
            stat.push(o.stat.avday);
            stat.push(o.stat.diff);
            stat.push(o.stat.beau);
            stat.push(o.stat.minn);
            stat.push(o.stat.markup);
            stat.push(o.stat.js);
            stat.push(o.stat.css);
            stat.push(o.stat.csv);
            stat.push(o.stat.text);
            stat.push(o.stat.pdate);
            localStorage.setItem("statdata", stat.join("|"));
        }
    };

//pd object contains all the interactive functions.  pd is just a
//collection to keep all these functions organized and together
pd = {

    //stores position information of floating report windows without
    //looking to localStorage each and every time
    position: {},

    //stores option information without looking into localStorage each
    //and every time
    optionString: [],

    //stores webtool information without looking into localStorage each
    //and every time
    webtool: [],

    //intelligently raise the z-index of the report windows
    top: function (x) {
        "use strict";
        var a = o.zindex,
            b = [Number(o.re.style.zIndex), Number(o.rg.style.zIndex), Number(o.ri.style.zIndex), Number(o.rk.style.zIndex)],
            c = Math.max(a, b[0], b[1], b[2], b[3]) + 1;
        o.zindex = c;
        x.style.zIndex = c;
    },

    //minimize report windows to the default size and location
    minimize: function (x) {
        "use strict";
        var a = x.parentNode,
            b = a.parentNode,
            c = b.getElementsByTagName("div")[0],
            d = b.getElementsByTagName("h2")[0],
            e = $$("options").offsetTop,
            f = b.getAttribute("id"),
            g = (b === o.re) ? a.getElementsByTagName("button")[1] : a.getElementsByTagName("button")[0];

        //shrink
        if (x.innerHTML === "\u2193") {
            if (!pd.position[f]) {
                pd.position[f] = {};
            }
            pd.position[f].top = (b.offsetTop / 10);
            pd.position[f].left = (b.offsetLeft / 10);
            pd.position[f].height = (c.clientHeight / 10) - 3.7;
            pd.position[f].width = (c.clientWidth / 10) - 0.4;
            g.innerHTML = "\u2191";
            b.style.left = "auto";
            a.style.display = "none";
            b.style.borderWidth = "0em";
            b.style.top = ((e / 10) + 1) + "em";
            b.style.zIndex = "2";
            if (b === o.re) {
                b.style.right = "68em";
            } else if (b === o.rg) {
                b.style.right = "46em";
            } else if (b === o.ri) {
                b.style.right = "24em";
            } else if (b === o.rk) {
                b.style.right = "2em";
            }
            if (o.zindex > 2) {
                o.zindex -= 3;
                a.style.zIndex = o.zindex;
            }
            c.style.display = "none";
            d.style.borderLeft = ".1em solid #006";
            d.style.borderTop = ".1em solid #006";
            d.style.cursor = "pointer";
            d.style.width = "20em";
            d.style.margin = "0em 0em -3.2em 0.1em";
            x.innerHTML = "\u2191";

            //grow
        } else {
            pd.top(b);
            g.innerHTML = "\u2191";
            a.style.display = "block";
            b.style.borderWidth = ".1em";
            c.style.display = "block";
            d.style.cursor = "move";
            d.style.borderLeft = "none";
            d.style.borderTop = "none";
            d.style.margin = "0.1em 1.7em -3.2em 0.1em";
            if (pd.position && pd.position[f] && pd.position[f].top) {
                b.style.right = "auto";
                b.style.top = pd.position[f].top + "em";
                b.style.left = pd.position[f].left + "em";
                if (b === o.re) {
                    d.style.width = (pd.position[f].width - 9.71) + "em";
                } else {
                    d.style.width = (pd.position[f].width - 6.71) + "em";
                }
                c.style.width = pd.position[f].width + "em";
                c.style.height = pd.position[f].height + "em";
            } else {
                b.style.top = "55em";
                if (b === o.re) {
                    b.style.right = "64em";
                    d.style.width = "65.24em";
                } else if (b === o.rg) {
                    b.style.right = "42em";
                    d.style.width = "68.24em";
                } else if (b === o.ri) {
                    b.style.right = "20em";
                    d.style.width = "68.24em";
                } else if (b === o.rk) {
                    b.style.right = "2em";
                    d.style.width = "68.24em";
                }
                c.width = "75em";
            }
            x.innerHTML = "\u2193";
        }
        pd.options(b);
    },

    //maximize report window to available browser window
    maximize: function (x) {
        "use strict";
        var a = x.parentNode.parentNode,
            b = a.getElementsByTagName("h2")[0],
            c = a.getElementsByTagName("div")[0],
            d = (document.body.parentNode.scrollTop > document.body.scrollTop) ? document.body.parentNode.scrollTop : document.body.scrollTop,
            e = (document.body.parentNode.scrollLeft > document.body.scrollLeft) ? document.body.parentNode.scrollLeft : document.body.scrollLeft,
            f = a.getAttribute("id"),
            g = x.parentNode.getElementsByTagName("button"),
            h = g[g.length - 1];
        pd.top(a);
        if (x.innerHTML === "\u2191") {
            x.innerHTML = "\u2193";
            x.setAttribute("title", "Return this dialogue to its prior size and location.");
            pd.position[f] = {};
            pd.position[f].top = (a.offsetTop / 10);
            pd.position[f].left = (a.offsetLeft / 10);
            pd.position[f].height = (c.clientHeight / 10) - 3.7;
            pd.position[f].width = (c.clientWidth / 10) - 0.4;
            pd.position[f].zindex = a.style.zIndex;
            a.style.top = (d / 10) + "em";
            a.style.left = (e / 10) + "em";
            if (window.innerHeight) {
                c.style.height = ((window.innerHeight / 10) - 7.2) + "em";
                if (a === o.re) {
                    b.style.width = ((window.innerWidth / 10) - 16.76) + "em";
                } else {
                    b.style.width = ((window.innerWidth / 10) - 13.76) + "em";
                }
                c.style.width = ((window.innerWidth / 10) - 4) + "em";
            } else {
                c.style.height = ((window.screen.availHeight / 10) - 21) + "em";
                if (a === o.re) {
                    b.style.width = ((window.screen.availWidth / 10) - 17.76) + "em";
                } else {
                    b.style.width = ((window.screen.availWidth / 10) - 14.76) + "em";
                }
                c.style.width = ((window.screen.availWidth / 10) - 5) + "em";
            }
            h.style.display = "none";
        } else {
            x.innerHTML = "\u2191";
            x.setAttribute("title", "Maximize this dialogue to the browser window.");
            if (pd.position && pd.position[f] && pd.position[f].top) {
                a.style.top = pd.position[f].top + "em";
                a.style.left = pd.position[f].left + "em";
                if (a === o.re) {
                    b.style.width = (pd.position[f].width - 12.76) + "em";
                } else {
                    b.style.width = (pd.position[f].width - 9.76) + "em";
                }
                c.style.width = pd.position[f].width + "em";
                c.style.height = pd.position[f].height + "em";
            }
            a.style.zIndex = pd.position[f].zindex;
            h.style.display = "block";
        }
        pd.options(a);
    },

    //resize report window to custom width and height on drag
    resize: function (e, x) {
        "use strict";
        var a = x.parentNode.parentNode,
            b = a.getElementsByTagName("div")[0],
            c = a.getElementsByTagName("h2")[0],
            bx = b.clientWidth,
            by = b.clientHeight,
            drop = function (g) {
                document.onmousemove = null;
                bx = b.clientWidth;
                by = b.clientHeight;
                g = null;
                pd.options(a);
                document.onmouseup = null;
            },
            boxsize = function (f) {
                f = f || window.event;
                b.style.width = ((bx + ((f.clientX - 4) - b.mouseX)) / 10) + "em";
                if (a === o.re) {
                    c.style.width = (((bx + (f.clientX - b.mouseX)) / 10) - 10.01) + "em";
                } else {
                    c.style.width = (((bx + (f.clientX - b.mouseX)) / 10) - 7.01) + "em";
                }
                b.style.height = ((by + ((f.clientY - 36) - b.mouseY)) / 10) + "em";
                document.onmouseup = drop;
            };
        pd.top(a);
        e = e || window.event;
        b.mouseX = e.clientX;
        b.mouseY = e.clientY;
        document.onmousemove = boxsize;
        document.onmousedown = null;
    },

    //toggle between parsed html diff report and raw text representation
    save: function (x) {
        "use strict";
        var a = o.rf.innerHTML,
            b = [],
            c = "",
            d = [];
        pd.top(o.rf);
        if (/Please try using the option labeled ((&lt;)|<)em((&gt;)|>)Plain Text \(diff only\)((&lt;)|<)\/em((&gt;)|>)\./.test(a)) {
            o.rf.innerHTML = "<p><strong>Error:</strong> Please try using the option labeled <em>Plain Text (diff only)</em>. <span style='display:block'>The input does not appear to be markup, CSS, or JavaScript.</span></p>";
            return;
        }
        if (x.innerHTML === "S") {
            o.ps.checked = true;
            c = "<table";
            d = a.split(c);
            c = c + d[1];
            a = d[0];
            b.push(a);
            b.push(" <p>This is the generated diff output. Please copy the text output, paste into a text file, and save as a &quot;.html&quot; file.</p> <textarea rows='40' cols='80' id='textreport'>");
            b.push("&lt;?xml version='1.0' encoding='UTF-8' ?&gt;&lt;!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'&gt;&lt;html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en'&gt;&lt;head&gt;&lt;title&gt;Pretty Diff - The difference tool&lt;/title&gt;&lt;meta name='robots' content='index, follow'/&gt; &lt;meta name='DC.title' content='Pretty Diff - The difference tool'/&gt; &lt;link rel='canonical' href='http://prettydiff.com/' type='application/xhtml+xml'/&gt;&lt;meta http-equiv='Content-Type' content='application/xhtml+xml;charset=UTF-8'/&gt;&lt;meta http-equiv='Content-Style-Type' content='text/css'/&gt;&lt;style type='text/css'&gt;body{background-color:#a8b8c8;color:#000;font-family:'Arial';font-size:10px;}button{display:block;font-size:2em;font-weight:bold;margin:1em auto;padding:1em 2em;}button:hover{background:#ccf;}button:active{background:#c00;}h1{font-size:2em;}h1 span{color:#c00;font-size:.5em;}p{clear:both;font-size:1.2em;margin-top:.2em;}#diffoutput{width:100%;}p em{color:#c00;font-weight:bold;}table.diff{border-collapse:collapse;border:.1em solid darkgray;font-size:1em;white-space:pre;}table.diff tbody{font-family:'Courier New',Courier,'Lucida Console',monospace;font-size:1.1em;}table.diff tbody th{font-family:verdana,arial,'Bitstream Vera Sans',helvetica,sans-serif;background:#eed;font-weight:normal;border:.1em solid #bbc;color:#886;padding:.5em .6em 0em 2.4em;text-align:right;vertical-align:top;}table.diff thead{border-bottom:.1em solid #bbc;background:#efefef;font-family:Verdana;}table.diff thead th.texttitle{text-align:left;}table.diff tbody td{letter-spacing:.1em;padding:.5em .5em 0em .5em;vertical-align:top;}table.diff tbody td em{font-style:normal;padding:.05em 0em;margin:0-.09em;}table.diff .empty{background-color:#ddd;}table.diff .replace{background-color:#fd8;}table.diff .replace em{background-color:#ffd;border:.1em solid #963;color:#630;}table.diff .delete{background-color:#e99;}table.diff .delete em{background-color:#fdd;border:.1em solid #700;color:#600;}table.diff .equal{background-color:#fff;}table.diff .skip{background-color:#efefef;border:.1em solid #aaa;border-right:.1em solid #bbc;}table.diff .insert{background-color:#9e9;}table.diff .insert em{background-color:#efc;border:1px solid #070;color:#050;}table.diff th.author{text-align:right;border-top:.1em solid #bbc;background:#efefef;}@media print{html{font-size:.8em;}html table.diff{font-size:.8em;white-space:normal;}}&lt;/style&gt;&lt;/head&gt;&lt;body&gt;&lt;h1&gt;&lt;a href='http://prettydiff.com/'&gt;Pretty Diff - The difference tool&lt;/a&gt;&lt;/h1&gt;");
            b.push(a.replace(/\&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;"));
            b.push("&lt;p&gt;Accessibility note. &amp;lt;em&amp;gt; tags in the output represent character differences per lines compared.&lt;/p&gt;");
            b.push(c.replace(/\&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;"));
            b.push("&lt;/body&gt;&lt;/html&gt;</textarea>");
            x.innerHTML = "H";
            x.setAttribute("title", "Convert diff report to an HTML table.");
        } else {
            o.ps.checked = false;
            c = "<p>This is the generated diff output. Please copy the text output, paste into a text file, and save as a \".html\" file.</p>";
            a = a.replace(/ xmlns\="http:\/\/www\.w3\.org\/1999\/xhtml"/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
            d = a.split(c);
            b.push(d[0]);
            c = (d[1].indexOf("table class=\"diff\"") === -1) ? "table class='diff'" : "table class=\"diff\"";
            d[1] = d[1].split(c)[1];
            d[1] = "<table class=\"diff\"" + (d[1].substring(0, d[1].length - 25));
            b.push(d[1]);
            x.innerHTML = "S";
            x.setAttribute("title", "Convert diff report to text that can be saved.");
        }
        o.rf.innerHTML = b.join("");
        pd.options(x.parentNode);
    },

    //basic drag and drop for the report windows
    grab: function (e, x) {
        "use strict";
        var a = x.parentNode,
            b = a.getElementsByTagName("p")[0].style.display,
            c = {},
            ax = a.offsetLeft,
            ay = a.offsetTop,
            drop = function (g) {
                document.onmousemove = null;
                ax = a.offsetLeft;
                ay = a.offsetTop;
                g = null;
                pd.options(a);
                document.onmouseup = null;
            },
            boxmove = function (f) {
                f = f || window.event;
                a.style.right = "auto";
                a.style.left = ((ax + (f.clientX - a.mouseX)) / 10) + "em";
                a.style.top = ((ay + (f.clientY - a.mouseY)) / 10) + "em";
                document.onmouseup = drop;
            };
        if (b === "none") {
            if (a === o.re) {
                c = a.getElementsByTagName("button")[1];
            } else {
                c = a.getElementsByTagName("button")[0];
            }
            a.style.left = "auto";
            pd.minimize(c);
            return;
        }
        pd.top(a);
        e = e || window.event;
        a.mouseX = e.clientX;
        a.mouseY = e.clientY;
        document.onmousemove = boxmove;
        document.onmousedown = null;
        pd.options(a);
    },

    //maximize textareas and hide options
    hideOptions: function (x) {
        "use strict";
        if (!o.dt) {
            return;
        }
        o.bb = $$("modebeautify");
        o.dd = $$("modediff");
        o.mm = $$("modeminify");
        o.au = $$("ctype-auto");
        o.dt = $$("difftall");
        if (x.innerHTML === "Maximize inputs") {
            o.op.style.display = "none";
            o.bops.style.display = "none";
            o.dops.style.display = "none";
            o.mops.style.display = "none";
            o.to.style.display = "none";
            o.bd.className = "tall";
            o.md.className = "tall";
            o.bt.className = "difftall";
            o.nt.className = "difftall";
            if (window.innerHeight) {
                o.bi.style.height = ((window.innerHeight - 300) / 10) + "em";
                o.mi.style.height = ((window.innerHeight - 300) / 10) + "em";
                o.bx.style.height = ((window.innerHeight - 300) / 10) + "em";
                o.mx.style.height = ((window.innerHeight - 300) / 10) + "em";
                o.bo.style.height = ((window.innerHeight - 315) / 10) + "em";
                o.nx.style.height = ((window.innerHeight - 315) / 10) + "em";
            } else {
                o.bi.style.height = ((window.screen.availHeight - 430) / 10) + "em";
                o.mi.style.height = ((window.screen.availHeight - 430) / 10) + "em";
                o.bx.style.height = ((window.screen.availHeight - 430) / 10) + "em";
                o.mx.style.height = ((window.screen.availHeight - 430) / 10) + "em";
                o.bo.style.height = ((window.screen.availHeight - 445) / 10) + "em";
                o.nx.style.height = ((window.screen.availHeight - 445) / 10) + "em";
            }
            o.disp.className = "maximized";
            x.innerHTML = "Normal view";
            o.re.style.display = "none";
            o.rg.style.display = "none";
            o.ri.style.display = "none";
            o.rk.style.display = "none";
        } else if (x.innerHTML === "Normal view") {
            o.op.style.display = "block";
            if (o.bb.checked && o.au.checked) {
                o.bops.style.display = "block";
            } else if (o.dd.checked) {
                o.dops.style.display = "block";
            } else if (o.mm.checked && o.au.checked) {
                o.mops.style.display = "block";
            }
            o.bi.style.height = "";
            o.mi.style.height = "";
            o.bx.style.height = "";
            o.mx.style.height = "";
            o.bo.style.height = "";
            o.nx.style.height = "";
            if (typeof pd.position.diffreport === "object" && typeof pd.position.diffreport.display === "string" && pd.position.diffreport.display !== "none") {
                o.re.style.display = "block";
            } else {
                o.re.style.display = "none";
            }
            if (typeof pd.position.beaureport === "object" && typeof pd.position.beaureport.display === "string" && pd.position.diffreport.display !== "none") {
                o.rg.style.display = "block";
            } else {
                o.rg.style.display = "none";
            }
            if (typeof pd.position.minreport === "object" && typeof pd.position.minreport.display === "string" && pd.position.minreport.display !== "none") {
                o.ri.style.display = "block";
            } else {
                o.ri.style.display = "none";
            }
            if (typeof pd.position.statreport === "object" && typeof pd.position.statreport.display === "string" && pd.position.statreport.display !== "none") {
                o.rk.style.display = "block";
            } else {
                o.rk.style.display = "none";
            }
            if (!o.dt.checked) {
                o.bd.className = "wide";
                o.md.className = "wide";
                o.bt.className = "wide";
                o.nt.className = "wide";
            }
            o.to.style.display = "block";
            o.disp.className = "default";
            x.innerHTML = "Maximize inputs";
            o.re.style.display = "block";
            o.rg.style.display = "block";
            o.ri.style.display = "block";
            o.rk.style.display = "block";
        }
        pd.options(x);
        return false;
    },

    //toggle between tool modes and vertical/horizontal orientation of
    //textareas
    prettyvis: function (a) {
        "use strict";
        var optioncheck = function () {
                o.au.disabled = false;
                if (o.pt.checked) {
                    o.au.checked = true;
                }
                o.cv.disabled = false;
                o.pt.disabled = true;
                o.pt.checked = false;
            };
        if (a === o.bb) {
            optioncheck();
            o.bx.setAttribute("name", "paste_code");
            o.mx.removeAttribute("name");
            if (o.bi.value === "" && o.mi.value !== "") {
                o.bi.value = o.mi.value;
            } else if (o.bi.value === "" && o.bo.value !== "") {
                o.bi.value = o.bo.value;
            }
            o.bd.style.display = "block";
            o.md.style.display = "none";
            if (o.bt) {
                o.bt.style.display = "none";
            }
            if (o.nt) {
                o.nt.style.display = "none";
            }
            if (o.dops) {
                o.dops.style.display = "none";
            }
            o.mops.style.display = "none";
            if (o.cv.checked) {
                o.bops.style.display = "none";
            } else {
                o.bops.style.display = "block";
            }
        } else if (a === o.mm) {
            optioncheck();
            o.mx.setAttribute("name", "paste_code");
            o.bx.removeAttribute("name");
            if (o.mi.value === "" && o.bi.value !== "") {
                o.mi.value = o.bi.value;
            } else if (o.mi.value === "" && o.bo.value !== "") {
                o.mi.value = o.bo.value;
            }
            if (o.au.checked) {
                o.mops.style.display = "block";
            } else {
                o.mops.style.display = "none";
            }
            o.md.style.display = "block";
            o.bd.style.display = "none";
            if (o.bt) {
                o.bt.style.display = "none";
            }
            if (o.nt) {
                o.nt.style.display = "none";
            }
            if (o.dops) {
                o.dops.style.display = "none";
            }
            o.bops.style.display = "none";
        } else if (a === o.dd) {
            o.au.disabled = false;
            o.cv.disabled = false;
            o.pt.disabled = false;
            if (o.bo.value === "" && o.bi.value !== "") {
                o.bo.value = o.bi.value;
            } else if (o.bo.value === "" && o.mi.value !== "") {
                o.bo.value = o.mi.value;
            }
            o.bt.style.display = "block";
            o.nt.style.display = "block";
            o.bd.style.display = "none";
            o.md.style.display = "none";
            o.dops.style.display = "block";
            o.bops.style.display = "none";
            o.mops.style.display = "none";
            if (o.cv.checked || o.pt.checked) {
                o.dqp.style.display = "none";
                o.dqt.style.display = "none";
                o.db.style.display = "none";
            } else {
                o.dqp.style.display = "block";
                o.dqt.style.display = "block";
                o.db.style.display = "block";
            }
        } else if (a === o.dp) {
            o.mi.removeAttribute("style");
            o.mx.removeAttribute("style");
            o.bi.removeAttribute("style");
            o.bx.removeAttribute("style");
            o.bo.removeAttribute("style");
            o.nx.removeAttribute("style");
            o.bt.className = "wide";
            o.nt.className = "wide";
            o.bd.className = "wide";
            o.md.className = "wide";
        } else if (a === o.dt) {
            o.mi.removeAttribute("style");
            o.mx.removeAttribute("style");
            o.bi.removeAttribute("style");
            o.bx.removeAttribute("style");
            o.bo.removeAttribute("style");
            o.nx.removeAttribute("style");
            o.bt.className = "difftall";
            o.nt.className = "difftall";
            o.bd.className = "tall";
            o.md.className = "tall";
        }
        pd.options(a);
    },

    //alters available options depending upon language selection
    codeOps: function (x) {
        "use strict";
        o.bb = $$("modebeautify");
        o.dd = $$("modediff");
        o.mm = $$("modeminify");
        o.au = $$("ctype-auto");
        if (o.dd.checked) {
            o.mops.style.display = "none";
            o.bops.style.display = "none";
            if (o.cv.checked || o.pt.checked) {
                o.dqp.style.display = "none";
                o.dqt.style.display = "none";
                o.db.style.display = "none";
            } else {
                o.dqp.style.display = "block";
                o.dqt.style.display = "block";
                o.db.style.display = "block";
            }
        } else if (o.bb.checked) {
            o.mops.style.display = "none";
            o.dops.style.display = "none";
            if (o.cv.checked) {
                o.bops.style.display = "none";
            } else {
                o.bops.style.display = "block";
            }
        } else if (o.mm.checked) {
            o.bops.style.display = "none";
            o.dops.style.display = "none";
            if (o.au.checked) {
                o.mops.style.display = "block";
            } else {
                o.mops.style.display = "none";
            }
        }
        if (o.cv.checked) {
            o.csvp.style.display = "block";
        } else {
            o.csvp.style.display = "none";
        }
        if (x === false) {
            o.db.style.display = "block";
        } else {
            o.db.style.display = "none";
        }
    },

    //provides interaction to simulate a text input into a radio button
    //set with appropriate accessbility response
    indentchar: function (x) {
        "use strict";
        o.bc = $$("beau-char");
        o.dc = $$("diff-char");
        if (o.bb.checked && x === "beau-char") {
            o.bw.checked = true;
        } else if (o.dd.checked && x === "diff-char") {
            o.dw.checked = true;
        }
        if (o.bb.checked && o.bw.checked) {
            o.bc.style.background = "#eef8ff";
            o.bc.style.color = "#000";
            if (o.bc.value === "Click me for custom input") {
                o.bc.value = "";
            }
        } else if (o.bb.checked) {
            if (o.bc.value === "") {
                o.bc.value = "Click me for custom input";
                o.bc.style.color = "#888";
            }
            o.bc.style.background = "#eee";
        } else if (o.dd.checked && o.dw.checked) {
            o.dc.style.background = "#eef8ff";
            o.dc.style.color = "#000";
            if (o.dc.value === "Click me for custom input") {
                o.dc.value = "";
            }
        } else if (o.dd.checked) {
            if (o.dc.value === "") {
                o.dc.value = "Click me for custom input";
                o.dc.style.color = "#888";
            }
            o.dc.style.background = "#eee";
        }
        if (o.bcv !== "") {
            o.bc.value = o.bcv;
        }
        if (o.dcv !== "") {
            o.dc.value = o.dcv;
        }
    },

    //store tool changes into localStorage in effort to maintain state
    options: function (x) {
        "use strict";
        var a = {},
            b = 0;
        if (!ls) {
            return;
        }
        if (localStorage.hasOwnProperty("webtool") && localStorage.getItem("webtool") !== null) {
            pd.webtool = localStorage.getItem("webtool").replace(/prettydiffper/g, "%").split("prettydiffcsep");
        }
        if (localStorage.hasOwnProperty("optionString") && localStorage.getItem("optionString") !== null) {
            pd.optionString = localStorage.getItem("optionString").replace(/prettydiffper/g, "%").split("prettydiffcsep");
        }
        o.bb = $$("modebeautify");
        o.dd = $$("modediff");
        o.mm = $$("modeminify");
        o.dt = $$("difftall");
        o.sh = $$("hideOptions");
        o.ps = $$("diff-save");
        if (x === o.bb) {
            pd.optionString[0] = "api.mode: beautify";
        } else if (x === o.mm) {
            pd.optionString[0] = "api.mode: minify";
        } else if (x === o.dd) {
            pd.optionString[0] = "api.mode: diff";
        } else if (x === o.au) {
            pd.optionString[1] = "api.lang: auto";
        } else if (x === o.pt) {
            pd.optionString[1] = "api.lang: text";
        } else if (x === o.cv) {
            pd.optionString[1] = "api.lang: csv";
        } else if (x === o.ch) {
            pd.optionString[2] = "api.csvchar: \"" + o.ch.value + "\"";
        } else if (x === o.bq && o.bb.checked && o.bq.value !== "" && !isNaN(Number(o.bq.value))) {
            pd.optionString[3] = "api.insize: " + o.bq.value;
        } else if (x === o.dq && o.dd.checked && o.dq.value !== "" && !isNaN(Number(o.dq.value))) {
            pd.optionString[3] = "api.insize: " + o.dq.value;
        } else if (x === o.bc && o.bb.checked && o.bw.checked) {
            pd.optionString[4] = "api.inchar: \"" + o.bc.value + "\"";
            o.bcv = o.bc.value;
        } else if (x === o.bw && o.bb.checked) {
            pd.optionString[4] = "api.inchar: \"" + o.bc.value + "\"";
        } else if (x === o.bs && o.bb.checked) {
            pd.optionString[4] = "api.inchar: \" \"";
        } else if (x === o.ba && o.bb.checked) {
            pd.optionString[4] = "api.inchar: \"\\t\"";
        } else if (x === o.bn && o.bb.checked) {
            pd.optionString[4] = "api.inchar: \"\\n\"";
        } else if (x === o.dc && o.dd.checked && o.dw.checked) {
            pd.optionString[4] = "api.inchar: \"" + o.dc.value + "\"";
            o.dcv = o.dc.value;
        } else if (x === o.dw && o.dd.checked) {
            pd.optionString[4] = "api.inchar: \"" + o.dc.value + "\"";
        } else if (x === o.ds && o.dd.checked) {
            pd.optionString[4] = "api.inchar: \" \"";
        } else if (x === o.da && o.dd.checked) {
            pd.optionString[4] = "api.inchar: \"\\t\"";
        } else if (x === o.dz && o.dd.checked) {
            pd.optionString[4] = "api.inchar: \"\\n\"";
        } else if (x === o.iy && o.bb.checked) {
            pd.optionString[5] = "api.comments: indent";
        } else if (x === o.iz && o.bb.checked) {
            pd.optionString[5] = "api.comments: noindent";
        } else if (x === o.js && o.bb.checked) {
            pd.optionString[6] = "api.indent: allman";
        } else if (x === o.jt && o.bb.checked) {
            pd.optionString[6] = "api.indent: knr";
        } else if (x === o.jd && o.dd.checked) {
            pd.optionString[6] = "api.indent: allman";
        } else if (x === o.je && o.dd.checked) {
            pd.optionString[6] = "api.indent: knr";
        } else if (x === o.is && o.bb.checked) {
            pd.optionString[7] = "api.style: indent";
        } else if (x === o.it && o.bb.checked) {
            pd.optionString[7] = "api.stylet: noindent";
        } else if (x === o.id && o.dd.checked) {
            pd.optionString[7] = "api.style: indent";
        } else if (x === o.ie && o.dd.checked) {
            pd.optionString[7] = "api.style: noindent";
        } else if (x === o.hy && o.bb.checked) {
            pd.optionString[8] = "api.html: html-yes";
        } else if (x === o.hz && o.bb.checked) {
            pd.optionString[8] = "api.html: html-no";
        } else if (x === o.hm && o.mm.checked) {
            pd.optionString[8] = "api.html: html-yes";
        } else if (x === o.hn && o.mm.checked) {
            pd.optionString[8] = "api.html: html-no";
        } else if (x === o.hd && o.dd.checked) {
            pd.optionString[8] = "api.html: html-yes";
        } else if (x === o.he && o.dd.checked) {
            pd.optionString[8] = "api.html: html-no";
        } else if (x === o.context) {
            if (o.context.value === "" || isNaN(o.context.value)) {
                pd.optionString[9] = "api.context: \"\"";
            } else {
                pd.optionString[9] = "api.context: " + o.context.value;
            }
        } else if (x === o.du) {
            pd.optionString[10] = "api.content: true";
        } else if (x === o.dx) {
            pd.optionString[10] = "api.content: false";
        } else if (x === o.dr) {
            pd.optionString[11] = "api.quote: false";
        } else if (x === o.dy) {
            pd.optionString[11] = "api.quote: true";
        } else if (x === o.dm) {
            pd.optionString[12] = "api.semicolon: false";
        } else if (x === o.dn) {
            pd.optionString[12] = "api.semicolon: true";
        } else if (x === o.inline) {
            pd.optionString[13] = "api.diffview: inline";
        } else if (x === o.sideby) {
            pd.optionString[13] = "api.diffview: sidebyside";
        } else if (x === o.mb) {
            pd.optionString[14] = "api.topcoms: false";
        } else if (x === o.mc) {
            pd.optionString[14] = "api.topcoms: true";
        } else if (x === o.bg) {
            pd.optionString[15] = "api.force_indent: true";
        } else if (x === o.dg) {
            pd.optionString[15] = "api.force_indent: true";
        } else if (x === o.bf) {
            pd.optionString[15] = "api.force_indent: false";
        } else if (x === o.df) {
            pd.optionString[15] = "api.force_indent: false";
        } else if (x === o.re) {
            o.re = $$("diffreport");
            o.rf = $$("diffreportbody");
            if (o.rf.style.display === "none") {
                pd.webtool[3] = "diffreportzindex: 2";
                pd.webtool[4] = "diffreportmin: 1";
            } else {
                pd.webtool[3] = "diffreportzindex: " + o.re.style.zIndex;
                pd.webtool[4] = "";
            }
            pd.webtool[5] = "diffreportleft: " + o.re.offsetLeft;
            pd.webtool[6] = "diffreporttop: " + o.re.offsetTop;
            pd.webtool[7] = "diffreportwidth: " + ((o.rf.clientWidth / 10) - 0.3);
            pd.webtool[8] = "diffreportheight: " + ((o.rf.clientHeight / 10) - 3.6);
        } else if (x === o.rg) {
            o.rg = $$("beaureport");
            o.rh = $$("beaureportbody");
            if (o.rh.style.display === "none") {
                pd.webtool[9] = "beaureportzindex: 2";
                pd.webtool[10] = "beaureportmin: 1";
            } else {
                pd.webtool[9] = "beaureportzindex: " + o.rg.style.zIndex;
                pd.webtool[10] = "";
            }
            pd.webtool[11] = "beaureportleft: " + o.rg.offsetLeft;
            pd.webtool[12] = "beaureporttop: " + o.rg.offsetTop;
            pd.webtool[13] = "beaureportwidth: " + ((o.rh.clientWidth / 10) - 0.3);
            pd.webtool[14] = "beaureportheight: " + ((o.rh.clientHeight / 10) - 3.6);
        } else if (x === o.ri) {
            o.ri = $$("minreport");
            o.rj = $$("minreportbody");
            if (o.rj.style.display === "none") {
                pd.webtool[15] = "minnreportzindex: 2";
                pd.webtool[16] = "minnreportmin: 1";
            } else {
                pd.webtool[15] = "minnreportzindex: " + o.ri.style.zIndex;
                pd.webtool[16] = "";
            }
            pd.webtool[17] = "minnreportleft: " + o.ri.offsetLeft;
            pd.webtool[18] = "minnreporttop: " + o.ri.offsetTop;
            pd.webtool[19] = "minnreportwidth: " + ((o.rj.clientWidth / 10) - 0.3);
            pd.webtool[20] = "minnreportheight: " + ((o.rj.clientHeight / 10) - 3.6);
        } else if (x === o.rk) {
            o.rk = $$("statreport");
            o.rl = $$("statreportbody");
            if (o.rl.style.display === "none") {
                pd.webtool[21] = "statreportzindex: 2";
                pd.webtool[22] = "statreportmin: 1";
            } else {
                pd.webtool[21] = "statreportzindex: " + o.rk.style.zIndex;
                pd.webtool[22] = "";
            }
            pd.webtool[23] = "statreportleft: " + o.rk.offsetLeft;
            pd.webtool[24] = "statreporttop: " + o.rk.offsetTop;
            pd.webtool[25] = "statreportwidth: " + ((o.rl.clientWidth / 10) - 0.3);
            pd.webtool[26] = "statreportheight: " + ((o.rl.clientHeight / 10) - 3.6);
        }
        if (o.sh) {
            if (o.sh.innerHTML === "Normal view") {
                pd.webtool[0] = "showhide: hide";
            } else if (o.sh.innerHTML !== "Normal view") {
                pd.webtool[0] = "showhide: show";
            }
        }
        if (x === o.dp || !o.dt || !o.dt.checked) {
            pd.webtool[1] = "display: horizontal";
        } else if (x === o.dt || o.dt.checked) {
            pd.webtool[1] = "display: vertical";
        }
        if (o.ps) {
            a = o.re.getElementsByTagName("button")[0];
            if ((x === o.ps && o.ps.checked) || o.ps.checked) {
                pd.webtool[2] = "diffsave: true";
                a.innerHTML = "H";
                a.setAttribute("title", "Convert diff report to text that can be saved.");
            } else if (x === o.ps || !o.ps.checked) {
                pd.webtool[2] = "diffsave: false";
                a.innerHTML = "S";
                a.setAttribute("title", "Convert diff report to an HTML table.");
            }
        }
        o.option.innerHTML = ("/*prettydiff.com " + (pd.optionString.join(", ").replace(/(\,\s+\,\s+)+/g, ", ") + " */").replace(/((\,? )+\*\/)$/, " */")).replace(/^(\/\*prettydiff\.com (\, )+)/, "/*prettydiff.com ").replace(/(\,\s+\,\s+)+/g, ", ");
        if (pd.optionString[0] === "" || pd.optionString[0] === undefined) {
            if (o.bb.checked) {
                pd.optionString[0] = "api.mode: beautify";
            } else if (o.mm.checked) {
                pd.optionString[0] = "api.mode: minify";
            } else {
                pd.optionString[0] = "api.mode: diff";
            }
            localStorage.setItem("optionString", pd.optionString.join("prettydiffcsep").replace(/(prettydiffcsep)+/g, "prettydiffcsep").replace(/%/g, "prettydiffper"));
            pd.optionString[0] = "";
        } else {
            localStorage.setItem("optionString", pd.optionString.join("prettydiffcsep").replace(/(prettydiffcsep)+/g, "prettydiffcsep").replace(/%/g, "prettydiffper"));
        }

        //IMPORTANT the index for this loop must be one less than the
        //length on the parsed webtool storage. This limit prevents
        //excessive writing to the array which is corrupted each time
        //pd.options is executed
        for (b = 0; b < 26; b += 1) {
            if (typeof pd.webtool[b] !== "string") {
                pd.webtool[b] = "p";
            }
        }
        localStorage.setItem("webtool", pd.webtool.join("prettydiffcsep").replace(/(prettydiffcsep)+/g, "prettydiffcsep").replace(/%/g, "prettydiffper"));
    },

    //reset tool to default configuration
    reset: function () {
        "use strict";
        var a = o.re.getElementsByTagName("button");
        pd.optionString = [];
        pd.webtool = [];
        a[0].innerHTML = "S";
        a[1].innerHTML = "\u2191";
        o.rf.style.display = "none";
        o.re.style.display = "block";
        o.re.style.left = "auto";
        o.re.style.right = "68em";
        o.re.style.top = "64.1em";
        o.re.style.zIndex = "2";
        o.re.getElementsByTagName("p")[0].style.display = "none";
        o.rh.style.display = "none";
        o.rg.style.display = "block";
        o.rg.style.left = "auto";
        o.rg.style.right = "46em";
        o.rg.style.top = "64.1em";
        o.rg.style.zIndex = "2";
        o.rg.getElementsByTagName("p")[0].style.display = "none";
        o.rj.style.display = "none";
        o.ri.style.display = "block";
        o.ri.style.left = "auto";
        o.ri.style.right = "24em";
        o.ri.style.top = "64.1em";
        o.ri.style.zIndex = "2";
        o.ri.getElementsByTagName("p")[0].style.display = "none";
        o.rl.style.display = "none";
        if (!ls) {
            o.rk.style.display = "none";
        } else {
            o.rk.style.display = "block";
            o.rk.style.left = "auto";
            o.rk.style.right = "2em";
            o.rk.style.top = "64.1em";
            o.rk.style.zIndex = "2";
            o.rk.getElementsByTagName("p")[0].style.display = "none";
        }
        o.bi.style.height = "";
        o.mi.style.height = "";
        o.bx.style.height = "";
        o.mx.style.height = "";
        o.disp.className = "default";
        o.to.style.display = "block";
        o.op.style.display = "block";
        if (o.dops) {
            o.dops.style.display = "block";
            o.bops.style.display = "none";
        } else {
            o.bops.style.display = "block";
        }
        if (o.bt && o.nt) {
            o.bt.style.display = "block";
            o.nt.style.display = "block";
            o.bd.style.display = "none";
        } else {
            o.bd.style.display = "block";
        }
        o.mops.style.display = "none";
        o.csvp.style.display = "none";
        o.md.style.display = "none";
        if (o.bt) {
            o.bt.className = "wide";
        }
        if (o.nt) {
            o.nt.className = "wide";
        }
        o.bd.className = "wide";
        o.md.className = "wide";
        o.pt.disabled = true;
        o.au.checked = true;
        o.option.value = "/*prettydiff.com */";
        o.bq.value = "4";
        o.bc.value = "Click me for custom input";
        o.bc.style.color = "#888";
        o.bs.checked = true;
        o.is.checked = true;
        o.hz.checked = true;
        o.mb.checked = true;
        o.hn.checked = true;
        o.jt.checked = true;
        o.bf.checked = true;
        if (o.bo) {
            o.bo.style.height = "";
        }
        if (o.nx) {
            o.nx.style.height = "";
        }
        if (o.dd) {
            o.dd.checked = true;
        } else {
            o.bb.checked = true;
        }
        if (o.dp) {
            o.dp.checked = true;
        }
        if (o.sh) {
            o.sh.innerHTML = "Maximize inputs";
        }
        if (o.ds) {
            o.ds.checked = true;
        }
        if (o.dc) {
            o.dc.value = "Click me for custom input";
            o.dc.style.color = "#888";
        }
        if (o.je) {
            o.je.checked = true;
        }
        if (o.ps) {
            o.ps.checked = false;
        }
        if (o.context) {
            o.context.value = "";
        }
        if (o.dq) {
            o.dq.value = "4";
        }
        if (o.dx) {
            o.dx.checked = true;
        }
        if (o.dr) {
            o.dr.checked = true;
        }
        if (o.dm) {
            o.dm.checked = true;
        }
        if (o.sideby) {
            o.sideby.checked = true;
        }
        if (o.he) {
            o.he.checked = true;
        }
        if (o.id) {
            o.id.checked = true;
        }
        if (o.df) {
            o.df.checked = true;
        }
        if (ls && localStorage.hasOwnProperty("webtool")) {
            delete localStorage.webtool;
        }
        if (ls && localStorage.hasOwnProperty("optionString")) {
            delete localStorage.optionString;
        }
    },

    //alter tool on page load in reflection to saved state
    reload: function () {
        "use strict";
        var a = "",
            b = 0,
            c = 0,
            d = [],
            f = "",
            g = 0,
            h = "",
            i = {},
            j = new Date(),
            k = "",
            l = 0,
            bm = false,
            dm = false,
            mm = false,
            sm = false,
            bma = true,
            dma = true,
            mma = true,
            sma = true,
            source = true,
            diff = true,
            html = false,
            mode = "",
            stat = [],
            top = $$("options").offsetTop;
        o.bc = $$("beau-char");
        o.dc = $$("diff-char");
        o.re.style.top = ((top / 10) + 1) + "em";
        o.rg.style.top = ((top / 10) + 1) + "em";
        o.ri.style.top = ((top / 10) + 1) + "em";
        o.rk.style.top = ((top / 10) + 1) + "em";
        o.re.style.zIndex = "2";
        o.rg.style.zIndex = "2";
        o.ri.style.zIndex = "2";
        o.rk.style.zIndex = "2";
        if (ls && (localStorage.hasOwnProperty("optionString") || localStorage.hasOwnProperty("webtool") || localStorage.hasOwnProperty("statdata"))) {
            if (localStorage.hasOwnProperty("optionString") && localStorage.getItem("optionString") !== null) {
                o.option.innerHTML = "/*prettydiff.com " + (localStorage.getItem("optionString").replace(/prettydiffper/g, "%").replace(/(prettydiffcsep)+/g, ", ").replace(/(\,\s+\,\s+)+/g, ", ") + " */").replace(/((\,? )+\*\/)$/, " */");
                a = localStorage.getItem("optionString").replace(/prettydiffper/g, "%").split("prettydiffcsep");
                c = a.length;
                for (b = 0; b < c; b += 1) {
                    d = a[b].split(": ");
                    if (d[1]) {
                        f = d[1].charAt(0);
                        g = d[1].length - 1;
                        h = d[1].charAt(d[1].length - 2);
                        if ((f === "\"" || f === "'") && f === d[1].charAt(g) && h !== "\\") {
                            d[1] = d[1].substring(1, g);
                        }
                        if (d[0] === "api.mode") {
                            if (mode === "minify" || d[1] === "minify") {
                                o.mm.checked = true;
                                o.mx.setAttribute("name", "paste_code");
                                o.bx.removeAttribute("name");
                                if (o.bt) {
                                    o.bt.style.display = "none";
                                }
                                if (o.nt) {
                                    o.nt.style.display = "none";
                                }
                                o.md.style.display = "block";
                                o.bops.style.display = "none";
                                if (o.dops) {
                                    o.dops.style.display = "none";
                                }
                                if (o.pt.checked) {
                                    o.au.checked = true;
                                }
                                if (o.au.checked) {
                                    o.mops.style.display = "block";
                                } else {
                                    o.mops.style.display = "none";
                                }
                            } else if (mode === "beautify" || d[1] === "beautify") {
                                o.bb.checked = true;
                                if (o.bt) {
                                    o.bt.style.display = "none";
                                }
                                if (o.nt) {
                                    o.nt.style.display = "none";
                                }
                                o.bd.style.display = "block";
                                if (o.dops) {
                                    o.dops.style.display = "none";
                                }
                                o.mops.style.display = "none";
                                if (o.pt.checked) {
                                    o.au.checked = true;
                                }
                                if (o.au.checked) {
                                    o.ins.style.display = "block";
                                    o.ht.style.display = "block";
                                    o.bops.style.display = "block";
                                } else {
                                    o.ins.style.display = "none";
                                    o.ht.style.display = "none";
                                    o.bops.style.display = "none";
                                }
                            } else if (o.dd && (mode === "diff" || mode === "" || !d[1] || d[1] === "diff" || d[1] === "")) {
                                o.dd.checked = true;
                                o.pt.disabled = false;
                                o.bx.setAttribute("name", "paste_code");
                                o.mx.removeAttribute("name");
                                o.bd.style.display = "none";
                                o.md.style.display = "none";
                                o.bt.style.display = "block";
                                o.nt.style.display = "block";
                                o.dops.style.display = "block";
                                o.bops.style.display = "none";
                                o.mops.style.display = "none";
                                if (o.pt.checked || o.cv.checked) {
                                    o.db.style.display = "none";
                                } else {
                                    o.db.style.display = "block";
                                }
                                if (o.au.checked) {
                                    o.ind.style.display = "block";
                                    o.htd.style.display = "block";
                                } else {
                                    o.ind.style.display = "none";
                                    o.htd.style.display = "none";
                                }
                            }
                        } else if (d[0] === "api.lang") {
                            if (d[1] === "csv" || (o.dd.checked && d[1] === "text")) {
                                o.db.style.display = "none";
                                o.bops.style.display = "none";
                                o.mops.style.display = "none";
                                if (o.dops && o.dd.checked) {
                                    o.dops.style.display = "block";
                                }
                                if (d[1] === "csv") {
                                    o.cv.checked = true;
                                } else {
                                    o.pt.checked = true;
                                }
                            } else {
                                o.au.checked = true;
                            }
                        } else if (d[0] === "api.csvchar") {
                            o.ch.value = d[1];
                        } else if (d[0] === "api.insize") {
                            o.bq.value = d[1];
                            if (o.dq) {
                                o.dq.value = d[1];
                            }
                        } else if (d[0] === "api.inchar") {
                            if (d[1] === " ") {
                                if (o.ds) {
                                    o.ds.checked = true;
                                }
                                if (o.dc) {
                                    o.dc.value = "Click me for custom input";
                                    o.dc.style.background = "#eee";
                                    o.dc.style.color = "#888";
                                }
                                o.bs.checked = true;
                                o.bc.value = "Click me for custom input";
                                o.bc.style.background = "#eee";
                                o.bc.style.color = "#888";
                            } else if (d[1] === "\\t") {
                                if (o.da) {
                                    o.da.checked = true;
                                }
                                if (o.dc) {
                                    o.dc.value = "Click me for custom input";
                                    o.dc.style.background = "#eee";
                                    o.dc.style.color = "#888";
                                }
                                o.ba.checked = true;
                                o.bc.value = "Click me for custom input";
                                o.bc.style.background = "#eee";
                                o.bc.style.color = "#888";
                            } else if (d[1] === "\\n") {
                                if (o.dz) {
                                    o.dz.checked = true;
                                }
                                if (o.dc) {
                                    o.dc.value = "Click me for custom input";
                                    o.dc.style.background = "#eee";
                                    o.dc.style.color = "#888";
                                }
                                o.bn.checked = true;
                                o.bc.value = "Click me for custom input";
                                o.bc.style.background = "#eee";
                                o.bc.style.color = "#888";
                            } else {
                                if (o.dw) {
                                    o.dw.checked = true;
                                }
                                if (o.dc) {
                                    o.dc.value = d[1];
                                    o.dc.style.background = "#eef8ff";
                                    o.dc.style.color = "#000";
                                }
                                o.bw.checked = true;
                                o.bc.value = d[1];
                                o.bc.style.background = "#eef8ff";
                                o.bc.style.color = "#000";
                            }
                        } else if (d[0] === "api.comments" && d[1] === "noindent") {
                            o.iz.checked = true;
                        } else if (d[0] === "api.indent" && d[1] === "allman") {
                            o.jd.checked = true;
                            o.js.checked = true;
                        } else if (d[0] === "api.style" && d[1] === "noindent") {
                            o.ie.checked = true;
                            o.it.checked = true;
                        } else if (d[0] === "api.html" && d[1] === "html-yes") {
                            o.hd.checked = true;
                            o.hm.checked = true;
                            o.hy.checked = true;
                        } else if (d[0] === "api.context" && !isNaN(d[1])) {
                            o.context.value = d[1];
                        } else if (d[0] === "api.content" && d[1] === "true") {
                            o.du.checked = true;
                        } else if (d[0] === "api.quote" && d[1] === "true") {
                            o.dy.checked = true;
                        } else if (d[0] === "api.semicolon" && d[1] === "true") {
                            o.dn.checked = true;
                        } else if (d[0] === "api.diffview" && d[1] === "inline") {
                            o.inline.checked = true;
                        } else if (d[0] === "api.topcoms" && d[1] === "true") {
                            o.mc.checked = true;
                        }
                    }
                }
            }
            if (localStorage.hasOwnProperty("webtool") && localStorage.getItem("webtool") !== null) {
                a = localStorage.getItem("webtool").replace(/prettydiffper/g, "%").split("prettydiffcsep");
                c = a.length;
                for (b = 0; b < c; b += 1) {
                    d = a[b].split(": ");
                    if (typeof d[1] === "string") {
                        if (d[0] === "showhide" && d[1] === "hide") {
                            pd.hideOptions(o.sh);
                        } else if (o.dt && d[0] === "display" && d[1] === "vertical") {
                            o.dt.checked = true;
                            o.bt.className = "difftall";
                            o.nt.className = "difftall";
                            o.bd.className = "tall";
                            o.md.className = "tall";
                        } else if (d[0] === "diffsave" && d[1] === "true") {
                            o.ps.checked = true;
                            i = o.re.getElementsByTagName("button")[0];
                            i.innerHTML = "H";
                            i.setAttribute("title", "Convert diff report to text that can be saved.");
                        } else if (d[0] === "api.force_indent" && d[1] === "true") {
                            o.bg.checked = true;
                            o.dg.checked = true;
                        } else if (d[0].indexOf("report") === 4) {
                            if (d[0].indexOf("diff") === 0) {
                                dm = true;
                                if (d[0] === "diffreportleft") {
                                    o.re.style.left = (d[1] / 10) + "em";
                                } else if (d[0] === "diffreporttop") {
                                    o.re.style.top = (d[1] / 10) + "em";
                                } else if (d[0] === "diffreportwidth") {
                                    o.rf.style.width = d[1] + "em";
                                    o.re.getElementsByTagName("h2")[0].style.width = (d[1] - 9.65) + "em";
                                } else if (d[0] === "diffreportheight") {
                                    o.rf.style.height = d[1] + "em";
                                } else if (d[0] === "diffreportmin") {
                                    o.rf.style.display = "none";
                                    o.re.getElementsByTagName("p")[0].style.display = "none";
                                    o.re.getElementsByTagName("h2")[0].style.width = "20em";
                                    o.re.style.left = "auto";
                                    o.re.style.top = ((top / 10) + 1) + "em";
                                    dma = false;
                                } else if (d[0] === "diffreportzindex") {
                                    o.re.style.zIndex = d[1];
                                }
                            } else if (d[0].indexOf("beau") === 0) {
                                bm = true;
                                if (d[0] === "beaureportleft") {
                                    o.rg.style.left = (d[1] / 10) + "em";
                                } else if (d[0] === "beaureporttop") {
                                    o.rg.style.top = (d[1] / 10) + "em";
                                } else if (d[0] === "beaureportwidth") {
                                    o.rh.style.width = d[1] + "em";
                                    o.rg.getElementsByTagName("h2")[0].style.width = (d[1] - 6.65) + "em";
                                } else if (d[0] === "beaureportheight") {
                                    o.rh.style.height = d[1] + "em";
                                } else if (d[0] === "beaureportmin") {
                                    o.rh.style.display = "none";
                                    o.rg.getElementsByTagName("p")[0].style.display = "none";
                                    o.rg.getElementsByTagName("h2")[0].style.width = "20em";
                                    o.rg.style.left = "auto";
                                    o.rg.style.top = ((top / 10) + 1) + "em";
                                    bma = false;
                                } else if (d[0] === "beaureportzindex") {
                                    o.rg.style.zIndex = d[1];
                                }
                            } else if (d[0].indexOf("minn") === 0) {
                                mm = true;
                                if (d[0] === "minnreportleft") {
                                    o.ri.style.left = (d[1] / 10) + "em";
                                } else if (d[0] === "minnreporttop") {
                                    o.ri.style.top = (d[1] / 10) + "em";
                                } else if (d[0] === "minnreportwidth") {
                                    o.rj.style.width = d[1] + "em";
                                    o.ri.getElementsByTagName("h2")[0].style.width = (d[1] - 6.65) + "em";
                                } else if (d[0] === "minnreportheight") {
                                    o.rj.style.height = d[1] + "em";
                                } else if (d[0] === "minnreportmin") {
                                    o.rj.style.display = "none";
                                    o.ri.getElementsByTagName("p")[0].style.display = "none";
                                    o.ri.getElementsByTagName("h2")[0].style.width = "20em";
                                    o.ri.style.left = "auto";
                                    o.ri.style.top = ((top / 10) + 1) + "em";
                                    mma = false;
                                } else if (d[0] === "minnreportzindex") {
                                    o.ri.style.zIndex = d[1];
                                }
                            } else if (d[0].indexOf("stat") === 0) {
                                sm = true;
                                if (d[0] === "statreportleft") {
                                    o.rk.style.left = (d[1] / 10) + "em";
                                } else if (d[0] === "statreporttop") {
                                    o.rk.style.top = (d[1] / 10) + "em";
                                } else if (d[0] === "statreportwidth") {
                                    o.rl.style.width = d[1] + "em";
                                    o.rk.getElementsByTagName("h2")[0].style.width = (d[1] - 6.65) + "em";
                                } else if (d[0] === "statreportheight") {
                                    o.rl.style.height = d[1] + "em";
                                } else if (d[0] === "statreportmin") {
                                    o.rl.style.display = "none";
                                    o.rk.getElementsByTagName("p")[0].style.display = "none";
                                    o.rk.getElementsByTagName("h2")[0].style.width = "20em";
                                    o.rk.style.left = "auto";
                                    o.rk.style.top = ((top / 10) + 1) + "em";
                                    sma = false;
                                } else if (d[0] === "statreportzindex") {
                                    o.rk.style.zIndex = d[1];
                                }
                            }
                        }
                    }
                }
                if (dm && dma) {
                    o.re.style.right = "auto";
                    o.re.getElementsByTagName("p")[0].style.display = "block";
                    o.re.getElementsByTagName("p")[0].getElementsByTagName("button")[1].innerHTML = "\u2193";
                    o.rf.style.display = "block";
                }
                if (bm && bma) {
                    o.rg.style.right = "auto";
                    o.rg.getElementsByTagName("p")[0].style.display = "block";
                    o.rg.getElementsByTagName("p")[0].getElementsByTagName("button")[0].innerHTML = "\u2193";
                    o.rh.style.display = "block";
                }
                if (mm && mma) {
                    o.ri.style.right = "auto";
                    o.ri.getElementsByTagName("p")[0].style.display = "block";
                    o.ri.getElementsByTagName("p")[0].getElementsByTagName("button")[0].innerHTML = "\u2193";
                    o.rj.style.display = "block";
                }
                if (sm && sma) {
                    o.rk.style.right = "auto";
                    o.rk.getElementsByTagName("p")[0].style.display = "block";
                    o.rk.getElementsByTagName("p")[0].getElementsByTagName("button")[0].innerHTML = "\u2193";
                    o.rl.style.display = "block";
                }
            }
            if (localStorage.hasOwnProperty("statdata") && localStorage.getItem("statdata") !== null) {
                stat = localStorage.getItem("statdata").split("|");
                o.stat.visit = Number(stat[0]) + 1;
                stat[0] = o.stat.visit.toString();
                o.stvisit.innerHTML = stat[0];
                k = (Date.parse(new Date()) - Number(stat[stat.length - 1]));
                if (k < 86400000) {
                    k = 1;
                } else {
                    k = Number((k / 86400000).toFixed(0));
                }
                stat[3] = (o.stat.visit / k).toFixed(2);
                o.stat.avday = stat[3];
                localStorage.setItem("statdata", stat.join("|"));
                o.stat.usage = Number(stat[1]);
                o.stat.fdate = stat[2];
                o.stat.diff = Number(stat[4]);
                o.stat.beau = Number(stat[5]);
                o.stat.minn = Number(stat[6]);
                o.stat.markup = Number(stat[7]);
                o.stat.js = Number(stat[8]);
                o.stat.css = Number(stat[9]);
                o.stat.csv = Number(stat[10]);
                o.stat.text = Number(stat[11]);
                o.stat.pdate = stat[stat.length - 1];
                o.stusage.innerHTML = stat[1];
                o.stfdate.innerHTML = stat[2];
                o.stavday.innerHTML = stat[3];
                o.stdiff.innerHTML = stat[4];
                o.stbeau.innerHTML = stat[5];
                o.stminn.innerHTML = stat[6];
                o.stmarkup.innerHTML = stat[7];
                o.stjs.innerHTML = stat[8];
                o.stcss.innerHTML = stat[9];
                o.stcsv.innerHTML = stat[10];
                o.sttext.innerHTML = stat[11];
            } else {
                k = j.toLocaleDateString();
                o.stfdate.innerHTML = k;
                o.stat.fdate = k;
                stat = [1, 0, k, 1, 0, 0, 0, 0, 0, 0, 0, 0, Date.parse(j)];
                if (localStorage.hasOwnProperty("pageCount") && localStorage.getItem("pageCount") !== null) {
                    l = Number(localStorage.getItem("pageCount")) + 1;
                    o.stvisit.innerHTML = l;
                    o.stat.visit = l;
                    stat[0] = l;
                } else {
                    o.stat.visit = 1;
                }
                o.stat.usage = 0;
                o.stat.avday = 1;
                o.stat.diff = 0;
                o.stat.beau = 0;
                o.stat.minn = 0;
                o.stat.markup = 0;
                o.stat.js = 0;
                o.stat.css = 0;
                o.stat.csv = 0;
                o.stat.text = 0;
                localStorage.setItem("statdata", stat.join("|"));
            }
            if (o.cv.checked) {
                o.csvp.style.display = "block";
            }
            if (o.cv.checked || o.pt.checked) {
                o.db.style.display = "none";
            }
            if (o.bw.checked) {
                o.bc.style.backgroundColor = "#eef8ff";
                o.bc.style.color = "#000";
            }
            if (o.dw && o.dw.checked) {
                o.dc.style.backgroundColor = "#eef8ff";
                o.dc.style.color = "#000";
            }
        } else {
            o.bb = $$("modebeautify");
            o.dd = $$("modediff");
            o.mm = $$("modeminify");
            o.au = $$("ctype-auto");
            o.rk.style.display = "none";
            if (o.cv.checked) {
                o.csvp.style.display = "block";
            }
            if (o.mm.checked) {
                o.mx.setAttribute("name", "paste_code");
                o.bx.removeAttribute("name");
                o.bd.style.display = "none";
                o.md.style.display = "block";
                if (o.bt) {
                    o.bt.style.display = "none";
                }
                if (o.nt) {
                    o.nt.style.display = "none";
                }
                if (o.dops) {
                    o.dops.style.display = "none";
                }
                o.bops.style.display = "none";
                if (o.au.checked) {
                    o.mops.style.display = "block";
                } else {
                    o.mops.style.display = "none";
                }
            } else if (o.dd && o.dd.checked) {
                o.pt.disabled = false;
                o.bd.style.display = "none";
                o.md.style.display = "none";
                o.bt.style.display = "block";
                o.nt.style.display = "block";
                o.dops.style.display = "block";
                o.bops.style.display = "none";
                o.mops.style.display = "none";
                if (o.pt.checked || o.cv.checked) {
                    o.db.style.display = "none";
                } else {
                    o.db.style.display = "block";
                }
                if (o.au.checked) {
                    o.ind.style.display = "block";
                    o.htd.style.display = "block";
                } else {
                    o.ind.style.display = "none";
                    o.htd.style.display = "none";
                }
            } else if (o.bb.checked) {
                if (o.dops) {
                    o.dops.style.display = "none";
                }
                o.mops.style.display = "none";
                o.bd.style.display = "block";
                o.md.style.display = "none";
                if (o.bt) {
                    o.bt.style.display = "none";
                }
                if (o.nt) {
                    o.nt.style.display = "none";
                }
                if (o.au.checked) {
                    o.ins.style.display = "block";
                    o.ht.style.display = "block";
                    o.bops.style.display = "block";
                } else {
                    o.ins.style.display = "none";
                    o.ht.style.display = "none";
                    o.bops.style.display = "none";
                }
            }
            if (o.dt && o.dt.checked) {
                o.bt.className = "difftall";
                o.nt.className = "difftall";
                o.bd.className = "tall";
                o.md.className = "tall";
            }
            if (o.bw.checked) {
                o.bc.style.background = "#eef8ff";
                o.bc.style.color = "#000";
            }
            if (o.dw && o.dw.checked) {
                o.dc.style.background = "#eef8ff";
                o.dc.style.color = "#000";
            }
        }
        if (location && location.href && location.href.indexOf("?") !== -1) {
            d = location.href.split("?")[1].split("&");
            c = d.length;
            for (b = 0; b < c; b += 1) {
                if (d[b].indexOf("m=") === 0) {
                    f = d[b].toLowerCase().substr(2);
                    if (f === "beautify") {
                        o.bb.click();
                    } else if (f === "minify") {
                        o.mm.click();
                    } else if (o.dd && f === "diff") {
                        o.dd.click();
                    }
                } else if (d[b].indexOf("s=") === 0) {
                    source = d[b].substr(2);
                    o.bi.value = source;
                    o.mi.value = source;
                    if (o.bo) {
                        o.bo.value = source;
                    }
                } else if (d[b].indexOf("d=") === 0) {
                    diff = d[b].substr(2);
                    o.nx.value = diff;
                } else if (d[b].toLowerCase() === "html") {
                    html = true;
                }
            }
        }
        if (o.bc.value !== "" && o.bc.value !== "Click me for custom input") {
            o.bcv = o.bc.value;
        }
        if (o.dc && o.dc.value !== "" && o.dc.value !== "Click me for custom input") {
            o.dcv = o.dc.value;
        }
        if (html) {
            o.hd.checked = true;
            o.hm.checked = true;
            o.hy.checked = true;
        }
        if (source !== true && (o.bb.checked || o.mm.checked || (o.dd.checked && diff !== true))) {
            recycle();
            return;
        }
        if (ls) {
            if (localStorage.hasOwnProperty("bi") && localStorage.getItem("bi") !== null) {
                o.bi.value = localStorage.getItem("bi");
            }
            if (localStorage.hasOwnProperty("mi") && localStorage.getItem("mi") !== null) {
                o.mi.value = localStorage.getItem("mi");
            }
            if (o.bo && localStorage.hasOwnProperty("bo") && localStorage.getItem("bo") !== null) {
                o.bo.value = localStorage.getItem("bo");
            }
            if (o.nx && localStorage.hasOwnProperty("nx") && localStorage.getItem("nx") !== null) {
                o.nx.value = localStorage.getItem("nx");
            }
            if (o.bl && localStorage.hasOwnProperty("bl") && localStorage.getItem("bl") !== null) {
                o.bl.value = localStorage.getItem("bl");
            }
            if (o.nl && localStorage.hasOwnProperty("nl") && localStorage.getItem("ni") !== null) {
                o.nl.value = localStorage.getItem("nl");
            }
        }
    }
};
_gaq.push(["_setAccount", "UA-27834630-1"]);
_gaq.push(["_trackPageview"]);
if (bounce) {
    $$("webtool").onclick = function () {
        "use strict";
        _gaq.push(["_trackEvent", "Logging", "NoBounce", "NoBounce", null, false]);
    };
    bounce = false;
}
(function () {
    "use strict";
    var ga = document.createElement("script"),
        s = document.getElementsByTagName("script")[0];
    ga.setAttribute("type", s.getAttribute("type"));
    ga.setAttribute("async", true);
    ga.setAttribute("src", ("https:" === document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js");
    s.parentNode.insertBefore(ga, s);
    window.onerror = function (message, file, line) {
        var code = "",
            mode = (function () {
                if ($$("modebeautify").checked) {
                    code = $$("beautyinput").value;
                    return "beautify";
                }
                if ($$("modeminify").checked) {
                    code = $$("minifyinput").value;
                    return "minify";
                }
                code = $$("baseText").value + " " + $$("newText").value;
                return "diff";
            }()),
            sFormattedMessage = "";
        if (message === "prettydiff is not defined" && ls) {
            if (mode === "minify") {
                localStorage.setItem("mi", "");
            } else if (mode === "beautify") {
                localStorage.setItem("bi", "");
            } else {
                localStorage.setItem("bo", "");
                localStorage.setItem("nx", "");
            }
        }
        if (line > 0) {
            sFormattedMessage = "[" + file + " (" + line + ")] " + message + " " + mode + " " + o.lang + " " + code;
            _gaq.push(["_trackEvent", "Exceptions", "Application", sFormattedMessage, null, true]);
        }
    };
}());