# J_LexYacc-一款JS编写的词法、语法分析生成器
作者：槿铃兔
## 一、说明
1 该库包含J_Lex,L_Yacc两个工具  
2 该库为本人编译原理实验，许多地方有待完善，比如J_Lex生成的词法分析器没有进行DFA优化以及函数查重，性能上有待优化  
3 快速上手：每个demo文件夹中均包含main.js和run.js，其中main.js进行代码生成，run.js运行生成的代码。也可通过npm指令执行，如下：
> * npm run j_lexdemo1 //J_LexDemo1 main.js执行
> *  npm run j_lexdemo1run //J_LexDemo1 run.js执行
> *  npm run j_lexdemo2 //J_LexDemo2 main.js执行
> *  npm run j_lexdemo2run //J_LexDemo2 run.js执行

4 根目录下的test代码为未整理代码，暂不可用
5 文档编写中。。。
## 二、J_Lex
一款JS编写的词法分析生成器  
特点：  
1 最大程度支持自定义，通过继承J_SimpleLexers实现自定义匹配方式，不仅限于最大匹配  
2 词法定义中支持匹配函数定义，用于解决如中文等因基数过大无法构建DFA有向边的问题  
3 生成的词法分析器支持多文法匹配，同时输出全部匹配结果，优先级与文法定义顺序相同  
4 J_Lex本身及生成的代码都有做良好的异常处理  
### 2.1 J_Lex使用说明
#### 2.1.1 简单使用
*注意：对应 j_lexdemo1，执行以下指令直接运行demo
npm run j_lexdemo1
npm run j_lexdemo1run*

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
*注意：对应 j_lexdemo2，执行以下指令直接运行demo  
npm run j_lexdemo2  
npm run j_lexdemo2run*
##### 词法定义说明
$$lex.regxs := [regx_1,regx_2,regx_m]$$
$$regx_i := \{id:名称,regx:词法[,noMatch:bool]\}$$
$$\begin{aligned}
词法:=&块_1块_2...块_n\\
&or\\
&词法|词法
\end{aligned}$$
$$\begin{aligned}
块:=&（一个字符 \\
&or \\
 &()[]\{\}<>四种括号的内容）[| or * or +]
\end{aligned}$$
注：noMatch属性使用，表示该词法不需要匹配，仅为支持其他词法定义时引用而存在，该值可为空
|符号|含义|
|---|---|
|\||或，表示"\|"前后两段都接受，如：abc\|123表示接受abc或123|
|*|"\*"前面的块重复0~n次均接受，如：a*表示接受ε,a,aa,aaa,...|
|+|"+"前面的块重复0~n次均接受，如：a+表示接受a,aa,aaa,...|
|()|表示一个块，比如：ab*表示接受a,ab,abb...而(ab)*表示接受ε,ab,abab,ababab,...|
|{}|表示引用，如：已定义{id:"test",regx:"a\|b"},则{test}\*表示接受ε,a,b,ab,aab,abba,ababaa...等任意a,b组成的串|
|<>|用于定义一个接受字符函数，用于表示是否接受一个字符，<>内为一个js函数，(c)=>bool，如：<(c)=\\>c!="a">表示接受除a意外的任意字符（注意，由于"<",">"为特殊字符，其中的任意"<",">"要表示其原义需加反斜杠）|
|\[\]|为简写"\|"和<>而存在，如：\[abc\]等价于 a \| b \| c，而\[0-9\]等价于<(c)=\\>c.charCodeAt(0)>=48&&c.charCodeAt(0)<=57>|
|\\ |反斜杠表示转义字符，如：\* 将报错，而\\*表示接受字符"\*"|
```javascript
var lex = {
    /**词法正则表达式 */
    regxs: [
      //支持中文ID和中文词法解析
      { id: "中文也支持噢", regx: "耶" },
      //|使用，表示或
      //()使用，用于确定结合优先级
      //+使用，表示前面的字符串重复1~n次
      { id: "01string", regx: "(0|1)+" },
      //{}使用，引用其他词法定义
      //*使用，表示前面的字符串重复0~n次
      { id: "float", regx: "{数字}*.{数字}+" },
      //[]使用，等价于"\r|\n|\t| "，注意空格
      { id: "ws", regx: "[\r\n\t ]" },
      //-使用，等价于"<(c)=\\>c.charCodeAt(0)>=48&&c.charCodeAt(0)<=57>"
      //noMatch属性使用，表示该词法不需要匹配
      { id: "数字", regx: "[0-9]", noMatch: true },
      //<>使用，定义匹配函数function(c)=>bool，匹配一个字符，匹配与否由函数决定
      { id: "非引号字符", regx: `<(c)=\\>c != '"'>` },
      //\（反斜杠）使用，加在+*-|\()[]{}<>等前，用于表示其本身含义
      {
        id: "反斜杠使用",
        regx: "\\+|\\*|\\-|\\||\\\\|\\(|\\)|\\[|\\]|\\{|\\}|\\<|\\>",
      },
      //综合案例：识别c语言注释
      { id: "注释", regx: "//<(c)=\\>c != '\\\\n'>*" },
    ],
  },
};
```
## 三、J_Yacc
采用LR(1)