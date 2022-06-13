# J_LexYacc-一款纯JS编写的词法、语法分析生成器
作者：槿铃兔
## 一、说明
1 该库包含J_Lex,L_Yacc两个工具  
2 该库为本人编译原理实验，许多地方有待完善，比如J_Lex生成的词法分析器没有进行DFA优化以及函数查重，性能上有待优化  
3 快速上手：每个demo文件夹中均包含main.js和run.js，其中main.js进行代码生成，run.js运行生成的代码。也可通过npm指令执行，如下：
> * npm run j_lexdemo1 //J_LexDemo1 main.js执行
> *  npm run j_lexdemo1run //J_LexDemo1 run.js执行
> *  npm run j_lexdemo2 //J_LexDemo2 main.js执行
> *  npm run j_lexdemo2run //J_LexDemo2 run.js执行
> *  npm run j_yaccdemo1 //J_YaccDemo1 main.js执行
> *  npm run j_yaccdemo1run //J_YaccDemo1 run.js执行

4 根目录下的test代码为未整理代码，暂不可用  
5 文档编写中。。。
## 二、J_Lex
一款JS编写的词法分析生成器  
特点：  
1 词法定义中支持匹配函数定义，用于解决如中文等因基数过大无法构建DFA有向边的问题  
2 生成的词法分析器支持多文法匹配，同时输出全部匹配结果，优先级与文法定义顺序相同  
3 最大程度支持自定义，通过继承J_SimpleLexers实现自定义匹配方式，不仅限于最大匹配  
4 J_Lex本身及生成的代码都有做良好的异常处理  
### 2.1 J_Lex使用说明
#### 2.1.1 简单使用
*注意：对应 j_lexdemo1，执行以下指令直接运行demo*
> * npm run j_lexdemo1
> *  npm run j_lexdemo1run

##### step1: 包导入
```javascript
import { J_Lex } from "J_LexYacc.js";
```
##### step2: 给参数
说明：
* lex.input.regxs数组存放词法定义，数组每一项对应一个词法
* lex.input.code字段非必须，用于配置代码生成相关内容
  * lex.input.code.prefix 生成的代码前面会添加此字段指定的字符串
  * lex.input.code.suffix 生成的代码后面会添加此字段指定的字符串

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
运行效果如下：  
> { tag: [ 'float', 'int' ], value: '123', restStr: ' 1 67.9 21' }  
{ tag: [ 'ws' ], value: ' ', restStr: '1 67.9 21' }  
{ tag: [ 'float', 'int', 'num' ], value: '1', restStr: ' 67.9 21' }  
{ tag: [ 'ws' ], value: ' ', restStr: '67.9 21' }  
{ tag: [ 'float' ], value: '67.9', restStr: ' 21' }  
{ tag: [ 'ws' ], value: ' ', restStr: '21' }  
{ tag: [ 'float', 'int' ], value: '21', restStr: '' }  

#### 2.1.1 详细说明
*注意：对应 j_lexdemo2，执行以下指令直接运行demo*  
> * npm run j_lexdemo2  
> * npm run j_lexdemo2run
##### 词法定义说明
$$lex.regxs := [regx_1,regx_2,regx_m]$$
  
$$
regx_i := \\{id:名称,regx:词法[,noMatch:bool]\\}
$$  
  
$$\begin{aligned}
词法:=&块_1块_2...块_n\\
&or\\
&词法|词法
\end{aligned}$$  

$$\begin{aligned}
块:=&（一个字符 \\
&or \\
 &()[]\\{\\}<>四种括号的内容）[* or +]
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

例子：
```javascript
var lex = {
  input:{
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
  }
};
```
## 三、J_Yacc

一款JS编写的语法分析生成器  
特点：  
1 支持定义文法优先级和结合性（左结合、右结合）进行冲突处理  
2 记录冲突及其处理方式，方便文法设计者了解冲突处理是否正常
3 生成的词法分析器使用LR(1)分析法  
4 J_Yacc本身及生成的代码都有做良好的异常处理  
### 3.1 J_Yacc使用说明
#### 3.1.1 简单使用
*注意：对应 j_yaccdemo1，执行以下指令直接运行demo*  
> * npm run j_yaccdemo1  
> * npm run j_yaccdemo1run
##### step1: 包导入
```javascript
import { J_Yacc } from "../../../J_LexYacc.js";
```
##### step2: 给参数
说明：
* yacc.input.formalGram变量定义文法
  * yacc.input.formalGram.P 字段给出文法产生式
  * yacc.input.formalGram.Vt 字段给出文法终结符
  * yacc.input.formalGram.S 字段给出文法起始符
