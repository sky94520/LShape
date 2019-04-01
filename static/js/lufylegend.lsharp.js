/*
* LScript.js
**/
function LScript(scriptLayer,value){
	var self = this;
	LGlobal.script = self;
	self.scriptLayer = scriptLayer;
	scriptLayer.graphics.drawRect(0,"#000",[0,0,LGlobal.width,LGlobal.height]);
	self.scriptArray = new LScriptArray();
	self.scriptArray.layerList["-"] = scriptLayer;
	self.dataList = new Array();
	value = self.removeComment(value);
	var arr=[value];
	self.dataList.unshift(arr);
	self.toList(value);
}
LScript.prototype = {
	removeComment:function(str){
		var self = this;
		var sIndex;
		var eIndex;
		var sStr;
		var eStr;
		sIndex = str.indexOf("/*");
		while(sIndex >=0){
			eIndex = str.indexOf("*/",sIndex + 2);
			sStr = str.substr(0,sIndex);
			eStr = str.substr(eIndex + 2);
			str = sStr + eStr;
			sIndex = str.indexOf("/*");
		}
			
		sIndex = str.indexOf("//");
		while(sIndex >=0){
			eIndex = str.indexOf("\n",sIndex);
			if(eIndex >= 0){
				sStr = str.substr(0,sIndex);
				eStr = str.substr(eIndex);
				str = sStr + eStr;
				sIndex = str.indexOf("//");
			}else{
				sStr = str.substr(0,sIndex);
				str = sStr;
				sIndex = -1;
			}
		}
		return str;
	},
	toList:function(ltxt){
		var self = this;
		self.lineList = ltxt.split(";");
		self.copyList = self.lineList.slice(0);
		self.analysis();
	},
	saveList:function(){
		var self = this;
		var arr=self.dataList[0];
		if(arr){
			arr[1]=self.lineList;
			arr[2]=self.copyList;
		}
	},
	analysis:function(){
		var self = this;
		var arr;
		if(self.lineList.length == 0){
			self.dataList.shift();
			if(self.dataList.length > 0){
				arr=self.dataList[0];
				self.lineList = arr[1];
				self.copyList = arr[2];
				self.analysis();
			}
			return;
		}
		var lineValue = "";
		while(self.lineList.length > 0 && lineValue.length == 0){
			lineValue = LMath.trim(self.lineList[0]);
			self.lineList.shift();
		}
		if(lineValue.length == 0){
			self.analysis();
			return;
		}
		lineValue = ScriptVarlable.getVarlable(lineValue);
		trace("analysis lineValue = " + lineValue);
		var sarr = lineValue.split(".");
		switch(sarr[0]){
			case "Load":
				ScriptLoad.analysis(lineValue);
				break;
			case "Text":
				ScriptText.analysis(lineValue);
				break;
			case "Var":
				ScriptVarlable.analysis(lineValue);
				break;
			case "Call":
				ScriptFunction.analysis(lineValue);
				break;
			case "Img":
				ScriptImg.analysis(lineValue);
				break;
			case "Layer":
				ScriptLayer.analysis(lineValue);
				break;
			case "Button":
				ScriptButton.analysis(lineValue);
				break;
			case "Wait":
				ScriptWait.analysis(lineValue);
				break;
			case "Mark":
				ScriptMark.analysis(lineValue);
				break;
			default:
				if(lineValue.indexOf("if") >= 0){
					ScriptIF.getIF(lineValue);
				}else if(lineValue.indexOf("function") >= 0){
					ScriptFunction.setFunction(lineValue);
				}else{
					self.analysis();
				}
		}
	}
};
/*
* LScriptArray.js
**/
function LScriptArray(){
	var self = this;
	//用来保存LTextField对象
	self.textList = new Array();
	//用来保存LSprite对象
	self.layerList = new Array();
	//用来保存变量
	self.varList = new Array();
	//用来保存函数
	self.funList = new Array();
	//用来保存LBitmapData对象
	self.bitmapdataList = new Array();
	//用来保存LBitmap对象
	self.imgList = new Array();
	//用来保存LButton按钮对象
	self.btnList = new Array();
}
/*
* ScriptLoad.js
**/
var ScriptLoad = function (){};
ScriptLoad.data = "";
ScriptLoad.urlloader = null;
ScriptLoad.analysis = function (value){
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	ScriptLoad.data = value.substring(start+1,end).split(",");
	switch(LMath.trim(value.substr(0,start))){
		case "Load.img":
			ScriptLoad.loadImg();
			break;
		case "Load.script":
			ScriptLoad.loadScript();
			break;
		default:
			LGlobal.script.analysis();
	}
};
ScriptLoad.loadImg = function (){
	ScriptLoad.loader = new LLoader();
	ScriptLoad.loader.addEventListener(LEvent.COMPLETE,ScriptLoad.loadImgOver);
	ScriptLoad.loader.load(ScriptLoad.data[1],"bitmapData");
};
ScriptLoad.loadImgOver = function (event){
	var script = LGlobal.script;
	script.scriptArray.bitmapdataList[ScriptLoad.data[0]] = new LBitmapData(ScriptLoad.loader.content);
	ScriptLoad.loader.imgLoader = null;
	script.analysis();
};
ScriptLoad.loadScript = function (){
	ScriptLoad.urlloader = new LURLLoader();
	ScriptLoad.urlloader.addEventListener(LEvent.COMPLETE,ScriptLoad.loadScriptOver);
	ScriptLoad.urlloader.load(ScriptLoad.data[0],"text");
};
ScriptLoad.loadScriptOver = function (event){
	var script = LGlobal.script;
	var data = script.removeComment(event.target.data);
	ScriptLoad.urlloader.die();
	ScriptLoad.urlloader = null;
	script.saveList();
	script.dataList.unshift([data]);
	script.toList(data);
};
/*
* ScriptImg.js
**/
var ScriptImg = function (){};
ScriptImg.analysis = function (value,start,end){
	
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	switch(value.substr(0,start)){
		case "Img.add":
			ScriptImg.addImg(value,start,end);
			break;
		case "Img.transition":
			ScriptImg.transition(value,start,end);
			break;
	}
};
ScriptImg.addImg = function (value,start,end){
	var script = LGlobal.script;
	var layer;
	//分解参数
	var lArr = value.substring(start+1,end).split(",");
	var layerStr = lArr[0];
	var nameStr = lArr[1];
	var dataStr = lArr[2];
	var bitdata;
	//获取LBitmapData对象
	bitdata = script.scriptArray.bitmapdataList[dataStr];
	var xInt = parseFloat(lArr[3]);
	var yInt = parseFloat(lArr[4]);
	var wNum;
	var hNum;
	//得到宽（非必须）
	if(lArr.length > 5){
		wNum = parseFloat(lArr[5]);
	}
	//得到高（非必须）
	if(lArr.length > 6){
		hNum = parseFloat(lArr[6]);
	}
	var alphaNum = 1;
	//得到透明度，默认是1（非必须）
	if(lArr.length > 7){
		alphaNum = parseFloat(lArr[7]);
	}
	//获取LSprite显示层
	layer = script.scriptArray.layerList[layerStr];
	var bitmap = new LBitmap(bitdata);
	//如果设置了宽，则通过scaleX计算LBitmap的宽
	if(wNum)bitmap.scaleX = wNum/bitdata.width;
	//如果设置了高，则通过scaleX计算LBitmap的高
	if(hNum)bitmap.scaleY = hNum/bitdata.height;
	//设置透明度
	bitmap.alpha = alphaNum;
	//设置坐标
	bitmap.x = xInt;
	bitmap.y = yInt;
	bitmap.name = nameStr;
	//将LBitmap对象保存到imgList数组
	script.scriptArray.imgList[nameStr] = bitmap;
	layer.addChild(bitmap);
	script.analysis();
};
//(name,{x:200},1,Strong.easeOut)
ScriptImg.transition = function (value,start,end){
	var script = LGlobal.script;
	
	var lArr = value.substring(start+1,end).split(",");
	var nameStr = lArr[0];
	//将json对象还原
	var toObj = eval('(' + lArr[1] + ')');
	//获取缓动时间
	var time = parseFloat(lArr[2]);
	var eases = lArr[3].split(".");
	var runNow = false;
	//是否立即执行下一行脚本
	if(lArr.length > 4){
		runNow = (lArr[4] == "1");
	}
	toObj["ease"] = LEasing[eases[0]][eases[1]];
	if(!runNow){
		toObj["onComplete"] = function(){
			script.analysis();
		};
	}
	LTweenLite.to(script.scriptArray.imgList[nameStr],time,toObj);  
	//如果runNow为1，则立即执行下一行脚本
	if(runNow)script.analysis();
};
/*
* ScriptText.js
**/
var ScriptText = function (){};
ScriptText.analysis = function (value){
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	switch(LMath.trim(value.substr(0,start))){
		case "Text.label":
			ScriptText.label(value,start,end);
			break;
		case "Text.labelChange":
			ScriptText.labelChange(value,start,end);
			break;
                case "Text.remove":
                        ScriptText.removeText(value,start,end);
			break;
		default:
			LGlobal.script.analysis();
	}
};
ScriptText.removeText = function (value,start,end){
	var lArr = value.substring(start+1,end).split(",");
	var nameStr = lArr[0];
	var script = LGlobal.script;
	var textList = script.scriptArray.textList[nameStr];
	if(textList == null){
		script.analysis();
		return;
	}
	for(i=0;i<textList.length;i++){
		label = textList[i];
		label.parent.removeChild(label);
	}
	script.scriptArray.textList[nameStr] = null;
	script.analysis();
};
ScriptText.label = function (value,start,end){
	var script = LGlobal.script;
	var lArr = value.substring(start+1,end).split(",");
	var layer,label,i;
	var layerStr = lArr[0];
	var nameStr = lArr[1];
	var textStr = lArr[2];
	layer = script.scriptArray.layerList[layerStr];
	var textArr = textStr.split("\\n");
	var textList = new Array();
	for(i=0;i<textArr.length;i++){
		label = new LTextField();
		label.size = lArr[5]-4;
		label.color = lArr[6];
		label.text = textArr[i];
		label.x = parseInt(lArr[3]);
		label.y = parseInt(lArr[4]) + label.getHeight()* i ;
		label.name = nameStr;
		layer.addChild(label);
		textList.push(label);
	}
	script.scriptArray.textList[nameStr] = textList;
	script.analysis();
};
ScriptText.labelChange = function (value,start,end){
	var script = LGlobal.script,i;
	var lArr = value.substring(start+1,end).split(",");
	var nameStr = lArr[0];
	var textStr = lArr[1];
	var textList = script.scriptArray.textList[nameStr];
	var x = textList[0].x;
	var y = textList[0].y;
	layer = textList[0].parent;
	for(i=0;i<textList.length;i++){
		label = textList[i];
		label.parent.removeChild(label);
	}
	textList = new Array();
	textArr = textStr.split("\\n");
	for(i=0;i<textArr.length;i++){
		label = new LTextField();
		label.size = lArr[2];
		label.color = lArr[3];
		label.text = textArr[i];
		label.x = x;
		label.y = y + label.getHeight()* i ;
		label.name = nameStr;
		layer.addChild(label);
		textList.push(label);
	}
	script.scriptArray.textList[nameStr] = textList;
	script.analysis();
};
/*
* ScriptVarlable.js
**/
var ScriptVarlable = function (){};
ScriptVarlable.analysis = function (value){
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	switch(value.substr(0,start)){
		case "Var.set":
			ScriptVarlable.setVarlable(value,start,end);
			break;
		default:
			LGlobal.script.analysis();
	}
};
ScriptVarlable.setVarlable = function (value,start,end){
	var script = LGlobal.script;
	var lArr = value.substring(start+1,end).split(",");
	script.scriptArray.varList[lArr[0]] = lArr[1];
	script.analysis();
};
ScriptVarlable.getVarlable = function (str){
	var script = LGlobal.script;
	var iIndex = 0;
	var sIndex;
	var eIndex;
	var sStr;
	var eStr;
	var vStr;
	var result = "";
	var r=/^([a-z]|[A-Z]|_)+$/;
	sIndex = str.indexOf("@");
	while(sIndex >=0){
		eIndex = str.indexOf("@",sIndex+1);
		if(sIndex + 1 == eIndex){
			sStr = str.substr(iIndex,sIndex);
			vStr = "@";
			eStr = str.substr(eIndex + 1);
			iIndex = eIndex + 1;
		}else{
			sStr = str.substring(iIndex,sIndex);
			vStr = "";
			sIndex++;
			while(r.exec(str.charAt(sIndex))){
				vStr += str.charAt(sIndex);
				sIndex++;
			}
			vStr = script.scriptArray.varList[vStr];
			eStr = str.substr(sIndex);
			iIndex = sIndex;
		};
		result += (sStr + vStr);
		sIndex = str.indexOf("@",iIndex);
	}
	result += str.substr(iIndex);
	return result;
};
/*
* ScriptFunction.js
**/
var ScriptFunction = function (){};
ScriptFunction.analysis = function (value){
	var script = LGlobal.script;
	var point = value.indexOf(".");
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	var name = value.substring(point + 1,start);
	var funArr = script.scriptArray.funList[name];
	if(funArr == null){
		script.analysis();
		return;
	}
	_data = value.substring(start+1,end).split(",");
	var param = funArr["param"];
	var i;
	for(i=0;i<param.length;i++){
		script.scriptArray.varList[param[i]] = _data[i];
	}
	var funLineArr = funArr["function"];
	for(i=funLineArr.length-1;i>=0;i--)script.lineList.unshift(funLineArr[i]);
	script.analysis();
	
};
ScriptFunction.setFunction = function (value){
	var script = LGlobal.script;
	var startNameIndex = value.indexOf(" ");
	var child;
	var funArr = new Array();
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	var strParam = value.substring(start + 1,end);
	var param = strParam.split(",");
	funArr["param"] = new Array();
	var i;
	for(i=0;i<param.length;i++){
		param[i] = LMath.trim(param[i]);
		if(param[i].length > 0)	{
			funArr["param"].push("param_" + param[i]);
		}
	}
	funArr["name"] = LMath.trim(value.substring(startNameIndex + 1,start));
	
	var funLineArr = new Array();
	while(script.lineList[0].indexOf("endfunction") < 0){
		child = script.lineList.shift();
		for(i=0;i<param.length;i++){
			if(param[i].length > 0)	child = child.replace("@"+param[i],"@param_"+param[i]);
		}
		funLineArr.push(child);
	}
	script.lineList.shift();
	funArr["function"] = funLineArr;
	script.scriptArray.funList[funArr["name"]] = funArr;
	script.analysis();
};
/*
* ScriptIF.js
**/
var ScriptIF = function (){};
ScriptIF.getIF = function (value){
	var script = LGlobal.script;
	var startifIndex = 0;
	var endifIndex = 0;
	var ifArr;
	var childArray = new Array();
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	var str = value.substring(start + 1,end);
	ifArr = str.split("&&");
	var ifvalue = ScriptIF.checkCondition(ifArr);
	var ifvalueend = false;
	var sCount = 0;
	var eCount = 0;
	
	while(startifIndex<script.lineList.length){
		sCount = 0;
		
		if(script.lineList[startifIndex].indexOf("elseif") >= 0){
			if(ifvalue){
				ifvalueend = true;
				startifIndex++;
				continue;
			}
			start = script.lineList[startifIndex].indexOf("(");
			end = script.lineList[startifIndex].indexOf(")");
			str = script.lineList[startifIndex].substring(start + 1,end);
			str = ScriptVarlable.getVarlable(str);
			ifArr = str.split("&&");
			ifvalue = ScriptIF.checkCondition(ifArr);
			startifIndex++;
			continue;
		}else if(script.lineList[startifIndex].indexOf("else") >= 0){
			if(ifvalue){
				ifvalueend = true;
				startifIndex++;
				continue;
			}
			ifvalue = true;
			endifIndex = startifIndex;
			startifIndex++;
			continue;
		}else if(script.lineList[startifIndex].indexOf("endif") >= 0){
			startifIndex++;
			break;
		}else if(script.lineList[startifIndex].indexOf("if") >= 0){
			if(ifvalue && !ifvalueend){
				childArray.push(script.lineList[startifIndex]);
			}
			startifIndex++;
			sCount = 1;
			eCount = 0;
			while(sCount > eCount){
				if(script.lineList[startifIndex].indexOf("if") >= 0 && 
					script.lineList[startifIndex].indexOf("else") < 0 && 
					script.lineList[startifIndex].indexOf("end") < 0){
					sCount++;
				}else if(script.lineList[startifIndex].indexOf("endif") >= 0){
					eCount++;
				}
				if(ifvalue && !ifvalueend){
					childArray.push(script.lineList[startifIndex]);
				}
				startifIndex++;
			}
		}
		if(sCount==0){
			if(ifvalue && !ifvalueend){
				childArray.push(script.lineList[startifIndex]);
			}
			startifIndex++;
		}
	}
	script.lineList.splice(0,startifIndex);
	
	for(var i=childArray.length - 1;i>=0;i--){
		script.lineList.unshift(childArray[i]);
	}
	
	script.analysis();
};
ScriptIF.checkCondition = function (arr){
	for(var i = 0;i<arr.length;i++){
		if(!ScriptIF.condition(arr[i])){
			return false;
		}	
	}
	return true;
};
ScriptIF.condition = function (value){
	var arr;
	if(value.indexOf("===") >= 0){
		arr=ScriptIF.getCheckStr(value,"===");
		return arr[0] == arr[1];
	}else if(value.indexOf("!==") >= 0){
		arr=ScriptIF.getCheckStr(value,"!==");
		return arr[0] != arr[1];
	}else if(value.indexOf("==") >= 0){
		arr=ScriptIF.getCheckInt(value,"==");
		return arr[0] == arr[1];
	}else if(value.indexOf("!=") >= 0){
		arr=ScriptIF.getCheckInt(value,"!=");
		return arr[0] != arr[1];
	}else if(value.indexOf(">=") >= 0){
		arr=ScriptIF.getCheckInt(value,">=");
		return arr[0] >= arr[1];
	}else if(value.indexOf("<=") >= 0){
		arr=ScriptIF.getCheckInt(value,"<=");
		return arr[0] <= arr[1];
	}else if(value.indexOf(">") >= 0){
		arr=ScriptIF.getCheckInt(value,">");
		return arr[0] > arr[1];
	}else if(value.indexOf("<") >= 0){
		arr=ScriptIF.getCheckInt(value,"<");
		return arr[0] < arr[1];
	}
	return false;
};
ScriptIF.getCheckInt = function (value,s){
	var arr;
	arr = value.split(s);
	arr[0] = parseInt(arr[0]);
	arr[1] = parseInt(arr[1]);
	
	return arr;
};
ScriptIF.getCheckStr = function (value,s){
	var arr;
	arr = value.split(s);
	arr[0] = LMath.trim(arr[0].replace('"',''));
	arr[1] = LMath.trim(arr[1].replace('"',''));
	
	
	return arr;
};
var ScriptLayer = function (){};
ScriptLayer.analysis = function (value){
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	switch(value.substr(0,start)){
		case "Layer.add"://添加显示层
			ScriptLayer.setLayer(value,start,end);
			break;
		case "Layer.remove"://移除显示层
			ScriptLayer.removeLayer(value,start,end);
			break;
		case "Layer.clear"://清空显示层
			ScriptLayer.clearLayer(value,start,end);
			break;
		case "Layer.drawRect"://绘制实心矩形
			ScriptLayer.drawRect(value,start,end);
			break;
		case "Layer.drawRectLine"://绘制空心矩形框
			ScriptLayer.drawRectLine(value,start,end);
			break;
		case "Layer.drawRoundRect"://绘制实心圆角矩形
			ScriptLayer.drawRoundRect(value,start,end);
			break;
		case "Layer.drawRoundRectLine"://绘制空心圆角矩形框
			ScriptLayer.drawRoundRectLine(value,start,end);
			break;
		case "Layer.drawTriangle"://绘制实心三角形
			ScriptLayer.drawTriangle(value,start,end);
			break;
		case "Layer.drawTriangleLine"://绘制空心三角形框
			ScriptLayer.drawTriangleLine(value,start,end);
			break;
		case "Layer.transition"://对显示层进行缓动操作
			ScriptLayer.transition(value,start,end);
			break;
		default:
	}
};
ScriptLayer.setLayer = function (value,start,end){
	var params = value.substring(start+1,end).split(",");
	var parentStr = params[0];
	var nameStr = params[1];
	var xInt = parseInt(params[2]);
	var yInt = parseInt(params[3]);
	var script = LGlobal.script;
	var layer,parent,i;
	parent = script.scriptArray.layerList[parentStr];
	layer = new LSprite();
	layer.x = xInt;
	layer.y = yInt;
	layer.name = nameStr;
	parent.addChild(layer);
	script.scriptArray.layerList[nameStr] = layer;
	script.analysis();
};
ScriptLayer.removeFromArray = function (obj){
	if(obj.childList == null)return;
	var count = obj.childList.length;
	for(var i = 0; i < count; i++){
		if(obj.type == "LSprite"){
			ScriptLayer.removeFromArray(obj.childList[i]);
		}else if(obj.type == "LBitmap"){
			LGlobal.script.scriptArray.imgList[obj.childList[i].name] = null;
		}else if(obj.type == "LTextField"){
			LGlobal.script.scriptArray.textList[obj.childList[i].name] = null;
		}
	}
};
ScriptLayer.removeLayer = function (value,start,end){
	var nameStr = LMath.trim(value.substring(start+1,end));
	var script = LGlobal.script;
	var layer,parent;
	layer = script.scriptArray.layerList[nameStr];
	if(!layer){
		script.analysis();
		return;
	}
	parent = layer.parent;
	ScriptLayer.removeFromArray(layer);
	parent.removeChild(layer);
	script.scriptArray.layerList[nameStr] = null;
	script.analysis();
}
ScriptLayer.clearLayer = function (value,start,end){
	var nameStr = LMath.trim(value.substring(start+1,end));
	var script = LGlobal.script;
	var layer = script.scriptArray.layerList[nameStr];
	if(!layer){
		script.analysis();
		return;
	}
	ScriptLayer.removeFromArray(layer);
	layer.die();
	layer.removeAllChild();
	script.analysis();
};
ScriptLayer.drawRect = function (value,start,end){
	var params = value.substring(start+1,end).split(",");
	var nameStr = params[0];
	var color = params[5];
	color = color.replace("0x","#");
	var script = LGlobal.script;
	var layer = script.scriptArray.layerList[nameStr];
	layer.graphics.drawRect(1,color,[parseInt(params[1]),parseInt(params[2]),parseInt(params[3]),parseInt(params[4])],true,color);
	script.analysis();
};
ScriptLayer.drawRectLine = function (value,start,end){
	var params = value.substring(start+1,end).split(",");
	var nameStr = params[0];
	var color = params[5];
	color = color.replace("0x","#");
	var num = 1;
	if(params.length > 6)num = parseFloat(params[6]);
	var script = LGlobal.script;
	var layer = script.scriptArray.layerList[nameStr];
	layer.graphics.drawRect(num,color,[parseInt(params[1]),parseInt(params[2]),parseInt(params[3]),parseInt(params[4])]);
	script.analysis();
};
ScriptLayer.drawRoundRect = function (value,start,end){
	var params = value.substring(start+1,end).split(",");
	var nameStr = params[0];
	var color = params[6];
	color = color.replace("0x","#");
	var script = LGlobal.script;
	var layer = script.scriptArray.layerList[nameStr];
	layer.graphics.drawRoundRect(1,color,[parseInt(params[1]),parseInt(params[2]),parseInt(params[3]),parseInt(params[4]),parseInt(params[5])],true,color);
	script.analysis();
};
ScriptLayer.drawRoundRectLine = function (value,start,end){
	var params = value.substring(start+1,end).split(",");
	var nameStr = params[0];
	var color = params[6];
	color = color.replace("0x","#");
	var num = 1;
	if(params.length > 7)num = parseFloat(params[7]);
	var script = LGlobal.script;
	var layer = script.scriptArray.layerList[nameStr];
	layer.graphics.drawRoundRect(num,color,[parseInt(params[1]),parseInt(params[2]),parseInt(params[3]),parseInt(params[4]),parseInt(params[5])]);
	script.analysis();
};
ScriptLayer.drawTriangle = function (value,start,end){
	var params = value.substring(start+1,end).split(",");
	var nameStr = params[0];
	var color = params[7];
	color = color.replace("0x","#");
	var script = LGlobal.script;
	var layer = script.scriptArray.layerList[nameStr];
	layer.graphics.drawVertices(1,color,[[parseInt(params[1]),parseInt(params[2])],[parseInt(params[3]),parseInt(params[4])],[parseInt(params[5]),parseInt(params[6])]],true,color);
	script.analysis();
};
ScriptLayer.drawTriangleLine = function (value,start,end){
	var params = value.substring(start+1,end).split(",");
	var nameStr = params[0];
	var color = params[7];
	color = color.replace("0x","#");
	var num = 1;
	if(params.length > 8)num = parseFloat(params[8]);
	var script = LGlobal.script;
	var layer = script.scriptArray.layerList[nameStr];
	layer.graphics.drawVertices(num,color,[[parseInt(params[1]),parseInt(params[2])],[parseInt(params[3]),parseInt(params[4])],[parseInt(params[5]),parseInt(params[6])]]);
	script.analysis();
};
ScriptLayer.transition = function (value,start,end){
	var script = LGlobal.script;
	
	var lArr = value.substring(start+1,end).split(",");
	var nameStr = lArr[0];
	//将json对象还原
	var toObj = eval('(' + lArr[1] + ')');
	//获取缓动时间
	var time = parseFloat(lArr[2]);
	var eases = lArr[3].split(".");
	var runNow = false;
	//是否立即执行下一行脚本
	if(lArr.length > 4){
		runNow = (lArr[4] == "1");
	}
	toObj["ease"] = LEasing[eases[0]][eases[1]];
	if(!runNow){
		toObj["onComplete"] = function(){
			script.analysis();
		};
	}
	LTweenLite.to(script.scriptArray.layerList[nameStr],time,toObj);  
	//如果runNow为1，则立即执行下一行脚本
	if(runNow)script.analysis();
};
/*
* ScriptButton.js
**/
var ScriptButton = function (){};
ScriptButton.analysis = function (value){
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	switch(value.substr(0,start)){
		case "Button.add"://添加按钮
			ScriptButton.addButton(value,start,end);
			break;
		case "Button.remove"://删除按钮
			ScriptButton.removeButton(value,start,end);
			break;
		case "Button.mousedown"://鼠标按下事件
			ScriptButton.mouseevent(value,start,end,LMouseEvent.MOUSE_DOWN);
			break;
		case "Button.mouseup"://鼠标弹起事件
			ScriptButton.mouseevent(value,start,end,LMouseEvent.MOUSE_UP);
			break;
		case "Button.mousemove"://鼠标移动事件
			ScriptButton.mouseevent(value,start,end,LMouseEvent.MOUSE_MOVE);
			break;
		default:
			LGlobal.script.analysis();
			
	}
};
/**
添加按钮脚本解析
Button.add(layer01,button01,null,50,50,ok_button_up,ok_button_over,null);
*/
ScriptButton.addButton = function (value,start,end){
	var script = LGlobal.script;
	var layer;
	//获取参数
	var lArr = value.substring(start+1,end).split(",");
	var layerStr = lArr[0];//显示层名称
	var nameStr = lArr[1];//按钮名称
	var labelStr = lArr[2];//按钮上的文字，如果设置为null，则不显示文字
	var x = parseInt(lArr[3]);//按钮坐标
	var y = parseInt(lArr[4]);//按钮坐标
	var dataUp = lArr[5];//按钮弹起样式的bitmapData对象名称
	var dataOver = lArr[6];//按钮点击后样式的bitmapData对象名称
	//获取按钮弹起和按下的样式的bitmapData对象
	var upimg = script.scriptArray.bitmapdataList[dataUp];
	var overimg = script.scriptArray.bitmapdataList[dataOver];
	//按钮弹起状态LSprite
	var upLayer = new LSprite();
	upLayer.addChild(new LBitmap(upimg));
	//按钮按下状态LSprite
	var overLayer = new LSprite();
	overLayer.addChild(new LBitmap(overimg));
	//如果设置了按钮文字，则开始在按钮上添加一个LTextField对象来显示文字
	if(labelStr && labelStr != "null"){
		var upText = new LTextField();
		upText.text = labelStr;
		upText.size = upimg.height * 0.5;
		upText.x = (upimg.width - upText.getWidth())*0.5;
		upText.y = upimg.height * 0.2;
		upLayer.addChild(upText);
		var overText = new LTextField();
		overText.text = labelStr;
		overText.size = upimg.height * 0.5;
		overText.x = (upimg.width - upText.getWidth())*0.5+2;
		overText.y = upimg.height * 0.2+2;
		overLayer.addChild(overText);
		//按钮的文字颜色
		if(lArr.length > 7){
			upText.color = lArr[7];
			overText.color = lArr[7];
		}
	}
	//利用按钮的两个状态，新建一个LButton按钮对象
	var btn = new LButton(upLayer,overLayer);
	btn.x = x;
	btn.y = y;
	//得到显示层
	layer = script.scriptArray.layerList[layerStr];
	//保存按钮
	script.scriptArray.btnList[nameStr] = btn;
	btn.name = nameStr;
	//将按钮添加到显示层
	layer.addChild(btn);
	script.analysis();
};
/**
删除按钮脚本解析
Button.remove(button01);
*/
ScriptButton.removeButton = function(value,start,end){
	//获取参数
	var lArr = value.substring(start+1,end).split(",");
	var nameStr = lArr[0];//按钮名称
	var script = LGlobal.script;
	//获取按钮
	var btn = script.scriptArray.btnList[nameStr];
	//如果按钮不存在，则解析下一行脚本
	if(btn == null){
		script.scriptArray.btnList[nameStr] = null;
		script.analysis();
		return;
	}
	//移除按钮
	btn.parent.removeChild(btn);
	script.scriptArray.btnList[nameStr] = null;
	script.analysis();
};
/**
按钮事件脚本解析
Button.mousedown(button01,function_test01);
*/
ScriptButton.mouseevent = function (value,start,end,e){
	var script = LGlobal.script;
	//获取参数
	var lArr = value.substring(start+1,end).split(",");
	var nameStr = lArr[0];//按钮名称
	var funStr = lArr[1];//函数名称
	//获取按钮
	var btn = script.scriptArray.btnList[nameStr];
	//添加匿名函数，然后匿名函数中利用Call脚本类来调用相应的函数
	var fun = function(event){
		ScriptFunction.analysis("Call." + funStr + "();");
	};
	//为按钮添加事件
	btn.addEventListener(e,fun);
	script.analysis();
};

