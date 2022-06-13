/*J_YaccDemo-简单案例，对称串识别【此代码为自动生成代码】*/
class J_SimpleParser {
        static info = {"indexToSymbol":{"0":"","1":"a","2":"b","3":"c","4":"S","5":"A","6":"S'"},"symbolToIndex":{"":0,"a":1,"b":2,"c":3,"S":4,"A":5,"S'":6},"stop":6,"table":{"0_5":{"d":"j","t":1},"0_3":{"d":"j","t":14},"0_1":{"d":"j","t":8},"0_2":{"d":"j","t":9},"0_4":{"d":"j","t":15},"1_5":{"d":"j","t":2},"1_4":{"d":"j","t":10},"1_3":{"d":"j","t":7},"1_1":{"d":"j","t":8},"1_2":{"d":"j","t":9},"2_5":{"d":"j","t":2},"2_4":{"d":"j","t":3},"2_3":{"d":"j","t":7},"2_1":{"d":"j","t":8},"2_2":{"d":"j","t":9},"3_5":{"d":"j","t":4},"3_1":{"d":"j","t":5},"3_2":{"d":"j","t":6},"4_1":{"d":"r","s":4,"l":3},"4_2":{"d":"r","s":4,"l":3},"5_1":{"d":"r","s":5,"l":1},"5_2":{"d":"r","s":5,"l":1},"6_1":{"d":"r","s":5,"l":1},"6_2":{"d":"r","s":5,"l":1},"7_1":{"d":"r","s":4,"l":1},"7_2":{"d":"r","s":4,"l":1},"8_3":{"d":"r","s":5,"l":1},"8_1":{"d":"r","s":5,"l":1},"8_2":{"d":"r","s":5,"l":1},"9_3":{"d":"r","s":5,"l":1},"9_1":{"d":"r","s":5,"l":1},"9_2":{"d":"r","s":5,"l":1},"10_5":{"d":"j","t":11},"10_1":{"d":"j","t":12},"10_2":{"d":"j","t":13},"11_-1":{"d":"r","s":4,"l":3},"12_-1":{"d":"r","s":5,"l":1},"13_-1":{"d":"r","s":5,"l":1},"14_-1":{"d":"r","s":4,"l":1},"15_-1":{"d":"r","s":6,"l":1}}};
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