* yacc.input.code字段非必须，用于配置代码生成相关内容
  * yacc.input.code.prefix 生成的代码前面会添加此字段指定的字符串
  * yacc.input.code.suffix 生成的代码后面会添加此字段指定的字符串

注意：
* 程序默认不会export default J_Lexers;如需模块化使用请添加此语句
```javascript
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
```
##### step3: 运行
说明：
* 直接运行即可
* 运行中间过程及结果保存在输入的yacc变量中，如：
  * yacc.code保存输出的代码
  * yacc.formalGram保存处理过程中关于文法的全部中间信息
    * yacc.formalGram.P 为进过预处理且编号后的文法产生式
    * yacc.formalGram.indexToSymbol 为所有符号的编号至符号的映射
    * yacc.formalGram.Vt 为终结符与其编号的映射
    * yacc.formalGram.Vtn 为yacc.formalGram.Vt的逆映射
    * yacc.formalGram.Vn 为非终结符与其编号的映射
    * yacc.formalGram.Vnn 为yacc.formalGram.Vn的逆映射
    * yacc.formalGram.S 为经过文法拓广后的起始符
    * yacc.formalGram.gramsSettings 为处理后的文法设置，包括对每条文法的优先级定义和结核性定义
    * yacc.formalGram.closuers 为文法P的LR(1)闭包
    * yacc.formalGram.tempTable 为各闭包间转换情况
```javascript
//运行J_Yacc，输出代码保存在yacc.code中
console.log("开始生成");
J_Yacc.run(yacc);
console.log("打印中间变量");
console.log(yacc);
// J_Yacc.showClosuers(yacc) //可以打印闭包信息
```
##### step4: 将代码保存到文件，或直接eval执行
```javascript
//将生成的代码写入到文件
fs.writeFileSync("./out/J_Parser.js", yacc.code);
console.log("生成完毕");
```
##### step5: 运行生成的代码
说明：
* 此处以打印语法分析树为案例
###### step5.1: 导入并新建对象
```javascript
//------代码测试------------代码测试------------代码测试------------代码测试------
//导入生成的代码
import J_Parser from "./out/J_Parser.js";
var j_parser = new J_Parser();
```
###### step5.2: 定义规约处理函数
说明：
* 每次规约时程序会调用scallback函数
  * 函数调用参数为：规约信息F={ t:"规约至符号", f:[{symbol:"待规约符号1",state:"状态栈中该符号对应的状态码",args:"该符号挂载的参数"},...]}
  * 函数返回值为：将挂载到规约符号上的参数，进行属性文法设计时使用
* 在此我们为了生成语法树，每个非终结符节点定义一个属性文法，其值为一个数组，用于存储其子节点的信息，这样在规约过程中整棵树就建立出来了
```javascript
//自定义规约处理函数，用于处理属性文法，当前为生成一颗语法树
j_parser.scallback = (F) => {
  var temp = [];
  F.f.forEach((e) => {
    temp.push({ c: e.symbol, args: e.args });
  });
  //该返回值将作为规约符号的挂载属性
  return temp;
};
```
###### step5.3: 读取符号
说明：
* 调用readSymbol函数，每次读取一个符号
  * 参数1：待读取的符号
  * 参数2： 将挂载到该符号上的参数，进行属性文法设计时使用
* 这里我们让这些符号分别带上1,2,3,4,5这些值，显示的时候我们将看到他们出现的顺序  
* 全部符号读取结束后需调用j_parser.finishRead()表示读取结束，进行最后的规约，如果未规约至起始符将返回false
  
注意：
* readSymbol的第二个参数非必须，也不限定其格式，可以为任意javascript类型

