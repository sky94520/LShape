/**
 * 按照名称映射值
 * @param name_list 键请不要使用 size
 * @param text
 * @param split
 * @return Map
 */
function parseParams(name_list, text, split=',') {
    let mapping = new Map();
    let valueList = text.split(',');

    //判断实参是否足够
    if (valueList.length != name_list.length) {
        return null;
    }
    for (let i = 0; i < name_list.length; i++){
        let name = name_list[i];
        mapping[name] = valueList[i];
    }
    return mapping;
}


function LScriptArray() {
    let self = this;
    //textList用来保存LTextField文本对象
    self.textList = [];
    //layerList保存LSprite对象
    self.layerList = [];
    //保存脚本变量
    self.varList = [];
    //函数
    self.funList = [];
    //保存BtimapData对象
    self.bitmapdataList = [];
    //保存LBitmap对象
    self.imgList = [];
    //保存按钮对象
    self.btnList = [];
}

function LScript(scriptLayer, value) {
    let self = this;
    LGlobal.script = self;
    self.scriptLayer = scriptLayer;
    self.scriptArray = new LScriptArray();
    //-为当前层
    self.scriptArray.layerList['-'] = scriptLayer;
    self.dataList = [];
    let arr = [value];
    //在dataList开头添加元素
    self.dataList.unshift(arr);
    //切割脚本并解析
    self.toList(value);
}

LScript.prototype = {
    /**
     * 把文本分成行，并存储在lineList和copyList数组中，之后开始解析
     * @param ltxt 脚本代码
     */
    toList: function (ltxt) {
      let self = this;
      //移除注释
      ltxt = self.removeComment(ltxt);
      //按照分号分隔行
      self.lineList = ltxt.split(';');
      //拷贝一份
      self.copyList = self.lineList.slice(0);
      //开始解析脚本
      self.analysis();
     },
    /**
     * 对分好的脚本代码进行解析
      */
    analysis: function () {
      let self = this;
      let lineValue = "";

      if (self.lineList.length == 0){
          //删除第一个元素
          self.dataList.shift();
          //获取数组头元素
          if (self.dataList.length > 0){
              let arr = self.dataList[0];
              self.lineList = arr[1];
              self.copyList = arr[2];
              self.analysis();
          }
          return ;
      }
      //读取下一个不为空的行
      while (self.lineList.length > 0 && lineValue.length == 0){
          lineValue = LMath.trim(self.lineList[0]);
          self.lineList.shift();
      }
      //当前脚本指令为空，则执行下一条指令
      if (lineValue.length == 0){
          self.analysis();
          return ;
      }
      lineValue = ScriptVariable.getVariable(lineValue);
      trace('analysis lineValue = ' + lineValue);
      let sarr = lineValue.split('.');
      switch (sarr[0]) {
          case 'Load':
              ScriptLoad.analysis(lineValue);
              break;
          case 'Text':
              ScriptText.analysis(lineValue);
              break;
          case 'Var':
              ScriptVariable.analysis(lineValue);
              break;
          case 'Call':
              ScriptFunction.analysis(lineValue);
              break;
          case 'Img':
              ScriptImg.analysis(lineValue);
              break;
          case 'Layer':
              ScriptLayer.analysis(lineValue);
              break;
          case 'Button':
              ScriptButton.analysis(lineValue);
              break;
          case 'Wait':
              ScriptWait.analysis(lineValue);
              break;
          default:
              if (lineValue.indexOf('if') >= 0){
                  ScriptIF.getIF(lineValue);
              }else if (lineValue.indexOf('function') >= 0){
                  ScriptFunction.setFunction(lineValue);
              }else{
                  //接着向下解析
                  self.analysis();
              }
      }
  },
    /**
     * 保存当前的脚本代码，主要用于保护现场
      */
    saveList: function () {
      let self = this;
      let arr = self.dataList[0];
      if (arr){
          arr[1] = self.lineList;
          arr[2] = self.copyList;
      }
      console.log(arr);
  },
    /**
     * 移除注释 注释包括单行注释//和多行注释
     * @param str 一般是脚本代码, 本函数会直接对该字符串进行切割
     * @return {string} 移除注释的脚本代码
     */
    removeComment: function (str) {
        let self = this;
        let sIndex = 0, eIndex = 0;
        let sStr, eStr;
        //移除多行和单行注释
        let comments = [['/*', '*/'], ['//', '\n']];
        for (let i = 0; i < comments.length; i++){
            //开始字符和结束字符
            let sChar = comments[i][0];
            let eChar = comments[i][1];
            //开始删除
            sIndex = str.indexOf(sChar);
            while (sIndex >= 0){
                //找到匹配的结束字符
                eIndex = str.indexOf(eChar, sIndex + sChar.length);
                //找到结束字符,删除注释
                if (eIndex != -1){
                    sStr = str.substr(0, sIndex);
                    eStr = str.substr(eIndex + eChar.length);
                    str = sStr + eStr;
                    sIndex = str.indexOf(sChar);
                }else{
                    sStr = str.substr(0, sIndex);
                    str = sStr;
                    sIndex = -1;
                }
            }// end while
        }// end for
        return str;
   }
};

