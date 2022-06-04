/*J_LexDemo-全用法解析【此代码为自动生成代码】*/class J_SimpleLexers {
              static info = {stateTranTable:{"耶_0":1,"1_0":2,"0_0":2," _0":7,"\t_0":7,"\n_0":7,"\r_0":7,">_0":8,"<_0":8,"}_0":8,"{_0":8,"]_0":8,"[_0":8,")_0":8,"(_0":8,"|_0":8,"-_0":8,"*_0":8,"+_0":8,"/_0":9,"._0":12,"1_2":3,"0_2":3,"._2":4,"1_3":3,"0_3":3,"._3":4,"._6":4,"/_9":10,"._14":4},funcTranTable:{"ft_0":6,"tf_0":13,"tt_0":14,"t_2":6,"t_3":6,"t_4":5,"t_5":5,"t_6":6,"t_10":11,"t_11":11,"t_12":5,"t_14":6},ftable:{"0":[[0],[1]],"2":[[1]],"3":[[1]],"4":[[1]],"5":[[1]],"6":[[1]],"10":[[2]],"11":[[2]],"12":[[1]],"14":[[1]]},funcs:["(c)=>c != '\"'","(c)=>c.charCodeAt(0)>=48&&c.charCodeAt(0)<=57","(c)=>c != '\\n'"],AccStatID:[[6,5],[1,5],[2,5],[2],[],[3],[],[4,5],[6,5],[5],[7],[7],[5],[5],[5],],codeToName:{"1":"中文也支持噢","2":"01string","3":"float","4":"ws","5":"非引号字符","6":"反斜杠使用","7":"注释"}}
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