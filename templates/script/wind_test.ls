Layer.add(-,layer01,100,100);
Layer.add(-,layer02,20,50);
Load.img(ok_button_over,ok_button_over.png);
Load.img(ok_button_up,ok_button_up.png);
Button.add(layer01,button01,null,50,50,ok_button_up,ok_button_over,null);

function function_test01();
	Button.remove(button01);
	Text.windChange(txt01,你点击了按钮，\n被点击按钮已经消失\n且文本已经被替换,30,#000000);
endfunction;

Button.mousedown(button01,function_test01);
Text.wind(layer02,txt01,点击下面按钮，\n被点击按钮就会消失，且文本会被替换,0,0,300,20,null,#ff0000);