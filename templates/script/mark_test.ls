Layer.add(-,layer01,0,0);
//调到标签drawTriangle
Mark.goto(drawTriangle);
//绘制矩形
Layer.drawRect(layer01,0,0,100,60,0xff0000);
Layer.drawRectLine(layer01,0,100,100,60,0xff0000,5);
//设置drawRoundRect标签
Mark.drawRoundRect;
//绘制圆角矩形
Layer.drawRoundRect(layer01,150,0,100,60,10,0x880000);
Layer.drawRoundRectLine(layer01,150,100,100,60,10,0x880000,5);

//跳到标签over
Mark.goto(over);
//设置drawTriangle标签
Mark.drawTriangle;
//绘制三角形
Layer.drawTriangle(layer01,350,0,300,60,400,60,0xff0000);
Layer.drawTriangleLine(layer01,350,100,300,160,400,160,0xff0000,5);
//跳到标签drawRoundRect
Mark.goto(drawRoundRect);
//设置over标签
Mark.over;
