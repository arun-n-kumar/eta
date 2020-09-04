import Parse from "./parse.ts";

/* TYPES */

import { EtaConfig } from "./config.ts";
import { AstObject } from "./parse.ts";

/* END TYPES */

/**
 * Compiles a template string to a function string. Most often users just use `compile()`, which calls `compileToString` and creates a new function using the result
 *
 * **Example**
 *
 * ```js
 * compileToString("Hi <%= it.user %>", eta.defaultConfig)
 * // "var tR='';tR+='Hi ';tR+=E.e(it.user);if(cb){cb(null,tR)} return tR"
 * ```
 */

export default function compileToString(str: string, config: EtaConfig) {
  var buffer: Array<AstObject> = Parse(str, config);

  var res = "var tR=''\n" +
    (config.useWith ? "with(" + config.varName + "||{}){" : "") +
    compileScope(buffer, config) +
    "if(cb){cb(null,tR)} return tR" +
    (config.useWith ? "}" : "");

  if (config.plugins) {
    for (var i = 0; i < config.plugins.length; i++) {
      var plugin = config.plugins[i];
      if (plugin.processFnString) {
        res = plugin.processFnString(res, config);
      }
    }
  }

  return res;
}

/**
 * Loops through the AST generated by `parse` and transform each item into JS calls
 *
 * **Example**
 *
 * ```js
 * // AST version of 'Hi <%= it.user %>'
 * let templateAST = ['Hi ', { val: 'it.user', t: 'i' }]
 * compileScope(templateAST, eta.defaultConfig)
 * // "tR+='Hi ';tR+=E.e(it.user);"
 * ```
 */

function compileScope(buff: Array<AstObject>, config: EtaConfig) {
  var i = 0;
  var buffLength = buff.length;
  var returnStr = "";

  for (i; i < buffLength; i++) {
    var currentBlock = buff[i];
    if (typeof currentBlock === "string") {
      var str = currentBlock;

      // we know string exists
      returnStr += "tR+='" + str + "'\n";
    } else {
      var type = currentBlock.t; // ~, s, !, ?, r
      var content = currentBlock.val || "";

      if (type === "r") {
        // raw
        returnStr += "tR+=" + content + "\n";
      } else if (type === "i") {
        // interpolate
        if (config.autoEscape) {
          content = "E.e(" + content + ")";
        }
        returnStr += "tR+=" + content + "\n";
        // reference
      } else if (type === "e") {
        // execute
        returnStr += content + "\n"; // you need a \n in case you have <% } %>
      }
    }
  }

  return returnStr;
}
