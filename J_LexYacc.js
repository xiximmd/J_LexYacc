function error(str) {
  throw str;
}
class StringReader {
  constructor(string) {
    this.string = string;
    this.i = 0;
    this.lasti = 0;
  }
  readCharOne() {
    if (this.i < this.string.length) {
      var char = this.string.charAt(this.i);
      this.i += 1;
      return char;
    } else {
      return null;
    }
  }
  readChar() {
    this.lasti = this.i;
    var char = this.readCharOne();
    if (char == "\\") {
      char += this.readCharOne();
    }
    return char;
  }
  /**
   * 替换字符串中的某一部分
   * @param {*} start 包含start
   * @param {*} end 不包含end
   * @param {*} string 替换字符串
   */
  replace(start, end, string) {
    var move = 0;
    if (this.i >= end) {
      move = string.length - (end - start);
      this.i += move;
    }
    this.string =
      this.string.substring(0, start) + string + this.string.substring(end);
    return move;
  }
}
class J_Lex {
  static run(lex) {
    lex.regxs = Object.create(lex.input.regxs);
    this.preprocess(lex);
    this.createNFA(lex);
    this.createDFA(lex);
    this.buildClassTable(lex);
  }

  static preprocess(lex) {
    var regxs = lex.regxs;
    var filter = new Map();
    //检查是否有重复ID
    var m = new Map();
    regxs.forEach((v) => {
      if (m.has(v.id)) {
        error("ID重复:" + v.id);
      }
      m.set(v.id, v);
    });
    function brace(element) {
      var id = element.id;
      var regx = element.regx;
      //检查是否有循环定义
      if (filter.has(id)) {
        if (filter.get(id) == false) {
          error("循环定义:" + id);
        } else {
          return;
        }
      } else {
        filter.set(id, false);
      }
      var sr = new StringReader(regx);
      var char = sr.readChar();
      while (char != null) {
        //判断是否有循环定义
        if (char == "{") {
          var start = sr.i - 1;
          var temp1 = "";
          char = sr.readChar();
          while (char != "}") {
            if (char == null) {
              error("大括号不匹配:" + regx);
            }
            temp1 += char;
            char = sr.readChar();
          }
          var end = sr.i - 1;
          if (m.has(temp1)) {
            brace(m.get(temp1));
            sr.replace(start, end + 1, "(" + m.get(temp1).regx + ")");
          } else {
            error("未定义ID:" + temp1);
          }
        } else if (char == "[") {
          var start = sr.i - 1;
          //处理中括号
          var temp1 = "";
          var lastChar = null;
          char = sr.readChar();
          while (char != "]") {
            if (char == null) {
              error("中括号不匹配:" + regx);
            } else if (char == "-") {
              if (lastChar == null) {
                error("-前不存在字符:" + regx);
              }
              char = sr.readChar();
              if (char == null) {
                error("-后不存在字符:" + regx);
              }
              var f = lastChar.charCodeAt(0);
              var t = char.charCodeAt(0);
              if (lastChar.charAt(0) == "\\") {
                if (lastChar.length == 1) {
                  error("\\后不存在字符" + regx);
                }
                f = lastChar.charCodeAt(1);
              }
              if (char.charAt(0) == "\\") {
                if (char.length == 1) {
                  error("\\后不存在字符" + regx);
                }
                t = char.charCodeAt(1);
              }
              if (f > t) {
                var temp2 = f;
                f = t;
                t = temp2;
              }
              temp1 +=
                "<(c)=\\>c.charCodeAt(0)\\>=" +
                f +
                "&&c.charCodeAt(0)\\<=" +
                t +
                ">|";
              lastChar = null;
              char = null;
            } else if (
              char == "(" ||
              char == ")" ||
              char == "*" ||
              char == "+" ||
              char == "|" ||
              char == "{" ||
              char == "}" ||
              char == "[" ||
              char == "]" ||
              char == "<" ||
              char == ">"
            ) {
              error("中括号中出现非法字符" + char + ":" + regx);
            } else {
              if (lastChar != null) {
                temp1 += lastChar + "|";
              }
            }
            lastChar = char;
            char = sr.readChar();
          }
          if (lastChar != null) {
            temp1 += lastChar + "|";
          }
          temp1 = "(" + temp1.substring(0, temp1.length - 1) + ")";
          var end = sr.i - 1;
          sr.replace(start, end + 1, temp1);
        } else if (char == "-") {
          error("-出现在[]外:" + regx);
        } else if (char == "<") {
          var temp1 = "";
          char = sr.readChar();
          while (char != ">") {
            if (char == null) {
              error("尖括号不匹配:" + regx);
            }
            temp1 += char;
            char = sr.readChar();
          }
        } else if (char == "(") {
          sr.replace(sr.i, sr.i, "(");
        } else if (char == ")") {
          sr.replace(sr.i, sr.i, ")");
        } else if (char == "|") {
          sr.replace(sr.i - 1, sr.i, ")|(");
        }
        char = sr.readChar();
      }
      element.regx = "(" + sr.string + ")";
      filter.set(id, true);
    }
    regxs.forEach((element) => {
      brace(element);
    });
  }
  static createNFA(lex) {
    function NFAAddSide(NFA, v, inNodeID, outNodeID) {
      if (v.charAt(0) == "c") {
        var inNode = NFA.sides.get(inNodeID);
        var vv = v.substring(1);
        if (!inNode.has(vv)) {
          inNode.set(vv, []);
        }
        inNode.get(vv).push(outNodeID);
      } else if (v.charAt(0) == "f") {
        if (!NFA.fsides.has(inNodeID)) {
          NFA.fsides.set(inNodeID, new Map());
        }
        var inNode = NFA.fsides.get(inNodeID);
        if (!inNode.has(outNodeID)) {
          inNode.set(outNodeID, []);
        }
        var f = v.substring(1);
        inNode.get(outNodeID).push({ f: f, r: eval(f) });
      } else {
        error("遇到非法符号:" + v.length);
      }
    }
    //v以m开头表示混合，以c开头表示字符，以f开头表示函数
    function buildNFA(NFA, v, inNodeID, outNodeID) {
      var sr = new StringReader(v);
      var char = sr.readChar();
      var start = -1;
      var end = -1;
      //递归边界
      if (char == "c") {
        if (v.charAt(1) == "\\") {
          NFAAddSide(NFA, "c" + v.charAt(2), inNodeID, outNodeID);
        } else {
          NFAAddSide(NFA, v, inNodeID, outNodeID);
        }
        return;
      } else if (char == "f") {
        char = sr.readChar();
        while (char != null) {
          if (char.charAt(0) == "\\") {
            sr.replace(sr.i - 2, sr.i - 1, "");
          }
          char = sr.readChar();
        }
        try {
          var f = eval(sr.string.substring(1));
          if (!(f instanceof Function)) {
            error("给予的匹配非函数:" + sr.string.substring(1));
          }
        } catch (e) {
          error("给予的匹配函数非法:" + sr.string.substring(1));
        }
        NFAAddSide(NFA, sr.string, inNodeID, outNodeID);
        return;
      }
      char = sr.readChar();
      var type = "";
      if (char == "(") {
        start = sr.i;
        var layer = 1;
        while (true) {
          char = sr.readChar();
          if (char == null) {
            error("小括号不匹配:" + v);
          } else if (char == "(") {
            layer += 1;
          } else if (char == ")") {
            layer -= 1;
          } else if (char == "<") {
            while (char != ">") {
              char = sr.readChar();
            }
          }
          if (layer == 0) {
            end = sr.i - 2;
            type = "m";
            break;
          }
        }
      } else if (char == "<") {
        start = sr.i;
        while (char != ">") {
          char = sr.readChar();
        }
        end = sr.i - 2;
        type = "f";
      } else if (
        char == ")" ||
        char == "|" ||
        char == "*" ||
        char == "+" ||
        char == ">"
      ) {
        error("符号非法使用:" + char);
      } else {
        start = sr.i - 1;
        end = sr.i - 1;
        type = "c";
      }

      var string1 = v.substring(start, end + 1);
      var char2 = "";
      var or = false;
      char = sr.readChar();
      if (char == "*" || char == "+") {
        char2 = char;
        char = sr.readChar();
      }
      if (char == "|") {
        or = true;
        char = sr.readChar();
      }
      //是否有OR
      if (char != null) {
        if (or) {
          buildNFA(NFA, "m" + v.substring(sr.lasti), inNodeID, outNodeID);
        } else {
          var nextID = NFA.nextID;
          NFA.nextID += 1;
          NFA.sides.set(nextID, new Map());
          buildNFA(NFA, "m" + v.substring(sr.lasti), nextID, outNodeID);
          outNodeID = nextID;
        }
      }
      if (char2 == "*") {
        var nextID = NFA.nextID;
        NFA.nextID += 1;
        NFA.sides.set(nextID, new Map());
        NFAAddSide(NFA, "c", inNodeID, nextID);
        NFAAddSide(NFA, "c", nextID, outNodeID);
        buildNFA(NFA, type + string1, nextID, nextID);
      } else if (char2 == "+") {
        var nextID = NFA.nextID;
        NFA.nextID += 1;
        NFA.sides.set(nextID, new Map());
        buildNFA(NFA, type + string1, inNodeID, nextID);
        NFAAddSide(NFA, "c", nextID, outNodeID);
        buildNFA(NFA, type + string1, nextID, nextID);
      } else {
        buildNFA(NFA, type + string1, inNodeID, outNodeID);
      }
    }

    var regxs = lex.regxs;
    var NFA = {};
    lex.NFA = NFA;
    NFA.sides = new Map();
    NFA.fsides = new Map();
    NFA.sides.set(0, new Map());
    NFA.nextID = 1;
    regxs.forEach((element) => {
      if (element.noMatch != true) {
        NFA.sides.set(NFA.nextID, new Map());
        element.NFAAcceptState = NFA.nextID;
        NFA.nextID += 1;
      }
    });
    NFA.lastEndState = NFA.nextID - 1;
    regxs.forEach((element) => {
      if (element.noMatch != true) {
        buildNFA(NFA, "m" + element.regx, 0, element.NFAAcceptState);
      }
    });
  }
  static createDFA(lex) {
    function SetToString(NumOfID, set) {
      var output = "";
      for (var i = 0; i < NumOfID; ++i) {
        if (set.has(i)) {
          output += "1";
        } else {
          output += "0";
        }
      }
      return output;
    }
    var NFA = lex.NFA;
    var DFA = { nextID: 0 };
    lex.DFA = DFA;
    DFA.sides = new Map();
    var StateMap = new Map();
    DFA.StateMap = StateMap;
    DFA.States = new Map();
    DFA.funcs = new Map();

    function buildDFA(NFA, DFA, startSet) {
      //空串闭包扩展
      var closure = new Set();
      function calcuClosure(v) {
        if (closure.has(v)) {
          return;
        }
        closure.add(v);
        //计算空字符串导致的闭包
        var toNodes = NFA.sides.get(v).get("");
        if (toNodes != undefined) {
          toNodes.forEach((vv) => {
            calcuClosure(vv);
          });
        }
        //计算函数导致的闭包
        var funcs = NFA.fsides.get(v);
        if (funcs != undefined) {
          funcs.forEach((v, k) => {
            var t = false;
            for (var i = 0; i < v.length; ++i) {
              if (v[i].r("")) {
                t = true;
                break;
              }
            }
            if (t == true) {
              calcuClosure(k);
            }
          });
        }
      }
      startSet.forEach((v) => {
        calcuClosure(v);
      });
      //ID分配
      var name = SetToString(NFA.nextID, closure);
      // console.log(name);
      //判断是否为已计算过的状态
      if (!StateMap.has(name)) {
        StateMap.set(name, DFA.nextID); //记录状态已出现
        DFA.sides.set(DFA.nextID, new Map());
        var fromId = DFA.nextID;
        var endState = new Set(); //计算闭包包含的终结状态
        closure.forEach((v) => {
          if (v <= NFA.lastEndState && v > 0) {
            endState.add(v);
          }
        });
        DFA.States.set(fromId, { endState: endState });
        DFA.nextID += 1;
        //计算到达集
        //计算因字符而导致的状态转换
        var CharSet = new Set(); //已检查过的字符
        CharSet.add("");
        closure.forEach((nodeID) => {
          var node = NFA.sides.get(nodeID);
          node.forEach((v, k) => {
            if (!CharSet.has(k)) {
              var char = k; //当前检查的字符
              CharSet.add(k);
              var startSet2 = new Set();
              closure.forEach((nodeID1) => {
                //计算因字符匹配到达的节点
                var node1 = NFA.sides.get(nodeID1);
                if (node1.has(char)) {
                  var toNodes = node1.get(char);
                  toNodes.forEach((v1) => {
                    startSet2.add(v1);
                  });
                }
                //计算因函数匹配到达的节点
                var funcs = NFA.fsides.get(nodeID1);
                if (funcs != undefined) {
                  funcs.forEach((v, k) => {
                    var t = false;
                    for (var i = 0; i < v.length; ++i) {
                      if (v[i].r(char)) {
                        t = true;
                        break;
                      }
                    }
                    if (t == true) {
                      startSet2.add(k);
                    }
                  });
                }
              });
              var toId = buildDFA(NFA, DFA, startSet2);
              DFA.sides.get(fromId).set("c" + char, toId);
            }
          });
        });
        //计算因函数而导致的状态转换
        var map1 = new Map();
        closure.forEach((nodeID1) => {
          var node1 = NFA.fsides.get(nodeID1);
          if (node1 != undefined) {
            node1.forEach((v, k) => {
              if (!map1.has(k)) {
                map1.set(k, []);
              }
              map1.set(k, map1.get(k).concat(v));
            });
          }
        });
        if (map1.size != 0) {
          //将函数加入DFA.funcs中
          DFA.funcs.set(fromId, Array.from(map1.values()));
          //计算转移
          var allArray = Array.from(map1.keys());
          //作为位指示的array
          var bits = "f".repeat(allArray.length - 1);
          bits += "t";
          var sr = new StringReader(bits);
          var stop = false;
          while (!stop) {
            var startSet3 = new Set();
            stop = true;
            for (var i = 0; i < sr.string.length; ++i) {
              if (sr.string.charAt(i) == "t") {
                startSet3.add(allArray[i]);
              } else {
                stop = false;
              }
            }
            //递归计算DFA
            var toId = buildDFA(NFA, DFA, startSet3);
            DFA.sides.get(fromId).set("f" + sr.string, toId);

            //二进制加以一
            for (var i = sr.string.length - 1; i >= 0; --i) {
              if (sr.string.charAt(i) == "t") {
                sr.replace(i, i + 1, "f");
              } else {
                sr.replace(i, i + 1, "t");
                break;
              }
            }
          }
          // console.log(bits);
        }
      }
      return StateMap.get(name);
    }
    var startSet = new Set();
    startSet.add(0);
    buildDFA(NFA, DFA, startSet);
  }
  static buildClassTable(lex) {
    var DFA = lex.DFA;
    var table = {};
    var funcTranTable = {};
    var funcsMap = new Map();
    var funcs = [];
    var ftable = {};
    function getFuncsId(funcString) {
      if (funcsMap.has(funcString)) {
        return funcsMap.get(funcString);
      } else {
        funcs.push(funcString);
        funcsMap.set(funcString, funcs.length - 1);
        return funcs.length - 1;
      }
    }
    DFA.sides.forEach((side, nodeId) => {
      side.forEach((v, k) => {
        if (k.charAt(0) == "c") {
          table[k.substring(1) + "_" + nodeId] = v;
        } else if (k.charAt(0) == "f") {
          funcTranTable[k.substring(1) + "_" + nodeId] = v;
        }
      });
      var node = DFA.funcs.get(nodeId);
      if (node != undefined) {
        var ft = [];
        node.forEach((v) => {
          var temp1 = [];
          v.forEach((element) => {
            temp1.push(getFuncsId(element.f));
          });
          ft.push(temp1);
        });
        ftable[nodeId] = ft;
      }
    });

    var code5 = "";
    for (var i = 0; i < lex.DFA.nextID; ++i) {
      code5 += JSON.stringify(Array.from(lex.DFA.States.get(i).endState)) + ",";
    }
    var codeToName = {};
    lex.input.regxs.forEach((v) => {
      if (v.NFAAcceptState != undefined) {
        codeToName[v.NFAAcceptState] = v.id;
      }
    });
    var code4 =
      `{stateTranTable:` +
      JSON.stringify(table) +
      `,funcTranTable:` +
      JSON.stringify(funcTranTable) +
      `,ftable:` +
      JSON.stringify(ftable) +
      `,funcs:` +
      JSON.stringify(funcs) +
      `,AccStatID:[` +
      code5 +
      `],codeToName:` +
      JSON.stringify(codeToName) +
      `}`;
    if (lex.input.code == undefined) {
      lex.input.code = {};
    }
    if (lex.input.code.prefix == undefined) {
      lex.input.code.prefix = "";
    }
    if (lex.input.code.suffix == undefined) {
      lex.input.code.suffix = "";
    }
    var code3 =
      lex.input.code.prefix +
      `class J_SimpleLexers {
              static info = ` +
      code4 +
      `
      static stateTranTableInit() {
        if (this.info.stateTranTableInited != true) {
          for (var i = 0; i < this.info.funcs.length; ++i) {
            this.info.funcs[i] = eval(this.info.funcs[i]);
          }
          this.info.stateTranTableInited = true;
        }
      }
      constructor() {
        this.initState();
        J_Lexers.stateTranTableInit();
      }
      initState() {
        this.string = "";
        this.state = 0;
      }
      /**
       * 处理一个字符
       * @param {*} char 输入字符
       */
      readChar(char) {
        var next = J_SimpleLexers.info.stateTranTable[char + "_" + this.state];
        if (next == undefined) {
          var ft = J_SimpleLexers.info.ftable[this.state];
          if (ft == undefined) {
            return false;
          } else {
            var string = "";
            for (var i = 0; i < ft.length; ++i) {
              var temp = ft[i];
              var t = false;
              for (var j = 0; j < temp.length; ++j) {
                if (J_SimpleLexers.info.funcs[temp[j]](char)) {
                  t = true;
                  break;
                }
              }
              if (t) {
                string += "t";
              } else {
                string += "f";
              }
            }
            var next = J_SimpleLexers.info.funcTranTable[string + "_" + this.state];
            if (next == undefined) {
              return false;
            } else {
              this.state = next;
              this.string += char;
              return true;
            }
          }
        } else {
          this.state = next;
          this.string += char;
          return true;
        }
      }
    }
    class J_Lexers extends J_SimpleLexers {
      /**
       * 初始化词法分析器状态，每次重新运行前调用
       */
      initState() {
        super.initState();
        this.lastFinal = { state: 0, string: "" };
      }
      /**
       * 实行一次最大匹配，支持流式读取，若inputStr不足以形成一个符号，则返回null，可继续调用readTag(接下来的内容)，直到最大匹配并返回匹配到的词法符号
       * @param {*} inputStr 内容字符串
       * @returns 如果识别到一个词法符号则返回对象var output = {tag:[匹配符号1,匹配符号2...],value:"匹配字符串",restStr:"剩余的字符串"}，如果未识别到一个词法符号则返回null。如果匹配非法，则output.error = true
       */
      readTag(inputStr) {
        var output = {};
        for (var i = 0; i < inputStr.length; ++i) {
          var b = this.readChar(inputStr.charAt(i));
          var stateS = J_Lexers.info.AccStatID[this.state];
          if (stateS.length > 0) {
            this.lastFinal.state = this.state;
            this.lastFinal.string = this.string;
          }
          if (!b) {
            var state = this.lastFinal.state;
            var stateS = J_Lexers.info.AccStatID[state];
            var stateName = [];
            stateS.forEach((v) => {
              stateName.push(J_Lexers.info.codeToName[v]);
            });
            output.tag = stateName;
            output.value = this.lastFinal.string;
            output.restStr =
              this.string.substring(this.lastFinal.string.length) +
              inputStr.substring(i);
    
            this.initState();
            if (state == 0) {
              output.error = true;
            }
            return output;
          }
        }
        return null;
      }
      /**
       * 内容读取结束后调用，输出最后一次匹配内容，如果无法匹配全部内容 output.error = true
       * @returns 同readTag
       */
      finishRead() {
        var output = {};
        var state = this.lastFinal.state;
        var stateS = J_Lexers.info.AccStatID[state];
        var stateName = [];
        stateS.forEach((v) => {
          stateName.push(J_Lexers.info.codeToName[v]);
        });
        output.tag = stateName;
        output.value = this.lastFinal.string;
        output.restStr = this.string.substring(this.lastFinal.string.length);
    
        this.initState();
        if (output.restStr.length > 0) {
          output.error = true;
        }
        return output;
      }
    }
        ` +
      lex.input.code.suffix;
    lex.code = code3;
  }
}

