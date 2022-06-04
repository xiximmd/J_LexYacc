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
