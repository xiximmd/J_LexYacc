/*J_YaccDemo-复杂案例，简单表达式识别【此代码为自动生成代码】*/
class J_SimpleParser {
        static info = {"indexToSymbol":{"0":"","1":"+","2":"*","3":"num","4":"(","5":")","6":"Expr","7":"Expr'"},"symbolToIndex":{"":0,"+":1,"*":2,"num":3,"(":4,")":5,"Expr":6,"Expr'":7},"stop":7,"table":{"0_3":{"d":"j","t":1},"0_4":{"d":"j","t":2},"0_6":{"d":"j","t":13},"1_-1":{"d":"r","s":6,"l":1},"1_1":{"d":"r","s":6,"l":1},"1_2":{"d":"r","s":6,"l":1},"2_3":{"d":"j","t":3},"2_4":{"d":"j","t":4},"2_6":{"d":"j","t":11},"3_5":{"d":"r","s":6,"l":1},"3_1":{"d":"r","s":6,"l":1},"3_2":{"d":"r","s":6,"l":1},"4_3":{"d":"j","t":3},"4_4":{"d":"j","t":4},"4_6":{"d":"j","t":5},"5_5":{"d":"j","t":6},"5_1":{"d":"j","t":7},"5_2":{"d":"j","t":9},"6_5":{"d":"r","s":6,"l":3},"6_1":{"d":"r","s":6,"l":3},"6_2":{"d":"r","s":6,"l":3},"7_3":{"d":"j","t":3},"7_4":{"d":"j","t":4},"7_6":{"d":"j","t":8},"8_1":{"d":"r","s":6,"l":3},"8_5":{"d":"r","s":6,"l":3},"8_2":{"d":"j","t":9},"9_3":{"d":"j","t":3},"9_4":{"d":"j","t":4},"9_6":{"d":"j","t":10},"10_1":{"d":"r","s":6,"l":3},"10_2":{"d":"r","s":6,"l":3},"10_5":{"d":"r","s":6,"l":3},"11_5":{"d":"j","t":12},"11_1":{"d":"j","t":7},"11_2":{"d":"j","t":9},"12_-1":{"d":"r","s":6,"l":3},"12_1":{"d":"r","s":6,"l":3},"12_2":{"d":"r","s":6,"l":3},"13_1":{"d":"j","t":14},"13_2":{"d":"j","t":16},"13_-1":{"d":"r","s":7,"l":1},"14_3":{"d":"j","t":1},"14_4":{"d":"j","t":2},"14_6":{"d":"j","t":15},"15_1":{"d":"r","s":6,"l":3},"15_-1":{"d":"r","s":6,"l":3},"15_2":{"d":"j","t":16},"16_3":{"d":"j","t":1},"16_4":{"d":"j","t":2},"16_6":{"d":"j","t":17},"17_1":{"d":"r","s":6,"l":3},"17_2":{"d":"r","s":6,"l":3},"17_-1":{"d":"r","s":6,"l":3}}};
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
      export default J_Parser;