/*
* ScriptWait.js
**/
var ScriptWait = function (){};
ScriptWait.analysis = function (value){
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	switch(value.substr(0,start)){
		case "Wait.click"://暂停，等待点击鼠标
			ScriptWait.waitclick();
			break;
		case "Wait.ctrl"://暂停，等待运行脚本
			 if(int(value.substring(start + 1,end)) > 0)LGlobal.script.lineList.unshift("Wait.ctrl()");
			break;
		case "Wait.play"://脚本继续运行
			LGlobal.script.analysis();
			break;
		case "Wait.time"://脚本暂停一段时间
			ScriptWait.timeId = setTimeout(function(){
				ScriptWait.timeId = null;
				LGlobal.script.analysis();
			}, 1000);
			break;
		case "Wait.clickOver"://结束等待点击脚本（Wait.click）
			LGlobal.script.scriptLayer.removeEventListener(LMouseEvent.MOUSE_UP,ScriptWait.clickEvent);
			LGlobal.script.analysis();
			break;
		case "Wait.timeOver"://结束时间暂停脚本（Wait.time）
			ScriptWait.timeOver();
			break;
		case "Wait.Over"://结束所有暂停脚本
			LGlobal.script.scriptLayer.removeEventListener(LMouseEvent.MOUSE_UP,ScriptWait.clickEvent);
			ScriptWait.timeOver();
			break;
		default:
			LGlobal.script.analysis();
	}
};
/*
* 结束时间暂停脚本（Wait.time）
**/
ScriptWait.timeOver = function (){
	if(ScriptWait.timeId){
		clearTimeout(ScriptWait.timeId);
		ScriptWait.timeId = null;
	}
	LGlobal.script.analysis();
};
/*
* 暂停，等待点击鼠标
**/
ScriptWait.waitclick = function (){
	var layer = LGlobal.script.scriptLayer;
	//添加一个鼠标点击事件，当鼠标点击屏幕的时候，调用clickEvent函数，开始运行脚本
	layer.addEventListener(LMouseEvent.MOUSE_UP,ScriptWait.clickEvent);
};
/*
* 鼠标点击运行脚本
**/
ScriptWait.clickEvent = function (event){
	LGlobal.script.scriptLayer.removeEventListener(LMouseEvent.MOUSE_UP,ScriptWait.clickEvent);
	LGlobal.script.analysis();
};
/*
* ScriptMark.js
**/
var ScriptMark = function (){};
ScriptMark.analysis = function (value){
	var start = value.indexOf("(");
	var end = value.indexOf(")");
	switch(value.substr(0,start)){
		case "Mark.goto"://跳至标签位置
			ScriptMark.goto(value,start,end);
			break;
		default:
			LGlobal.script.analysis();
	}
};
ScriptMark.goto = function (value,start,end){
	var mark = LMath.trim(value.substring(start+1,end));
	//copyList是当前正在解析的脚本序列的副本，再复制一个脚本序列的副本
	var copyArray = LGlobal.script.copyList.concat();
	var foundStr;
	while(copyArray.length){
		//从复制的脚本序列中开始查找标签，没查找一行，则将其删除
		foundStr = copyArray.shift();
		if(foundStr.indexOf("Mark."+mark) >= 0){
			//如果找到标签，则将当前正在解析的脚本序列替换为复制序列
			LGlobal.script.lineList = copyArray;
			LGlobal.script.analysis();
			return;
		}
	}
	//如果没有找到标签，则什么都不做，进行下一行脚本的解析
	LGlobal.script.analysis();
};