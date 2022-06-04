class J_SimpleYacc {
  static info = {};
  constructor() {
    this.initState();
    this.callback = (F) => {};
  }
  initState() {
    this.Stack = [{ symbol: "#", state: 0 }];
  }
  readSymbol(symbol) {
    var index = info.symbolToIndex[symbol];
    if (index == undefined) {
      throw "输入symbol非法:" + symbol;
    }
    var top = this.Stack[this.Stack.length - 1];
    var d = info.table[top.state + "_" + index];
    if (d.d == "j") {
      this.Stack.push({ symbol: index, state: d.t });
    } else {
      var to = this.Stack.length - d.l;
      this.callback(this.Stack.slice(to));
      this.Stack = this.Stack.slice(0, to);
      this.readSymbol(d.s);
    }
  }
}
class J_Yacc extends J_SimpleYacc {
  constructor() {
    super();
    this.callback = (F) => {
      this.scallback(
        F.map((v) => {
          return J_SimpleYacc.info.indexToSymbol[v.symbol];
        })
      );
    };
    this.scallback = (F) => {};
  }
}
