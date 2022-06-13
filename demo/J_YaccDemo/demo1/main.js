//------代码生成------------代码生成------------代码生成------------代码生成------
import fs from "fs";
import { J_Yacc } from "../../../J_LexYacc.js";
/**J_Yacc输入参数*/
var yacc = {
  input: {
    /**词法分析器输出代码配置 */
    code: {
      /**代码前缀，将添加到输出代码的最前面 */
      prefix: "/*J_YaccDemo-简单案例，对称串识别【此代码为自动生成代码】*/\n",
      /**代码后缀，将添加到输出代码的最后面 */
      suffix: "export default J_Parser;", //模块化输出
    },
    formalGram: {
      /**
       * 文法产生式定义
       */
      P: [
        { id: "S", gram: "A S A" },
        { id: "S", gram: "c" },
        { id: "A", gram: ["a", "b"] },
      ],
      /**
       * 非终结符定义
       */
      Vt: ["a", "b", "c"],
      /**
       * 文法开始符定义
       */
      S: "S",
    },
  },
};
//运行J_Yacc，输出代码保存在yacc.code中
console.log("开始生成");
J_Yacc.run(yacc);
console.log("打印中间变量");
console.log(yacc);
// J_Yacc.showClosuers(yacc) //可以打印闭包信息
//将生成的代码写入到文件
fs.writeFileSync("./out/J_Parser.js", yacc.code);
console.log("生成完毕");
