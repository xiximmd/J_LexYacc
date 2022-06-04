# J_LexYacc-一款JS编写的词法、语法分析生成器
## 一、说明
1 该库包含J_Lex,L_Yacc两个工具
2 该库为本人编译原理实验，许多地方有待完善，比如J_Lex生成的词法分析器没有进行DFA优化以及函数查重，性能上有待优化
3 快速上手：每个demo文件夹中均包含main.js和run.js，其中main.js进行代码生成，run.js运行生成的代码。也可通过npm指令执行，如下：
 * npm run j_lexdemo1 //J_LexDemo1 main.js执行
 *  npm run j_lexdemo1run //J_LexDemo1 run.js执行
 *  npm run j_lexdemo2 //J_LexDemo2 main.js执行
 *  npm run j_lexdemo2run //J_LexDemo2 run.js执行

4 根目录下的test代码为未整理代码，赞不可用
## 二、J_Lex
一款JS编写的词法分析生成器
特点：
1 最大程度支持自定义，通过继承J_SimpleLexers实现自定义匹配方式，不仅限于最大匹配
2 词法定义中支持匹配函数定义，用于解决如中文等因基数过大无法构建DFA有向边的问题
3 生成的词法分析器支持多文法匹配，同时输出全部匹配结果，优先级与文法定义顺序相同
### 2.1 J_Lex使用说明
#### 2.1.1 简单使用
step1: import
```javascript
import { J_Lex } from "J_LexYacc.js";
```
step2: 给参数
```javascript
/**J_Lex输入参数*/
var lex = {
  input: {
    /**词法分析器输出代码配置 */
    code: {
      /**代码前缀，将添加到输出代码的最前面 */
      prefix: "/*J_LexDemo-简单案例，数字识别【此代码为自动生成代码】*/",
      /**代码后缀，将添加到输出代码的最后面 */
      suffix: "
        export default J_Lexers;", //模块化输出
    },
    /**词法正则表达式 */
    regxs: [
      { id: "ws", regx: " " }, //识别空格
      { id: "float", regx: "{num}+.{num}+|{num}+" }, //识别小数
      { id: "int", regx: "{num}+" }, //识别整数
      { id: "num", regx: "[0-9]" ,}, //识别数字
    ],
  },
};
```
step3: 运行
```javascript
//运行J_Lex，输出代码保存在lex.code中
console.log("开始生成");
J_Lex.run(lex);
console.log("生成完毕");
```
step4: 将代码保存到文件，或进行其他操作
```javascript
//将生成的代码写入到文件
fs.writeFileSync("./out/J_Lexers.js", lex.code);
```