class J_Yacc {
  static run(yacc) {
    this.preprocess(yacc);
    // console.log(yacc.formalGram.gramsSettings);
    // console.log(yacc.formalGram.P);
    this.createClosuer(yacc);
    this.createTable(yacc);
    // console.log(yacc.formalGram.P);
    // console.log(yacc.formalGram.Vn);
    // console.log(yacc.formalGram.Vt);
    // console.log(yacc.formalGram.closuers);
    // console.log(yacc.formalGram.table);
    this.buildClass(yacc);
  }
  static preprocess(yacc) {
    var formalGram = yacc.input.formalGram;
    var P = formalGram.P;
    var Vt = formalGram.Vt;
    var S = formalGram.S;
    var gramsMap = new Map();
    var gramsSettings = new Map();
    if (formalGram.asso == undefined) {
      formalGram.asso = "m";
    }
    var globalAsso = formalGram.asso;
    P.forEach((element) => {
      if (!gramsMap.has(element.id)) {
        gramsMap.set(element.id, []);
      }
      if (!(element.gram instanceof Array)) {
        element.gram = [element.gram];
      }
      if (element.priority == undefined) {
        element.priority = [];
      } else if (!(element.priority instanceof Array)) {
        element.priority = [element.priority];
      }
      if (element.asso == undefined) {
        element.asso = [];
      } else if (!(element.asso instanceof Array)) {
        element.asso = [element.asso];
      }

      element.gram.forEach((v) => {
        var sr = new StringReader(v + " ");
        var char = sr.readChar();
        var string = "";
        var output = [];
        while (char != null) {
          if (char == " ") {
            // if (string != "") {
            output.push(string);
            string = "";
            // }
          } else {
            string += char;
          }
          char = sr.readChar();
        }
        gramsMap.get(element.id).push(output);
      });
    });
    var Vn = Array.from(gramsMap.keys());
    //编号分配
    var i = 1;
    var Vti = new Map();
    //空串分配ID 0
    Vti.set("", 0);
    Vt.forEach((vt) => {
      if (Vti.has(vt)) {
        error("非终结符重复定义:" + vt);
      }
      Vti.set(vt, i);
      ++i;
    });
    var Vni = new Map();
    Vn.forEach((vn) => {
      if (Vti.has(vn)) {
        error("非终结符同时也是终结符:" + vn);
      }
      Vni.set(vn, i);
      ++i;
    });
    //做文法的增广
    var S_ = S + "'";
    while (Vti.has(S_) || Vni.has(S_)) {
      S_ += "'";
    }
    Vni.set(S_, i);
    gramsMap.set(S_, [[S]]);
    var Pi = new Map();
    //“符号ID化”及“符号是否定义检查”
    gramsMap.forEach((v, k) => {
      v.forEach((element2) => {
        for (var j = 0; j < element2.length; ++j) {
          var temp1 = element2[j];
          var temp2 = Vni.get(temp1);
          if (temp2 == undefined) {
            temp2 = Vti.get(temp1);
          }
          if (temp2 == undefined) {
            error("未定义的符号:" + temp1);
          }
          element2[j] = temp2;
        }
      });
      Pi.set(Vni.get(k), v);
    });
    //计算反向映射表
    var Vtn = new Map();
    Vti.forEach((v, k) => {
      Vtn.set(v, k);
    });
    var Vnn = new Map();
    Vni.forEach((v, k) => {
      Vnn.set(v, k);
    });
    P.forEach((element) => {
      var priority = element.priority;
      var asso = element.asso;
      var settings = [];
      if (gramsSettings.has(Vni.get(element.id))) {
        settings = gramsSettings.get(Vni.get(element.id));
      }
      var lastPNud = 0;
      var lastANud = 0;
      for (var i = 0; i < element.gram.length; ++i) {
        var p = priority[i];
        var a = asso[i];
        if (i >= priority.length) {
          p = priority[lastPNud];
        } else {
          lastPNud = i;
        }
        if (a == undefined) {
          a = asso[lastANud];
          if (a == undefined) {
            a = globalAsso;
          }
        } else {
          lastANud = i;
        }
        settings.push({ priority: p, asso: a });
      }
      gramsSettings.set(Vni.get(element.id), settings);
    });
    //将拓广后的开始符的优先级和结合性定义好
    gramsSettings.set(Vni.get(S_), [
      {
        priority: formalGram.S_priority,
        asso: formalGram.S_asso == undefined ? globalAsso : formalGram.S_asso,
      },
    ]);
    yacc.formalGram = {
      P: Pi,
      Vt: Vti,
      Vn: Vni,
      Vtn: Vtn,
      Vnn: Vnn,
      S: S_,
      gramsSettings: gramsSettings,
    };
  }
  static __ProjectToString(formalGram, c) {
    var P = formalGram.P;
    var Vnn = formalGram.Vnn;
    var Vtn = formalGram.Vtn;
    var gram = P.get(c.f)[c.i];
    var output = (Vnn.get(c.f) || Vtn.get(c.f)) + "->";
    for (var i = 0; i < c.p; ++i) {
      output += (Vnn.get(gram[i]) || Vtn.get(gram[i])) + " ";
    }
    output += "★ ";
    for (var i = c.p; i < gram.length; ++i) {
      output += (Vnn.get(gram[i]) || Vtn.get(gram[i])) + " ";
    }

    output += ",";
    c.n.forEach((element) => {
      output += (element == -1 ? "#" : Vtn.get(element)) + " | ";
    });
    return output;
  }
  static __TableItemToString(formalGram, item) {
    var Vnn = formalGram.Vnn;
    var output = "转换异常！";
    if (item.d == "r") {
      output = "r:规约" + item.l + "个符号并产生符号" + Vnn.get(item.s);
    } else if (item.d == "j") {
      output = "j:移进并转移至状态" + item.t;
    }
    return output;
  }
  //显示用函数
  static __ClosuerToString(formalGram, closuer) {
    var output = "";
    closuer.forEach((c) => {
      output += this.__ProjectToString(formalGram, c) + "\n";
    });
    return output;
  }
  static __ClosuersToString(formalGram, closuers) {
    var output = "";
    closuers.forEach((c, i) => {
      output += "状态" + i + ":\n" + this.__ClosuerToString(formalGram, c);
    });
    return output;
  }
  static __tableErrorToString(formalGram, tableError, level = 3) {
    var output = "状态：";
    if (tableError.solved) {
      output += "已解决\n";
      output += "解决方案：" + tableError.solution.describe + "\n";
    } else {
      output += "未解决\n";
    }
    if (level > 0) {
      output += "冲突状态：" + tableError.state + "\n";
      output +=
        "冲突符号：" + formalGram.indexToSymbol[tableError.symbol] + "\n";
    }
    if (level > 1) {
      output +=
        "-------------冲突内容-------------:\n" +
        this.__TableItemToString(formalGram, tableError.ConflictTableItem[0]) +
        "\n与:\n" +
        this.__TableItemToString(formalGram, tableError.ConflictTableItem[1]) +
        "\n";
    }
    if (level > 2) {
      output +=
        "-------------冲突项目-------------:\n" +
        this.__ProjectToString(formalGram, tableError.ConflictProject[0]) +
        "\n与\n" +
        this.__ProjectToString(formalGram, tableError.ConflictProject[1]) +
        "\n";
    }
    if (level > 3) {
      output +=
        "-------------冲突项目集-------------:\n" +
        this.__ClosuerToString(formalGram, tableError.ConflictProjectSet) +
        "\n";
    }

    return output;
  }
  /**
   * 输出冲突处理方案日志
   * @param {*} yacc 运行run函数时的输入
   * @param {*} outputHandle 输出日志调用函数，默认为console.log，表示输出到控制台
   * @param {*} solvedShowLevel 已解决方案的输出等级，输出等级未1，2，3，4，默认为3
   * @param {*} unsolvedShowLevel 未解决方案的输出等级，输出等级未1，2，3，4，默认为4
   * @param {*} filter 一个过滤器，过滤一些不想输出的日志
   */
  static showConflictResolution(
    yacc,
    outputHandle = console.log,
    solvedShowLevel = 3,
    unsolvedShowLevel = 4,
    filter = (tableError) => {
      return tableError.solution.code != -1;
    }
  ) {
    var formalGram = yacc.formalGram;
    var tableErrors = formalGram.tableErrors;
    tableErrors.forEach((tableError) => {
      if (filter(tableError)) {
        var level = 0;
        if (tableError.solved == true) {
          level = solvedShowLevel;
        } else if (tableError.solved == false) {
          level = unsolvedShowLevel;
        }
        outputHandle(
          this.__tableErrorToString(formalGram, tableError, level) + "\n"
        );
      }
    });
  }
  static showClosuers(yacc) {
    console.log(
      this.__ClosuersToString(yacc.formalGram, yacc.formalGram.closuers)
    );
  }
  static createClosuer(yacc) {
    var formalGram = yacc.formalGram;
    var P = formalGram.P;
    var Vt = formalGram.Vt;
    var Vtn = formalGram.Vtn;
    var Vn = formalGram.Vn;
    var Vnn = formalGram.Vnn;
    var S = formalGram.S;
    var closuers = [];
    var tempTable = [];
    formalGram.tempTable = tempTable;
    var F = new Map(); //First集
    //计算所有非终结符的First集
    //所有终结符的First集为其本身
    Vt.forEach((v, k) => {
      F.set(v, new Set([v]));
    });
    //计算所有非终结符的First集
    Vn.forEach((v, k) => {
      var p = P.get(v);
      var s = new Set();
      p.forEach((element) => {
        var element2 = element[0];
        //如果文法第一个字符为终结符则直接加入first集，0表示空串
        if (element2 == 0 || Vtn.has(element2)) {
          s.add(element2);
        }
      });
      F.set(v, s);
    });
    //循环计算first集
    var change = true;
    while (change) {
      change = false;
      //遍历所有非终结符
      Vnn.forEach((v, k) => {
        var s = F.get(k);
        var size = s.size;
        var p = P.get(k);
        p.forEach((element) => {
          var element2 = element[0];
          //如果文法起始为非终结符
          if (Vnn.has(element2)) {
            var temp = true; //是否继续处理文法中下一非终结符，取决于当前非终结符First集是否存在空串
            var ii = -1;
            while (temp) {
              ii += 1;
              if (ii >= element.length) {
                s.add(0);
                break;
              }
              element2 = element[ii];
              var s2 = F.get(element2);
              s2.forEach((vv) => {
                if (vv != 0) {
                  s.add(vv);
                }
              });
              temp = s2.has(0);
            }
          }
        });
        if (s.size > size) {
          change = true;
        }
      });
    }
    // console.log(formalGram);
    // console.log(F);
    //检查是否有符号的First集为空
    F.forEach((v, k) => {
      if (v.size == 0) {
        error("符号'" + Vnn.get(k) + "'无法推出非终结符");
      }
    });

    //计算一个串的非终结符
    function calcuFirst(array) {
      var s = new Set();
      var hasZ = true; //s是否需要有空串
      for (var i = 0; i < array.length; ++i) {
        var V = array[i];
        var f = F.get(V);
        f.forEach((element) => {
          if (element != 0) {
            s.add(element);
          }
        });
        if (!f.has(0)) {
          hasZ = false;
          break;
        }
      }
      if (hasZ) {
        s.add(0);
      }
      return s;
    }
    var closuersMap = new Map();
    function closuerToKey(closuer) {
      var output = "";
      for (var i = 0; i < closuer.length; ++i) {
        var temp = closuer[i];
        output += temp.f + " " + temp.i + " " + temp.p + " ";
        temp.n.forEach((v) => {
          output += v + "|";
        });
        output += "^";
      }
      return output;
    }

    //计算闭包
    function addClosure(closuer) {
      // console.log(closuer);
      //计算闭包
      for (var i = 0; i < closuer.length; ++i) {
        var temp = closuer[i];
        var gram = P.get(temp.f)[temp.i];
        //处理空串
        while (temp.p < gram.length) {
          if (gram[temp.p] == 0) {
            temp.p += 1;
          } else {
            break;
          }
        }
        if (temp.p < gram.length) {
          var nextChar = gram[temp.p];
          if (Vnn.has(nextChar)) {
            var ba = gram.slice(temp.p + 1);
            //计算展望Set
            var b = null;
            if (ba.length == 0) {
              b = temp.n;
            } else {
              b = calcuFirst(ba);
              if (b.has(0)) {
                temp.n.forEach((v) => {
                  b.add(v);
                });
              }
            }

            var grams1 = P.get(nextChar);
            // console.log(grams1);
            for (var j = 0; j < grams1.length; ++j) {
              var c = { f: nextChar, i: j, p: 0, n: b };
              var has = false;
              var index1 = -1;
              closuer.forEach((element2, index) => {
                if (
                  element2.f == c.f &&
                  element2.i == c.i &&
                  element2.p == c.p
                ) {
                  has = true;
                  index1 = index;
                }
              });
              if (!has) {
                closuer.push(c);
              } else {
                var c2 = closuer[index1];
                c.n.forEach((v2) => {
                  c2.n.add(v2);
                });
              }
            }
          }
        }
      }
      //在此判断是否已存在
      closuer = closuer.sort((a, b) => {
        var output = a.f - b.f;
        if (output == 0) {
          output = a.i - b.i;
          if (output == 0) {
            output = a.p - b.p;
          }
        }
        return output;
      });
      var key = closuerToKey(closuer);
      var index = -1;
      if (!closuersMap.has(key)) {
        // console.log("KKK");
        // showClosuer(closuer);
        tempTable.push(new Map());
        closuers.push(closuer);
        index = closuers.length - 1;
        closuersMap.set(key, index);
        var CharSet = new Map(); //根据下一字符分类
        closuer.forEach((element3) => {
          var gram1 = P.get(element3.f)[element3.i];
          if (element3.p < gram1.length) {
            var char = gram1[element3.p];
            if (!CharSet.has(char)) {
              CharSet.set(char, []);
            }
            CharSet.get(char).push(element3);
          }
        });
        CharSet.forEach((v, k) => {
          var closuer2 = [];
          v.forEach((vv) => {
            closuer2.push({
              f: vv.f,
              i: vv.i,
              p: vv.p + 1,
              n: new Set(vv.n),
            });
          });
          var t = addClosure(closuer2);
          tempTable[index].set(k, t);
        });
      } else {
        index = closuersMap.get(key);
      }
      return index;
    }
    var closuer = [{ f: Vn.get(S), i: 0, p: 0, n: new Set([-1]) }]; //f,i用于索引文法,p指示短语下一识别字符，n为展望终结符集，-1表示特殊符号#
    addClosure(closuer);
    formalGram.closuers = closuers;
    // console.log(closuer);
  }
  static createTable(yacc) {
    var formalGram = yacc.formalGram;
    var P = formalGram.P;
    var Vt = formalGram.Vt;
    var Vtn = formalGram.Vtn;
    var Vn = formalGram.Vn;
    var Vnn = formalGram.Vnn;
    var S = formalGram.S;
    var closuers = formalGram.closuers;
    var tempTable = formalGram.tempTable;
    var table = [];
    for (var i = 0; i < closuers.length; ++i) {
      var closuer = closuers[i];
      var temp = tempTable[i]; //临时转移表
      var ag = [];
      closuer.forEach((element, j) => {
        var gram = P.get(element.f)[element.i];
        //规约
        if (element.p >= gram.length) {
          element.n.forEach((element2) => {
            ag.push({
              c: element2,
              d: "r",
              f: element.f,
              i: element.i,
              ci: i, //此项目对应closuers中的位置
              cj: j, //此项目对应closuers中的位置
            });
          });
        } //移进
        else {
          var char = gram[element.p];
          ag.push({
            c: char,
            d: "j",
            t: temp.get(char),
            ci: i, //此项目对应closuers中的位置
            cj: j, //此项目对应closuers中的位置
          });
        }
      });
      table.push(ag);
    }
    formalGram.table = table;
  }
  static buildClass(yacc) {
    var formalGram = yacc.formalGram;
    var P = formalGram.P;
    var Vt = formalGram.Vt;
    var Vtn = formalGram.Vtn;
    var Vn = formalGram.Vn;
    var Vnn = formalGram.Vnn;
    var S = formalGram.S;
    var closuers = formalGram.closuers;
    var table = formalGram.table;
    var gramsSettings = formalGram.gramsSettings;
    // console.log(gramsSettings);
    var tableErrors = []; //构建LR表时遇到的问题以及问题的解决方案
    formalGram.tableErrors = tableErrors;
    //开始构造info
    var info = {};
    //构造indexToSymbol
    var indexToSymbol = {};
    Vtn.forEach((v, k) => {
      indexToSymbol[k] = v;
    });
    Vnn.forEach((v, k) => {
      indexToSymbol[k] = v;
    });
    info.indexToSymbol = indexToSymbol;
    formalGram.indexToSymbol = indexToSymbol;
    //构造symbolToIndex
    var symbolToIndex = {};
    Vt.forEach((v, k) => {
      symbolToIndex[k] = v;
    });
    Vn.forEach((v, k) => {
      symbolToIndex[k] = v;
    });
    info.symbolToIndex = symbolToIndex;
    info.stop = Vn.get(S);
    //构造table
    var CodeTable = {};
    var CodeProject = new Map(); //LR表中项目与文法项目对应表，用于提供报错信息
    for (var i = 0; i < table.length; ++i) {
      var t = table[i];
      t.forEach((element, j) => {
        var temp = { d: element.d };
        if (element.d == "j") {
          temp.t = element.t;
        } else {
          var gram = P.get(element.f)[element.i];
          temp.s = element.f;
          var length = 0;
          gram.forEach((v) => {
            if (v != 0) {
              length += 1;
            }
          });
          temp.l = length;
        }
        var key = i + "_" + element.c;
        //出现冲突
        if (CodeTable[key] != undefined) {
          var temp3 = CodeTable[key];
          var hasError = true;
          var ci1 = element.ci; //当前项目在closuers中的位置
          var cj1 = element.cj; //当前项目在closuers中的位置
          var ci3 = CodeProject.get(key).ci; //表中冲突项目在closuers中的位置
          var cj3 = CodeProject.get(key).cj; //表中冲突项目在closuers中的位置
          var tableError = {};
          //判断是否是已解决的冲突
          if (temp3.d == temp.d) {
            if (temp3.d == "j") {
              //移进/移进 冲突
              if (temp3.t == temp.t) {
                //移进相同目的地
                hasError = false;
                tableError.solution = {
                  code: -1,
                  describe: "同一项目冲突，不予理会",
                };
              }
            } else if (temp3.d == "r") {
              //规约/规约 冲突
              var proj1 = closuers[ci1][cj1];
              var proj3 = closuers[ci3][cj3];
              var settings1 = gramsSettings.get(proj1.f)[proj1.i];

              var settings3 = gramsSettings.get(proj3.f)[proj3.i];
              if (settings1.priority < settings3.priority) {
                //优先级大的执行
                CodeTable[key] = temp3;
                CodeProject.set(key, { ci: ci3, cj: cj3 });
                hasError = false;
                tableError.solution = {
                  code: -2,
                  describe: "按照优先级执行后者",
                };
              } else if (settings1.priority > settings3.priority) {
                //优先级大的执行
                CodeTable[key] = temp;
                CodeProject.set(key, { ci: ci1, cj: cj1 });
                hasError = false;
                tableError.solution = {
                  code: -2,
                  describe: "按照优先级执行前者",
                };
              } else if (
                settings1.priority != undefined &&
                settings1.priority == settings3.priority
              ) {
              } else {
              }
            }
            // else {
            //   error("程序错误，d字段非法:" + temp3.d);
            // }
          } else {
            //移进/规约 冲突
            if (temp3.d == "j") {
              var temp2 = temp3;
              temp3 = temp;
              temp = temp2;
              var cj2 = cj3;
              cj3 = cj1;
              cj1 = cj2;
              var ci2 = ci3;
              ci3 = ci1;
              ci1 = ci2;
            }
            //temp为移进,temp3为规约
            var proj1 = closuers[ci1][cj1];
            var proj3 = closuers[ci3][cj3];
            if (proj1.f == proj3.f && proj1.i == proj3.i) {
              //同一产生式出现的冲突
              var settings = gramsSettings.get(proj1.f)[proj1.i];
              if (settings.asso == "l") {
                //左结合，先规约
                // console.log(settings);
                CodeTable[key] = temp3;
                CodeProject.set(key, { ci: ci3, cj: cj3 });
                hasError = false;
                tableError.solution = {
                  code: -3,
                  describe: "同一文法按照左结合规则，先规约",
                };
              } else if (settings.asso == "r") {
                //右结合，先移进
                CodeTable[key] = temp;
                CodeProject.set(key, { ci: ci1, cj: cj1 });
                hasError = false;
                tableError.solution = {
                  code: -3,
                  describe: "同一文法按照右结合规则，先移进",
                };
              }
            } else {
              //不同产生式出现的冲突
              var settings1 = gramsSettings.get(proj1.f)[proj1.i];
              // console.log(proj3.f + " " + proj3.i);
              var settings3 = gramsSettings.get(proj3.f)[proj3.i];
              if (settings1.priority < settings3.priority) {
                //优先级大的执行
                CodeTable[key] = temp3;
                CodeProject.set(key, { ci: ci3, cj: cj3 });
                hasError = false;
                tableError.solution = {
                  code: -4,
                  describe: "按照优先级执行后者",
                };
              } else if (settings1.priority > settings3.priority) {
                //优先级大的执行
                CodeTable[key] = temp;
                CodeProject.set(key, { ci: ci1, cj: cj1 });
                hasError = false;
                tableError.solution = {
                  code: -4,
                  describe: "按照优先级执行前者",
                };
              } else if (
                settings1.priority != undefined &&
                settings1.priority == settings3.priority
              ) {
                //优先级相同的，按照结合方向执行
                if (settings1.ass0 == settings3.ass0) {
                  //结合方向定义相同
                  if (settings1.asso == "l") {
                    //左结合，先规约
                    // console.log(settings);
                    CodeTable[key] = temp3;
                    CodeProject.set(key, { ci: ci3, cj: cj3 });
                    hasError = false;
                    tableError.solution = {
                      code: -3,
                      describe: "优先级相同，按照左结合规则，先规约",
                    };
                  } else if (settings1.asso == "r") {
                    //右结合，先移进
                    CodeTable[key] = temp;
                    CodeProject.set(key, { ci: ci1, cj: cj1 });
                    hasError = false;
                    tableError.solution = {
                      code: -3,
                      describe: "优先级相同，按照右结合规则，先移进",
                    };
                  }
                } else {
                  //结合方向定义不同
                }
              } else {
                // //以下代码启用会有危险性，由于全局asso定义的存在，可能会导致很多结合性冲突解决遇到异常，但如果启用，则可能由于拓广文法的起始符无法定义优先级而遇到无法解决的冲突
                // //优先级未定义，按照结合方向执行
                // if (settings1.ass0 == settings3.ass0) {
                //   //结合方向定义相同
                //   if (settings1.asso == "l") {
                //     //左结合，先规约
                //     // console.log(settings);
                //     CodeTable[key] = temp3;
                //     CodeProject.set(key, { ci: ci3, cj: cj3 });
                //     hasError = false;
                //     tableError.solution = {
                //       code: -4,
                //       describe: "优先级未定义，按照左结合规则，先规约",
                //     };
                //   } else if (settings1.asso == "r") {
                //     //右结合，先移进
                //     CodeTable[key] = temp;
                //     CodeProject.set(key, { ci: ci1, cj: cj1 });
                //     hasError = false;
                //     tableError.solution = {
                //       code: -4,
                //       describe: "优先级未定义，按照右结合规则，先移进",
                //     };
                //   }
                // } else {
                //   //结合方向定义不同
                // }
              }
            }
          }
          tableError.state = i;
          tableError.symbol = element.c;
          tableError.ConflictTableItem = [temp, temp3];
          tableError.ConflictProject = [closuers[ci1][cj1], closuers[ci3][cj3]];
          tableError.ConflictProjectSet = closuers[i];
          tableError.solved = !hasError;
          tableErrors.push(tableError);
          if (hasError) {
            error(this.__tableErrorToString(formalGram, tableError));
            // error(
            //   "冲突，" +
            //     "-------------详细信息-------------:\nkey:" +
            //     i +
            //     "_" +
            //     +element.c +
            //     "(" +
            //     indexToSymbol[element.c] +
            //     ")" +
            //     "\n-------------冲突内容-------------:\n" +
            //     this.__TableItemToString(formalGram, temp) +
            //     "\n与:\n" +
            //     this.__TableItemToString(formalGram, temp3) +
            //     "\n-------------冲突项目-------------:\n" +
            //     this.__ProjectToString(formalGram, closuers[ci1][cj1]) +
            //     "\n与\n" +
            //     this.__ProjectToString(formalGram, closuers[ci3][cj3]) +
            //     "\n-------------冲突项目集-------------:\n" +
            //     this.__ClosuerToString(formalGram, closuers[i]) +
            //     "\n-------------ID映射-------------:\nVn:\n" +
            //     JSON.stringify(Array.from(Vnn.entries()), null, "") +
            //     "\nVt:\n" +
            //     JSON.stringify(Array.from(Vtn.entries()), null, "")
            //   // +
            //   // "\n-------------状态-------------:\n" +
            //   // this.__ClosuersToString(formalGram, closuers)
            // );
          }
        } else {
          CodeTable[key] = temp;
          CodeProject.set(key, { ci: element.ci, cj: element.cj });
        }
      });
    }
    info.table = CodeTable;
    var code1 =
      `class J_SimpleParser {
        static info = ` +
      JSON.stringify(info) +
      `;
      constructor() {
        this.initState();
        this.callback = (F) => {
          return undefined;
        };
      }
      /**
       * 初始化函数，每次需重新运行时调用
       */
      initState() {
        this.Stack = [{ symbol: -1, state: 0 }];
        this.his = null;
      }
      /**
       * 读取符号的编号并进行相应的状态转换
       * @param {*} code 符号对应的编号，符号编号映射表存于J_SimpleParser.info中
       * @param {*} args 将挂载到该符号上的参数，进行属性文法设计时使用
       * @returns 本次读取是否合法，合法则返回true，不合法返回false
       */
      readSymbolCode(code, args) {
        if (code == undefined) {
          throw "输入symbol非法:" + J_SimpleParser.info.indexToSymbol[code];
        }
        var top = this.Stack[this.Stack.length - 1];
        var d = J_SimpleParser.info.table[top.state + "_" + code];
        if (d == undefined) {
          throw (
            "解析异常:" +
            (top.state + "_" + code) +
            " 遇到符号:[" +
            J_SimpleParser.info.indexToSymbol[code] +
            "]"
          );
        }
        if (d.d == "j") {
          this.Stack.push({ symbol: code, state: d.t, args: args });
        } else {
          var to = this.Stack.length - d.l;
          /**
           * 该值作为规约历史记录，记录最近一次规约参数
           */
          this.his = { t: d.s, f: this.Stack.slice(to) };
          var args1 = this.callback(this.his);
          this.Stack = this.Stack.slice(0, to);
          if (d.s == J_SimpleParser.info.stop) {
            return true;
          }
    
          if (this.readSymbolCode(d.s, args1)) {
            return true;
          }
          if (this.readSymbolCode(code, args)) {
            return true;
          }
        }
        return false;
      }
    }
    class J_Parser extends J_SimpleParser {
      constructor() {
        super();
        this.callback = (F) => {
          /**
           * 该值作为规约历史记录，记录最近一次scallback调用参数（已进行编号与符号转换）
           */
          this.shis = {
            t: J_SimpleParser.info.indexToSymbol[F.t],
            f: F.f.map((v) => {
              return {
                symbol: J_SimpleParser.info.indexToSymbol[v.symbol],
                state: v.state,
                args: v.args,
              };
            }),
          };
          return this.scallback(this.shis);
        };
        /**
         * 规约回调处理，每次规约时调用
         * @param {*} F 规约信息，F={t:"规约至符号",f:[{symbol:"待规约符号1",state:"状态栈中该符号对应的状态码",args:"该符号挂载的参数"},...]}
         * @returns 将挂载到规约符号上的参数，进行属性文法设计时使用
         */
        this.scallback = (F) => {
          return undefined;
        };
      }
      /**
       * 初始化函数，每次需重新运行时调用
       */
      initState() {
        super.initState();
        this.shis = null;
      }
      /**
       * 读取符号并进行相应的状态转换
       * @param {*} code 待读取的符号
       * @param {*} args 将挂载到该符号上的参数，进行属性文法设计时使用
       * @returns 本次读取是否合法，合法则返回true，不合法返回false
       */
      readSymbol(symbol, args) {
        var code = J_SimpleParser.info.symbolToIndex[symbol];
        if (code == undefined) {
          throw "输入symbol非法:" + symbol;
        }
        return this.readSymbolCode(code, args);
      }
      /**
       * 全部符号读取完毕后调用，调用此函数将结束输入，正常情况下将规约至开始符号
       * @returns 结束是否合法，合法则返回true，不合法返回false
       */
      finishRead() {
        return this.readSymbolCode(-1);
      }
    }
      `;
    if (yacc.input.code == undefined) {
      yacc.input.code = {};
    }
    if (yacc.input.code.prefix == undefined) {
      yacc.input.code.prefix = "";
    }
    if (yacc.input.code.suffix == undefined) {
      yacc.input.code.suffix = "";
    }
    yacc.code = yacc.input.code.prefix + code1 + yacc.input.code.suffix;
  }
}

// ()-*+|\{}[]<>
// ()*+|\<>   {}
//先判断一段，一段可以是()，{}，<>，得到一段后看后一个字符是否是*+，然后是后一个字符（或再后一个字符）是否是|，

export { J_Lex, J_Yacc };
