//------代码生成------------代码生成------------代码生成------------代码生成------
import fs from "fs";
import { J_Lex } from "../../../J_LexYacc.js";
/**J_Lex输入参数*/
var lex = {
  input: {
    /**词法分析器输出代码配置 */
    code: {
      /**代码前缀，将添加到输出代码的最前面 */
      prefix: `/*J_LexDemo-简单案例，数字识别【此代码为自动生成代码】*/`,
      /**代码后缀，将添加到输出代码的最后面 */
      suffix: `
        export default J_Lexers;`, //模块化输出
    },
    /**词法正则表达式 */
    regxs: [
      { id: "ws", regx: " " }, //识别空格
      { id: "float", regx: "{num}+.{num}+|{num}+" }, //识别小数
      { id: "int", regx: "{num}+" }, //识别整数
      { id: "num", regx: "[0-9]" }, //识别数字
    ],
  },
};
//运行J_Lex，输出代码保存在lex.code中
console.log("开始生成");
J_Lex.run(lex);
console.log(lex);
//将生成的代码写入到文件
fs.writeFileSync("./out/J_Lexers.js", lex.code);
console.log("生成完毕");
