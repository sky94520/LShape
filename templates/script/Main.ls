//显示
Var.set(age,18);
Var.set(num,5);
if(@num>10);
    Var.set(name,lufy);
elseif(@num>4);
    if(@num==5);
        Var.set(name,你好);
    else;
        Var.set(name,hello world);
    endif;
endif;

Text.label(-,txt01,变量测试：Hello World:@name@age,0,0,30,#000000);
Text.label(-,txt02,Hello Word,0,50,30,#000000);
/*改变第一个文本显示*/
//Text.labelChange(txt01,Hello \nChange,40,#FF0000);
Text.label(-,txt03,Hello Word,0,100,30,#000000);
Text.remove(txt03);

function test(value);
    Text.label(-,txt03,函数测试：@value,0,100,30,#000000);
    Text.label(-,txt04,函数测试：@value,0,140,30,#000000);
endfunction;
Call.test(继位，你好);

//读取图片数据
Load.img(backdata,lufy_legend.jpg);
//显示图片
Img.add(-,backimg01,backdata,100,300,100,100,1);
