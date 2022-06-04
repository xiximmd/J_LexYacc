/*J_LexDemo-简单案例，数字识别【此代码为自动生成代码】*/class J_SimpleLexers {
              static info = {stateTranTable:{" _0":1,"._5":6,"._8":6,"._9":6,"._10":6,"._15":6,"._16":6,"._17":6,"._18":6},funcTranTable:{"ffft_0":2,"fftf_0":3,"fftt_0":4,"ftff_0":5,"ftft_0":8,"fttf_0":9,"fttt_0":10,"tfff_0":11,"tfft_0":12,"tftf_0":13,"tftt_0":14,"ttff_0":15,"ttft_0":16,"tttf_0":17,"tttt_0":18,"t_3":3,"t_4":3,"t_5":5,"t_6":7,"t_7":7,"t_8":5,"ft_9":3,"tf_9":5,"tt_9":9,"ft_10":3,"tf_10":5,"tt_10":9,"t_11":11,"t_12":11,"ft_13":3,"tf_13":11,"tt_13":13,"ft_14":3,"tf_14":11,"tt_14":13,"ft_15":5,"tf_15":11,"tt_15":15,"ft_16":5,"tf_16":11,"tt_16":15,"fft_17":3,"ftf_17":5,"ftt_17":9,"tff_17":11,"tft_17":13,"ttf_17":15,"ttt_17":17,"fft_18":3,"ftf_18":5,"ftt_18":9,"tff_18":11,"tft_18":13,"ttf_18":15,"ttt_18":17},ftable:{"0":[[0],[0],[0],[0]],"3":[[0]],"4":[[0]],"5":[[0]],"6":[[0]],"7":[[0]],"8":[[0]],"9":[[0],[0]],"10":[[0],[0]],"11":[[0]],"12":[[0]],"13":[[0],[0]],"14":[[0],[0]],"15":[[0],[0]],"16":[[0],[0]],"17":[[0],[0],[0]],"18":[[0],[0],[0]]},funcs:["(c)=>c.charCodeAt(0)>=48&&c.charCodeAt(0)<=57"],AccStatID:[[],[1],[4],[3],[3,4],[],[],[2],[4],[3],[3,4],[2],[2,4],[2,3],[2,3,4],[2],[2,4],[2,3],[2,3,4],],codeToName:{"1":"ws","2":"float","3":"int","4":"num"}}
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
        
        export default J_Lexers;