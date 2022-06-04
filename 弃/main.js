import fs from "fs";
var CharConverTable = { "\r": "\\r", "\n": "\\n", "\t": "\\t", "\\": "\\\\" };
function error(str) {
  throw str;
}
function run(lex) {
  lex.regxs = Object.create(lex.input.regxs);
  managebrace(lex);
  manageSlash(lex);
  console.log(lex.input.regxs);
  createNFA(lex);
  createDFA(lex);
  buildClassTable(lex);
}
function managebrace(lex) {
  var regxs = lex.regxs;
  var m = new Map();
  var filter = new Map();
  regxs.forEach((v) => {
    if (m.has(v.id)) {
      error("ID重复:" + v.id);
    }
    m.set(v.id, v);
  });
  //处理括号
  function brace(element) {
    var e = filter.get(element.id);
    if (e == undefined) {
      filter.set(element.id, false);
    } else if (e == false) {
      error("循环定义:" + element.id);
    } else {
      return element.regx;
    }
    var regx = element.regx;
    var start = -1;
    var end = -1;
    for (var i = 0; i < regx.length; ++i) {
      var char = regx.charAt(i);
      if (char == "\\") {
        ++i;
        if (i >= regx.length) {
          error("\\不匹配:" + regx);
        }
        char = regx.charAt(i);
        continue;
      } else if (char == "[") {
        start = i;
        var content = "";
        while (true) {
          ++i;
          if (i >= regx.length) {
            error("中括号不匹配错误:" + JSON.stringify(element));
          }
          char = regx.charAt(i);
          if (char == "\\") {
            ++i;
            content += char;
            char = regx.charAt(i);
            content += char;
            continue;
          }
          if (char == "]") {
            break;
          }
          content += char;
        }
        end = i;
        var value = "";
        var last = undefined;
        var start2 = -1;
        var end2 = -1;
        for (var j = 0; j < content.length; ++j) {
          var char2 = content.charAt(j);
          if (char2 == "-") {
            if (last == undefined) {
              error('"-"不匹配');
            }
            start2 = last.charCodeAt();
            ++j;
            if (j >= content.length) {
              error('"-"不匹配');
            }
            char2 = content.charAt(j);
            last = undefined;
            end2 = char2.charCodeAt();
            if (end2 < start2) {
              var temp = end2;
              end2 = start2;
              start2 = temp;
            }
            for (var k = start2 + 1; k <= end2; ++k) {
              value += String.fromCharCode(k) + "|";
            }
            continue;
          } else if (char2 == "\\") {
            value += char2;
            ++j;
            if (j >= content.length) {
              error('"\\"不匹配');
            }
            char2 = content.charAt(j);
          }
          value += char2 + "|";
          last = char2;
        }
        value = value.substring(0, value.length - 1);

        var tempRegx = regx.substring(0, start) + "(" + value + ")";
        i = tempRegx.length;
        tempRegx += regx.substring(end + 1);
        regx = tempRegx;
      } else if (char == "{") {
        start = i;
        var id = "";
        while (true) {
          ++i;
          if (i >= regx.length) {
            error("大括号不匹配错误:" + JSON.stringify(element));
          }
          char = regx.charAt(i);
          //   if (char == "\\") {
          //     ++i;
          //     char = regx.charAt(i);
          //     continue;
          //   }
          if (char == "}") {
            break;
          }
          id += char;
        }
        end = i;
        var element2 = m.get(id);
        if (element2 == undefined) {
          error("命名未定义:{" + id + "}");
        } else {
          brace(element2);

          var tempRegx = regx.substring(0, start) + "(" + element2.regx + ")";
          i = tempRegx.length;
          tempRegx += regx.substring(end + 1);
          regx = tempRegx;
        }
      }
    }
    element.regx = regx;
    filter.set(element.id, true);
  }
  regxs.forEach((element) => {
    var regx = element.regx;
    brace(element);
  });
}
function manageSlash(lex) {
  var regxs = lex.regxs;
  regxs.forEach((element) => {
    var array = element.regx.split("\\");
    var newRegxs = array[0];
    for (var i = 1; i < array.length; ++i) {
      var s = array[i];
      if (s.length == 0) {
        newRegxs += "\\";
      } else {
        var char = array[i].charAt(0);
        if (
          char == "(" ||
          char == "|" ||
          char == ")" ||
          char == "*" ||
          char == "+" ||
          char == "-"
        ) {
          newRegxs += "\\";
        } else if (char == "{" || char == "}" || char == "[" || char == "]") {
        } else {
          error("\\后出现非法字符:" + element.regx);
        }
      }
      newRegxs += s;
    }
    element.regx = newRegxs;
  });
}
function createNFA(lex) {
  function NFAAddSide(NFA, v, inNodeID, outNodeID) {
    var inNode = NFA.sides.get(inNodeID);
    if (!inNode.has(v)) {
      inNode.set(v, []);
    }
    inNode.get(v).push(outNodeID);
  }
  function buildNFA(NFA, v, inNodeID, outNodeID) {
    if (v.length <= 1) {
      //   NFA.sides.get(inNodeID).set(v, outNodeID);
      NFAAddSide(NFA, v, inNodeID, outNodeID);
      return;
    }
    var end = -1;
    var i = 0;
    var char = v.charAt(i);
    var string1 = "";
    if (char == "(") {
      var layer = 1;
      while (true) {
        ++i;
        if (i >= v.length) {
          error("小括号不匹配:" + v);
        }
        char = v.charAt(i);
        if (char == "\\") {
          ++i;
          //pass
        } else if (char == "(") {
          layer += 1;
        } else if (char == ")") {
          layer -= 1;
        }
        if (layer == 0) {
          end = i;
          break;
        }
      }
      string1 = v.substring(1, end);
    } else if (char == "\\") {
      ++i;
      char = v.charAt(i);
      string1 = char;
    } else if (char == ")" || char == "|" || char == "*" || char == "+") {
      error("符号非法使用:" + char);
    } else {
      string1 = char;
    }
    ++i;
    var char2 = "";
    var hasNext = true;
    if (i >= v.length) {
      hasNext = false;
    } else {
      char = v.charAt(i);
      if (char == "*" || char == "+") {
        char2 = char;
        ++i;
        if (i >= v.length) {
          hasNext = false;
        }
      }
    }
    if (hasNext) {
      char = v.charAt(i);
      if (char == "|") {
        ++i;
        if (i >= v.length) {
          error("|使用错误:" + v);
        }
        buildNFA(NFA, v.substring(i), inNodeID, outNodeID);
      } else {
        var nextID = NFA.nextID;
        NFA.nextID += 1;
        NFA.sides.set(nextID, new Map());
        buildNFA(NFA, v.substring(i), nextID, outNodeID);
        outNodeID = nextID;
      }
    }
    if (char2 == "*") {
      var nextID = NFA.nextID;
      NFA.nextID += 1;
      NFA.sides.set(nextID, new Map());
      NFAAddSide(NFA, "", inNodeID, nextID);
      //   NFA.sides.get(inNodeID).set("", nextID);
      NFAAddSide(NFA, "", nextID, outNodeID);
      //   NFA.sides.get(nextID).set("", outNodeID);
      buildNFA(NFA, string1, nextID, nextID);
    } else if (char2 == "+") {
      var nextID = NFA.nextID;
      NFA.nextID += 1;
      NFA.sides.set(nextID, new Map());
      //   NFA.sides.get(inNodeID).push({ r: "", t: nextID });
      buildNFA(NFA, string1, inNodeID, nextID);
      NFAAddSide(NFA, "", nextID, outNodeID);
      //   NFA.sides.get(nextID).set("", outNodeID);
      buildNFA(NFA, string1, nextID, nextID);
    } else {
      buildNFA(NFA, string1, inNodeID, outNodeID);
    }
  }
  var regxs = lex.regxs;
  var NFA = {};
  lex.NFA = NFA;
  NFA.sides = new Map();
  NFA.sides.set(0, new Map());
  NFA.nextID = 1;
  regxs.forEach((element) => {
    NFA.sides.set(NFA.nextID, new Map());
    element.NFAAcceptState = NFA.nextID;
    NFA.nextID += 1;
  });
  NFA.lastEndState = NFA.nextID - 1;
  regxs.forEach((element) => {
    buildNFA(NFA, element.regx, 0, element.NFAAcceptState);
    // element.NFA = NFA;
  });
  //   console.log(NFA.sides);
}
function createDFA(lex) {
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

  function buildDFA(NFA, DFA, startSet) {
    //空串闭包扩展
    var closure = new Set();
    function calcuClosure(v) {
      closure.add(v);
      var toNodes = NFA.sides.get(v).get("");
      if (toNodes != undefined) {
        toNodes.forEach((vv) => {
          calcuClosure(vv);
        });
      }
    }
    startSet.forEach((v) => {
      calcuClosure(v);
    });
    // console.log(closure);
    //ID分配
    var name = SetToString(NFA.nextID, closure);
    // console.log(name);
    //判断是否为已计算过的状态
    if (!StateMap.has(name)) {
      StateMap.set(name, DFA.nextID);
      DFA.sides.set(DFA.nextID, new Map());
      var fromId = DFA.nextID;
      var endState = new Set();
      closure.forEach((v) => {
        if (v <= NFA.lastEndState && v > 0) {
          endState.add(v);
        }
      });
      DFA.States.set(fromId, { endState: endState });
      DFA.nextID += 1;
      var CharSet = new Set();
      CharSet.add("");
      closure.forEach((nodeID) => {
        var node = NFA.sides.get(nodeID);
        node.forEach((v, k) => {
          if (!CharSet.has(k)) {
            var char = k;
            CharSet.add(k);
            var startSet2 = new Set();
            closure.forEach((nodeID1) => {
              var node1 = NFA.sides.get(nodeID1);
              if (node1.has(char)) {
                var toNodes = node1.get(char);
                toNodes.forEach((v1) => {
                  startSet2.add(v1);
                });
              }
            });
            // console.log(k);
            // console.log(startSet2);
            var toId = buildDFA(NFA, DFA, startSet2);
            DFA.sides.get(fromId).set(char, toId);
          }
        });
      });
    }
    return StateMap.get(name);
  }
  var startSet = new Set();
  startSet.add(0);
  buildDFA(NFA, DFA, startSet);
  //   console.log(DFA);
  //   console.log(DFA.States);
}
function buildClassSwitch(lex) {
  var DFA = lex.DFA;
  var code1 = "";
  DFA.sides.forEach((sides, nodeId) => {
    var code2 = "";
    // console.log(sides);
    sides.forEach((v, k) => {
      if (CharConverTable[k] != undefined) {
        k = CharConverTable[k];
      }
      code2 +=
        `case "` +
        k +
        `":
        this.state = ` +
        v +
        `;
        break;
        `;
    });
    code1 +=
      `case ` +
      nodeId +
      `:
    switch (char) {
      ` +
      code2 +
      `default:
      return false;
      break;
    }
    break;`;
  });
  var code5 = ``;
  for (var i = 0; i < lex.DFA.nextID; ++i) {
    code5 += JSON.stringify(Array.from(lex.DFA.States.get(i).endState)) + ",";
  }
  var code4 =
    `{AccStatID:[` + code5 + `],regxs:` + JSON.stringify(lex.input.regxs) + `}`;

  var code3 =
    lex.input.code.prefix +
    `class J_SimpleLex {
        static info = ` +
    code4 +
    `
    constructor() {
      this.initState();
    }
    initState() {
      this.string = "";
      this.state = 0;
    }
    /**
     * 处理一个字符，如果处理成功则返回识别码，如果处理失败则返回null
     * @param {*} char 输入字符
     */
    readChar(char) {
        switch (this.state) {
            ` +
    code1 +
    `
        }
        this.string += char;
        return true;
    }
  }
  class J_Lex extends J_SimpleLex {
    readTag(inputStr) {
      var output = {};
      for (var i = 0; i < inputStr.length; ++i) {
        var b = this.readChar(inputStr.charAt(i));
        if (!b) {
          var stateS = J_Lex.info.AccStatID[this.state];
          var stateName = [];
          stateS.forEach((v) => {
            stateName.push(J_Lex.info.regxs[v - 1].id);
          });
          output.tag = stateName;
          output.value = this.string;
          output.nextRead = i;
          this.initState();
          if (output.nextRead == 0) {
            output.error = true;
          }
          return output;
        }
      }
      return null;
    }
  }
  ` +
    lex.input.code.suffix;
  lex.code = code3;
}
function buildClassTable(lex) {
  var DFA = lex.DFA;
  var table = {};
  DFA.sides.forEach((side, nodeId) => {
    side.forEach((v, k) => {
      table[k + "_" + nodeId] = v;
    });
  });

  var code5 = "";
  for (var i = 0; i < lex.DFA.nextID; ++i) {
    code5 += JSON.stringify(Array.from(lex.DFA.States.get(i).endState)) + ",";
  }
  var code4 =
    `{stateTranTable:` +
    JSON.stringify(table) +
    `,AccStatID:[` +
    code5 +
    `],regxs:` +
    JSON.stringify(lex.input.regxs) +
    `}`;

  var code3 =
    lex.input.code.prefix +
    `class J_SimpleLex {
          static info = ` +
    code4 +
    `
      constructor() {
        this.initState();
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
        var next = J_SimpleLex.info.stateTranTable[char + "_" + this.state];
        if (next == undefined) {
          return false;
        } else {
          this.state = next;
          this.string += char;
          return true;
        }
      }
    }
    class J_Lex extends J_SimpleLex {
      readTag(inputStr) {
        var output = {};
        for (var i = 0; i < inputStr.length; ++i) {
          var b = this.readChar(inputStr.charAt(i));
          if (!b) {
            var stateS = J_Lex.info.AccStatID[this.state];
            var stateName = [];
            stateS.forEach((v) => {
              stateName.push(J_Lex.info.regxs[v - 1].id);
            });
            output.tag = stateName;
            output.value = this.string;
            output.nextRead = i;
            this.initState();
            if (output.nextRead == 0) {
              output.error = true;
            }
            return output;
          }
        }
        return null;
      }
    }
    ` +
    lex.input.code.suffix;
  lex.code = code3;
}

