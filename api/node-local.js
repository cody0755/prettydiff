/*prettydiff.com api.topcoms: true, api.insize: 4, api.inchar: " ", api.vertical: true */
/*jslint node:true */
/***********************************************************************
 node-local is written by Austin Cheney on 6 Nov 2012.  Anybody may use
 this code without permission so long as this comment exists verbatim in
 each instance of its use.

 http://www.travelocity.com/
 http://mailmarkup.org/
 http://prettydiff.com/
 **********************************************************************/
/*

http://prettydiff.com/

Command line API for Prettydiff for local execution only.  This API is
not intended for execution as a service on a remote server.

Arguments entered from the command line are separated by spaces and
values are separated from argument names by a colon.  For safety
argument values should always be quoted.

Examples:

> node node-local.js source:"c:\mydirectory\myfile.js" readmethod:"file"
 diff:"c:\myotherfile.js" 
> node node-local.js source:"c:\mydirectory\myfile.js" mode:"beautify"
 readmethod:"file" output:"c:\output\otherfile.js"
> node node-local.js source:"../package.json" mode:"beautify"
 readmethod:"filescreen"
*/

(function () {
    "use strict";
    var prettydiff    = require('../prettydiff.js'),
        fs            = require("fs"),
        http          = require("http"),
        cwd           = process.cwd(),
        sfiledump     = [],
        dfiledump     = [],
        sState        = [],
        dState        = [],
        clidata       = [
            [], []
        ],
        slash         = ((/^([a-zA-Z]:\\)/).test(cwd) === true) ? "\\" : "/",
        method        = "auto",
        startTime     = Date.now(),
        dir           = [
            0, 0, 0
        ],
        address       = {
            dabspath: "",
            dorgpath: "",
            oabspath: "",
            oorgpath: "",
            sabspath: "",
            sorgpath: ""
        },
        help          = false,
        diffCount     = [
            0, 0
        ],
        options       = {
            api         : "",
            bracepadding: false,
            braces      : "knr",
            color       : "white",
            comments    : "indent",
            conditional : false,
            content     : false,
            context     : "",
            correct     : false,
            csvchar     : ",",
            diff        : "",
            diffcli     : false,
            diffcomments: false,
            difflabel   : "new",
            diffview    : "sidebyside",
            elseline    : false,
            force_indent: false,
            html        : false,
            inchar      : " ",
            inlevel     : 0,
            insize      : 4,
            jsscope     : "none",
            lang        : "auto",
            langdefault : "text",
            mode        : "diff",
            obfuscate   : false,
            objsort     : "none",
            output      : "",
            preserve    : "none",
            quote       : false,
            readmethod  : "screen",
            report      : true,
            semicolon   : false,
            source      : "",
            sourcelabel : "base",
            space       : true,
            style       : "indent",
            topcoms     : false,
            vertical    : "none",
            wrap        : 0
        },
        colors = {
            del: {
                lineStart: "\x1B[31m",
                lineEnd  : "\x1B[39m",
                charStart: "\x1B[1m",
                charEnd  : "\x1B[22m"
            },
            ins: {
                lineStart: "\x1B[32m",
                lineEnd  : "\x1B[39m",
                charStart: "\x1B[1m",
                charEnd  : "\x1B[22m"
            },
            filepath: {
                start: "\x1B[36m",
                end  : "\x1B[39m"
            }
        },

        //ending messaging with stats
        ender     = function () {
            var plural = (function () {
                    var a = 0,
                        len = diffCount.length,
                        arr = [];
                    for (a = 0; a < len; a += 1) {
                        if (diffCount[a] === 1) {
                            arr.push("");
                        } else {
                            arr.push("s");
                        }
                    }
                    if (clidata[1].length === 1) {
                        arr.push("");
                    } else {
                        arr.push("s");
                    }
                    if (clidata[0].length === 1) {
                        arr.push("");
                    } else {
                        arr.push("s");
                    }
                    return arr;
                }()),
                log = [],
                time = 0;

            //indexes of diffCount array
            //0 - total number of differences
            //1 - the number of files containing those differences
            //2 - new files
            //3 - deleted files
            //last - total file count (not counting (sub)directories)
            if ((method !== "directory" && method !== "subdirectory") || sfiledump.length === 1) {
                diffCount[1] = 1;
                diffCount.push("1 file");
            } else {
                diffCount.push(sfiledump.length + " files");
            }
            if (options.diffcli === true && options.mode === "diff") {
                if (clidata[0].length > 0) {
                    log.push("\nFiles deleted:\n");
                    log.push(colors.del.lineStart);
                    log.push(clidata[0].join("\n"));
                    log.push(colors.del.lineEnd);
                    log.push("\n\n");
                }
                if (clidata[1].length > 0) {
                    log.push("\nFiles inserted:\n");
                    log.push(colors.ins.lineStart);
                    log.push(clidata[1].join("\n"));
                    log.push(colors.ins.lineEnd);
                    log.push("\n\n");
                }
            }
            log.push("Pretty Diff ");
            if (options.mode === "diff") {
                log.push("found ");
                log.push(diffCount[0]);
                log.push(" difference");
                log.push(plural[0]);
                log.push(" in ");
                log.push(diffCount[1]);
                log.push(" file");
                log.push(plural[1]);
                log.push(" out of ");
            } else if (options.mode === "beautify") {
                log.push("beautified ");
            } else if (options.mode === "minify") {
                log.push("minified ");
            }
            log.push(diffCount[diffCount.length - 1]);
            log.push(". ");
            if (options.mode === "diff" && (method === "directory" || method === "subdirectory")) {
                log.push(clidata[1].length);
                log.push(" file");
                log.push(plural[2]);
                log.push(" added. ");
                log.push(clidata[0].length);
                log.push(" file");
                log.push(plural[3]);
                log.push(" deleted. Executed in ");
            } else {
                log.push("Executed in ");
            }
            time = (Date.now() - startTime) / 1000;
            log.push(time);
            log.push(" second");
            if (time !== 1) {
                log.push("s");
            }
            log.push(".\n");
            console.log(log.join(""));
        },

        //extract errorcount from diff
        //report files for ender stats
        counter       = function (x) {
            var num = Number(x.substring(14, x.indexOf("</em>")));
            if (num > 0) {
                diffCount[0] += num;
                diffCount[1] += 1;
            }
            return x;
        },

        //html report template
        reports       = function () {
            var result = prettydiff.api(options),
                css = {
                    core   : "body{font-family:'Arial';font-size:10px;overflow-y:scroll}#announcement.big{color:#00c;font-weight:bold;height:auto;left:14em;margin:0;overflow:hidden;position:absolute;text-overflow:ellipsis;top:4.5em;white-space:nowrap;width:50%;z-index:5}#announcement.big strong.duplicate{display:block}#announcement.big span{display:block}#announcement.normal{color:#000;font-weight:normal;height:2.5em;margin:0 -5em -4.75em;position:static;width:27.5em}#apireturn textarea{font-size:1.2em;height:50em;width:100%}#apitest input,#apitest label,#apitest select,#apitest textarea{float:left}#apitest input,#apitest select,#apitest textarea{width:30em}#apitest label{width:20em}#apitest p{clear:both;padding-top:0.75em}#beau-other-span,#diff-other-span{left:-20em;position:absolute;width:0}#beauops p strong,#options p strong,#diffops p strong,#miniops p strong,#options .label,#diffops .label,#miniops .label,#beauops .label{display:block;float:left;font-size:1.2em;font-weight:bold;margin-bottom:1em;width:17.5em}#beauops span strong,#miniops span strong,#diffops span strong{display:inline;float:none;font-size:1em;width:auto}#feedreport{right:38.8em}#beautyinput,#minifyinput,#baseText,#newText,#beautyoutput,#minifyoutput{font-size:1em}#Beautify,#Minify,#diffBase,#diffNew{border-radius:0.4em;padding:1em 1.25em 0}#Beautify .input,#Minify .input,#Beautify .output,#Minify .output{width:49%}#Beautify .input label,#Beautify .output label,#Minify .input label,#Minify .output label{display:block;font-size:1.05em;font-weight:bold}#Beautify p.file,#Minify p.file{clear:none;float:none}#Beautify textarea,#Minify textarea{margin-bottom:0.75em}#checklist_option li{font-weight:bold}#checklist_option li li{font-weight:normal}#codeInput{margin-bottom:1em;margin-top:-3.5em}#codeInput #diffBase p,#codeInput #diffNew p{clear:both;float:none}#codeInput .input{clear:none;float:left}#codeInput .output{clear:none;float:right;margin-top:-2.4em}#cssreport.doc table{position:absolute}#css-size{left:24em}#css-uri{left:40em}#css-uri td{text-align:left}#csvchar{width:11.8em}#dcolorScheme{float:right;margin:-2em 0 0}#dcolorScheme label{display:inline-block;font-size:1em}#diff .addsource{cursor:pointer;margin-bottom:1em;padding:0}#diff .addsource input{display:block;float:left;margin:0.5em 0.5em -1.5em}#diff .addsource label{cursor:pointer;display:inline-block;font-size:1.2em;padding:0.5em 0.5em 0.5em 2em}#diffBase,#diffNew,#Beautify,#Minify,#doc div,#doc div div,#doc ol,#option_comment,#update,#thirdparties img,#diffoutput #thirdparties,.box h3.heading,.box .body,.options,.diff .replace em,.diff .delete em,.diff .insert em,button,fieldset{border-style:solid;border-width:0.1em}#diffBase,#diffNew{padding:1.25em 1%;width:47%}#diffBase textarea,#diffNew textarea{width:99.5%}#diffBase{float:left;margin-right:1%}#diffNew{float:right}#diffoutput{width:100%}#diffoutput #thirdparties li{display:inline-block;list-style-type:none}#diffoutput li em,#diffoutput p em,.analysis .bad,.analysis .good{font-weight:bold}#diffoutput ul{font-size:1.2em;margin-top:1em}#diffoutput ul li{display:list-item;list-style-type:disc}#displayOps{float:right;font-size:1.5em;font-weight:bold;margin:0 1em 0 0;position:relative;width:22.5em;z-index:10}#displayOps #displayOps-hide{clear:both;float:none;position:absolute;top:-20em}#displayOps.default{position:static}#displayOps.maximized{margin-bottom:-2em;position:relative}#displayOps a{border-style:solid;border-width:0.1em;height:1.2em;line-height:1.4;margin:0.1em 0 0 5em;padding:0.05em 0 0.3em;text-align:center;text-decoration:none}#displayOps button,#displayOps a{font-size:1em}#displayOps li{clear:none;display:block;float:left;list-style:none;margin:0;text-align:right;width:9em}#doc_contents a{text-decoration:none}#doc_contents ol{padding-bottom:1em}#doc_contents ol ol li{font-size:0.75em;list-style:lower-alpha;margin:0.5em 0 1em 3em}#doc #doc_contents ol ol{background-color:inherit;border-style:none;margin:0.25em 0.3em 0 0;padding-bottom:0}#doc div.beautify{border-style:none}#doc #execution h3{background:transparent;border-style:none;font-size:1em;font-weight:bold}#doc code,.doc code{display:block;font-family:'Courier New',Courier,'Lucida Console',monospace;font-size:1.1em}#doc div,.doc div{margin-bottom:2em;padding:0 0.5em 0.5em}#doc div div,.doc div div{clear:both;margin-bottom:1em}#doc em,.doc em,.box .body em{font-style:normal;font-weight:bold}#doc h2,.doc h2{font-size:1.6em;margin:0.5em 0.5em 0.5em 0}#doc h3,.doc h3{margin-top:0.5em}#doc ol,.doc ol{clear:both;padding:0}#doc ol li span,.doc ol li span{display:block;margin-left:2em}#doc ol ol,#doc ul ol,.doc ol ol,.doc ul ol{margin-right:0.5em}#doc td span,.doc td span{display:block}#doc table,.doc table,.box .body table{border-collapse:collapse;border-style:solid;border-width:0.2em;clear:both}#doc table,.doc table{font-size:1.2em}#doc td,#doc th,.doc td,.doc th{border-left-style:solid;border-left-width:0.1em;border-top-style:solid;border-top-width:0.1em;padding:0.5em}#doc th,.doc th{font-weight:bold}#doc ul,.doc ul{margin-top:1em}#doc ul li,.doc ul li{font-size:1.2em}#feedemail{display:block;width:100%}#feedreportbody{text-align:center}#feedreportbody .radiogroup .feedlabel{display:block;margin:0 0 1em;width:auto;font-size:1.4em}#feedreportbody .radiogroup span{margin:0 0 2em;display:inline-block;width:5em}#feedreportbody .radiogroup input{position:absolute;top:-2000em}#feedreportbody .radiogroup label{display:inline-block;border-style:solid;border-width:0.1em;line-height:1.5;text-align:center;height:1.5em;width:1.5em;border-radius:50%;cursor:pointer}#feedreportbody .radiogroup span span{font-size:0.8em;display:block;margin:0;width:auto}#feedsubmit{position:static;width:50%;float:none;text-shadow:none;height:3em;margin:2.5em auto 0;font-family:inherit}#function_properties h4{font-size:1.2em;float:none}#function_properties h4 strong{color:#c00}#function_properties h5{margin:0 0 0 -2.5em;font-size:1em}#function_properties ol{padding-right:1em}#functionGroup.append{border-radius:0.2em;border-style:solid;border-width:0.1em;padding:0.7em 1.2em;position:relative;top:-2.625em}#functionGroup.append input{cursor:pointer}#functionGroup.append label{cursor:pointer;font-size:1em}#functionGroup.append span{display:inline-block;margin-left:2em}#hideOptions{margin-left:5em}#introduction{clear:both;margin:0 0 0 5.6em;position:relative;top:-2.75em}#introduction .information,#webtool #introduction h2{left:-90em;position:absolute;top:0;width:10em}#introduction h2{float:none}#introduction li{clear:none;display:block;float:left;font-size:1.4em;margin:0 4.95em -1em 0}#introduction li li{font-size:1em;margin-left:2em}#introduction ul{clear:both;height:3em;margin:0 0 0 -5.5em;overflow:hidden;width:100em}#modalSave p{background:#eee;color:#333;font-size:3em;padding:1em;position:absolute;text-align:center;top:10em;width:25em;z-index:9001}#modalSave p em{display:block;font-size:0.75em;margin-top:1em}#modalSave p strong{color:#c00;font-weight:bold}#modalSave span{background:#000;display:block;left:0;opacity:0.5;position:absolute;top:0;z-index:9000}#codereport{right:19.8em}#option_comment{font-size:1.2em;height:2.5em;margin-bottom:-1.5em;width:100%}#option_commentClear{float:right;height:2em;margin:-0.5em -0.25em 0 0;padding:0;width:15em}#options{margin:0 0 1em}#options label{width:auto}#options p,#addOptions p{clear:both;font-size:1em;margin:0;padding:1em 0 0}#options p span{height:2em;margin:0 0 0 1em}#pdsamples{list-style-position:inside;margin:0;padding:0;position:relative;z-index:10}#pdsamples li{border-radius:1em;border-style:solid;border-width:0.1em;margin:0 0 3em;padding:1em}#pdsamples li div{border-radius:1em;border-style:solid;border-width:0.1em;margin:0;padding:1em}#pdsamples li p{display:inline-block;font-size:1em;margin:0}#pdsamples li p a{display:block;margin:0 0 1em 2em}#pdsamples li ul{margin:0 0 0 2em}#reports{height:4em}#reports h2{display:none}#samples #dcolorScheme{position:relative;z-index:1000}#samples #pdsamples li li{background:none transparent;border-style:none;display:list-item;list-style:disc outside;margin:0;padding:0.5em}#samples h1{float:none}#samples h2{float:none;font-size:1.5em;border-style:none;margin:1em 0}#showOptionsCallOut{background:#fff;border:0.1em solid #000;box-shadow:0.2em 0.2em 0.4em rgba(0,0,0,.15);left:28.6%;padding:0.5em;position:absolute;top:4.6em;width:20%;z-index:1000}#showOptionsCallOut a{color:#66f;font-weight:bold}#showOptionsCallOut em{color:#c00}#showOptionsCallOut strong{color:#090}#statreport{right:0.8em}#statreport .body p,#statreport .body li,#statreport .body h3{font-size:1.2em}#statreport .body h3{margin-top:0}#statreport .body ul{margin-top:1em}#textareaTabKey{position:absolute;border-width:0.1em;border-style:solid;padding:0.5em;width:24em;right:51%}#textareaTabKey strong{text-decoration:underline}#textreport{width:100%}#thirdparties a{border-style:none;display:block;height:4em;text-decoration:none}#title_text{border-style:solid;border-width:0.05em;display:block;float:left;font-size:1em;margin-left:0.55em;padding:0.1em}#top{left:0;overflow:scroll;position:absolute;top:-200em;width:1em}#top em{font-weight:bold}#update{clear:left;float:right;font-weight:bold;padding:0.5em;position:absolute;right:1.25em;top:4.75em}#webtool .diff h3{border-style:none solid solid;border-width:0 0.1em 0.2em;box-shadow:none;display:block;font-family:Verdana;margin:0 0 0 -.1em;padding:0.2em 2em;text-align:left}#webtool .options input[type=text]{margin-right:1em;width:11.6em}#webtool .options input[type=text],div input,textarea{border-style:inset;border-width:0.1em}.analysis th{text-align:left}.analysis td{text-align:right}.beautify,.diff{border-style:solid;border-width:0.2em;display:inline-block;font-family:'Courier New',Courier,'Lucida Console',monospace;margin:0 1em 1em 0;position:relative}.beautify .count,.diff .count{border-style:solid;border-width:0 0.1em 0 0;font-weight:normal;padding:0;text-align:right}.beautify .count li,.diff .count li{padding-left:2em}.beautify .count li{padding-top:0.5em}.beautify .count li.fold,.diff .count li.fold{color:#900;cursor:pointer;font-weight:bold;padding-left:0.5em}.beautify .data,.diff .data{text-align:left;white-space:pre}.beautify .data em{display:inline-block;font-style:normal;font-weight:bold;padding-top:0.5em}.beautify .data li,.diff .data li{padding-left:0.5em;white-space:pre}.beautify li,.diff li{border-style:none none solid;border-width:0 0 0.1em;display:block;line-height:1.2;list-style-type:none;margin:0;padding-bottom:0;padding-right:0.5em}.beautify ol,.diff ol{display:table-cell;margin:0;padding:0}.box{border-style:solid;border-width:0;left:auto;margin:0;padding:0;position:absolute;z-index:10}.box button{border-radius:0;border-style:solid;border-width:0.1em;display:block;float:right;font-family:'Lucida Console','Trebuchet MS','Arial';height:1.75em;padding:0;position:absolute;right:0;text-align:center;top:0;width:1.75em;z-index:7}.box button.resize{border-width:0.05em;cursor:se-resize;font-size:1.667em;font-weight:normal;height:0.8em;line-height:0.5em;margin:-.85em 0 0;position:absolute;right:0.05em;top:100%;width:0.85em}.box button.minimize{margin:0.35em 4em 0 0}.box button.maximize{margin:0.35em 1.75em 0 0}.box button.save{margin:0.35em 6.25em 0 0}.box .buttons{float:right;margin:0}.box h3.heading{cursor:pointer;float:left;font-size:1em;height:3em;margin:0 0 -3.2em;position:relative;width:17em;z-index:6}.box h3.heading span{display:block;font-size:1.8em;padding:0.25em 0 0 0.5em}.box .body{clear:both;height:20em;margin-top:-.1em;overflow:scroll;padding:4.25em 1em 1em;position:relative;right:0;top:0;width:75em;z-index:5}.button{margin:1em 0;text-align:center}.button button{display:block;font-size:2em;height:1.5em;margin:0 auto;padding:0;width:50%}.clear{clear:both;display:block}.diff .skip{border-style:none none solid;border-width:0 0 0.1em}.diff .diff-left,.diff .diff-right{display:table-cell}.diff .diff-left{border-style:none none none solid;border-width:0 0 0 0.1em}.diff .diff-right{border-style:none none none solid;border-width:0 0 0 0.1em;margin-left:-.1em;min-width:16.5em;right:0;top:0}.diff-right .data ol{min-width:16.5em}.diff-right .data{border-style:none solid none none;border-width:0 0.1em 0 0;width:100%}.diff-right .data li{min-width:16.5em}.diff li,.diff p,.diff h3,.beautify li{font-size:1.1em}.diff li{padding-top:0.5em}.diff li em{font-style:normal;margin:0 -.09em;padding:0.05em 0}.diff p.author{border-style:solid;border-width:0.2em 0.1em 0.1em;margin:0;overflow:hidden;padding:0.4em;text-align:right}.difflabel{display:block;height:0}.file,.labeltext{font-size:0.9em;font-weight:bold;margin-bottom:1em}.file input,.labeltext input{display:inline-block;margin:0 0.7em 0 0;width:16em}.input,.output{margin:0}.options{border-radius:0.4em;clear:both;margin-bottom:1em;padding:1em 1em 3.5em;width:auto}.options input,.options label{border-style:none;display:block;float:left}.output label{text-align:right}.options p span label{font-size:1em}.options p span{display:block;float:left;font-size:1.2em;min-width:14em;padding-bottom:0.5em}.options select,#csvchar{margin:0 0 0 1em}.options span label{margin-left:0.4em}body#doc{font-size:0.8em;margin:0 auto;max-width:80em}body#doc #function_properties ul{margin:0}body#doc #function_properties ul li{font-size:0.9em;margin:0.5em 0 0 4em}body#doc ul li,body#doc ol li{font-size:1.1em}body#doc table{font-size:1em}button,a.button{border-radius:0.15em;display:block;font-weight:bold;padding:0.2em 0;width:100%}div .button{text-align:center}div button,div a.button{display:inline-block;font-weight:bold;margin:1em 0;padding:1em 2em}button:hover,a.button:hover{cursor:pointer}fieldset{border-radius:0.9em;clear:both;margin:3.5em 0 -2em;padding:0 0 0 1em}h1{float:left;font-size:2em;margin:0 0.5em 0.5em 0}h1 svg,h1 img{border-style:solid;border-width:0.05em;float:left;height:1.5em;margin-right:0.5em;width:1.5em}h1 span{font-size:0.5em}h2,h3{background:#fff;border-style:solid;border-width:0.075em;display:inline-block;font-size:1.8em;font-weight:bold;margin:0 0.5em 0.5em 0;padding:0 0.2em}h3{font-size:1.6em}h4{font-size:1.4em}input[type='radio']{margin:0 0.25em}input[type='file']{box-shadow:none}label{display:inline;font-size:1.4em}legend{border-style:solid;border-width:0.1em;font-size:1.2em;font-weight:bold;margin-left:-.25em}li{clear:both;margin:1em 0 1em 3em}li h4{display:inline;float:left;margin:0.4em 0;text-align:left;width:14em}ol li{font-size:1.4em;list-style-type:decimal}ol li li{font-size:1em}p{clear:both;font-size:1.2em;margin:0 0 1em}select{border-style:inset;border-width:0.1em;width:11.85em}strong.new{background:#ff6;font-style:italic}strong label{font-size:1em;width:inherit}textarea{display:inline-block;font-family:'Courier New',Courier,'Lucida Console',monospace;height:10em;margin:0 0 -.1em;width:100%}ul{margin:-1.4em 0 2em;padding:0}ul li{list-style-type:none}@media print{div{width:100%}html td{font-size:0.8em;white-space:normal}p,.options,#Beautify,#Minify,#diff,ul{display:none}}@media screen and (-webkit-min-device-pixel-ratio:0){.beautify .count li{padding-top:0.546em}.beautify .data li{line-height:1.3}}@media (max-width: 640px){#functionGroup{height:4em}#functionGroup.append span{margin-left:0.5em;position:relative;z-index:10}#displayOps{margin-bottom:-2em;padding-right:0.75em;width:auto}#displayOps li{padding-top:2em}#displayOps a{margin-left:1em}#diffBase,#diffNew{width:46%}#reports{display:none}.labeltext input,.file input{width:12em}#update{margin-top:2.75em}#codeInput label{display:none}#doc #dcolorScheme{margin:0 0 1em}}",
                    scanvas: "#doc.canvas{color:#444}#webtool.canvas input.unchecked{background:#ccc;color:#333}.canvas *:focus,.canvas .filefocus,.canvas #feedreportbody .focus,.canvas #feedreportbody .active-focus{outline:0.1em dashed #00f}.canvas #Beautify,.canvas #Minify,.canvas #diffBase,.canvas #diffNew{background:#d8d8cf;border-color:#664;box-shadow:0 0.2em 0.4em rgba(128,128,92,0.5);color:#444}.canvas #beautyoutput,.canvas #minifyoutput{background:#ccc}.canvas #diffoutput #thirdparties{background:#c8c8bf;border-color:#664}.canvas #diffoutput #thirdparties a{color:#664}.canvas #diffoutput p em,.canvas #diffoutput li em{color:#050}.canvas #feedreportbody .radiogroup label{background:#f8f8f8}.canvas #feedreportbody .feedradio1:hover,.canvas #feedreportbody .active .feedradio1{background:#f66}.canvas #feedreportbody .feedradio2:hover,.canvas #feedreportbody .active .feedradio2{background:#f96}.canvas #feedreportbody .feedradio3:hover,.canvas #feedreportbody .active .feedradio3{background:#fc9}.canvas #feedreportbody .feedradio4:hover,.canvas #feedreportbody .active .feedradio4{background:#ff9}.canvas #feedreportbody .feedradio5:hover,.canvas #feedreportbody .active .feedradio5{background:#eea}.canvas #feedreportbody .feedradio6:hover,.canvas #feedreportbody .active .feedradio6{background:#cd9}.canvas #feedreportbody .feedradio7:hover,.canvas #feedreportbody .active .feedradio7{background:#8d8}.canvas #functionGroup.append{background:#d8d8cf;border-color:#664;box-shadow:0 0.2em 0.4em rgba(128,128,92,0.5)}.canvas #option_comment{background:#e8e8e8;border-color:#664;color:#444}.canvas #pdsamples li{background:#d8d8cf;border-color:#664}.canvas #pdsamples li div{background:#e8e8e8;border-color:#664}.canvas #pdsamples li div a{color:#664}.canvas #pdsamples li p a{color:#450}.canvas #textareaTabKey{background:#c8c8bf;border-color:#c33;color:#555}.canvas #top em{color:#fcc}.canvas #update,.canvas #title_text{background:#f8f8ee;box-shadow:0 0.1em 0.2em rgba(128,128,92,0.75);color:#464}.canvas .beautify .data em.s0,#doc.canvas .beautify .data em.s0{color:#000}.canvas .beautify .data em.s1,#doc.canvas .beautify .data em.s1{color:#f66}.canvas .beautify .data em.s2,#doc.canvas .beautify .data em.s2{color:#12f}.canvas .beautify .data em.s3,#doc.canvas .beautify .data em.s3{color:#090}.canvas .beautify .data em.s4,#doc.canvas .beautify .data em.s4{color:#d6d}.canvas .beautify .data em.s5,#doc.canvas .beautify .data em.s5{color:#7cc}.canvas .beautify .data em.s6,#doc.canvas .beautify .data em.s6{color:#c85}.canvas .beautify .data em.s7,#doc.canvas .beautify .data em.s7{color:#737}.canvas .beautify .data em.s8,#doc.canvas .beautify .data em.s8{color:#6d0}.canvas .beautify .data em.s9,#doc.canvas .beautify .data em.s9{color:#dd0s}.canvas .beautify .data em.s10,#doc.canvas .beautify .data em.s10{color:#893}.canvas .beautify .data em.s11,#doc.canvas .beautify .data em.s11{color:#b97}.canvas .beautify .data em.s12,#doc.canvas .beautify .data em.s12{color:#bbb}.canvas .beautify .data em.s13,#doc.canvas .beautify .data em.s13{color:#cc3}.canvas .beautify .data em.s14,#doc.canvas .beautify .data em.s14{color:#333}.canvas .beautify .data em.s15,#doc.canvas .beautify .data em.s15{color:#9d9}.canvas .beautify .data em.s16,#doc.canvas .beautify .data em.s16{color:#880}.canvas .beautify .data .l0{background:#f8f8ef}.canvas .beautify .data .l1{background:#fed}.canvas .beautify .data .l2{background:#def}.canvas .beautify .data .l3{background:#efe}.canvas .beautify .data .l4{background:#fef}.canvas .beautify .data .l5{background:#eef}.canvas .beautify .data .l6{background:#fff8cc}.canvas .beautify .data .l7{background:#ede}.canvas .beautify .data .l8{background:#efc}.canvas .beautify .data .l9{background:#ffd}.canvas .beautify .data .l10{background:#edc}.canvas .beautify .data .l11{background:#fdb}.canvas .beautify .data .l12{background:#f8f8f8}.canvas .beautify .data .l13{background:#ffb}.canvas .beautify .data .l14{background:#eec}.canvas .beautify .data .l15{background:#cfc}.canvas .beautify .data .l16{background:#eea}.canvas .beautify .data .c0{background:#ddd}.canvas .beautify .data li{color:#777}.canvas .analysis .bad{background-color:#ecb;color:#744}.canvas .analysis .good{background-color:#cdb;color:#474}.canvas .box{background:#ccc;border-color:#664}.canvas .box .body{background:#e8e8e8;border-color:#664;box-shadow:0 0.2em 0.4em rgba(128,128,92,0.75);color:#666}.canvas .box button{box-shadow:0 0.1em 0.2em rgba(128,128,92,0.75)}.canvas .box button.maximize{background:#cfd8cf;border-color:#464;color:#464}.canvas .box button.maximize:hover{background:#cfc;border-color:#282;color:#282}.canvas .box button.minimize{background:#cfcfd8;border-color:#446;color:#446}.canvas .box button.minimize:hover{background:#bbf;border-color:#228;color:#228}.canvas .box button.resize{background:#cfcfd8;border-color:#446;color:#446}.canvas .box button.resize:hover{background:#bbf;border-color:#228;color:#228}.canvas .box button.save{background:#d8cfcf;border-color:#644;color:#644}.canvas .box button.save:hover{background:#fcc;border-color:#822;color:#822}.canvas .box h3.heading:hover{background:#d8d8cf}.canvas .diff,.canvas .beautify,.canvas ol,.canvas .diff p.author,.canvas .diff h3,.canvas .diff-right,.canvas .diff-left{border-color:#664}.canvas .diff .count,.canvas .beautify .count{background:#c8c8bf}.canvas .diff .count .empty{background:#c8c8bf;border-color:#664;color:#c8c8bf}.canvas .diff .data,.canvas .beautify .data{background:#f8f8ef}.canvas .diff .data .delete em{background-color:#fdc;border-color:#600;color:#933}.canvas .diff .data .insert em{background-color:#efc;border-color:#060;color:#464}.canvas .diff .data .replace em{background-color:#ffd;border-color:#664;color:#880}.canvas .diff .delete{background-color:#da9;border-color:#c87;color:#600}.canvas .diff .equal,.canvas .beautify .data li{background-color:#f8f8ef;border-color:#ddd;color:#666}.canvas .diff .insert{background-color:#bd9;border-color:#9c7;color:#040}.canvas .diff .replace{background-color:#dda;border-color:#cc8;color:#660}.canvas .diff .skip{background-color:#eee;border-color:#ccc}.canvas .diff h3{background:#c8c8bf;color:#664}.canvas .diff p.author{background:#ddc;color:#666}.canvas #doc .analysis thead th,.canvas #doc .analysis th[colspan],.canvas .doc .analysis thead th,.canvas .doc .analysis th[colspan]{background:#c8c8bf}.canvas #doc div,.canvas .doc div,#doc.canvas div{background:#c8c8bf;border-color:#664}.canvas #doc div:hover,.canvas .doc div:hover,#doc.canvas div:hover{background:#d8d8cf}.canvas #doc div div,.canvas .doc div div,#doc.canvas div div{background:#e8e8e8;border-color:#664}.canvas #doc div div:hover,.canvas .doc div div:hover,#doc.canvas div div:hover,#doc.canvas div ol:hover{background:#f8f8ef}.canvas #doc em,.canvas .doc em,.canvas .box .body em,.canvas .box .body .doc em{color:#472}.canvas #doc ol,.canvas .doc ol,#doc.canvas ol{background:#e8e8e8;border-color:#664}.canvas #doc strong,.canvas .doc strong,.canvas .box .body strong{color:#933}.canvas #doc table,.canvas .doc table,#doc.canvas table,.canvas .box .body table{background:#f8f8ef;border-color:#664;color:#666}.canvas #doc td,.canvas .doc td,#doc.canvas td{border-color:#664}.canvas #doc th,.canvas .doc th,#doc.canvas th{background:#c8c8bf;border-left-color:#664;border-top-color:#664}.canvas #doc tr:hover,.canvas .doc tr:hover,#doc.canvas tr:hover{background:#c8c8bf}.canvas .file input,.canvas .labeltext input,.canvas .options input[type=text],.canvas .options select{background:#f8f8f8;border-color:#664}.canvas .options{background:#d8d8cf;border-color:#664;box-shadow:0 0.2em 0.4em rgba(128,128,92,0.5);color:#444}.canvas a{color:#450}.canvas a.button,.canvas button{background:#d8d8cf;border-color:#664;box-shadow:0 0.1em 0.2em rgba(128,128,92,0.75);color:#664}.canvas a.button:hover,.canvas a.button:active,.canvas button:hover,.canvas button:active{background:#ffe}.canvas fieldset{background:#e8e8e8;border-color:#664}.canvas h1 svg{border-color:#664;box-shadow:0 0.1em 0.2em rgba(128,128,92,0.75)}.canvas h2,.canvas h3{background:#f8f8ef;border-color:#664;box-shadow:0 0.1em 0.2em rgba(128,128,92,0.75);text-shadow:none}.canvas input,.canvas select{box-shadow:0.1em 0.1em 0.2em #999}.canvas legend{background:#f8f8ef;border-color:#664}.canvas textarea{background:#f8f8ef;border-color:#664}.canvas textarea:hover{background:#e8e8e8}html .canvas,body.canvas{background:#e8e8e8;color:#666}",
                    sshadow: "#doc.shadow{color:#ddd}#doc.shadow h3 a{color:#f90}#webtool.shadow input.unchecked{background:#666;color:#ddd}.shadow *:focus,.shadow .filefocus,.shadow #feedreportbody .focus,.shadow #feedreportbody .active-focus{outline:0.1em dashed #00f}.shadow #beautyoutput,.shadow #minifyoutput{background:#555;color:#eee}.shadow #Beautify,.shadow #Minify,.shadow #diffBase,.shadow #diffNew{background:#666;border-color:#999;color:#ddd}.shadow #Beautify label,.shadow #Minify label,.shadow #diffBase label,.shadow #diffNew label{text-shadow:0.1em 0.1em 0.1em #333}.shadow #diffoutput #thirdparties{background:#666;border-color:#999}.shadow #diffoutput #thirdparties a{box-shadow:0 0.2em 0.4em rgba(0,0,0,1);color:#000}.shadow #doc div,.shadow .doc div,#doc.shadow div{background:#666;border-color:#999}.shadow #doc div:hover,.shadow .doc div:hover,#doc.shadow div:hover{background:#777}.shadow #doc div div,.shadow .doc div div,#doc.shadow div div{background:#333;border-color:#999}.shadow #doc div div:hover,.shadow .doc div div:hover,#doc.shadow div div:hover,#doc.shadow div ol:hover{background:#444}.shadow #doc em,.shadow .doc em,.shadow .box .body em,.shadow .box .body .doc em,.shadow #diffoutput p em,.shadow #diffoutput li em{color:#684}.shadow #doc ol,.shadow .doc ol,#doc.shadow ol{background:#333;border-color:#999}.shadow #doc strong,.shadow .doc strong,.shadow .box .body strong{color:#b33}.shadow #doc table,.shadow .doc table,#doc.shadow table,.shadow .diff,.shadow .beautify,.shadow .box .body table{background:#333;border-color:#999;color:#ddd}.shadow #doc th,.shadow .doc th,#doc.shadow th{background:#bbb;border-left-color:#999;border-top-color:#999;color:#333}.shadow #doc tr:hover,.shadow .doc tr:hover,#doc.shadow tr:hover{background:#555}.shadow #feedreportbody .radiogroup label{background:#000}.shadow #feedreportbody .feedradio1:hover,.shadow #feedreportbody .active .feedradio1{background:#700}.shadow #feedreportbody .feedradio2:hover,.shadow #feedreportbody .active .feedradio2{background:#742}.shadow #feedreportbody .feedradio3:hover,.shadow #feedreportbody .active .feedradio3{background:#763}.shadow #feedreportbody .feedradio4:hover,.shadow #feedreportbody .active .feedradio4{background:#880}.shadow #feedreportbody .feedradio5:hover,.shadow #feedreportbody .active .feedradio5{background:#675}.shadow #feedreportbody .feedradio6:hover,.shadow #feedreportbody .active .feedradio6{background:#452}.shadow #feedreportbody .feedradio7:hover,.shadow #feedreportbody .active .feedradio7{background:#362}.shadow #functionGroup.append{background:#eee;border-color:#ccc;box-shadow:0 0.1em 0.2em rgba(64,64,64,0.15)}.shadow #functionGroup.append{background:#666;border-color:#999}.shadow #option_comment{background:#333;border-color:#999;color:#ddd}.shadow #option_comment,.shadow input,.shadow select{box-shadow:0.1em 0.1em 0.2em #000}.shadow #pdsamples li{background:#666;border-color:#999}.shadow #pdsamples li div{background:#333;border-color:#999}.shadow #pdsamples li p a{color:#f90}.shadow #pdsamples li p a:hover{color:#fc0}.shadow #textreport{background:#222}.shadow #title_text{border-color:#222;color:#eee}.shadow #top em{color:#9c6}.shadow #update{background:#ddd;border-color:#000;color:#222}.shadow .analysis .bad{background-color:#400;color:#c66}.shadow .analysis .good{background-color:#040;color:#6a6}.shadow .beautify .data em.s0,#doc.shadow .beautify .data em.s0{color:#fff}.shadow .beautify .data em.s1,#doc.shadow .beautify .data em.s1{color:#c44}.shadow .beautify .data em.s2,#doc.shadow .beautify .data em.s2{color:#69c}.shadow .beautify .data em.s3,#doc.shadow .beautify .data em.s3{color:#0c0}.shadow .beautify .data em.s4,#doc.shadow .beautify .data em.s4{color:#c0c}.shadow .beautify .data em.s5,#doc.shadow .beautify .data em.s5{color:#0cc}.shadow .beautify .data em.s6,#doc.shadow .beautify .data em.s6{color:#981}.shadow .beautify .data em.s7,#doc.shadow .beautify .data em.s7{color:#a7a}.shadow .beautify .data em.s8,#doc.shadow .beautify .data em.s8{color:#7a7}.shadow .beautify .data em.s9,#doc.shadow .beautify .data em.s9{color:#ff6}.shadow .beautify .data em.s10,#doc.shadow .beautify .data em.s10{color:#33f}.shadow .beautify .data em.s11,#doc.shadow .beautify .data em.s11{color:#933}.shadow .beautify .data em.s12,#doc.shadow .beautify .data em.s12{color:#990}.shadow .beautify .data em.s13,#doc.shadow .beautify .data em.s13{color:#987}.shadow .beautify .data em.s14,#doc.shadow .beautify .data em.s14{color:#fc3}.shadow .beautify .data em.s15,#doc.shadow .beautify .data em.s15{color:#897}.shadow .beautify .data em.s16,#doc.shadow .beautify .data em.s16{color:#f30}.shadow .beautify .data .l0{background:#333}.shadow .beautify .data .l1{background:#633}.shadow .beautify .data .l2{background:#335}.shadow .beautify .data .l3{background:#353}.shadow .beautify .data .l4{background:#636}.shadow .beautify .data .l5{background:#366}.shadow .beautify .data .l6{background:#640}.shadow .beautify .data .l7{background:#303}.shadow .beautify .data .l8{background:#030}.shadow .beautify .data .l9{background:#660}.shadow .beautify .data .l10{background:#003}.shadow .beautify .data .l11{background:#300}.shadow .beautify .data .l12{background:#553}.shadow .beautify .data .l13{background:#432}.shadow .beautify .data .l14{background:#640}.shadow .beautify .data .l15{background:#562}.shadow .beautify .data .l16{background:#600}.shadow .beautify .data .c0{background:#666}.shadow .box{background:#000;border-color:#999;box-shadow:0.6em 0.6em 0.8em rgba(0,0,0,.75)}.shadow .box .body{background:#333;border-color:#999;color:#ddd}.shadow .box button{box-shadow:0 0.1em 0.2em rgba(0,0,0,0.75);text-shadow:0.1em 0.1em 0.1em rgba(0,0,0,.5)}.shadow .box button.maximize{background:#9c9;border-color:#030;color:#030}.shadow .box button.maximize:hover{background:#cfc;border-color:#060;color:#060}.shadow .box button.minimize{background:#bbf;border-color:#006;color:#006}.shadow .box button.minimize:hover{background:#eef;border-color:#228;color:#228}.shadow .box button.resize{background:#bbf;border-color:#446;color:#446}.shadow .box button.resize:hover{background:#ddf;border-color:#228;color:#228}.shadow .box button.save{background:#d99;border-color:#300;color:#300}.shadow .box button.save:hover{background:#fcc;border-color:#822;color:#822}.shadow .box h3{background:#ccc;border-color:#333;box-shadow:0.2em 0.2em 0.8em #000;color:#222}.shadow .box h3.heading:hover{background:#222;border-color:#ddd;color:#ddd}.shadow .diff,.shadow .beautify,.shadow .diff div,.shadow .diff p,.ahadow .diff ol,.shadow .beautify ol,.shadow .diff li,.ahadow .beautify li,.shadow .diff .count li,.shadow .beautify .count li,.shadow .diff-right .data{border-color:#999}.shadow .diff .count,.shadow .beautify .count,#doc.shadow .diff .count,#doc.shadow .beautify .count{background:#bbb;color:#333}.shadow .diff .count .empty{background:#bbb;color:#bbb}.shadow .diff .data,.shadow .beautify .data{background:#333;color:#ddd}.shadow .diff .data .delete em{background-color:#700;border-color:#c66;color:#f99}.shadow .diff .data .insert em{background-color:#363;border-color:#6c0;color:#cfc}.shadow .diff .data .replace em{background-color:#440;border-color:#220;color:#cc9}.shadow .diff .delete{background-color:#300;border-color:#400;color:#c66}.shadow .diff .diff-right{border-color:#999 #999 #999 #333}.shadow .diff .empty{background-color:#999;border-color:#888}.shadow .diff .equal,.shadow .beautify .data li{background-color:#333;border-color:#404040;color:#ddd}.shadow .diff .insert{background-color:#040;border-color:#005000;color:#6c6}.shadow .diff .replace{background-color:#664;border-color:#707050;color:#bb8}.shadow .diff .skip{background-color:#000;border-color:#555}.shadow .diff h3,.shadow #doc .analysis th[colspan],.shadow #doc .analysis thead th,.shadow .doc .analysis th[colspan],.shadow .doc .analysis thead th{background:#555;border-color:#999;color:#ddd}.shadow .diff p.author{background:#555;border-color:#999;color:#ddd}.shadow .file input,.shadow .labeltext input,.shadow .options input[type=text],.shadow .options select{background:#333;border-color:#999;color:#ddd}.shadow .options{background:#666;border-color:#999;color:#ddd;text-shadow:0.1em 0.1em 0.2em #333}.shadow .options fieldset span input[type=text]{background:#222;border-color:#333}.shadow a{color:#f90}.shadow a:hover{color:#c30}.shadow a.button,.shadow button{background:#630;border-color:#600;box-shadow:0 0.2em 0.4em rgba(0,0,0,1);color:#f90;text-shadow:0.1em 0.1em 0.1em #000}.shadow a.button:hover,.shadow a.button:active,.shadow button:hover,.shadow button:active{background:#300;border-color:#c00;color:#fc0;text-shadow:0.1em 0.1em 0.1em rgba(0,0,0,.5)}.shadow h1 svg{border-color:#222;box-shadow:0.2em 0.2em 0.4em #000}.shadow h2,.shadow h3{background-color:#666;border-color:#666;box-shadow:none;color:#ddd;padding-left:0;text-shadow:none}.shadow textarea{background:#333;border-color:#000;color:#ddd}.shadow textarea:hover{background:#000}.shadow fieldset{background:#333;border-color:#999}.shadow input[disabled]{box-shadow:none}.shadow legend{background:#eee;border-color:#333;box-shadow:0 0.1em 0.2em rgba(0,0,0,0.75);color:#222;text-shadow:none}.shadow table td{border-color:#999}html .shadow,body.shadow{background:#222;color:#eee}",
                    swhite : "#webtool.white input.unchecked{background:#ccc;color:#666}.white *:focus,.white .filefocus,.white #feedreportbody .focus,.white #feedreportbody .active-focus{outline:0.1em dashed #00f}.white #beautyoutput,.white #minifyoutput{background:#ddd}.white #Beautify,.white #Minify,.white #diffBase,.white #diffNew{background:#eee;border-color:#ccc;box-shadow:0 0.2em 0.4em rgba(64,64,64,0.15)}.white #diffoutput #thirdparties{background:#eee}.white #diffoutput p em,.white #diffoutput li em{color:#c00}.white #doc .analysis thead th,.white #doc .analysis th[colspan],.white .doc .analysis thead th,.white .doc .analysis th[colspan]{background:#eef}.white #doc div,.white .doc div,#doc.white div{background:#ddd;border-color:#999}.white #doc div:hover,.white .doc div:hover,#doc.white div:hover{background:#ccc}.white #doc div div,.white .doc div div,#doc.white div div{background:#eee;border-color:#999}.white #doc div div:hover,.white .doc div div:hover,#doc.white div div:hover,#doc.white div ol:hover{background:#fff}.white #doc em,.white .doc em,#doc.white em{color:#060}.white #doc ol,.white .doc ol,#doc.white ol{background:#f8f8f8;border-color:#999}.white #doc strong,.white .doc strong,.white .box .body strong{color:#c00}#doc.white table,.white #doc table,.white .doc table,.white .box .body table{background:#fff;border-color:#999}.white #doc th,.white .doc th,#doc.white th{background:#ddd;border-left-color:#999;border-top-color:#999}.white #doc tr:hover,.white .doc tr:hover,#doc.white tr:hover{background:#ddd}.white #feedreportbody .radiogroup label{background:#f8f8f8}.white #feedreportbody .feedradio1:hover,.white #feedreportbody .active .feedradio1,.white #feedreportbody .active-focus .feedradio1{background:#f66}.white #feedreportbody .feedradio2:hover,.white #feedreportbody .active .feedradio2,.white #feedreportbody .active-focus .feedradio2{background:#f96}.white #feedreportbody .feedradio3:hover,.white #feedreportbody .active .feedradio3,.white #feedreportbody .active-focus .feedradio3{background:#fc9}.white #feedreportbody .feedradio4:hover,.white #feedreportbody .active .feedradio4,.white #feedreportbody .active-focus .feedradio4{background:#ff9}.white #feedreportbody .feedradio5:hover,.white #feedreportbody .active .feedradio5,.white #feedreportbody .active-focus .feedradio5{background:#eea}.white #feedreportbody .feedradio6:hover,.white #feedreportbody .active .feedradio6,.white #feedreportbody .active-focus .feedradio6{background:#cd9}.white #feedreportbody .feedradio7:hover,.white #feedreportbody .active .feedradio7,.white #feedreportbody .active-focus .feedradio7{background:#8d8}.white #functionGroup.append{background:#eee;border-color:#ccc;box-shadow:0 0.1em 0.2em rgba(64,64,64,0.15)}.white #introduction h2{border-color:#999;color:#333}.white #option_comment{background:#ddd;border-color:#999}.white #pdsamples li{background:#eee;border-color:#999}.white #pdsamples li div{background:#ddd;border-color:#999}.white #pdsamples li div a{color:#47a}.white #pdsamples li p a{color:#009}.white #thirdparties img,.white #diffoutput #thirdparties{border-color:#999}.white #textareaTabKey{background:#fff;border-color:#ccf}.white #thirdparties img{box-shadow:0.2em 0.2em 0.4em #999}.white #title_text{border-color:#fff;color:#333}.white #top em{color:#00f}.white #update{background:#ddd;border-color:#999;box-shadow:0 0.1em 0.2em rgba(64,64,64,0.15)}.white .analysis .bad{background-color:#ebb;color:#400}.white .analysis .good{background-color:#cec;color:#040}.white .beautify .data .l0{background:#fff}.white .beautify .data .l1{background:#fed}.white .beautify .data .l2{background:#def}.white .beautify .data .l3{background:#efe}.white .beautify .data .l4{background:#fef}.white .beautify .data .l5{background:#eef}.white .beautify .data .l6{background:#fff8cc}.white .beautify .data .l7{background:#ede}.white .beautify .data .l8{background:#efc}.white .beautify .data .l9{background:#ffd}.white .beautify .data .l10{background:#edc}.white .beautify .data .l11{background:#fdb}.white .beautify .data .l12{background:#f8f8f8}.white .beautify .data .l13{background:#ffb}.white .beautify .data .l14{background:#eec}.white .beautify .data .l15{background:#cfc}.white .beautify .data .l16{background:#eea}.white .beautify .data .c0{background:#ddd}.white .beautify .data em.s0,#doc.white .beautify .data em.s0{color:#000}.white .beautify .data em.s1,#doc.white .beautify .data em.s1{color:#f66}.white .beautify .data em.s2,#doc.white .beautify .data em.s2{color:#12f}.white .beautify .data em.s3,#doc.white .beautify .data em.s3{color:#090}.white .beautify .data em.s4,#doc.white .beautify .data em.s4{color:#d6d}.white .beautify .data em.s5,#doc.white .beautify .data em.s5{color:#7cc}.white .beautify .data em.s6,#doc.white .beautify .data em.s6{color:#c85}.white .beautify .data em.s7,#doc.white .beautify .data em.s7{color:#737}.white .beautify .data em.s8,#doc.white .beautify .data em.s8{color:#6d0}.white .beautify .data em.s9,#doc.white .beautify .data em.s9{color:#dd0}.white .beautify .data em.s10,#doc.white .beautify .data em.s10{color:#893}.white .beautify .data em.s11,#doc.white .beautify .data em.s11{color:#b97}.white .beautify .data em.s12,#doc.white .beautify .data em.s12{color:#bbb}.white .beautify .data em.s13,#doc.white .beautify .data em.s13{color:#cc3}.white .beautify .data em.s14,#doc.white .beautify .data em.s14{color:#333}.white .beautify .data em.s15,#doc.white .beautify .data em.s15{color:#9d9}.white .beautify .data em.s16,#doc.white .beautify .data em.s16{color:#880}.white .beautify .data li{color:#777}.white .box{background:#666;border-color:#999;box-shadow:0 0.4em 0.8em rgba(64,64,64,0.25)}.white .box .body{background:#eee;border-color:#888;box-shadow:0 0 0.4em rgba(64,64,64,0.75)}.white .box .body em,.white .box .body .doc em{color:#090}.white .box button{box-shadow:0 0.1em 0.2em rgba(0,0,0,0.25);text-shadow:0.1em 0.1em 0.1em rgba(0,0,0,.25)}.white .box button.maximize{background:#9c9;border-color:#030;color:#030}.white .box button.maximize:hover{background:#cfc;border-color:#060;color:#060}.white .box button.minimize{background:#bbf;border-color:#006;color:#006}.white .box button.minimize:hover{background:#eef;border-color:#228;color:#228}.white .box button.resize{background:#bbf;border-color:#446;color:#446}.white .box button.resize:hover{background:#ddf;border-color:#228;color:#228}.white .box button.save{background:#d99;border-color:#300;color:#300}.white .box button.save:hover{background:#fcc;border-color:#822;color:#822}.white .box h3.heading{background:#ddd;border-color:#888;box-shadow:0.2em 0.2em 0.4em #ccc}.white .box h3.heading:hover{background:#333;color:#eee}.white .diff,.white .beautify,.white .diff ol,.white .beautify ol,.white .diff .diff-left,.white .diff .diff-right,.white h3,.white p.author{border-color:#999}.white .diff .count li,.white .beautify .count li{background:#eed;border-color:#bbc;color:#886}.white .diff .data .delete em{background-color:#fdd;border-color:#700;color:#600}.white .diff .data .insert em{background-color:#efc;border-color:#070;color:#050}.white .diff .data .replace em{background-color:#ffd;border-color:#963;color:#630}.white .diff .delete{background-color:#fbb;border-color:#eaa}.white .diff .equal,.white .beautify .data li{background-color:#fff;border-color:#eee}.white .diff .empty{background-color:#ddd;border-color:#ccc}.white .diff .insert{background-color:#bfb;border-color:#aea}.white .diff .replace{background-color:#fea;border-color:#dd8}.white .diff .skip{background-color:#efefef;border-color:#ddd}.white .diff h3{background:#ddd;border-bottom-color:#bbc}.white .diff p.author{background:#efefef;border-top-color:#bbc}.white .file input,.white .labeltext input{border-color:#fff}.white .options{background:#eee;border-color:#ccc;box-shadow:0 0.2em 0.4em rgba(64,64,64,0.15);text-shadow:0.05em 0.05em 0.1em #ddd}.white .options input[type=text],.white .options select{border-color:#999}.white .options h2,.white #Beautify h2,.white #Minify h2,.white #diffBase h2,.white #diffNew h2{background:#eee;border-color:#eee;box-shadow:none;text-shadow:none}.white a{color:#009}.white a.button:hover,.white a.button:active,.white button:hover,.white button:active{background:#fee;border-color:#cbb;color:#966;text-shadow:0.05em 0.05em 0.1em #f8e8e8}.white fieldset{background:#ddd;border-color:#999}.white h1 svg{background:#eee;border-color:#999;box-shadow:0 0.1em 0.2em rgba(150,150,150,0.5)}.white h2,.white h3{background:#fefefe;border-color:#999;box-shadow:none;text-shadow:none}.white legend{background:#fff;border-color:#999;color:#333;text-shadow:none}.white div input{border-color:#999}.white textarea{border-color:#ccc;border-style:solid}.white textarea:hover{background:#eef8ff}body.white button,body.white a.button{background:#f8f8f8;border-color:#bbb;box-shadow:0 0.1em 0.2em rgba(64,64,64,0.15);color:#666;text-shadow:0.05em 0.05em 0.1em #e0e0e0}html .white,body.white{color:#333}#about_license a{display:block}"
                },
                a      = ["<?xml version='1.0' encoding='UTF-8' ?><!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'><html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en'><head><title>Pretty Diff - The difference tool</title><meta name='robots' content='index, follow'/> <meta name='DC.title' content='Pretty Diff - The difference tool'/> <link rel='canonical' href='http://prettydiff.com/' type='application/xhtml+xml'/><meta http-equiv='Content-Type' content='application/xhtml+xml;charset=UTF-8'/><meta http-equiv='Content-Style-Type' content='text/css'/><style type='text/css'>"];
            if (result[0].indexOf("Error: ") === 0) {
                return [
                    result[0], ""
                ];
            }
            a.push(css.core);
            a.push(css["s" + options.color]);
            a.push("</style></head><body class='");
            a.push(options.color);
            a.push("'><h1><a href='http://prettydiff.com/'>Pretty Diff - The difference tool</a></h1><div id='doc'>");
            a.push(result[1]);
            a.push("</div>");
            if (options.jsscope === true && options.mode === "beautify" && (options.lang === "javascript" || options.lang === "auto")) {
                a.push(result[0]);
                a.push("<script type='application/javascript'><![CDATA[");
                a.push("var pd={};pd.beaufold=function dom__beaufold(){'use strict';var self=this,title=self.getAttribute('title').split('line '),min=Number(title[1].substr(0,title[1].indexOf(' '))),max=Number(title[2]),a=0,b='',list=[self.parentNode.getElementsByTagName('li'),self.parentNode.nextSibling.getElementsByTagName('li')];if(self.innerHTML.charAt(0)==='-'){for(a=min;a<max;a+=1){list[0][a].style.display='none';list[1][a].style.display='none';}self.innerHTML='+'+self.innerHTML.substr(1);}else{for(a=min;a<max;a+=1){list[0][a].style.display='block';list[1][a].style.display='block';if(list[0][a].getAttribute('class')==='fold'&&list[0][a].innerHTML.charAt(0)==='+'){b=list[0][a].getAttribute('title');b=b.substring(b.indexOf('to line ')+1);a=Number(b)-1;}}self.innerHTML='-'+self.innerHTML.substr(1);}};(function(){'use strict';var lists=document.getElementsByTagName('ol'),listslen=lists.length,list=[],listlen=0,a=0,b=0;for(a=0;a<listslen;a+=1){if(lists[a].getAttribute('class')==='count'&&lists[a].parentNode.getAttribute('class')==='beautify'){list=lists[a].getElementsByTagName('li');listlen=list.length;for(b=0;b<listlen;b+=1){if(list[b].getAttribute('class')==='fold'){list[b].onmousedown=pd.beaufold;}}}}}());");
                a.push("]]></script></body></html>");
                return a.join("");
            }
            if (options.mode === "diff") {
                a.push("<p>Accessibility note. &lt;em&gt; tags in the output represent character differences per lines compared.</p>");
                a.push(result[0]);
                a.push("<script type='application/javascript'><![CDATA[");
                a.push("var pd={};pd.colSliderProperties=[];(function(){var d=document.getElementsByTagName('ol'),cells=d[0].getElemensByTagName('li'),len=cells.length,a=0;pd.colSliderProperties=[d[0].clientWidth,d[1].clientWidth,d[2].parentNode.clientWidth,d[2].parentNode.parentNode.clientWidth,d[2].parentNode.offsetLeft-d[2].parentNode.parentNode.offsetLeft,];for(a=0;a<len;a+=1){if(cells[a].getAttribute('class')==='fold'){cells[a].onmousedown=pd.difffold;}}if(d.length>3){d[2].onmousedown=pd.colSliderGrab;d[2].ontouchstart=pd.colSliderGrab;}}());pd.difffold=function dom__difffold(){var a=0,b=0,self=this,title=self.getAttribute('title').split('line '),min=Number(title[1].substr(0,title[1].indexOf(' '))),max=Number(title[2]),inner=self.innerHTML,lists=[],parent=self.parentNode.parentNode,listnodes=(parent.getAttribute('class')==='diff')?parent.getElementsByTagName('ol'):parent.parentNode.getElementsByTagName('ol'),listLen=listnodes.length;for(a=0;a<listLen;a+=1){lists.push(listnodes[a].getElementsByTagName('li'));}if(lists.length>3){for(a=0;a<min;a+=1){if(lists[0][a].getAttribute('class')==='empty'){min+=1;max+=1;}}}max=(max>=lists[0].length)?lists[0].length:max;if(inner.charAt(0)==='-'){self.innerHTML='+'+inner.substr(1);for(a=min;a<max;a+=1){for(b=0;b<listLen;b+=1){lists[b][a].style.display='none';}}}else{self.innerHTML='-'+inner.substr(1);for(a=min;a<max;a+=1){for(b=0;b<listLen;b+=1){lists[b][a].style.display='block';}}}};pd.colSliderGrab=function dom__colSliderGrab(e){var event=e||window.event,touch=(e.type==='touchstart')?true:false,node=this,diffRight=node.parentNode,diff=diffRight.parentNode,subOffset=0,counter=pd.colSliderProperties[0],data=pd.colSliderProperties[1],width=pd.colSliderProperties[2],total=pd.colSliderProperties[3],offset=pd.colSliderProperties[4],min=0,max=data-1,status='ew',minAdjust=min+15,maxAdjust=max-15,withinRange=false,diffLeft=diffRight.previousSibling,drop=function dom__colSliderGrab_drop(f){f=f||window.event;f.preventDefault();node.style.cursor=status+'-resize';if(touch===true){document.ontouchmove=null;document.ontouchend=null;}else{document.onmousemove=null;document.onmouseup=null;}},boxmove=function dom__colSliderGrab_boxmove(f){f=f||window.event;f.preventDefault();if(touch===true){subOffset=offset-f.touches[0].clientX;}else{subOffset=offset-f.clientX;}if(subOffset>minAdjust&&subOffset<maxAdjust){withinRange=true;}if(withinRange===true&&subOffset>maxAdjust){diffRight.style.width=((total-counter-2)/10)+'em';status='e';}else if(withinRange===true&&subOffset<minAdjust){diffRight.style.width=(width/10)+'em';status='w';}else if(subOffset<max&&subOffset>min){diffRight.style.width=((width+subOffset)/10)+'em';status='ew';}if(touch===true){document.ontouchend=drop;}else{document.onmouseup=drop;}};event.preventDefault();if(typeof pd.o==='object'&&pd.o.report.code.box!==null){offset+=pd.o.report.code.box.offsetLeft;offset-=pd.o.report.code.body.scrollLeft;}else{subOffset=(document.body.parentNode.scrollLeft>document.body.scrollLeft)?document.body.parentNode.scrollLeft:document.body.scrollLeft;offset-=subOffset;}offset+=node.clientWidth;node.style.cursor='ew-resize';diff.style.width=(total/10)+'em';diff.style.display='inline-block';if(diffLeft.nodeType!==1){do{diffLeft=diffLeft.previousSibling;}while(diffLeft.nodeType!==1);}diffLeft.style.display='block';diffRight.style.width=(diffRight.clientWidth/10)+'em';diffRight.style.position='absolute';if(touch===true){document.ontouchmove=boxmove;document.ontouchstart=false;}else{document.onmousemove=boxmove;document.onmousedown=null;}};");
                a.push("]]></script>");
                a.push("</body></html>");
                return [
                    a.join(""), ""
                ];
            }
            a.push("</body></html>");
            return [
                result[0], a.join("")
            ];
        },

        //instructions
        error         = (function () {
            var a = [];
            a.push("Arguments      - Type    - Definition");
            a.push("-------------------------------------");
            a.push("* bracepadding - boolean - Inserts a space after the start of a contain and");
            a.push("                           before the end of the container in JavaScript if the");
            a.push("                           contents of that container are not indented; such as:");
            a.push("                           conditions, function arguments, and escaped sequences");
            a.push("                           of template strings. Default is false.");
            a.push("");
            a.push("* braces       - string  - If lang is 'javascript' and mode is 'beautify' this");
            a.push("                           determines if opening curly braces will exist on the");
            a.push("                           same line as their condition or be forced onto a new");
            a.push("                           line. Defaults to 'knr'.");
            a.push("                 Accepted values: knr, allman");
            a.push("");
            a.push("* color        - string  - The color scheme of the reports. Default is shadow.");
            a.push("                 Accepted values: default, canvas, shadow, white");
            a.push("");
            a.push("* comments     - string  - If mode is 'beautify' this will determine whether");
            a.push("                           comments should always start at position 0 of each");
            a.push("                           line or if comments should be indented according to");
            a.push("                           sthe code. Default is 'indent'.");
            a.push("                 Accepted values: indent, noindent");
            a.push("");
            a.push("* conditional  - boolean - If true then conditional comments used by Internet");
            a.push("                           Explorer are preserved at minification of markup.");
            a.push("                           Default is false.");
            a.push("");
            a.push("* content      - boolean - If true and mode is 'diff' this will normalize all");
            a.push("                           string literals in JavaScript to 'text' and all");
            a.push("                           content in markup to 'text' so as to eliminate some");
            a.push("                           differences from the HTML diff report. Default is");
            a.push("                           false.");
            a.push("");
            a.push("* context      - number  - This shortens the diff output by allowing a");
            a.push("                           specified number of equivalent lines between each");
            a.push("                           line of difference. Defaults to an empty string,");
            a.push("                           which nullifies its use.");
            a.push("");
            a.push("* correct      - boolean - Automatically correct some sloppiness in JavaScript.");
            a.push("                           The default is 'false' and it is only applied during");
            a.push("                           JavaScript beautification.");
            a.push("");
            a.push("* csvchar      - string  - The character to be used as a separator if lang is");
            a.push("                           'csv'. Any string combination is accepted. Defaults");
            a.push("                           to a comma ','.");
            a.push("");
            a.push("* diff         - string  - The file to be compared to the source file. This is");
            a.push("                           required if mode is 'diff'.");
            a.push("");
            a.push("* diffcli      - boolean - If true only text lines of the code differences are");
            a.push("                           returned instead of an HTML diff report. Default is");
            a.push("                           false.");
            a.push("");
            a.push("* diffcomments - boolean - If true then comments will be preserved so that both");
            a.push("                           code and comments are compared by the diff engine.");
            a.push("");
            a.push("* difflabel    - string  - This allows for a descriptive label for the diff");
            a.push("                           file code of the diff HTML output. Defaults to new'.");
            a.push("");
            a.push("* diffview     - string  - This determines whether the diff HTML output should");
            a.push("                           display as a side-by-side comparison or if the");
            a.push("                           differences should display in a single table column.");
            a.push("                           Defaults to 'sidebyside'.");
            a.push("                 Accepted values: sidebyside, inline");
            a.push("");
            a.push("* elseline     - boolean - If elseline is true then the keyword 'else' is forced");
            a.push("                           onto a new line in JavaScript beautification.");
            a.push("                           Defaults to false.");
            a.push("");
            a.push("* force_indent - boolean - If lang is 'markup' this will force indentation upon");
            a.push("                           all content and tags without regard for the creation");
            a.push("                           of new text nodes. Default is false.");
            a.push("");
            a.push("* help         - string  - This list of argument definitions. The value is");
            a.push("                           unnecessary and is required only to pass in use of");
            a.push("                           the parameter.");
            a.push("");
            a.push("* html         - boolean - If lang is 'markup' this will provide an override so");
            a.push("                           that some tags are treated as singletons and not");
            a.push("                           start tags, such as '<br>' opposed to '<br/>'.");
            a.push("");
            a.push("* inchar       - string  - The string characters to comprise a single");
            a.push("                           indentation. Any string combination is accepted.");
            a.push("                           Defaults to space ' '.");
            a.push("");
            a.push("* inlevel      - number  - How much indentation padding should be applied to");
            a.push("                           JavaScript beautification?  Default is 0.");
            a.push("");
            a.push("* insize       - number  - The number of characters to comprise a single");
            a.push("                           indentation. Defaults to '4'.");
            a.push("");
            a.push("* jsscope      - string  - If 'html' JavaScript beautification produces HTML");
            a.push("                           formatted output coloring function scope and");
            a.push("                           variables to indicate scope depth and inheritance.");
            a.push("                           The value 'report' is similar to the value 'html',");
            a.push("                           except that it forms the entirety of an HTML");
            a.push("                           document. Default is 'none', which just returns");
            a.push("                           beautified JavaScript in text format.");
            a.push("                 Accepted values: none, report, html");
            a.push("");
            a.push("* lang         - string  - The programming language of the source file.");
            a.push("                           Defaults to auto.");
            a.push("                 Accepted values: auto, markup, javascript, css, html, csv, text");
            a.push("");
            a.push("* langdefault  - string  - The fallback option if lang is set to 'auto' and a");
            a.push("                           language cannot be detected.");
            a.push("                 Accepted values: markup, javascript, css, html, csv, text");
            a.push("");
            a.push("* mode         - string  - The operation to be performed. Defaults to 'diff'.");
            a.push("                 Accepted values: diff, beautify, minify.");
            a.push("");
            a.push("* obfuscate    - boolean - If JavaScript minification should result in smaller");
            a.push("                           variable names and fewer simicolons.  Default is");
            a.push("                           false.");
            a.push("");
            a.push("* objsort      - string  - Sorts properties by key name in JavaScript and/or");
            a.push("                           CSS. Defaults to 'none', which turns off sorting.");
            a.push("                 Accepted values: all, css, js, none");
            a.push("");
            a.push("* output       - string  - The path of the directory, if readmethod is value");
            a.push("                           'directory', or path and name of the file to write");
            a.push("                           the output.  If the directory path or file exists it");
            a.push("                           will be over written else it will be created.");
            a.push("");
            a.push("* preserve     - string  - Should empty lines be removed during JavaScript or");
            a.push("                           CSS beautification? Default value is true which");
            a.push("                           retains one empty line for any series of empty lines");
            a.push("                           in the code input.");
            a.push("                 Accepted values: all, css, js, none");
            a.push("");
            a.push("* quote        - boolean - If true and mode is 'diff' then all single quote");
            a.push("                           characters will be replaced by double quote");
            a.push("                           characters in both the source and diff file input so");
            a.push("                           as to eliminate some differences from the diff");
            a.push("                           report HTML output.");
            a.push("");
            a.push("* readmethod   - string  - The readmethod determines if operating with IO from");
            a.push("                           command line or IO from files.  Default value is");
            a.push("                           'screen':");
            a.push("                           * auto         - changes to value subdirectory,");
            a.push("                                            file, or screen depending on the");
            a.push("                                            source");
            a.push("                           * screen       - reads from screen and outputs to");
            a.push("                                            screen");
            a.push("                           * file         - reads a file and outputs to a file");
            a.push("                                          - file requires option 'output'");
            a.push("                           * filescreen   - reads a file and writes to screen");
            a.push("                           * directory    - process all files in the immediate");
            a.push("                                            directory");
            a.push("                           * subdirectory - process all files in a directory");
            a.push("                                            and its subdirectories");
            a.push("                 Accepted values: auto, screen, file, filescreen, directory,");
            a.push("                                  subdirectory");
            a.push("");
            a.push("* report       - boolean - Determines whether a report file should be created.");
            a.push("                           The default value is true.  If false reports will be");
            a.push("                           suppressed for 'beautify' and 'minify' modes if");
            a.push("                           readmethod is 'file' or 'directory'.");
            a.push("");
            a.push("* semicolon    - boolean - If true and mode is 'diff' and lang is 'javascript'");
            a.push("                           all semicolon characters that immediately preceed");
            a.push("                           any white space containing a new line character will");
            a.push("                           be removed so as to elimate some differences from");
            a.push("                           the diff report HTML output.");
            a.push("");
            a.push("* source       - string  - The file source for interpretation. This is required.");
            a.push("");
            a.push("* sourcelabel  - string  - This allows for a descriptive label of the source");
            a.push("                           file code of the diff HTML output. Defaults to 'base'");
            a.push("");
            a.push("* space        - boolean - If false the space following the function keyword for");
            a.push("                           anonymous functions is removed. Default is true.");
            a.push("* style        - string  - If mode is 'beautify' and lang is 'markup' or 'html'");
            a.push("                           this will determine whether the contents of script");
            a.push("                           and style tags should always start at position 0 of");
            a.push("                           each line or if such content should be indented");
            a.push("                           starting from the opening script or style tag.");
            a.push("                           Default is 'indent'.");
            a.push("                 Accepted values: indent, noindent");
            a.push("");
            a.push("* topcoms      - boolean - If mode is 'minify' this determines whether comments");
            a.push("                           above the first line of code should be kept. Default");
            a.push("                           is false.");
            a.push("");
            a.push("* vertical     - string  - If lists of assignments and properties should be");
            a.push("                           vertically aligned. Default is 'none'.");
            a.push("                 Accepted values: all, css, js, none");
            a.push("");
            a.push("* wrap         - number  - How many characters wide text can be before wrapping");
            a.push("                           from markup beautification. The default value is 0, ");
            a.push("                           which turns this feature off. Wrapping occurs on the");
            a.push("                           last space character prior to the given character");
            a.push("                           width");
            a.push("");
            return a.join("\n");
        }()),

        //defaults for the options
        args          = (function () {
            var a         = process.argv.slice(2),
                b         = 0,
                c         = a.length,
                d         = [],
                e         = [],
                f         = 0,
                alphasort = false,
                pathslash = function (name, x) {
                    var y    = x.indexOf("://"),
                        z    = "",
                        itempath = "",
                        ind  = "",
                        abspath = function () {
                            var tree  = cwd.split(slash),
                                ups   = [],
                                uplen = 0;
                            if (itempath.indexOf("..") === 0) {
                                ups   = itempath.split(".." + slash);
                                uplen = ups.length;
                                do {
                                    uplen -= 1;
                                    tree.pop();
                                } while (uplen > 1);
                                return tree.join(slash) + slash + ups[ups.length - 1];
                            }
                            if ((/^([a-z]:\\)/).test(itempath) === true || itempath.indexOf("/") === 0) {
                                return itempath;
                            }
                            return cwd + slash + itempath;
                        };
                    if (name === "diff") {
                        ind = 0;
                    }
                    if (name === "output") {
                        ind = 1;
                    }
                    if (name === "source") {
                        ind = 2;
                    }
                    if (x.indexOf("http://") === 0 || x.indexOf("https://") === 0) {
                        dir[ind] = 3;
                        return x;
                    }
                    if (y < 0) {
                        if (slash === "/") {
                            itempath = x.replace(/\\/g, "/");
                        } else {
                            itempath = x.replace(/\//g, "\\");
                        }
                    } else {
                        z = x.slice(0, y);
                        x = x.slice(y + 3);
                        if (slash === "/") {
                            itempath = z + "://" + x.replace(/\\/g, "/");
                        }
                        itempath = z + "://" + x.replace(/\//g, "\\");
                    }
                    fs.stat(itempath, function (err, stat) {
                        if (err !== null) {
                            dir[ind] = -1;
                            return "";
                        }
                        if (stat.isDirectory() === true) {
                            dir[ind] = 1;
                        } else if (stat.isFile() === true) {
                            dir[ind] = 2;
                        } else {
                            dir[ind] = -1;
                        }
                    });
                    if (name === "diff") {
                        address.dabspath = abspath();
                        address.dorgpath = itempath;
                    }
                    if (name === "output") {
                        address.oabspath = abspath();
                        address.oorgpath = itempath;
                        fs.mkdir(address.oabspath, function () {
                            return;
                        });
                    }
                    if (name === "source") {
                        address.sabspath = abspath();
                        address.sorgpath = itempath;
                    }
                    return itempath;
                };
            for (b = 0; b < c; b += 1) {
                e = [];
                f = a[b].indexOf(":");
                e.push(a[b].substring(0, f).replace(/(\s+)$/, ""));
                e.push(a[b].substring(f + 1).replace(/^(\s+)/, ""));
                d.push(e);
            }
            c = d.length;
            for (b = 0; b < c; b += 1) {
                if (d[b].length === 2) {
                    if (d[b][0] === "" && d[b][1] === "help") {
                        help = true;
                    }
                    if (d[b][0] === "api") {
                        options.api = "node";
                    }
                    if ((d[b][0] === "braces" && d[b][1] === "allman") || (d[b][0] === "indent" && d[b][1] === "allman")) {
                        options.braces = "allman";
                    }
                    if (d[b][0] === "color" && (d[b][1] === "default" || d[b][1] === "coffee" || d[b][1] === "dark" || d[b][1] === "canvas" || d[b][1] === "white")) {
                        options.color = d[b][1];
                    }
                    if (d[b][0] === "comments" && d[b][1] === "noindent") {
                        options.comments = "noindent";
                    }
                    if (d[b][0] === "conditional" && d[b][1] === "true") {
                        options.conditional = true;
                    }
                    if (d[b][0] === "content" && d[b][1] === "true") {
                        options.content = true;
                    }
                    if (d[b][0] === "context" && isNaN(d[b][1]) === false) {
                        options.context = Number(d[b][1]);
                    }
                    if (d[b][0] === "correct" && d[b][1] === "true") {
                        options.correct = true;
                    }
                    if (d[b][0] === "csvchar" && d[b][1].length > 0) {
                        options.csvchar = d[b][1];
                    }
                    if (d[b][0] === "diff" && d[b][1].length > 0) {
                        options.diff = pathslash(d[b][0], d[b][1]);
                    }
                    if (d[b][0] === "diffcli" && d[b][1] === "true") {
                        options.diffcli = true;
                    }
                    if (d[b][0] === "diffcomments" && d[b][1] === "true") {
                        options.diffcomments = true;
                    }
                    if (d[b][0] === "difflabel" && d[b][1].length > 0) {
                        options.difflabel = d[b][1];
                    }
                    if (d[b][0] === "diffview" && d[b][1] === "inline") {
                        options.diffview = "inline";
                    }
                    if (d[b][0] === "elseline" && d[b][1] === "true") {
                        options.elseline = true;
                    }
                    if (d[b][0] === "force_indent" && d[b][1] === "true") {
                        options.force_indent = true;
                    }
                    if (d[b][0] === "html" && d[b][1] === "true") {
                        options.html = true;
                    }
                    if (d[b][0] === "inchar" && d[b][1].length > 0) {
                        d[b][1]        = d[b][1].replace(/\\t/g, "\u0009").replace(/\\n/g, "\u000a").replace(/\\r/g, "\u000d").replace(/\\f/g, "\u000c").replace(/\\b/g, "\u0008");
                        options.inchar = d[b][1];
                    }
                    if (d[b][0] === "inlevel" && isNaN(d[b][1]) === false) {
                        options.inlevel = Number(d[b][1]);
                    }
                    if (d[b][0] === "insize" && isNaN(d[b][1]) === false) {
                        options.insize = Number(d[b][1]);
                    }
                    if (d[b][0] === "jsscope") {
                        if (d[b][1] === "true") {
                            options.jsscope = "report";
                        } else if (d[b][1] === "report" || d[b][1] === "html") {
                            options.jsscope = d[b][1];
                        } else {
                            options.jsscope = "none";
                        }
                    }
                    if (d[b][0] === "lang" && (d[b][1] === "markup" || d[b][1] === "javascript" || d[b][1] === "css" || d[b][1] === "html" || d[b][1] === "csv" || d[b][1] === "text")) {
                        options.lang = d[b][1];
                        if (d[b][1] === "html") {
                            options.html = true;
                        }
                    }
                    if (d[b][0] === "langdefault" && (d[b][1] === "markup" || d[b][1] === "javascript" || d[b][1] === "css" || d[b][1] === "html" || d[b][1] === "csv")) {
                        options.langdefault = d[b][1];
                    }
                    if (d[b][0] === "mode" && (d[b][1] === "minify" || d[b][1] === "beautify")) {
                        options.mode = d[b][1];
                    }
                    if (d[b][0] === "obfuscate" && d[b][1] === "true") {
                        options.obfuscation = true;
                    }
                    if (d[b][0] === "objsort") {
                        if (d[b][1] === "all" || d[b][1] === "css" || d[b][1] === "js") {
                            options.objsort = d[b][1];
                        } else if (d[b][1] === "true") {
                            options.objsort = "all";
                        }
                    }
                    if (d[b][0] === "output" && d[b][1].length > 0) {
                        options.output = pathslash(d[b][0], d[b][1]);
                    }
                    if (d[b][0] === "preserve") {
                        if (d[b][1] === "all" || d[b][1] === "css" || d[b][1] === "js") {
                            options.preserve = d[b][1];
                        } else if (d[b][1] === "true") {
                            options.preserve = "all";
                        }
                    }
                    if (d[b][0] === "quote" && d[b][1] === "true") {
                        options.quote = true;
                    }
                    if (d[b][0] === "readmethod") {
                        if (d[b][1] === "auto") {
                            options.readmethod = "auto";
                        }
                        if (d[b][1] === "file") {
                            options.readmethod = "file";
                        }
                        if (d[b][1] === "filescreen") {
                            options.readmethod = "filescreen";
                        }
                        if (d[b][1] === "directory") {
                            options.readmethod = "directory";
                        }
                        if (d[b][1] === "subdirectory") {
                            options.readmethod = "subdirectory";
                        }
                        method = options.readmethod;
                    }
                    if (d[b][0] === "report") {
                        options.output = d[b][1];
                    }
                    if (d[b][0] === "semicolon" && d[b][1] === "true") {
                        options.semicolon = true;
                    }
                    if (d[b][0] === "source" && d[b][1].length > 0) {
                        options.source = pathslash(d[b][0], d[b][1]);
                    }
                    if (d[b][0] === "sourcelabel" && d[b][1].length > 0) {
                        options.sourcelabel = d[b][1];
                    }
                    if (d[b][0] === "space" && d[b][1] === "false") {
                        options.space = false;
                    }
                    if (d[b][0] === "style" && d[b][1] === "noindent") {
                        options.style = "noindent";
                    }
                    if (d[b][0] === "topcoms" && d[b][1] === "true") {
                        options.topcoms = true;
                    }
                    if (d[b][0] === "vertical") {
                        if (d[b][1] === "all" || d[b][1] === "css" || d[b][1] === "js") {
                            options.vertical = d[b][1];
                        } else if (d[b][1] === "true") {
                            options.vertical = "all";
                        }
                    }
                    if (d[b][0] === "wrap") {
                        if (isNaN(d[b][1])) {
                            options.wrap = 0;
                        } else {
                            options.wrap = Number(d[b][1]);
                        }
                    }
                } else if (help === false && (d[b] === "help" || d[b][0] === "help")) {
                    help = true;
                }
            }
            if (alphasort === true) {
                options.objsort = "all";
            }
            return c;
        }()),

        //write output to a file
        //executed from fileComplete
        fileWrite   = function (data) {
            var dirs      = data.localpath.split(slash),
                suffix    = (options.mode === "diff") ? "-diff.html" : "-report.html",
                filename  = dirs[dirs.length - 1],
                count     = 1,
                finalpath = "",
                report    = [
                    "", ""
                ],
                writing   = function (ending) {
                    fs.writeFile(address.oabspath + slash + finalpath + ending, report[0], function (err) {
                        if (err !== null) {
                            console.log("\nError writing report output.\n");
                            console.log(err);
                        } else if (method === "file") {
                            console.log("\nReport successfully written to file.");
                        }
                    });
                },
                files  = function () {
                    if (options.mode === "diff" || (options.mode === "beautify" && options.jsscope === true)) {
                        writing(suffix);
                    } else {
                        if (options.report === true) {
                            writing(suffix);
                        }
                        writing("");
                    }
                    if (data.last === true) {
                        ender();
                    }
                },
                newdir = function () {
                    fs.mkdir(address.oabspath + slash + dirs.slice(0, count).join(slash), function () {
                        count += 1;
                        if (count < dirs.length + 1) {
                            newdir();
                        } else {
                            files();
                        }
                    });
                };
            dirs.pop();
            options.source = sfiledump[data.index];
            if (options.mode === "diff") {
                finalpath = (dirs.length > 0) ? "__" + dirs.join("__") + "__" + filename : filename;
                options.diff = dfiledump[data.index];
            } else {
                finalpath = (method === "file") ? filename : dirs.join(slash) + slash + filename;
            }
            report = reports();
            if (options.mode === "diff") {
                report[0].replace(/<strong>Number of differences:<\/strong> <em>\d+<\/em> difference/, counter);
            }
            if (report[0].indexOf("Error") === 0) {
                if (data.last === true) {
                    ender();
                }
                return console.log(report[0]);
            }
            if (dirs.length > 0 && options.mode !== "diff") {
                newdir();
            } else {
                files();
            }
        },

        //write the CLI output
        cliWrite = function (output, path) {console.log(output);
            var a = 0,
                b = 0,
                plural = "",
                pdlen = output[0].length;
            diffCount[0] += output[output.length - 1];
            diffCount[1] += 1;
            if (diffCount[0] !== 1) {
                plural = "s";
            }
            if (options.readmethod === "screen") {
                console.log("\nScreen input with " + diffCount[0] + " difference" + plural);
            } else if (output[5].length === 0) {
                console.log("\n" + colors.filepath.start + path + "\nLine: " + output[0][a] + colors.filepath.end);
            }
            for (a = 0; a < pdlen; a += 1) {
                if (output[5].length > 0 && output[5][b] !== undefined) {
                    if (output[5][b][0] + 1 === output[0][a]) {
                        if (options.readmethod === "screen") {
                            console.log("\nLine: " + output[0][a] + colors.filepath.end);
                        } else {
                            console.log("\n" + colors.filepath.start + path + "\nLine: " + output[0][a] + colors.filepath.end);
                        }
                        b += 1;
                    } else if (output[5][b][1] + 1 === output[2][a]) {
                        if (options.readmethod === "screen") {
                            console.log("\nLine: " + output[2][a] + colors.filepath.end);
                        } else {
                            console.log("\n" + colors.filepath.start + path + "\nLine: " + output[2][a] + colors.filepath.end);
                        }
                        b += 1;
                    }
                }
                if (output[4][a] === "delete") {
                    console.log(colors.del.lineStart + output[1][a].replace(/\x1B/g, "\\x1B").replace(/<p(d)>/g, colors.del.charStart).replace(/<\/pd>/g, colors.del.charEnd) + colors.del.lineEnd);
                } else if (output[4][a] === "insert") {
                    console.log(colors.ins.lineStart + output[3][a].replace(/\x1B/g, "\\x1B").replace(/<p(d)>/g, colors.ins.charStart).replace(/<\/pd>/g, colors.ins.charEnd) + colors.ins.lineEnd);
                } else if (output[4][a] === "equal") {
                    console.log(output[3][a]);
                } else if (output[4][a] === "replace") {
                    console.log(colors.del.lineStart + output[1][a].replace(/\x1B/g, "\\x1B").replace(/<p(d)>/g, colors.del.charStart).replace(/<\/pd>/g, colors.del.charEnd) + colors.del.lineEnd);
                    console.log(colors.ins.lineStart + output[3][a].replace(/\x1B/g, "\\x1B").replace(/<p(d)>/g, colors.ins.charStart).replace(/<\/pd>/g, colors.ins.charEnd) + colors.ins.lineEnd);
                }
            }
        },

        //write output to screen
        //executed from fileComplete
        screenWrite   = function () {
            var report = [];
            if (options.jsscope === true && options.mode === "beautify" && (options.lang === "javascript" || options.lang === "auto")) {
                return reports();
            }
            report = prettydiff.api(options);
            if (options.diffcli === true) {
                return cliWrite(report);
            }
            return console.log(report[0]);
        },

        //generate the diff output
        //for CLI from files
        cliFile = function (data) {
            options.source = sfiledump[data.index];
            options.diff = dfiledump[data.index];
            if (options.source.indexOf("undefined") === 0) {
                options.source = options.source.replace("undefined", "");
            }
            if (options.diff.indexOf("undefined") === 0) {
                options.diff = options.diff.replace("undefined", "");
            }
            if (typeof options.context !== "number" || options.context < 0) {
                console.log("\n" + colors.filepath.start + data.localpath + colors.filepath.end);
            }
            cliWrite(prettydiff.api(options), data.localpath);
        },

        //is a file read operation complete?
        //executed from readLocalFile
        //executed from readHttpFile
        fileComplete  = function (data) {
            if (data.type === "diff") {
                dfiledump[data.index] = data.file;
                dState[data.index]    = true;
            } else {
                sfiledump[data.index] = data.file;
                sState[data.index]    = true;
            }
            if (data.index !== sfiledump.length - 1) {
                data.last = false;
            }
            if ((options.mode === "diff" && sState[data.index] === true && dState[data.index] === true && sfiledump[data.index] !== dfiledump[data.index]) || (options.mode !== "diff" && sState[data.index] === true)) {
                if (options.diffcli === true) {
                    cliWrite(data);
                } else if (method === "filescreen") {
                    screenWrite();
                } else if (method === "file" || method === "directory" || method === "subdirectory") {
                    fileWrite(data);
                }
                sState[data.index] = false;
                if (options.mode === "diff") {
                    dState[data.index] = false;
                }
            } else if (data.last === true && data.type !== "diff") {
                ender();
            }
        },

        //read from a file
        //executed from init
        readLocalFile = function (data) {
            fs.readFile(data.absolutepath, {
                encoding: "utf8"
            }, function (err, dump) {
                if (err !== null) {
                    return readLocalFile(data);
                }
                data.file += dump;
                fileComplete(data);
            });
        },

        //resolve file contents from a web address
        //executed from init
        readHttpFile  = function (data) {
            var file = [
                    "", 0
                ];
            http.get(data.absolutepath, function (res) {
                file[1] = Number(res.headers["content-length"]);
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    file[0] += chunk;
                    if (file[0].length === file[1]) {
                        data.file = file[0];
                        options.source = file[0];
                        fileComplete(data);
                    }
                });
            });
        },

        //gather files in directory and sub directories
        //executed from init
        directory     = function () {
            //the following four are necessary because you can
            //walk a directory tree from a relative path but you
            //cannot read file contents with a relative path in
            //node at this time
            var sfiles     = {
                    path       : [],
                    total      : 0,
                    count      : 0,
                    directories: 1
                },
                dfiles     = {
                    path       : [],
                    total      : 0,
                    count      : 0,
                    directories: 1
                },
                readDir    = function (start, listtype) {
                    fs.stat(start, function (erra, stat) {
                        var item    = {},
                            dirtest = function (itempath, lastitem) {
                                var pusher = function (itempath) {
                                        if (slash === "\\") {
                                            itempath = itempath.replace(/\//g, slash);
                                        } else {
                                            itempath = itempath.replace(/\\/g, slash);
                                        }
                                        if (listtype === "diff") {
                                            dfiles.path.push(itempath.replace(address.dabspath + slash, ""));
                                        } else {
                                            sfiles.path.push(itempath.replace(address.sabspath + slash, ""));
                                        }
                                        item.count += 1;
                                    };
                                fs.stat(itempath, function (errb, stat) {
                                    var preprocess = function () {
                                            var b      = 0,
                                                length = (options.mode === "diff") ? Math.min(sfiles.path.length, dfiles.path.length) : sfiles.path.length,
                                                end    = false;
                                            sfiles.path.sort();
                                            if (options.mode === "diff") {
                                                dfiles.path.sort();
                                                for (b = 0; b < length; b += 1) {
                                                    dState.push(false);
                                                    sState.push(false);
                                                    sfiledump.push("");
                                                    dfiledump.push("");
                                                    if (sfiles.path[b] === dfiles.path[b]) {
                                                        if (b === length - 1) {
                                                            end = true;
                                                        }
                                                        readLocalFile({
                                                            absolutepath: address.dabspath + slash + dfiles.path[b],
                                                            localpath: dfiles.path[b],
                                                            type: "diff",
                                                            index: b,
                                                            last: end
                                                        });
                                                        readLocalFile({
                                                            absolutepath: address.sabspath + slash + sfiles.path[b],
                                                            localpath: sfiles.path[b],
                                                            type: "source",
                                                            index: b,
                                                            last: end
                                                        });
                                                    } else {
                                                        if (sfiles.path[b] < dfiles.path[b]) {
                                                            if (options.diffcli === true) {
                                                                clidata[0].push(sfiles.path[b]);
                                                            }
                                                            if (length === dfiles.path.length) {
                                                                length += 1;
                                                            }
                                                            dfiles.path.splice(b, 0, "");
                                                        } else if (dfiles.path[b] < sfiles.path[b]) {
                                                            if (options.diffcli === true) {
                                                                clidata[1].push(dfiles.path[b]);
                                                            }
                                                            if (length === sfiles.path.length) {
                                                                length += 1;
                                                            }
                                                            sfiles.path.splice(b, 0, "");
                                                        }
                                                        if (b === length - 1) {
                                                            ender();
                                                        }
                                                    }
                                                }
                                            } else {
                                                if (options.output !== "") {
                                                    for (b = 0; b < length; b += 1) {
                                                        if (b === length - 1) {
                                                            end = true;
                                                        }
                                                        if (sfiles.path[b] !== undefined) {
                                                            readLocalFile({
                                                                absolutepath: address.sabspath + slash + sfiles.path[b],
                                                                localpath: sfiles.path[b],
                                                                type: "source",
                                                                index: b,
                                                                last: end
                                                            });
                                                        } else if (end === true) {
                                                            ender();
                                                        }
                                                    }
                                                } else {
                                                    ender();
                                                }
                                            }
                                        };
                                    if (errb !== null) {
                                        return console.log(errb);
                                    }
                                    if (stat.isDirectory() === true) {
                                        if (method === "subdirectory") {
                                            item.directories += 1;
                                            readDir(itempath, listtype);
                                            item.count += 1;
                                        }
                                        if (method === "directory") {
                                            item.total -= 1;
                                        }
                                    } else if (stat.isFile() === true) {
                                        pusher(itempath);
                                    } else {
                                        if (listtype === "diff") {
                                            dfiles.total -= 1;
                                        } else {
                                            sfiles.total -= 1;
                                        }
                                        console.log(itempath + "\nis an unsupported type");
                                    }
                                    if (lastitem === true && ((options.mode === "diff" && sfiles.count === sfiles.total && dfiles.count === dfiles.total && sfiles.directories === 0 && dfiles.directories === 0) || (options.mode !== "diff" && item.directories === 0 && item.count === item.total))) {
                                        preprocess();
                                    }
                                });
                            };
                        if (erra !== null) {
                            return console.log(erra);
                        }
                        if (stat.isDirectory() === true) {
                            fs.readdir(start, function (errd, files) {
                                var x     = 0,
                                    total = files.length;
                                if (errd !== null) {
                                    return console.log(errd);
                                }
                                if (total === 0) {
                                    return;
                                }
                                if (listtype === "diff") {
                                    item = dfiles;
                                } else {
                                    item = sfiles;
                                }
                                item.total += total;
                                if (total === 0) {
                                    item.directories -= 1;
                                }
                                for (x = 0; x < total; x += 1) {
                                    if (x === total - 1) {
                                        item.directories -= 1;
                                        dirtest(start + slash + files[x], true);
                                    } else {
                                        dirtest(start + slash + files[x], false);
                                    }
                                }
                            });
                        } else {
                            return console.log("path: " + start + " is not a directory");
                        }
                    });
                };
            readDir(address.sabspath, "source");
            if (options.mode === "diff") {
                readDir(address.dabspath, "diff");
            }
        };
    if (args === 0 || help === true) {
        return console.log(error);
    }
    if (options.source === "") {
        return console.log("Error: 'source' argument is empty");
    }
    if (options.mode === "diff" || (options.jsscope === true && options.mode === "beautify")) {
        if (options.mode === "diff" && options.diff === "") {
            return console.log("Error: 'diff' argument is empty");
        }
        options.report = true;
    }
    if (options.output === "" && options.mode === "diff") {
        if (options.readmethod !== "screen") {
            options.diffcli = true;
        }
        if (process.argv.join(" ").indexOf(" context:") === -1) {
            options.context = 2;
        }
    }
    if (method === "file" && options.output === "") {
        return console.log("Error: 'readmethod' is value 'file' and argument 'output' is empty");
    }

    //determine file types and then execute
    (function init() {
        var state   = true,
            status  = function () {
                //status codes
                //-1 is not file or directory
                //0 is status pending
                //1 is directory
                //2 is file
                //3 is file via http/s
                //
                //dir[0] - diff
                //dir[1] - output
                //dir[2] - source
                if (dir[2] === 0) {
                    return;
                }
                if (method === "auto") {
                    if (dir[2] === 1) {
                        method = "subdirectory";
                    } else if (dir[2] > 1) {
                        if (options.output === "") {
                            method = "filescreen";
                        } else {
                            if (options.output === "" && options.mode !== "diff") {
                                console.log("\x1B[91m\nNo output option is specified, so no files written.\n\x1B[39m");
                            }
                            method = "file";
                            if (options.output === "") {
                                return console.log("Error: 'readmethod' is value 'file' and argument 'output' is empty");
                            }
                        }
                    } else if (dir[2] < 0) {
                        method = "screen";
                    }
                }
                if (dir[2] < 0) {
                    if (options.readmethod === "screen" && options.mode !== "diff") {
                        return screenWrite();
                    }
                    state = false;
                    if (options.readmethod !== "screen") {
                        return console.log("source is not a directory or file");
                    }
                }
                if (dir[2] === 1 && method !== "directory" && method !== "subdirectory") {
                    state = false;
                    return console.log("source is a directory but readmethod option is not 'auto', 'directory', or 'subdirectory'");
                }
                if (dir[2] > 1 && (method === "directory" || method === "subdirectory")) {
                    state = false;
                    return console.log("source is a file but readmethod option is 'directory' or 'subdirectory'");
                }
                if (options.mode === "diff") {
                    if (dir[0] === 0 || dir[2] === 0) {
                        return;
                    }
                    if (dir[0] < 0) {
                        if (dir[2] < 0 && options.readmethod === "screen") {
                            return screenWrite();
                        }
                        state = false;
                        return console.log("diff is not a directory or file");
                    }
                    if (dir[0] === 1 && method !== "directory" && method !== "subdirectory") {
                        state = false;
                        return console.log("diff is a directory but readmethod option is not 'directory' or 'subdirectory'");
                    }
                    if (dir[0] > 2 && (method === "directory" || method === "subdirectory")) {
                        state = false;
                        return console.log("diff is a file but readmethod option is 'directory' or 'subdirectory'");
                    }
                    if (dir[0] > 1 && dir[2] > 1 && (method === "file" || method === "filescreen")) {
                        state = false;
                        dState.push(false);
                        sState.push(false);
                        if (dir[0] === 3) {
                            readHttpFile({
                                absolutepath: options.diff,
                                localpath: options.diff,
                                type: "diff",
                                index: 0,
                                last: true
                            });
                        } else {
                            readLocalFile({
                                absolutepath: options.diff,
                                localpath: options.diff,
                                type: "diff",
                                index: 0,
                                last: true
                            });
                        }
                        if (dir[2] === 3) {
                            readHttpFile({
                                absolutepath: options.source,
                                localpath: options.source,
                                type: "source",
                                index: 0,
                                last: true
                            });
                        } else {
                            readLocalFile({
                                absolutepath: options.source,
                                localpath: options.source,
                                type: "source",
                                index: 0,
                                last: true
                            });
                        }
                        return;
                    }
                    if (dir[0] === 1 && dir[2] === 1 && (method === "directory" || method === "subdirectory")) {
                        state = false;
                        return directory();
                    }
                } else {
                    if (dir[2] > 1 && (method === "file" || method === "filescreen")) {
                        state = false;
                        sState.push(false);
                        if (dir[2] === 3) {
                            readHttpFile({
                                absolutepath: options.source,
                                localpath: options.source,
                                type: "source",
                                index: 0,
                                last: true
                            });
                        } else {
                            readLocalFile({
                                absolutepath: options.source,
                                localpath: options.source,
                                type: "source",
                                index: 0,
                                last: true
                            });
                        }
                        return;
                    }
                    if (dir[2] === 1 && (method === "directory" || method === "subdirectory")) {
                        state = false;
                        return directory();
                    }
                }
            },
            delay   = function () {
                if (state === true) {
                    status();
                    setTimeout(function () {
                        delay();
                    }, 50);
                }
            };
        if (dir[2] === 0 || (options.mode === "diff" && dir[0] === 0)) {
            delay();
        } else {
            status();
        }
    }());
}());