/**
 * 加载外部文件
 * @constructor
 */
var ScriptLoad = function () {};
ScriptLoad.data = "";
ScriptLoad.urlloader = null;

ScriptLoad.analysis = function (value) {
    let start = value.indexOf('(');
    let end = value.indexOf(')');
    //获取并分割实参
    ScriptLoad.data = value.substring(start + 1, end).split(',');
    //获取指令并执行对应的函数
    switch (LMath.trim(value.substr(0, start))) {
        case 'Load.script':
            ScriptLoad.loadScript();
            break;
        case 'Load.img':
            ScriptLoad.loadImg();
            break;
        default:
            LGlobal.script.analysis();
    }
};

/**
 * 加载脚本文件
 */
ScriptLoad.loadScript = function () {
    ScriptLoad.urlloader = new LURLLoader();
    //添加事件监听器，当事件完成时回调函数
    ScriptLoad.urlloader.addEventListener(LEvent.COMPLETE, ScriptLoad.loadScriptOver);
    //尝试获取数据
    ScriptLoad.urlloader.load(ScriptLoad.data[0], 'text');
};

ScriptLoad.loadScriptOver = function (event) {
    let script = LGlobal.script;
    let data = event.target.data;
    ScriptLoad.urlloader.die();
    ScriptLoad.urlloader = null;

    script.saveList();
    //在数组头添加数据
    script.dataList.unshift([data]);
    script.toList(data);
};

ScriptLoad.loadImg = function () {
    ScriptLoad.loader = new LLoader();

    ScriptLoad.loader.addEventListener(LEvent.COMPLETE, ScriptLoad.loadImgOver);
    //参数有两个，图片的名字和图片的路径
    ScriptLoad.loader.load(ScriptLoad.data[1], 'bitmapData');
};

ScriptLoad.loadImgOver = function (event) {
    let script = LGlobal.script;
    let name = ScriptLoad.data[0];

    //将读取到的图片保存为LBitmapData对象，并保存在数组中
    script.scriptArray.bitmapdataList[name] = new LBitmapData(ScriptLoad.loader.content);
    ScriptLoad.loader.imgLoader = null;
    script.analysis();
};


/*
* ScriptText.js
 */
var ScriptText = function () {};
ScriptText.analysis = function (value) {
    let start = value.indexOf('(');
    let end = value.indexOf(')');

    switch (LMath.trim(value.substr(0, start))) {
        case 'Text.label':
            ScriptText.label(value, start, end);
            break;
        case 'Text.labelChange':
            ScriptText.labelChange(value, start, end);
            break;
        case 'Text.remove':
            ScriptText.removeText(value, start, end);
            break;
        default:
            LGlobal.script.analysis();
    }
};

/**
 * 按照参数创建label，如果为多行则创建多个label
 * @param value
 * @param start
 * @param end
 */
ScriptText.label = function (value, start, end) {
    let script = LGlobal.script;
    //参数名
    let name_list = ['layer', 'name', 'text', 'x', 'y', 'font-size', 'color'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('label not have enough parameters');
        return ;
    }
    //获取所有参数
    let layer, label;
    //根据层名获取对应的层
    layer = script.scriptArray.layerList[params['layer']];
    let textArr = params['text'].split('\\n');
    let textList = [];

    for (let i = 0; i < textArr.length; i++){
        label = new LTextField();
        label.size = parseInt(params['font-size']) - 4;
        label.color = params['color'];
        label.text = textArr[i];

        label.x = parseInt(params['x']);
        label.y = parseInt(params['y']) + label.getHeight() * i;
        label.name = params['name'];

        layer.addChild(label);
        textList.push(label);
    }
    script.scriptArray.textList[params['name']] = textList;
    //TODO:继续解析
    script.analysis();
};

/**
 * 改变文本，先删除原先的label，之后重新添加
 * @param value
 * @param start
 * @param end
 */
