# J_LexYacc-一款JS编写的词法、语法分析生成器
## 一、说明
1 该库包含J_Lex,L_Yacc两个工具
2 该库为本人编译原理实验，许多地方有待完善，比如J_Lex生成的词法分析器没有进行DFA优化以及函数查重，性能上有待优化
3 快速上手：每个demo文件夹中均包含main.js和run.js，其中main.js进行代码生成，run.js运行生成的代码。也可通过npm指令执行，如下：
> * npm run j_lexdemo1 //J_LexDemo1 main.js执行
> *  npm run j_lexdemo1run //J_LexDemo1 run.js执行
> *  npm run j_lexdemo2 //J_LexDemo2 main.js执行
> *  npm run j_lexdemo2run //J_LexDemo2 run.js执行

4 根目录下的test代码为未整理代码，赞不可用
## 二、J_Lex
一款JS编写的词法分析生成器
特点：
1 最大程度支持自定义，通过继承J_SimpleLexers实现自定义匹配方式，不仅限于最大匹配
2 词法定义中支持匹配函数定义，用于解决如中文等因基数过大无法构建DFA有向边的问题
3 生成的词法分析器支持多文法匹配，同时输出全部匹配结果，优先级与文法定义顺序相同
### 2.1 J_Lex使用说明
#### 2.1.1 简单使用
注意：对应 j_lexdemo1，执行以下指令直接运行demo
npm run j_lexdemo1
npm run j_lexdemo1run

##### step1: 包导入
```javascript
import { J_Lex } from "J_LexYacc.js";
```
##### step2: 给参数
说明：
* lex.regxs数组存放词法定义，数组每一项对应一个词法
* lex.code字段非必须，用于配置代码生成相关内容
  * lex.code.prefix 生成的代码前面会添加此字段指定的字符串
  * lex.code.suffix 生成的代码后面会添加此字段指定的字符串

注意：
* 程序默认不会export default J_Lexers;如需模块化使用请添加此语句
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
##### step3: 运行
说明：
* 直接运行即可
* 运行中间过程及结果保存在输入的lex变量中，如：
  * lex.code保存输出的代码
  * lex.regxs保存预处理后的词法
  * lex.NFA保存不确定有限状态自动机
  * lex.DFA保存确定有限状态自动机
```javascript
//运行J_Lex，输出代码保存在lex.code中
console.log("开始生成");
J_Lex.run(lex);
console.log("生成完毕");
```
##### step4: 将代码保存到文件，或直接eval执行
```javascript
//将生成的代码写入到文件
fs.writeFileSync("./out/J_Lexers.js", lex.code);
```
##### step5:运行生成的代码
说明：
* 执行j_lexers.readTag(inputStr) 进行一次识别
  * 识别返回为null表示输入的字符串不足以执行一次最大匹配;
  * output.error = true 表示识别异常;
  * 除上面两种情况外表示识别成功
    * output.tag保存匹配符号集，比如123既匹配int的定义，也匹配float的定义，则output.tag=[ 'float', 'int' ]
    * output.value保存匹配的字符串原始值
    * output.restStr保存剩余的未匹配内容，可反复投入readTag中进行多次匹配
* 字符串识别完成后调用output = j_lexers.finishRead();结束读取，并取走最后一次匹配结果
```javascript
//导入生成的代码
import J_Lexers from "./out/J_Lexers.js";
var j_lexers = new J_Lexers();

var input = "123 1 67.9 21"; //待解析的文本

var output = j_lexers.readTag(input);
console.log(output);//{ tag: [ 'float', 'int' ], value: '123', restStr: ' 1 67.9 21' }
output = j_lexers.readTag(output.restStr);
console.log(output);//{ tag: [ 'ws' ], value: ' ', restStr: '1 67.9 21' }
//以此类推重复调用readTag
//最后调用output = j_lexers.finishRead();读取最后一个匹配
```
#### 2.1.1 详细说明
<font color="red">注意：对应 j_lexdemo2，执行以下指令直接运行demo</font>
<font color="red">npm run j_lexdemo2</font>
<font color="red">npm run j_lexdemo2run</font>


