class J_SimpleLex {
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
