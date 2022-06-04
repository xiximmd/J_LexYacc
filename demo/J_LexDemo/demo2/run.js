//------代码测试------------代码测试------------代码测试------------代码测试------
//导入生成的代码
import J_Lexers from "./out/J_Lexers.js";
import fs from "fs";
var j_lexers = new J_Lexers();

var input = fs.readFileSync("./inputTest.txt").toString();
function show(output) {
  console.log({ tag: output.tag, value: output.value });
}
while (true) {
  var output = j_lexers.readTag(input); //实行一次最大匹配
  if (output == null) {
    //如果返回为空，表示剩余的input已不足以确定一个最大匹配
    var output = j_lexers.finishRead(); //结束读取，并取走最后一次匹配结果
    if (output.error) {
      console.log("无法全部读入异常:[" + output.restStr + "]");
    }
    show(output);
    break;
  }
  input = output.restStr;
  show(output);
  if (output.error == true) {
    console.log("存在异常模式:[" + input + "]");
    break;
  }
}