ScriptText.labelChange = function (value, start, end) {
    let script = LGlobal.script;
    //获取所有参数
    let name_list = ['name', 'text', 'font-size', 'color'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('labelChange not have enough parameters');
        return ;
    }
    //根据名称获取原先的label数组
    let textList = script.scriptArray.textList[params.name];
    let x = textList[0].x;
    let y = textList[0].y;
    //获取label对应的父节点层
    layer = textList[0].parent;
    let textArr = params.text.split('\\n');
    //删除原来的label
    for (let i = 0; i < textList.length; i++){
        label = textList[i];
        label.parent.removeChild(label);
    }
    //重新创建
    textList = [];
    for (let i = 0; i < textArr.length; i++){
        label = new LTextField();
        label.size = params['font-size'];
        label.color = params['color'];
        label.text = textArr[i];

        label.x = x;
        label.y = y + label.getHeight() * i;
        label.name = params['name'];

        layer.addChild(label);
        textList.push(label);
    }
    script.scriptArray.textList[params['name']] = textList;
    script.analysis();
};

/**
 * 根据名称移除标签
 * @param value
 * @param start
 * @param end
 */
ScriptText.removeText = function (value, start, end) {
    //获取参数
    let nameStr = value.substring(start + 1, end);
    let script = LGlobal.script;
    let textList = script.scriptArray.textList[nameStr];
    if (textList == null){
        script.analysis();
        return;
    }
    for (let i = 0; i < textList.length; i++){
        label = textList[i];
        label.parent.removeChild(label);
    }
    script.scriptArray.textList[nameStr] = null;
    script.analysis();
};

/**
  * ScriptVariable.js
 * Var.set(name, sky);设置变量
 * 当使用@<name>语法时表示使用该变量
 * 本对象中有三个函数。analysis和setVariable()
 * analysis会判断是否是Var.set，是则调用setVariable()设置变量
 * getVariable()可以在其他场景下自由调用，目前在解析行和if语句内有调用
 */
var ScriptVariable = function () {};
ScriptVariable.analysis = function (value) {
    let start = value.indexOf('(');
    let end = value.indexOf(')');
    
    switch (value.substr(0, start)) {
        case 'Var.set':
            ScriptVariable.setVariable(value, start, end);
            break;
        default:
            LGlobal.script.analysis();
    }
};

/**
 * 设置变量，若没有则新建
 * @param value
 * @param start
 * @param end
 */
ScriptVariable.setVariable = function (value, start, end) {
    let script = LGlobal.script;
    //获取所有参数
    let name_list = ['key', 'value'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('setVariable not have enough parameters');
        return ;
    }
    //TODO:设置变量 出错!!
    script.scriptArray.varList[params['key']] = params['value'];
    script.analysis();
};

ScriptVariable.getVariable = function (str) {
    let script = LGlobal.script;
    let iIndex = 0;
    let sIndex = 0;
    let eIndex = 0;
    let sStr, vStr;
    let result = "";
    let r = /^([a-z]|[A-Z]|_)+$/;
    sIndex = str.indexOf('@');

    while (sIndex >= 0){
        eIndex = str.indexOf('@', sIndex + 1);
        //TODO:两个@@不进行替换，三个可替换
        if (sIndex + 1 == eIndex){
            sStr = str.substr(iIndex, sIndex);
            vStr = '@';
            iIndex = eIndex + 1;
        }else{
            sStr = str.substring(iIndex, sIndex);
            vStr = "";
            sIndex++;
            //获取变量的名称
            while (r.exec(str.charAt(sIndex))){
                vStr += str.charAt(sIndex);
                sIndex ++;
            }
            //用变量的值代替
            vStr = script.scriptArray.varList[vStr];
            iIndex = sIndex;
        }
        result += (sStr + vStr);
        sIndex = str.indexOf('@', iIndex);
    }//end while
    result += str.substr(iIndex);
    console.log(result);
    return result;
};

/*
 *  ScriptFunction.js
 *  主要有两个函数 setFunction和analysis函数。
 *  setFunction函数是以函数名为键，函数体、函数的形参名称为值放入到了一个array中
 *  然后局部变量全都加上了param_的前缀，换句话说，外层同样可以使用这个内部变量
 *
 *  analysis函数则根据函数名称找到对应的函数体，然后给parm_<name>对应的值，接着把函数体放到
 *  语句解析数组中，这样就相当于执行了函数。
 *  这种做法的好处就是省去了栈的使用，缺点就是变量数组会越来越庞大,这种做法就是当使用到某个变量时
 *  擦亮这个变量，然后当内存泰国庞大时，删除掉擦亮这个变量最远的点，删除即可。
 */
var ScriptFunction = function () {};

