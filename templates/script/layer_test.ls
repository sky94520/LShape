//创建层
Layer.add(-,layer01,100,100);
Layer.add(-,layer02,150,150);
Layer.add(-,layer03,200,200);

//加载图片
Load.img(backdata,lufy_legend.jpg);

//添加图片
Img.add(layer01,backimg01,backdata,0,0,100,100,1);
Img.add(layer02,backimg02,backdata,0,0,100,100,1);
Img.add(layer03,backimg03,backdata,0,0,100,100,1);
//移除层
//Layer.clear(layer03);
Layer.remove(layer01);

//Img.add(layer03,backimg03,backdata,0,0,100,100,1);
//绘制矩形
Layer.drawRect(layer03,100,0,100,100,#ff0000);
Layer.drawRectLine(layer03,100,100,100,100,#ff0000,1);


