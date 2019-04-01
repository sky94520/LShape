Layer.add(-,layer01,100,100);
Layer.add(-,layer02,20,50);

Text.label(layer02,txt01,点击下面的按钮，被点击的按钮就会消失,0,0,30,#000000);
//加载图片
Load.img(ok_button_over,ok_button_over.png);
Load.img(ok_button_up,ok_button_up.png);
//添加按钮
Button.add(layer01,button01,null,50,50,ok_button_up,ok_button_over,#000000);
Button.add(layer01,button02,null,200,50,ok_button_up,ok_button_over,#000000);


//声明函数
function function_test01();
    Button.remove(button01);
endfunction;

function function_test02();
    Button.remove(button02);
endfunction;

//给按钮添加事件
Button.mousedown(button01,function_test01);
Button.mousedown(button02,function_test02);