ScriptFunction.setFunction = function (value) {
    let script = LGlobal.script;
    //函数名称开始索引
    let startNameIndex = value.indexOf(" ");
    let child;
    let funArr = [];
    //获取参数字符串
    let start = value.indexOf("(");
    let end = value.indexOf(')');
    let strParam = value.substring(start + 1, end);
    let param = strParam.split(',');
    funArr['param'] = new Array();
    for (let i = 0; i < param.length; i++){
        param[i] = LMath.trim(param[i]);
        if (param[i].length > 0){
            funArr["param"].push("param_" + param[i]);
        }
    }
    funArr["name"] = LMath.trim(value.substring(startNameIndex + 1, start));
    //函数体
    let funLineArr = new Array();
    while (script.lineList[0].indexOf('endfunction') < 0){
        child = script.lineList.shift();
        for (let i = 0; i < param.length; i++){
            if (param[i].length > 0)
                child = child.replace('@' + param[i], '@param_' + param[i]);
        }
        funLineArr.push(child);
    }
    script.lineList.shift();
    funArr['function'] = funLineArr;
    script.scriptArray.funList[funArr['name']] = funArr;
    script.analysis();
};

/**
 * Call.<name>()调用对应的脚本函数
 * @param value
 */
ScriptFunction.analysis = function (value) {
    let script = LGlobal.script;
    let point = value.indexOf('.');
    let start = value.indexOf('(');
    let end = value.indexOf(')');
    //获取函数的名称
    let name = value.substring(point + 1, start);
    let funArr = script.scriptArray.funList[name];
    //未发现对应的函数
    if (funArr == null){
        console.log('not found the function:' + name);
        script.analysis();
        return ;
    }
    let _data = value.substring(start + 1, end).split(',');
    //获取函数的形参
    let param = funArr['param'];
    for (let i = 0; i < param.length; i++){
        script.scriptArray.varList[param[i]] = _data[i];
    }
    //把函数体放入当前解析队列中
    let funLineArr = funArr['function'];
    for (let i = funLineArr.length - 1; i >= 0; i--)
        script.lineList.unshift(funLineArr[i]);
    script.analysis();
};

/*
 * ScriptIF.js
 * 关于条件语句的嵌套，在没有错误的情况下，分层进行处理，
 * 即先处理外层的判断，筛选出条件满足的语句，然后放到解析数组中
 * 然后接着解析下一层判断语句，以此类推
 */
let ScriptIF = function () {};

ScriptIF.getIF = function (value) {
    let script = LGlobal.script;
    let startIfIndex = 0;
    let endIfIndex = 0;
    let ifArr;
    let childArray = new Array();
    let start = value.indexOf('(');
    let end = value.indexOf(')');
    let str = value.substring(start + 1, end);
    ifArr = str.split('&&');
    let ifValue = ScriptIF.checkCondition(ifArr);
    let ifValueEnd = false;
    let sCount = 0;
    let eCount = 0;

    while (startIfIndex < script.lineList.length){
        sCount = 0;
        let line = script.lineList[startIfIndex];
        if (line.indexOf('elseif') >= 0){
            //上一个判断语句为true
            if (ifValue){
                ifValueEnd = true;
                startIfIndex++;
                continue;
            }
            start = line.indexOf('(');
            end = line.indexOf(')');
            str = line.substring(start + 1, end);
            str = ScriptVariable.getVariable(str);
            ifArr = str.split('&&');
            ifValue = ScriptIF.checkCondition(ifArr);
            startIfIndex++;
            continue;
        }else if (line.indexOf('else') >= 0){
            if (ifValue){
                ifValueEnd = true;
                startIfIndex++;
                continue;
            }
            ifValue = true;
            endIfIndex = startIfIndex;
            startIfIndex++;
            continue;
        }else if (line.indexOf("endif") >= 0){
            startIfIndex++;
            break;
        }else if (line.indexOf("if") >=0){
            if (ifValue && !ifValueEnd){
                childArray.push(line);
            }
            startIfIndex++;
            sCount = 1;
            eCount = 0;
            while (sCount > eCount){
                line = script.lineList[startIfIndex];
                if (line.indexOf('if') >= 0 &&
                line.indexOf('else') < 0 &&
                line.indexOf('end') < 0){
                    sCount++;
                }else if (line.indexOf('endif') >= 0){
                    eCount++;
                }
                if (ifValue && !ifValueEnd){
                    childArray.push(line);
                }
                startIfIndex++;
            }//end while
        }//end else if
        if (sCount == 0){
            if (ifValue && !ifValueEnd){
                childArray.push(line);
            }
            startIfIndex++;
        }
    }//end while
    //删除判断语句
    script.lineList.splice(0, startIfIndex);
    for (let i = childArray.length - 1; i >= 0; i--){
        script.lineList.unshift(childArray[i]);
    }
    script.analysis();
};

ScriptIF.checkCondition = function (arr) {
    for (let i = 0; i < arr.length; i++){
        if (!ScriptIF.condition(arr[i])){
            return false;
        }
    }
    return true;
};

ScriptIF.getCheckStr = function(value, s){
    let arr;
    arr = value.split(s);
    arr[0] = LMath.trim(arr[0].replace('"', ''));
    arr[1] = LMath.trim(arr[1].replace('"', ''));

    return arr;
};

