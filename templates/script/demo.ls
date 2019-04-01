//添加显示层back
Layer.add(-,back,0,0);
//添加显示层chara
Layer.add(-,chara,0,0);
//添加显示层talk
Layer.add(-,talk,0,0);

//显示文字，读取中
Text.label(-,loading,图片读取中...,120,200,15,#000000);

//读取图片
Load.img(backdata,images/back01.png);
Load.img(backdata01,images/back02.png);
Load.img(selectbox,images/selectbox.png);
Load.img(selectbtnup,images/selectbtnup.png);
Load.img(selectbtnover,images/selectbtnover.png);
Load.img(girldata,images/girl01.png);
Load.img(boydata,images/boy.png);

//删除读取中的文字
Text.remove(loading);

//显示背景
Img.add(back,backimg,backdata,0,0,700,500,0);
//背景由透明逐渐显示
Img.transition(backimg,{alpha:1},1,Strong.easeOut);

//在屏幕外显示吕布的图片
Img.add(chara,boyimg,boydata,-202,50,202,353,1);
//吕布图片划入
Img.transition(boyimg,{x:240},1,Strong.easeOut);

//添加对话框
Img.add(talk,selectbox,selectbox,100,270,405,125,1);
//显示对话人物名称
Text.label(talk,name01,[ 吕布 ],120,290,15,#ffffff);
//显示对话
Text.wind(talk,talk, 你好！欢迎来到「L#游戏世界」！我是吕布。吕布与貂蝉中的吕布，现在开始我来向大家做一个简单的L#脚本演示。（点击屏幕继续）,120,310,360,13,null,#ffffff);
//暂停，等待点击屏幕
Wait.click();

//改变对话
Text.windChange(talk,首先，来试一下选择分支的使用。);
//暂停
Wait.time(500);

//改变对话
Text.windChange(talk,告诉我你是男生还是女生？);

Layer.add(talk,select,120,320);
//显示按钮
Button.add(select,btn01,男生,0,10,selectbtnup,selectbtnover,#ffffff);
Button.add(select,btn02,女生,0,40,selectbtnup,selectbtnover,#ffffff);

function btn01Click();
    //移除选择层
    Layer.remove(select);
    Var.set(gender,帅哥);
    //对话
    Text.windChange(talk,原来是@gender啊！);
endfunction;

function btn02Click();
    //移除选择层
    Layer.remove(select);
    Var.set(gender,美女);
    //对话
    Text.windChange(talk,原来是@gender啊！);
endfunction;

//为按钮添加点击事件
Button.mousedown(btn01,btn01Click);
Button.mousedown(btn02,btn02Click);

//暂停
Wait.ctrl(0);
//暂停
Wait.time(500);
//改变对话
Text.windChange(talk,那么，接下来。。。。。);

//暂停
Wait.time(500);
//貂蝉
Text.labelChange(name01,[???],15,#ff0000);
Text.windChange(talk,奉先～～～！);
Wait.time(500);

//奉先
Text.labelChange(name01,[ 吕布 ],15,#ffffff);
Text.windChange(talk,。。。。咦，是谁呢？);

//在屏幕外显示图片
Img.add(chara,girlimg,girldata,800,70,248,338,1);
Img.transition(girlimg,{x:450},1,Strong.easeOut);

Text.labelChange(name01,[ 神秘女郎 ],15,#ff0000);
Text.windChange(talk,你不用管我是谁，我带你去一个地方！);
Wait.time(500);

Text.labelChange(name01,[ 吕布 ],15,#ff0000);
Text.windChange(talk,我不认识你，为什么要跟你去？而且我现在正在介绍游戏。。。);
Wait.time(500);

Text.labelChange(name01,[ 神秘女郎 ],15,#ff0000);
Text.windChange(talk,我就是来帮你一起介绍的啊，快点过来！);
Wait.time(50);

//神秘女郎移出屏幕
Img.transition(girlimg,{x:800},1,Strong.easeOut);

//背景替换
Img.transition(backimg,{alpha:0},1,Strong.easeOut);
Img.changeData(backimg,backdata01);
Wait.time(1000);
Img.transition(backimg,{alpha:1},1,Strong.easeOut);
