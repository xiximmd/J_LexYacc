//------代码测试------------代码测试------------代码测试------------代码测试------
/**
 * 完整demo，实现C语言大部分语法词法的分析
 * 代码未详细注释，详细说明请参看J_LexDemo和J_YaccDemo中的注释
 * 该代码将打印分析出的C语言语法树，如果有不合法的语法使用，进行简单提醒
 */

//导入生成的代码
import J_Lexers from "./out/J_Lexers.js";
import J_Parser from "./out/J_Parser.js";

import fs from "fs";

console.log("Start");

var j_lexers = new J_Lexers();
var j_parser = new J_Parser();

//自定义规约处理函数，用于处理属性文法，当前为生成一颗语法树
j_parser.scallback = (F) => {
  var temp = [];
  F.f.forEach((e) => {
    temp.push({ c: e.symbol, args: e.args });
  });
  //该返回值将作为规约符号的挂载属性
  return temp;
};

//读取待处理的程序文本
var input = fs.readFileSync("./in/test.ccc").toString();
var input2 = input; //暂存一份完整的input
function readOneTag(output) {
  //如果是空白字符，直接退出
  if (output.tag[0] == "ws") {
    return;
  }
  //打印识别到的词
  console.log({ tag: output.tag, value: output.value });
  try {
    j_parser.readSymbol(output.tag[0], { val: output.value });
  } catch (error) {
    //异常处理，打印不合法的程序所在行、列
    if (error.startsWith("解析异常:")) {
      var readed = input2.substring(0, input2.length - input.length + 1);
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
//总处理循环，该循环以输入文本为主线，将其首先输入到词法分析器中，并将词法分析器分析出的符号直接投入语法分析器中，最后得到一颗语法树
while (true) {
  var output = j_lexers.readTag(input); //实行一次最大匹配
  if (output == null) {
    //如果返回为空，表示剩余的input已不足以确定一个最大匹配
    var output = j_lexers.finishRead(); //结束读取，并取走最后一次匹配结果
    if (output.error) {
      console.log("无法全部读入异常:[" + output.restStr + "]");
    }
    readOneTag(output);
    break;
  }
  input = output.restStr;
  readOneTag(output);
  if (output.error == true) {
    console.log("存在异常模式:[" + input + "]");
    break;
  }
}
//符号串读取完毕后调用此函数结束读取
var succeed = j_parser.finishRead();
if (succeed) {
    //如果分析成功，规约至起始符
    show(j_parser.shis.f[0]);
  } else {
    //如果分析失败，未规约至起始符
    console.log("分析失败，未规约至起始符");
  }
  /**
   * 显示语法分析树的显示函数
   * @param {*} f j_parser.shis.f[0]
   */
  function show(f) {
    console.log(f.symbol);
    showLayer(f.args, 0, "");
    function showLayer(args, layer, prefix) {
      var nextPrefix = prefix + "┃";
      for (var i = 0; i < args.length; ++i) {
        var arg = args[i];
        var string;
        if (i < args.length - 1) {
          string = prefix + "┣" + arg.c;
        } else {
          string = prefix + "┗" + arg.c;
        }
        if (arg.args.val != undefined) {
          string += " ⇒ " + arg.args.val;
        }
        console.log(string);
        if (i < args.length - 1) {
          showLayer(arg.args, layer + 1, nextPrefix);
        } else {
          showLayer(arg.args, layer + 1, prefix + " ");
        }
      }
    }
  }
  