ScriptIF.getCheckInt = function(value, s){
    let arr;
    arr = value.split(s);
    arr[0] = parseInt(arr[0]);
    arr[1] = parseInt(arr[1]);

    return arr;
};

ScriptIF.condition = function (value) {
    let arr;

    if (value.indexOf('===') >= 0){
        arr = ScriptIF.getCheckStr(value, '===');
        return arr[0] == arr[1];
    }else if (value.indexOf('!==') >= 0){
        arr = ScriptIF.getCheckStr(value, '!==');
        return arr[0] != arr[1];
    }else if (value.indexOf('==') >= 0){
        arr = ScriptIF.getCheckInt(value, '==');
        return arr[0] == arr[1];
    }else if (value.indexOf('!=') >= 0){
        arr = ScriptIF.getCheckInt(value, '!=');
        return arr[0] != arr[1];
    }else if (value.indexOf('>=') >= 0){
        arr = ScriptIF.getCheckInt(value, '>=');
        return arr[0] >= arr[1];
    }else if (value.indexOf('<=') >= 0){
        arr = ScriptIF.getCheckInt(value, '<=');
        return arr[0] <= arr[1];
    }else if (value.indexOf('>') >= 0){
        arr = ScriptIF.getCheckInt(value, '>');
        return arr[0] > arr[1];
    }else if (value.indexOf('<') >= 0){
        arr = ScriptIF.getCheckInt(value, '<');
        return arr[0] < arr[1];
    }
    return false;
};

var ScriptImg = function () {};
ScriptImg.analysis = function (value) {
    let start = value.indexOf('(');
    let end = value.indexOf(')');

    switch (value.substr(0, start)) {
        case 'Img.add':
            ScriptImg.addImg(value, start, end);
            break;
        case 'Img.transition':
            ScriptImg.transition(value, start, end);
            break;
    }
};

/**
 * 显示已经加载的图片
 * 用法 Img.add(-,backimg01,backdata,0,0,100,100,1)
 * 分别是 显示层名称 精灵名称 精灵数据 x y width height alpha
 * 后面三个可选
 * @param value
 * @param start
 * @param end
 */
ScriptImg.addImg = function (value, start, end) {
    let script = LGlobal.script;
    let layer;
    //分解参数
    let lArr = value.substring(start + 1, end).split(',');
    let layerStr = lArr[0];
    let nameStr = lArr[1];
    let dataStr = lArr[2];
    let bitmapData = null;
    //获取bitmap对象
    bitmapData = script.scriptArray.bitmapdataList[dataStr];
    let xInt = parseFloat(lArr[3]);
    let yInt = parseFloat(lArr[4]);
    let width = null, height = null;
    let opacity = 1;

    //得到宽(非必须)
    if (lArr.length > 5){
        width = parseFloat(lArr[5]);
    }
    //得到高(非必须)
    if (lArr.length > 6){
        height = parseFloat(lArr[6]);
    }
    if (lArr.length > 7){
        opacity = parseFloat(lArr[7]);
    }

    //获取显示层
    layer = script.scriptArray.layerList[layerStr];
    let bitmap = new LBitmap(bitmapData);
    //如果设置了宽，尝试缩放
    if (width)
        bitmap.scaleX = width / bitmapData.width;
    if (height)
        bitmap.scaleY = height / bitmapData.height;
    bitmap.alpha = opacity;
    bitmap.name = nameStr;

    //设置坐标
    bitmap.x = xInt;
    bitmap.y = yInt;

    //保存该对象
    script.scriptArray.imgList[nameStr] = bitmap;
    layer.addChild(bitmap);

    //继续解析
    script.analysis();
};

/**
 * 对图片进行缓动变换
 * Img.transition(backimg01,{x:300},1,Strong.easeOut,type);
 * LBitmap对象名称 操作内容 变换所需的时间 缓动种类 是否立即执行下一行脚本
 * 如果不设置，则缓动结束后才开始执行下一行脚本
 * @param value
 * @param start
 * @param end
 */
ScriptImg.transition = function (value, start, end) {
    let script = LGlobal.script;
    //获取所有参数
    let name_list = ['name', 'obj', 'duration', 'ease', 'runNow'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('transition not have enough parameters');
        return ;
    }

    //将json对象还原
    let toObj = eval('(' + params['obj'] + ')');
    //变换类型
    let eases = params['ease'].split('.');
    //是否立即执行
    let runNow = (params['runNow'] == '1');

    //是否立即执行下一行脚本
    if (!runNow){
        toObj['onComplete'] = function () {
            script.analysis();
        };
    }
    LTweenLite.to(script.scriptArray.imgList[params['name']]
        , params['duration'], toObj);

    if (runNow)
        script.analysis();
};

/*
  ScriptLayer 负责显示的层的一些操作，如创建层，删除层等
 */