var lex = {
  input: {
    code: {
      prefix: `/*测试*/
        `,
      suffix: `
        export default J_Lex;`,
    },
    regxs: [
      {
        id: "test",
        regx: `<(c) => {
          if (c == 1) {
            return true;
          } else {
            return false;
          }
        }>`,
      },
      // { id: "数字", regx: "[零一二三四五六七八九.]" },
      // { id: "special", regx: "[\\*\\+\\-\\|#]" },
      // { id: "delim", regx: "[\r\n\t ]" },
      // { id: "\\", regx: "\\\\" },
      // { id: "\\s", regx: "{\\}+" },
      // { id: "ws", regx: "{delim}+" },
      // { id: "int", regx: "int" },
      // { id: "bracket", regx: "\\{|\\}|\\[|\\]|\\(|\\)|<|>" },
      // { id: "stop", regx: ";" },
      // { id: "id", regx: "{letter}({letter}|{num})*" },
      // { id: "letter", regx: "[a-zA-Z]" },
      // { id: "num", regx: "[0-9]" },
      // { id: "file", regx: "({letter}|{num})*.({letter}|{num})*" },
      // { id: "keywords", regx: "(while)|(for)|(if)|(else)|(class)|(return)" },
      // { id: "中文", regx: "测试" },
    ],
  },
};

run(lex);
fs.writeFileSync("./test/out.js", lex.code);

// ()-*+|\    {}[]<>
//()|*+\
