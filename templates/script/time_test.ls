Layer.add(-,layer01,20,20);
Text.label(layer01,txt01,暂停测试，请等待一秒,0,0,20,#000000);
Wait.time(1000);

Text.label(layer01,txt01,一秒结束，请点击一下屏幕,0,30,20,#000000);
Wait.click();
//加载图片
Load.img(ok_button_over,ok_button_over.png);
Load.img(ok_button_up,ok_button_up.png);
//添加按钮
Button.add(layer01,button01,null,50,200,ok_button_up,ok_button_over);

function function_test01();
    Wait.play();
endfunction;

Button.mousedown(button01,function_test01);
Text.label(layer01,txt01,脚本暂停，你可以点击ok按钮来继续解析脚本,90,20,#000000);
Wait.ctrl();
Button.remove(button01);
Text.label(layer01,txt01,脚本结束,0,120,20,#000000);