var ScriptLayer = function () {};

ScriptLayer.analysis = function (value) {
    let start = value.indexOf('(');
    let end = value.indexOf(')');
    
    switch (value.substr(0, start)) {
        case 'Layer.add':
            ScriptLayer.setLayer(value, start, end);
            break;
        case 'Layer.remove':
            ScriptLayer.removeLayer(value, start, end);
            break;
        case 'Layer.clear':
            ScriptLayer.clearLayer(value, start, end);
            break;
        case 'Layer.drawRect':
            ScriptLayer.drawRect(value, start, end);
            break;
        case 'Layer.drawRectLine':
            ScriptLayer.drawRectLine(value, start, end);
            break;
        case 'Layer.drawRoundRect':
            ScriptLayer.drawRoundRect(value, start, end);
            break;
        case 'Layer.drawRoundRectLine':
            ScriptLayer.drawRoundRectLine(value, start, end);
            break;
        case 'Layer.transition':
            ScriptLayer.transition(value, start, end);
            break;
        default:
    }
};

/**
 * 添加显示层
 * Layer.add(-,layer01,100,100);
 * @param value
 * @param start
 * @param end
 */
ScriptLayer.setLayer = function (value, start, end) {
    //获取所有参数
    let name_list = ['parent', 'name', 'x', 'y'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('setLayer not have enough parameters');
        return ;
    }

    let script = LGlobal.script;
    let layer, parent;

    //赋值
    parent = script.scriptArray.layerList[params['parent']];
    layer = new LSprite();
    layer.x = parseInt(params['x']);
    layer.y = parseInt(params['y']);
    layer.name = params['name'];

    parent.addChild(layer);
    script.scriptArray.layerList[layer.name] = layer;

    script.analysis();
};

/**
 * 清空显示层，即将该显示层上的所有子类都移除
 * @param obj
 */
ScriptLayer.removeFromArray = function (obj) {
    if (obj.childList == null)
        return;

    let count = obj.childList.length;
    for (let i = 0; i < count; i++){
        let type = obj.childList[i].type;
        if (type == 'LSprite')
            ScriptLayer.removeFromArray(obj.childList[i]);
        else if (type == 'LBitmap')
            LGlobal.script.scriptArray.imgList[obj.childList[i].name] = null;
        else if (type == 'LTextField')
            LGlobal.script.scriptArray.textList[obj.childList[i].name] = null;
    }
};

ScriptLayer.clearLayer = function (value, start, end) {
    let nameStr = LMath.trim(value.substring(start + 1, end));
    let script = LGlobal.script;
    let layer = script.scriptArray.layerList[nameStr];
    if (!layer){
        script.analysis();
        return;
    }

    ScriptLayer.removeFromArray(layer);
    //移除所有事件
    layer.die();
    //移除所有子对象
    layer.removeAllChild();
    script.analysis();
};

/**
 * 移除显示层，比清空显示层多的一步就是移除了自己
 * @param value
 * @param start
 * @param end
 */
ScriptLayer.removeLayer = function (value, start, end) {
    let nameStr = LMath.trim(value.substring(start + 1, end));
    let script = LGlobal.script;
    let layer = script.scriptArray.layerList[nameStr];
    if (!layer){
        script.analysis();
        return;
    }

    let parent = layer.parent;
    ScriptLayer.removeFromArray(layer);
    parent.removeChild(layer);
    script.scriptArray.layerList[nameStr] = null;

    script.analysis();
};

/**
 * 绘制实心矩形
 * Layer.drawRect(layer02,0,0,100,100,#ff0000);
 * @param value
 * @param start
 * @param end
 */
ScriptLayer.drawRect = function (value, start, end) {
    //获取所有参数
    let name_list = ['layerName', 'x', 'y', 'width', 'height', 'color'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('drawRect not have enough parameters');
        return ;
    }

    let script = LGlobal.script;
    let layer = script.scriptArray.layerList[params['layerName']];

    //绘制矩形
    layer.graphics.drawRect(1, params['color'], [
        parseInt(params['x']),
        parseInt(params['y']),
        parseInt(params['width']),
        parseInt(params['height'])
    ], true, params['color']);

    script.analysis();
};

/**
 * 绘制空心矩形框
 * Layer.drawRectLine(layerName,x,y,width,height,color,num);
 * @param value
 * @param start
 * @param end
 */
ScriptLayer.drawRectLine = function (value, start, end) {
    //获取所有参数
    let name_list = ['layerName', 'x', 'y', 'width', 'height', 'color', 'num'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('drawRectLine not have enough parameters');
        return ;
    }

    let script = LGlobal.script;
    let layer = script.scriptArray.layerList[params['layerName']];

    //绘制空心矩形
    layer.graphics.drawRect(params['num'], params['color'], [
        parseInt(params['x']),
        parseInt(params['y']),
        parseInt(params['width']),
        parseInt(params['height']),
    ]);

    script.analysis();
};

