import J_Lex from "./test/out.js";
import J_Yacc from "./test/out2.js";
import fs from "fs";
console.log("Start");
var j_lex = new J_Lex();
var j_yacc = new J_Yacc();
j_yacc.scallback = (F) => {
  var temp = [];
  F.forEach((e) => {
    temp.push({ c: e.symbol, args: e.args });
  });
  return temp;
};
var s = fs.readFileSync("./test/test.ccc").toString();
var ss = s;
function readOneTag(output) {
  if (output.tag[0] == "ws") {
    return;
  }
  console.log({ tag: output.tag, value: output.value });
  try {
    j_yacc.readSymbol(output.tag[0], { val: output.value });
  } catch (error) {
    if (error.startsWith("解析异常:")) {
      var readed = ss.substring(0, ss.length - s.length + 1);
      var rsplit = readed.split("\n");
      var code = "";
      var i = rsplit.length - 5;
      if (i < 0) {
        i = 0;
      }
      for (; i < rsplit.length; ++i) {
        code += "\n" + rsplit[i];
      }
      var h = rsplit.length;
      var l = rsplit[rsplit.length - 1].length;
      throw (
        error +
        "\n位置:" +
        h +
        "行" +
        l +
        "列" +
        code +
        "\n" +
        " ".repeat(l - 2) +
        "^^^"
      );
    }
  }
}
while (true) {
  var output = j_lex.readTag(s);
  if (output == null) {
    var output = j_lex.finishRead();
    if (output.error) {
      console.log("无法全部读入异常:[" + output.restStr + "]");
    }
    readOneTag(output);
    break;
  }
  readOneTag(output);
  s = output.restStr;
  if (output.error == true) {
    console.log("存在异常模式:[" + s + "]");
    break;
  }
}
//输出语法树
var bb = j_yacc.readSymbolCode(-1);
if (bb) {
  function show(args, layer) {
    for (var i = 0; i < args.length; ++i) {
      var arg = args[i];
      var string = "  ".repeat(layer) + "|-" + arg.c;
      if (arg.args.val != undefined) {
        string += " ♥ " + arg.args.val;
      }
      console.log(string);
      show(arg.args, layer + 1);
    }
  }
  //   console.log(JSON.stringify(j_yacc.his));
  show(j_yacc.his[0].args, 0);
} else {
  console.log("分析失败，未规约至起始符");
}
