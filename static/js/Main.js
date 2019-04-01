init(50, 'mylegend', 900, 500, main);

function main() {
    LGlobal.setDebug(true);
    let sc = 'Load.script(script/button_test.ls)';
    let sp = new LSprite();
    addChild(sp);
    let script = new LScript(sp, sc);
}