/**
 * 绘制圆角矩形
 * Layer.drawRoundRect(layerName,x,y,width,height,color);
 * @param value
 * @param start
 * @param end
 */
ScriptLayer.drawRoundRect = function (value, start, end) {
    //获取所有参数
    let name_list = ['layerName', 'x', 'y', 'width', 'height', 'radius', 'color'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('drawRectLine not have enough parameters');
        return ;
    }

    let script = LGlobal.script;
    let layer = script.scriptArray.layerList[params['layerName']];

    //绘制矩形
    layer.graphics.drawRoundRect(1, params['color'], [
        parseInt(params['x']),
        parseInt(params['y']),
        parseInt(params['width']),
        parseInt(params['height']),
        parseInt(params['radius'])
    ], true, params['color']);

    script.analysis();
};
/**
 * 绘制空心圆角矩形
 * Layer.drawRoundRectLine(layerName,x,y,width,height,color,num);
 * @param value
 * @param start
 * @param end
 */
ScriptLayer.drawRoundRectLine = function (value, start, end) {
    //获取所有参数
    let name_list = ['layerName', 'x', 'y', 'width', 'height', 'radius', 'color', 'num'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('drawRectLine not have enough parameters');
        return ;
    }

    let script = LGlobal.script;
    let layer = script.scriptArray.layerList[params['layerName']];

    //绘制矩形
    layer.graphics.drawRoundRect(params['num'], params['color'], [
        parseInt(params['x']),
        parseInt(params['y']),
        parseInt(params['width']),
        parseInt(params['height']),
        parseInt(params['radius'])
    ]);

    script.analysis();
};

/**
 * 对显示层进行缓动变换
 * Layer.transition(layerName,obj,duration,type,runNow);
 * @param value
 * @param start
 * @param end
 */
ScriptLayer.transition = function (value, start, end) {
    //获取所有参数
    let name_list = ['layerName', 'obj', 'duration', 'type', 'runNow'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('drawRectLine not have enough parameters');
        return ;
    }
    let script = LGlobal.script;
    //将json对象还原
    let toObj = eval('(' + params['obj'] + ')');
    //缓动类型
    let eases = params['type'].split('.');
    let runNow = (params['runNow'] == '1');

    //立即执行下一行代码
    toObj['ease'] = LEasing[eases[0]][eases[1]];

    if (!runNow){
        toObj['onComplete'] = function () {
            script.analysis();
        };
    }
    LTweenLite.to(script.scriptArray.layerList[params['layerName']], params['duration'], toObj);

    if (runNow)
        script.analysis();
};

var ScriptButton = function () {};
/**
 * 对按钮进行解析
 * @param value
 */
ScriptButton.analysis = function (value) {
    let start = value.indexOf('(');
    let end = value.indexOf(')');

    switch (value.substr(0, start)) {
        case 'Button.add':
            ScriptButton.addButton(value, start, end);
            break;
        case 'Button.remove':
            ScriptButton.removeButton(value, start, end);
            break;
        case 'Button.mousedown':
            ScriptButton.mouseevent(value, start, end, LMouseEvent.MOUSE_DOWN);
            break;
        case 'Button.mouseup':
            ScriptButton.mouseevent(value, start, end, LMouseEvent.MOUSE_UP);
            break;
        case 'Button.mousemove':
            ScriptButton.mouseevent(value, start, end, LMouseEvent.MOUSE_MOVE);
            break;
        default:
    }
};

/**
 * 添加按钮
 * Button.add(layer01,button01,null,50,50,ok_button_up,ok_button_over,null);
 * 显示层名称 按钮名称 按钮上的文字 按钮坐标 按钮弹起时的bitmapData对象名称
 * @param value
 * @param start
 * @param end
 */
