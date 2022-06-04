import J_Yacc from "./test/out2.js";
import fs from "fs";
console.log("Start");
var j_yacc = new J_Yacc();
j_yacc.scallback = (F) => {
  var temp = [];
  F.forEach((e) => {
    temp.push({ c: e.symbol, args: e.args });
  });
  return temp;
};
j_yacc.readSymbol("a", { val: "1" });
j_yacc.readSymbol("a", { val: "2" });
j_yacc.readSymbol("b", { val: "3" });
j_yacc.readSymbol("b", { val: "4" });
var bb = j_yacc.readSymbolCode(-1);
console.log(bb);
function show(args, layer) {
  for (var i = 0; i < args.length; ++i) {
    var arg = args[i];
    var string = "  ".repeat(layer) + "|-" + arg.c;
    if (arg.args.val != undefined) {
        string += ":" + arg.args.val;
    }
    console.log(string);
    show(arg.args, layer + 1);
  }
}
console.log(JSON.stringify(j_yacc.his));
show(j_yacc.his[0].args, 0);
