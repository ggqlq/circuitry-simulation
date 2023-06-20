//const konva = require("./konva");

var stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight
})

var background = new Konva.Layer();

stage.add(background);

var backgroundRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
    fill: 'rgba(77,177,231,1)'
});

background.add(backgroundRect);
background.draw();

var front = new Konva.Layer();
stage.add(front);

var con = new Konva.Layer();
stage.add(con);



var t = new Table(front);
//t.addInstrument(new voltmeter((window.innerWidth - window.innerHeight * 0.5 * 0.75) / 2, (window.innerHeight - window.innerHeight * 0.5) / 2, window.innerHeight * 0.5));
t.addInstrument(new Voltmeter(200, 200, 100));
t.addInstrument(new Ammeter(300, 300, 100));
t.addInstrument(new Resistor({
    x: 400,
    y: 400,
    height: 50
}));
t.addInstrument(new Power({
    x: 500,
    y: 200,
    height:50,
}))

t.addInstrument(new CircuitChange({
    x: 500,
    y: 200,
    height:50,
}))
t.addInstrument(new SlideResistor({
    x: 100,
    y: 150,
    height: 100
}))
t.getInstrumentById(0).setValue(10);
//t.removeInstrumentById(0);
var c = new Console(con, t);

function drawGrid(layer, gridSize) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create horizontal lines
    for (let i = 0; i < width; i += gridSize) {
        const line = new Konva.Line({
            points: [i, 0, i, height],
            stroke: '#ddd',
            strokeWidth: 1,
        });
        layer.add(line);
    }

    // Create vertical lines
    for (let i = 0; i < height; i += gridSize) {
        const line = new Konva.Line({
            points: [0, i, width, i],
            stroke: '#ddd',
            strokeWidth: 1,
        });
        layer.add(line);
    }

    // Draw the grid
    layer.draw();
}

drawGrid(front, 100);

var rect = new Konva.Shape({
    x: 10,
    y: 20,
    fill: '#00D2FF',
    width: 100,
    height: 50,
    draggable: true,
    sceneFunc: function (context, shape) {
      context.beginPath();
      // 不用设置rect的位置，框架会自动处理
      context.rect(0, 0, shape.getAttr('width'), shape.getAttr('height'));
      // Konva 扩展的一个非常重要的方法
      // 绘制设置的样式
      context.fillStrokeShape(shape);
    }
  });
front.add(rect);

//t.addInstrument(new Instrument(20, 10, 100));

/*var customShape = new Konva.Shape({
    x: 50,
    y: 60,
    fill: 'red',
    draggable: true,
    sceneFunc: function(context) {
      context.beginPath();
      context.arc(0, 0, 50, 0, Math.PI * 2, false);
      context.closePath();
  
      // Konva.js specific method
      context.fillStrokeShape(this);
    }
  });
  
  front.add(customShape);*/