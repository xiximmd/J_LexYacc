//------代码生成------------代码生成------------代码生成------------代码生成------
import fs from "fs";
import { J_Yacc } from "../../../J_LexYacc.js";
/**J_Yacc输入参数*/
var yacc = {
  input: {
    /**词法分析器输出代码配置 */
    code: {
      /**代码前缀，将添加到输出代码的最前面 */
      prefix:
        "/*J_YaccDemo-复杂案例，简单表达式识别【此代码为自动生成代码】*/\n",
      /**代码后缀，将添加到输出代码的最后面 */
      suffix: "export default J_Parser;", //模块化输出
    },
    formalGram: {
      /**
       * 定义全局结合性，表示以下文法表达式中没有特殊定义的文法表达式均采用此结合性，其值可以为m,l,r,以下的结合性定义均可设置这三个值
       * m：不定义结合性（默认），l：左结合，r：左结合
       */
      asso: "l",
      /**
       * 拓广文法的起始符结合性定义，可为空
       */
      S_asso: "l",
      /**
       * 拓广文法的优先级定义，可为空
       */
      S_priority: -1,
      /**
       * 文法产生式定义
       */
      P: [
        /**
         * id为非终结符
         * gram为其对应的文法产生式
         */
        {
          id: "Expr",
          gram: "num",
        },
        /**
         * id可重复，如果重复则表示该非终结符的不同产生式
         * gram定义以空格分隔
         */
        {
          id: "Expr",
          gram: "( Expr )",
        },
        /**
         * gram定义中可以出现数组，表示该非终结符的不同产生式
         * 如下表示等价于：
         * Expr=>Expr + Expr | Expr * Expr
         * 如果算上上面分开定义的两条Expr的产生式，则实际等价于：
         * Expr=> num | ( Expr ) | Expr + Expr | Expr * Expr
         */
        {
          id: "Expr",
          gram: ["Expr + Expr", "Expr * Expr"],
          /**
           *1  priority定义文法产生式的优先级，文法产生式的默认优先级为undefined，表示不参与优先级比较，如需让两产生式根据优先级比较进行冲突处理，则需同时为这两条产生式定义优先级，优先级为一个数
           *2  优先级越高的文法产生式在冲突处理时会被选择，不管是何种冲突
           *3 优先级定义同样可以写为数组或一个单一的值
           *4  如果priority数组大小小于gram数组大小，则表示多余的gram对应priority数组最后一项的优先级定义
           */
          priority: [0, 1],
        },
      ],
      /**
       * 非终结符定义
       */
      Vt: ["+", "*", "num", "(", ")"],
      /**
       * 文法开始符定义
       */
      S: "Expr",
    },
  },
};
//运行J_Yacc，输出代码保存在yacc.code中
console.log("开始生成");
J_Yacc.run(yacc);
J_Yacc.showClosuers(yacc) //可以打印闭包信息

//将冲突处理方案输出到日志，在./out/log.txt文件中可以看到冲突解决方案
var s = "";
J_Yacc.showConflictResolution(
  yacc,
  (ss) => {
    s += ss;
  },
  3,
  4
);
fs.writeFileSync("./out/log.txt", s);

//将生成的代码写入到文件
fs.writeFileSync("./out/J_Parser.js", yacc.code);
console.log("生成完毕");
