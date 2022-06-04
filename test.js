import J_Lex from "./test/out.js";
import fs from "fs";
console.log("Start");
var j_lex = new J_Lex();
var s = fs.readFileSync("./test/test.ccc").toString();
J_Lex.stateTranTableInit();
function show(output) {
  if (output.tag[0] == "ws") {
    return;
  }
  console.log({ tag: output.tag, value: output.value });
}
while (true) {
  var output = j_lex.readTag(s);
  if (output == null) {
    var output = j_lex.finishRead();
    if (output.error) {
      console.log("无法全部读入异常:[" + output.restStr + "]");
    }
    show(output);
    break;
  }
  s = output.restStr;
  show(output);
  if (output.error == true) {
    console.log("存在异常模式:[" + s + "]");
    break;
  }
}

// var sr = new StringReader("HHsa\\s\\\\\\a\\n");
// for (var i = 0; i < 15; ++i) {
//   console.log("(" + sr.readChar() + ")");
// }
