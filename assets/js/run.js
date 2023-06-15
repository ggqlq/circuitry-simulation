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



class Connector {
    //接线柱类
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.wireTo = new Set;
        this.resistanceTo = new Map;
    }
    addWire(connector1) {
        //添加一根导线
        return this.wireTo.add(connector1);
    }
    removeWire(connector1) {
        //移除一根导线
        return this.wireTo.delete(connector1);
    }
    addResistanceTo(connector1, value) {
        //设定或更改到其他接线柱间的电阻
        return this.resistanceTo.set(connector1, value);
    }
    removeResistanceTo(connector1) {
        return this.resistanceTo.delete(connector1);
    }
}

class Instrument {
    //仪器类，其他具体仪器类可从此处继承 
    constructor(height) {
        this.height = height;
        this.width = 0.75 * height;
        this.id = -1;
        this.connectors = new Map;
    }
}

class Meter extends Instrument{
    //电表类
    #value  //声明私有属性#value，表示电压值
    constructor(obj = {
        x: 0,
        y: 0,
        height :100,
        connectorColor: 'red',
        connectorSize: -1,
        backgroundColor: 'white',
        nameArr: []
    }) {
        super(obj.height);  //继承父类instrument构造函数，继承了两个属性height和width
        obj.connectorSize = obj.connectorSize == -1 ? this.height * 0.05 : obj.connectorSize;
        for (let i = 0; i <= obj.nameArr.length - 1; ++i) {
            this.connectors.set(obj.nameArr[i], new Connector((this.width * 0.1 + (this.width * 0.8 / (obj.nameArr.length - 1)) * i), 0.85 * this.height));
        }
        this.#value = 0;
        var self = this;
        this.shape = new Konva.Shape({
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            draggable: true,
            fill: 'red',
            sceneFunc: function(context, shape) {
                context.beginPath();
                context.rect(0, 0, self.width, self.height);
                context.closePath();
                context.fillStyle = obj.backgroundColor;
                context.fillStrokeShape(this);
                context.fill();
                context.stroke();
                self.connectors.forEach((v) => {
                    context.beginPath();
                    context.arc(v.x, v.y, self.height * 0.05, 0, 2 * Math.PI, true);
                    context.arc(v.x, v.y, self.height * 0.02, 0, 2 * Math.PI, false);
                    context.fillStyle = obj.connectorColor;
                    //context.fillStrokeShape(this);
                    context.fill();
                    context.stroke();
                })
                context.beginPath();
                context.rect((self.width * 0.1) / 2, (self.height / 2) * 0.1, self.width * 0.9, (self.height / 2) * 0.9);//读数窗
                context.fillStyle = 'white';
                context.fillStrokeShape(this);
                //context.fill();
                context.stroke();
                context.font = String(self.height / 2) + 'px serif';
                context.fillStyle = 'red';
                context.fillText(self.#value, (self.width * 0.1) / 2, (self.height / 2));
                }
            })
    }
    getValue() {
        //读取电表读数
        return this.#value;
    }
    setValue(v) {
        //设置电表读数
        this.#value = v;
        return this.#value;
    }
}

class Voltmeter extends Meter{
    //电压表类
    constructor(x, y, height) {
        super({
            x: x,
            y: y,
            height: height,
            connectorColor: 'red',
            backgroundColor: 'rgba(200, 255, 255, 1)',
            nameArr: [ '-','+15','+3' ] 
        });  //继承父类instrument构造函数，继承了两个属性height和width
        this.connectors.get('+15').addResistanceTo(this.connectors.get('-'), 150000);
        this.connectors.get('+3').addResistanceTo(this.connectors.get('-'), 30000);  //设置电表内部阻值
    }
}

class Ammeter extends Meter {
    constructor(x, y, height) {
        super({
            x: x,
            y: y,
            height: height,
            connectorColor: 'red',
            backgroundColor: 'rgba(255, 210, 210, 1)',
            nameArr: [ '-','+0.6','+3' ]
        })
        this.connectors.get('+3').addResistanceTo(this.connectors.get('-'), 0.02);
        this.connectors.get('+0.6').addResistanceTo(this.connectors.get('-'), 0.02);  //设置电表内部阻值
    }
}

class Table {
    #instruments
    constructor(layer) {
        this.#instruments = new Array();
        this.length = 0;
        this.layer = layer;
        //stage.add(this.layer);
    }
    addInstrument(newInstrument) {
        //该方法用以将一个仪器对象添加到工作台上，传入参数应是仪器对象
        this.#instruments.push(newInstrument);
        newInstrument.id = this.#instruments.length - 1;
        this.length = this.update();
        this.layer.add(newInstrument.shape);
        this.layer.batchDraw();
    }
    update() {
        for (var i = 0; i <= this.#instruments.length - 1; ++i) {
            this.#instruments[i].id = i;
        }
        this.layer.batchDraw();
        return this.#instruments.length;
    }
    reDraw() {
        this.layer.batchDraw();
    }
    removeInstrumentById(id) {
        //通过id移除仪器
        if (id < 0 || id > this.#instruments.length - 1) {
            return -1;
        }
        this.#instruments[id].shape.remove();
        this.#instruments.splice(id, 1);
        this.length = this.update();
        this.layer.batchDraw();
        return this.length;
    }
}

var t = new Table(front);
//t.addInstrument(new voltmeter((window.innerWidth - window.innerHeight * 0.5 * 0.75) / 2, (window.innerHeight - window.innerHeight * 0.5) / 2, window.innerHeight * 0.5));
t.addInstrument(new Voltmeter(200, 200, 100));
t.addInstrument(new Ammeter(300, 300, 100));

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