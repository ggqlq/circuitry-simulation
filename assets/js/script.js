window.onresize = function (e) {
    stage.height(window.innerHeight);
    stage.width(window.innerWidth);
    backgroundRect.width(stage.width());
    backgroundRect.height(stage.height());
    stage.batchDraw();
}