//------代码生成------------代码生成------------代码生成------------代码生成------
/**
 * 完整demo，实现C语言大部分语法词法的分析
 * 代码未详细注释，详细说明请参看J_LexDemo和J_YaccDemo中的注释
 */
import fs from "fs";
import { J_Lex, J_Yacc } from "./../../J_LexYacc.js";
//词法分析参数
var lex = {
  input: {
    code: {
      prefix: `/*测试*/
        `,
      suffix: `
        export default J_Lexers;`,
    },
    regxs: [
      //关键字
      { id: "type", regx: "int|float|double|byte|short|long long" },
      { id: "for", regx: "for" },
      { id: "return", regx: "return" },
      { id: "if", regx: "if" },
      { id: "else", regx: "else" },
      { id: "while", regx: "while" },
      { id: "(", regx: "\\(" },
      { id: ")", regx: "\\)" },
      { id: "[", regx: "\\[" },
      { id: "]", regx: "\\]" },
      { id: "{", regx: "\\{" },
      { id: "}", regx: "\\}" },
      { id: "!=", regx: "!=" },
      { id: "==", regx: "==" },
      { id: "=", regx: "=" },
      { id: "/=", regx: "/=" },
      { id: "*=", regx: "\\*=" },
      { id: "%=", regx: "%=" },
      { id: "+=", regx: "\\+=" },
      { id: "-=", regx: "\\-=" },
      { id: "<<=", regx: "\\<\\<=" },
      { id: ">>=", regx: "\\>\\>=" },
      { id: "&=", regx: "&=" },
      { id: "^=", regx: "^=" },
      { id: "|=", regx: "\\|=" },
      { id: ">=", regx: "\\>=" },
      { id: "<=", regx: "\\<=" },
      { id: "<", regx: "\\<" },
      { id: ">", regx: "\\>" },
      { id: "++", regx: "\\+\\+" },
      { id: "--", regx: "\\-\\-" },
      { id: "+", regx: "\\+" },
      { id: "-", regx: "\\-" },
      { id: "*", regx: "\\*" },
      { id: "/", regx: "/" },
      { id: "%", regx: "%" },
      { id: "?", regx: "?" },
      { id: ";", regx: ";" },
      { id: ":", regx: ":" },
      { id: ",", regx: "," },
      { id: "||", regx: "\\|\\|" },
      { id: "&&", regx: "&&" },
      { id: "|", regx: "\\|" },
      { id: "^", regx: "^" },
      { id: "&", regx: "&" },
      { id: "<<", regx: "\\<\\<" },
      { id: ">>", regx: "\\>\\>" },
      { id: "~", regx: "~" },
      { id: "!", regx: "!" },
      { id: ".", regx: "." },
      { id: "->", regx: "\\-\\>" },
      { id: "sizeof", regx: "sizeof" },
      //变量
      { id: "id", regx: "{char}({num}|{char})*" },
      { id: "integer", regx: "{num}+|\\-{num}+" },
      { id: "float", regx: "{num}+|\\-{num}+|{num}+.{num}+|\\-{num}+.{num}+" },
      { id: "string", regx: `"{notQuote}*"|'{notSingleQuote}*'` },
      //空匹配
      { id: "ws", regx: "{blank}+" },
      { id: "blank", regx: "[\r\n\t ]" },
      { id: "#include", regx: "#include" },
      {
        id: "<>",
        regx: `\\<<(c)=\\>(c != '\\<' && c != '\\>')>*\\>`,
      },
      //不匹配对象
      { id: "num", regx: "[0-9]", noMatch: true },
      { id: "char", regx: "[a-zA-Z]", noMatch: true },
      {
        id: "notQuote",
        regx: `<(c)=\\>c != '"'>`,
        noMatch: true,
      },
      {
        id: "notSingleQuote",
        regx: `<(c)=\\>c != "'">`,
        noMatch: true,
      },
    ],
  },
};
var Vt = []; //终结符集合，直接从j_lex的输入中获取
lex.input.regxs.forEach((regx) => {
  if (regx.noMatch == true) {
  } else {
    Vt.push(regx.id);
  }
});
//语法分析输入
var yacc = {
  input: {
    code: {
      prefix: `/*测试*/
        `,
      suffix: `
        export default J_Parser;`,
    },
    formalGram: {
      asso: "l",
      P: [
        { id: "Start", gram: "predefine program" },
        {
          id: "predefine",
          gram: ["#include <> predefine", "#include string predefine", ""],
        },
        { id: "program", gram: ["funcDef program", "block program", ""] },
        { id: "funcDef", gram: "type id ( funcValDef ) { noneAbleBlock }" }, //函数声明
        { id: "funcValDef", gram: ["type id , funcValDef", "type id", ""] }, //函数参赛申明
        {
          id: "noneAbleBlock",
          gram: ["blocks", ""],
        }, //可空语句块
        {
          id: "blocks",
          gram: ["block block", "block"],
        }, //递归语句块
        //语句块
        {
          id: "block",
          gram: [
            "if_block",
            "for_block",
            "while_block",
            "bracket_block",
            "statement",
          ],
        }, //语句块
        { id: "bracket_block", gram: ["{ noneAbleBlock }"] },
        {
          id: "if_block",
          gram: ["if ( expr ) block", "if ( expr ) block else block"],
          priority: 0,
          asso: ["r"],
        }, //IF语句块
        {
          id: "for_block",
          gram: "for ( expr ; expr ; expr ) block",
        }, //For语句块
        {
          id: "while_block",
          gram: "while ( expr ) block",
        },

        //单一语句
        {
          id: "statement",
          gram: ["declaration_S", "expr_S", "empty_S", "return_S"],
        }, //语句
        { id: "declaration_S", gram: "type expr ;" }, //申明语句
        { id: "expr_S", gram: "expr ;" }, //表达式语句
        { id: "empty_S", gram: ";" },
        { id: "return_S", gram: ["return ;", "return expr ;"] },

        //表达式
        {
          id: "expr",
          gram: [
            "variable",
            // "id",
            "literal",

            // "squareBrackets", //15
            "funcCall", //15
            "bracket", //15
            // ".Expr", //15
            // "->Expr", //15

            "-Expr", //14
            "~Expr", //14
            "++Expr", //14
            "--Expr", //14
            "*Expr", //14
            "&Expr", //14
            "!Expr", //14
            "()Expr", //14
            "sizeofExpr", //14

            "multiply", //13
            "divide", //13
            "mod", //13
            "add", //12
            "subtract", //12
            "move", //11
            "bool", //9,10
            "bitExpr", //6,7,8
            "logicExpr", //4,5
            "?:expr", //3
            "assignment", //2
          ],
          priority: [0, undefined],
        },
        //变量
        {
          id: "variable",
          gram: [
            "id",

            "squareBrackets", //15
            ".Expr", //15
            "->Expr", //15
          ],
        },

        { id: "literal", gram: ["integer", "float", "string"] }, //字面量

        { id: "squareBrackets", gram: "expr [ expr ]", priority: 15 }, //数组取值
        { id: "bracket", gram: "( expr )", priority: 15 }, //括号
        { id: "funcCall", gram: "id ( expr )", priority: 15 }, //函数调用
        { id: ".Expr", gram: "expr . id", priority: 15 }, //函数调用
        { id: "->Expr", gram: "expr -> id", priority: 15 }, //函数调用

        { id: "-Expr", gram: "- expr", priority: 14, asso: "r" },
        { id: "~Expr", gram: "~ expr", priority: 14, asso: "r" },
        {
          id: "++Expr",
          gram: ["++ variable", "variable ++"],
          priority: 14,
          asso: "r",
        },
        {
          id: "--Expr",
          gram: ["-- variable", "variable --"],
          priority: 14,
          asso: "r",
        },
        { id: "*Expr", gram: "* variable", priority: 14, asso: "r" },
        { id: "&Expr", gram: "& variable", priority: 14, asso: "r" },
        { id: "!Expr", gram: "! expr", priority: 14, asso: "r" },
        { id: "()Expr", gram: "( type ) expr", priority: 14, asso: "r" },
        { id: "sizeofExpr", gram: "sizeof ( expr )", priority: 14, asso: "r" },

        { id: "multiply", gram: "expr * expr", priority: 13 },
        { id: "divide", gram: "expr / expr", priority: 13 },
        { id: "mod", gram: "expr % expr", priority: 13 },

        { id: "add", gram: "expr + expr", priority: 12 },
        { id: "subtract", gram: "expr - expr", priority: 12 },

        { id: "move", gram: ["expr << expr", "expr >> expr"], priority: 11 },

        {
          id: "bool",
          gram: [
            "expr != expr",
            "expr == expr",

            "expr <= expr",
            "expr >= expr",
            "expr > expr",
            "expr < expr",
          ],
          priority: [9, 9, 10, 10, 10, 10],
        },

        {
          id: "bitExpr",
          gram: ["expr | expr", "expr ^ expr", "expr & expr"],
          priority: [6, 7, 8],
        },

        {
          id: "logicExpr",
          gram: ["expr || expr", "expr && expr"],
          priority: [4, 5],
        },

        { id: "?:expr", gram: "expr ? expr : expr", priority: 3, asso: "r" },

        {
          id: "assignment",
          gram: [
            "variable = expr",
            "variable /= expr",
            "variable *= expr",
            "variable %= expr",
            "variable += expr",
            "variable -= expr",
            "variable <<= expr",
            "variable >>= expr",
            "variable &= expr",
            "variable ^= expr",
            "variable |= expr",
          ],
          priority: 2,
          asso: "r",
        },

        { id: "expr", gram: "expr , expr", priority: 1 },
      ],
      Vt: Vt,
      S: "Start",
    },
  },
};
console.log("开始生成");
console.log("词法分析生成器开始运行");
J_Lex.run(lex);
console.log("词法分析生成器运行结束");
fs.writeFileSync("./out/J_Lexers.js", lex.code);
console.log("词法分析代码保存结束");
console.log("语法分析生成器开始运行");
J_Yacc.run(yacc);
console.log("语法分析生成器运行结束");
//以下代码为输出J_Yacc冲突处理的代码，如果不需要可以注释掉，提高运行速率
// var s = "";
// J_Yacc.showConflictResolution(
//   yacc,
//   (ss) => {
//     s += ss;
//   },
//   3,
//   4
// );
// fs.writeFileSync("./out/log.txt", s);
fs.writeFileSync("./out/J_Parser.js", yacc.code);
console.log("语法分析代码保存结束");
console.log("生成完毕");
