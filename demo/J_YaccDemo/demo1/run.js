//------代码测试------------代码测试------------代码测试------------代码测试------
//导入生成的代码
import J_Parser from "./out/J_Parser.js";
console.log("Start");
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
//读取符号及其挂载的参数
j_parser.readSymbol("b", { val: "1" });
j_parser.readSymbol("a", { val: "2" });
j_parser.readSymbol("c", { val: "3" });
j_parser.readSymbol("b", { val: "4" });
j_parser.readSymbol("a", { val: "5" });
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
    var nextPrefix = prefix + "║";
    for (var i = 0; i < args.length; ++i) {
      var arg = args[i];
      var string;
      if (i < args.length - 1) {
        string = prefix + "╠" + arg.c;
      } else {
        string = prefix + "╚" + arg.c;
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