```javascript
//读取符号及其挂载的参数
j_parser.readSymbol("b", { val: "1" });
j_parser.readSymbol("a", { val: "2" });
j_parser.readSymbol("c", { val: "3" });
j_parser.readSymbol("b", { val: "4" });
j_parser.readSymbol("a", { val: "5" });
//符号串读取完毕后调用此函数结束读取
var succeed = j_parser.finishRead();
```
###### step5.4: 打印语法树
说明：
* j_parser.shis 规约历史记录，记录最近一次scallback调用参数。由于正确的识别结果最后一次规约都是规约至起始符，并且起始符是拓广后的新起始符，故shis.f[0]处刚好是文法定义中的起始符
* 如果需要进行下一步语义分析，也可仿照此例，在语法树上进行其他操作，同时语法树的定义也可以根据实际需求修改，只需要修改scallback处定义新的规约回调函数即可
```javascript
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
```
运行效果如下：  
> S  
╠A  
║╚b ⇒ 1  
╠S  
║╠A  
║║╚a ⇒ 2  
║╠S  
║║╚c ⇒ 3  
║╚A  
║ ╚b ⇒ 4  
╚A  
 ╚a ⇒ 5  

#### 3.1.2 详细说明
*注意：对应 j_yaccdemo2，执行以下指令直接运行demo*  
> * npm run j_yaccdemo2  
> * npm run j_yaccdemo2run
##### 语法定义说明
不说了，直接上案例！
```javascript
var yacc = {
  input: {
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

```
##### 闭包信息打印
打印项目集闭包，（由于没时间了，还没做打印闭包转换图的函数，这个函数其实也是我中间为了方便调试写的。。。）  
```javascript
J_Yacc.showClosuers(yacc);
```
运行结果：  
> 状态0:  
Expr->★ num ,# | + | * |  
Expr->★ ( Expr ) ,# | + | * |  
Expr->★ Expr + Expr ,# | + | * |  
Expr->★ Expr * Expr ,# | + | * |  
Expr'->★ Expr ,# | + | * |  
状态1:  
Expr->num ★ ,# | + | * |  
状态2:  
Expr->★ num ,) | + | * |  
Expr->★ ( Expr ) ,) | + | * |  
Expr->( ★ Expr ) ,# | + | * |  
Expr->★ Expr + Expr ,) | + | * |  
Expr->★ Expr * Expr ,) | + | * |  
状态3:  
Expr->num ★ ,) | + | * |  
。。。略。。。  


##### 冲突解决策略
* if(冲突双方想执行相同的操作)：
  * if(都想执行移进)
    * 同一项目冲突，不予理会
  * if(都想执行规约)
    * if(优先级都有定义且不同)
      * 按照优先级执行
    * else
      * 冲突未解决！
* else if(移进/规约冲突)
  * if(同一产生式产生的冲突)
    * if(产生式的结合性已定义)
      * 按照右结合规则，先移进；按照左结合，先规约
  * else
    * if(优先级都有定义且不同)
      * 按照优先级执行
    * else if(优先级都有定义且相同)
      * if(两产生式的结合性已定义且相同)
        * 按照右结合规则，先移进；按照左结合，先规约
      * else
        * 冲突未解决！
    * else 
      * 冲突未解决！  

执行以下语句打印冲突解决方案
```javascript
J_Yacc.showConflictResolution(yacc)
```
运行结果：  
> 状态：已解决  
解决方案：同一文法按照左结合规则，先规约  
冲突状态：8  
冲突符号：+  
-------------冲突内容-------------:  
j:移进并转移至状态7  
与:  
r:规约3个符号并产生符号Expr  
-------------冲突项目-------------:  
Expr->Expr ★ + Expr ,) | + | * |   
与  
Expr->Expr + Expr ★ ,) | + | * |   
状态：已解决  
解决方案：按照优先级执行前者  
冲突状态：8  
冲突符号：*  
-------------冲突内容-------------:  
j:移进并转移至状态9  
与:  
r:规约3个符号并产生符号Expr  
-------------冲突项目-------------:  
Expr->Expr ★ * Expr ,) | + | * |   
与  
Expr->Expr + Expr ★ ,) | + | * |   
。。。略。。。  

j_yaccdemo2运行结果：  

> Expr  
╠Expr  
║╚num ⇒ 444  
╠+ ⇒ +  
╚Expr  
 ╠Expr  
 ║╚num ⇒ 999  
 ╠* ⇒ *  
 ╚Expr  
  ╠( ⇒ (  
  ╠Expr  
  ║╠Expr  
  ║║╚num ⇒ 777  
  ║╠+ ⇒ +  
  ║╚Expr  
  ║ ╚num ⇒ 6666  
  ╚) ⇒ )  