ScriptButton.addButton = function (value, start, end) {
    //获取所有参数
    let name_list = ['layerName', 'btnName', 'text', 'x', 'y', 'dataUp', 'dataOver', 'color'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.log('addButton not have enough parameters');
        return ;
    }

    let script = LGlobal.script;
    let layerStr = params['layerName'];
    let nameStr = params['btnName'];
    let labelStr = params['text'];
    let x = parseInt(params['x']);
    let y = parseInt(params['y']);
    //按钮弹起和按下的样式的bitmapData对象名称
    let dataUp = params['dataUp'];
    let dataOver = params['dataOver'];
    let color = params['color'];

    let upImg = script.scriptArray.bitmapdataList[dataUp];
    let overImg = script.scriptArray.bitmapdataList[dataOver];
    //按钮精灵
    let upLayer = new LSprite();
    upLayer.addChild(new LBitmap(upImg));

    let overLayer = new LSprite();
    overLayer.addChild(new LBitmap(overImg));

    //如果设置了按钮文字，则在按钮上添加一个LTextField对象来显示文字
    if (labelStr && labelStr != 'null'){
        let upText = new LTextField();
        upText.text = labelStr;
        upText.size = upImg.height * 0.5;

        upText.x = (upImg.width - upText.getWidth()) * 0.5;
        upText.y = upImg.y = upImg.height * 0.2;
        upLayer.addChild(upText);

        let overText = new LTextField();
        overText.text = labelStr;
        overText.size = upImg.height * 0.5;

        overText.x = (upImg.width - overText.getWidth()) * 0.5;
        overText.y = upImg.y = upImg.height * 0.2;
        upLayer.addChild(overText);
        //按钮的文字颜色
        upText.color = color;
        overText.color = color;
    }

    let layer = script.scriptArray.layerList[layerStr];
    //利用按钮的两个状态，新建一个LButton按钮对象
    let btn = new LButton(upLayer, overLayer);
    btn.x = x;
    btn.y = y;
    //保存按钮
    script.scriptArray.btnList[nameStr] = btn;
    btn.name = nameStr;
    //将按钮添加到显示层
    layer.addChild(btn);

    script.analysis();
};

/*
   删除按钮脚本
   Button.remove(button01);
 */
ScriptButton.removeButton = function (value, start, end) {
    //获取所有参数
    let name_list = ['btnName'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.warn('removeButton not have enough parameters');
        return ;
    }
    let script = LGlobal.script;
    let nameStr = params['btnName'];

    //获取按钮
    let btn = script.scriptArray.btnList[nameStr];
    if (btn == null){
        script.scriptArray.btnList[nameStr] = null;
        script.analysis();
        return;
    }

    //移除按钮
    btn.parent.removeChild(btn);
    script.scriptArray.btnList[nameStr] = null;
    script.analysis();
};

/*
    按钮事件
    Button.mousedown(button01,function_test01);
 */
ScriptButton.mouseevent = function (value, start, end, e) {
    //获取所有参数
    let name_list = ['btnName', 'funName'];
    let params = parseParams(name_list, value.substring(start + 1, end));
    if (params == null){
        console.warn('mouseevent not have enough parameters');
        return ;
    }
    let script = LGlobal.script;

    let nameStr = params['btnName'];
    let funStr = params['funName'];

    //获取按钮
    let btn = script.scriptArray.btnList[nameStr];
    //添加匿名函数
    let fun = function (event) {
        ScriptFunction.analysis('Call.' + funStr + '();');
    };
    //为按钮添加事件
    btn.addEventListener(e, fun);

    script.analysis();
};

var ScriptWait = function () {};

ScriptWait.analysis = function (value) {
    let start = value.indexOf('(');
    let end = value.indexOf(')');

    switch (value.substr(0, start)) {
        case 'Wait.click':
            ScriptWait.waitClick();
            break;
        case 'Wait.ctrl':{
            if (int(value.substring(start + 1, end)) > 0)
                LGlobal.script.lineList.unshift('Wait.ctrl()');
        }break;
        case 'Wait.play':
            LGlobal.script.analysis();
            break;
        case 'Wait.time':{
            ScriptWait.timeId = setTimeout(function () {
                ScriptWait.timeId = null;
                LGlobal.script.analysis();
            }, 1000);
        }break;
        case 'Wait.clickOver':{
            LGlobal.script.scriptLayer.removeEventListener(LMouseEvent.MOUSE_UP, ScriptWait.clickEvent);
            LGlobal.script.analysis();
        }break;
        case 'Wait.timeOver':
            ScriptWait.timeOver();
            break;
        case 'Wait.over':{
            LGlobal.script.scriptLayer.removeEventListener(LMouseEvent.MOUSE_UP, ScriptWait.clickEvent);
            ScriptWait.timeOver();
        }break;
        default:
            LGlobal.script.analysis();
    }
};

ScriptWait.timeOver = function () {
    if (ScriptWait.timeId){
        clearTimeout(ScriptWait.timeId);
        ScriptWait.timeId = null;
    }
    LGlobal.script.analysis();
};

ScriptWait.waitClick = function () {
    let layer = LGlobal.script.scriptLayer;
    //添加一个鼠标点击事件，当鼠标点击屏幕的时候，调用clickEvent函数
    layer.addEventListener(LMouseEvent.MOUSE_UP, ScriptWait.clickEvent);
};

ScriptWait.clickEvent = function (event) {
    console.log('click');
    let layer = LGlobal.script.scriptLayer;
    layer.removeEventListener(LMouseEvent.MOUSE_UP, ScriptWait.clickEvent);
    LGlobal.script.analysis();
};

