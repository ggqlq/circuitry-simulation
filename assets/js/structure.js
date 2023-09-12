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
    constructor(obj = {
        x: 0,
        y: 0,
        height: 100,
        width: 100
    }) {
        //obj.connectorSize = obj.connectorSize ==  undefined ? this.height * 0.05 : obj.connectorSize;
        this.obj = obj;
        this.height = obj.height;
        this.width = obj.width;
        this.id = -1;
        this.connectors = new Map;//key为接线柱名称，value为接线柱对象
        this.group = new Konva.Group({
            x: obj.x,
            y: obj.y,
            draggable: true
        })
        this.connectorShape = new Map();//key为图形对象，value为接线柱对象
        this.initPromise = Promise.resolve();
    }
    
    loadImg(src) {
        //用来加载图片并创建Promise
        return new Promise((resolve, reject) => {
            var img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        })
    }
    destroy() {
        this.group.getChildren().each((v) => {
            v.off();
        })
    }
}

class Meter extends Instrument{
    //电表类
    #value  //声明私有属性#value，表示电压值
    constructor(obj = {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        connectorColor: 'red',
        connectorSize: -1,
        backgroundColor: 'white',
        nameArr: []
    }) {
        super(obj);  //继承父类instrument构造函数，继承了两个属性height和width以及一个konval组对象以及一个存储接线柱图形的数组
        obj.connectorSize = obj.connectorSize ==  undefined ? this.height * 0.05 : obj.connectorSize;
        for (let i = 0; i <= obj.nameArr.length - 1; ++i) {
            this.connectors.set(obj.nameArr[i], new Connector((this.width * 0.1 + (this.width * 0.8 / (obj.nameArr.length - 1)) * i), 0.85 * this.height));
        }
        this.#value = 0;
        this.group.add(new Konva.Rect({
            x: 0,
            y: 0,
            height: this.height,
            width: this.width,
            fill: obj.backgroundColor,
            stroke: 'black'
        }));//电表外壳
        this.connectors.forEach((v, k) => {//添加接线柱
            let t = new Konva.Ring({
                x: v.x,
                y: v.y,
                innerRadius: obj.connectorSize * 0.5,
                outerRadius: obj.connectorSize,
                fill: obj.connectorColor,
            });
            t.on('mouseover', function() {
                t.fill('black');
            });
            t.on('mouseout', function() {
                t.fill(obj.connectorColor);
            });
            /*t.on('click', () => {
                t.dispatchEvent(new CustomEvent('connectorClick', {detail: this}));
            })*/
            this.connectorShape.set(t, v);
            this.group.add(t);
            this.group.add(new Konva.Text({
                x: v.x,
                y: v.y - obj.connectorSize * 2.5,
                text: k,
                fontSize: obj.connectorSize * 2
            }))
        })
        this.group.add(new Konva.Rect({//读数窗
            x: (this.width * 0.1) / 2,
            y: (this.height / 2) * 0.1,
            width: this.width * 0.9,
            height: (this.height / 2) * 0.9,
            fill: 'white',
            stroke: 'black'
        }))
        this.text = new Konva.Text({
            x: (this.width * 0.1) / 2,
            y: (this.height / 2) * 0.1,
            text: String(this.#value),
            fontSize: this.height / 4
        });
        this.group.add(this.text);
    }
    getValue() {
        //读取电表读数
        return this.#value;
    }
    setValue(v) {
        //设置电表读数
        this.#value = v;
        this.text.text(String(this.#value));
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
            width: 0.75 * height,
            connectorColor: 'red',
            backgroundColor: 'rgba(200, 255, 255, 1)',
            nameArr: [ '-','+15','+3' ],
        });  //
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
            width: 0.75 * height,
            connectorColor: 'red',
            backgroundColor: 'rgba(255, 210, 210, 1)',
            nameArr: [ '-','+0.6','+3' ],
        })
        this.connectors.get('+3').addResistanceTo(this.connectors.get('-'), 0.02);
        this.connectors.get('+0.6').addResistanceTo(this.connectors.get('-'), 0.02);  //设置电表内部阻值
    }
}

class Resistor extends Instrument {
    #value
    constructor(obj) {
        super(obj);
        this.obj = obj;
        this.obj.connectorSize = obj.connectorSize == undefined ?  this.height * 0.1 : obj.connectorSize;
        this.obj.connectorColor = obj.connectorColor == undefined ? 'red' : obj.connectorColor;
        this.#value = obj.value == undefined ? 100 : obj.value;//默认阻值100
        this.height = obj.height;
        this.width = 2 * obj.height
        this.connectors.set('1', new Connector(this.width * 0.1, 0.9 * this.height));
        this.connectors.set('2', new Connector(this.width * 0.9, 0.9 * this.height));//添加接线柱对象
        this.connectors.get('1').addResistanceTo(this.connectors.get('2'), this.#value);
        this.connectors.get('2').addResistanceTo(this.connectors.get('1'), this.#value);//设置阻值
        this.initPromise = this.init();
    }
    async init() {
        //等待图片加载完成后再进行其他操作
        try {
            var img = await this.loadImg("./assets/img/resistor.png");
            this.group.add(new Konva.Image({
                x: 0,
                y: 0,
                image: img,
                width: this.width,
                height: this.height
            }));//加载图片
            
        } catch(error) {
            console.error('Failed to load image:', error);
        }
        this.connectors.forEach((v, k) => {
            //在图片加载完成后加入接线柱，防止接线柱被图片阻挡无法响应事件
            let t = new Konva.Circle({
                x: v.x,
                y: v.y,
                radius: this.obj.connectorSize,
                fill: this.obj.connectorColor,
                stroke: 'black'
            });
            this.group.add(t);
            t.moveUp();
            t.on('mouseover', function() {
                t.fill('black');
            });
            t.on('mouseout', () => {
                //此处应使用箭头函数确保this指向正确
                t.fill(this.obj.connectorColor);
            });
            this.connectorShape.set(t, v);
        })
    }
    getValue() {
        return this.#value;
    }
    setValue(newValue) {
        this.#value = newValue;
        return this.value;
    }
}

class Power extends Instrument {
    #value;
    constructor(obj) {
        obj.backgroundColor = 'rgb(195, 135, 215)';
        super(obj);
        this.width = this.height * 2;
        obj.connectorSize = obj.connectorSize ==  undefined ? this.height * 0.1 : obj.connectorSize;
        obj.connectorColor = obj.connectorColor ==  undefined ? 'red' : obj.connectorSize;
        this.#value = 50;
        //this.connectors.set("+", new Connector(10, 10));
        this.connectors.set("+", new Connector(this.width * 0.1, 0.85 * this.height));
        this.connectors.set("-", new Connector(this.width * 0.9, 0.85 * this.height));
        this.group.add(new Konva.Rect({
            x: 0,
            y: 0,
            height: this.height,
            width: this.width,
            connectorSize: 0.05 * this.height,
            fill: obj.backgroundColor,
            stroke: 'black'
        }));
        this.group.add(new Konva.Rect({
            x: this.width * 0.1,
            y: this.height * 0.1,
            height: this.height * 0.4,
            width: this.width * 0.8,
            fill: 'white',
            stroke: 'black'
        }));
        this.group.add(new Konva.Text({
            x: this.width * 0.1,
            y: this.height * 0.1,
            fontSize: this.height * 0.4,
            text: String(this.#value) + 'V',
            fill: 'red'
        }));
        this.connectors.forEach((v, k) => {
            let t = new Konva.Circle({
                x: v.x,
                y: v.y,
                radius: obj.connectorSize,
                fill: obj.connectorColor,
                stroke: 'black'
            });
            this.group.add(t);
            t.moveUp();
            t.on('mouseover', function() {
                t.fill('black');
            });
            t.on('mouseout', () => {
                //此处应使用箭头函数确保this指向正确
                t.fill(obj.connectorColor);
            });
            this.connectorShape.set(t, v);
        })
    }
}

class CircuitChange extends Instrument {
    #state
    constructor(obj) {
        super(obj);
        this.obj = obj;
        this.obj.connectorSize = obj.connectorSize ==  undefined ? this.height * 0.1 : obj.connectorSize;
        this.obj.connectorColor = obj.connectorColor ==  undefined ? 'red' : obj.connectorSize;
        this.#state = false //false表示断开，true表示闭合
        this.width = 2 * this.height;
        let t = this.width;
        this.connectors.set('1', new Connector(this.width * 0.2, this.height * 0.8));
        this.connectors.set('2', new Connector(this.width * 0.8, this.height * 0.8));
        this.initPromise = this.init();
    }
    async init() {
        //等待图片加载完成后再进行其他操作
        try {
            var img = await this.loadImg("./assets/img/switch.png");
            let konvaimg = new Konva.Image({
                x: 0,
                y: 0,
                image: img,
                width: this.width,
                height: this.height
            })
            this.group.add(konvaimg);//加载图片
            konvaimg.on('click', () => {
                this.changeState();
            })
            this.connectors.forEach((v, k) => {
            //在图片加载完成后加入接线柱，防止接线柱被图片阻挡无法响应事件
                let t = new Konva.Circle({
                    x: v.x,
                    y: v.y,
                    radius: this.obj.connectorSize,
                    fill: this.obj.connectorColor,
                    stroke: 'black'
                });
                this.group.add(t);
                t.moveUp();
                t.on('mouseover', function() {
                    t.fill('black');
                });
                t.on('mouseout', () => {
                    //此处应使用箭头函数确保this指向正确
                    t.fill(this.obj.connectorColor);
                });
                this.connectorShape.set(t, v);
            });
            this.switchRect = new Konva.Rect({
                x: this.width * 0.2,
                y: this.height * 0.5,
                height: this.height * 0.1,
                width: this.width * 0.6,
                fill: 'black',
                rotation: -45
            })
            this.group.add(this.switchRect);
        } catch(error) {
            console.error('Failed to load image:', error);
            return error;
        }
    }
    changeState() {
        if (this.#state) {
            this.#state = false;
            this.switchRect.rotation(-45);
            this.connectors.forEach(c => {
                c.resistanceTo.clear();
            })
        }
        else {
            this.#state = true;
            this.switchRect.rotation(0);
            this.connectors.get('1').addResistanceTo(this.connectors.get('2'), 0);
            this.connectors.get('2').addResistanceTo(this.connectors.get('1'), 0);
        }
    }
    getState() {
        return this.#state;
    }
}

class SlideResistor extends Instrument {
    #maxValue;
    #nowValue;
    constructor(obj) {
        super(obj);
        this.width = this.height * 2;
        this.obj = obj;
        this.obj.connectorSize = obj.connectorSize ==  undefined ? this.height * 0.05 : obj.connectorSize;
        this.obj.connectorColor = obj.connectorColor ==  undefined ? 'red' : obj.connectorSize;
        this.width = 1.5 * this.height;
        this.#maxValue = obj.maxValue == undefined ? 1000 : obj.maxValue;
        this.#nowValue = 0;
        this.connectors.set("1", new Connector(this.width * 0.1, 0.6 * this.height));
        this.connectors.set("2", new Connector(this.width * 0.9, 0.6 * this.height));
        this.connectors.set("3", new Connector(this.width * 0.97, 0.25 * this.height));
        this.connectors.get('1').addResistanceTo(this.connectors.get('2'),this.#maxValue);
        this.connectors.get('2').addResistanceTo(this.connectors.get('1'),this.#maxValue);
        this.connectors.get('1').addResistanceTo(this.connectors.get('3'), this.#nowValue);
        this.connectors.get('3').addResistanceTo(this.connectors.get('1'), this.#nowValue);
        this.connectors.get('2').addResistanceTo(this.connectors.get('3'), this.#maxValue - this.#nowValue);
        this.connectors.get('3').addResistanceTo(this.connectors.get('2'), this.#maxValue - this.#nowValue);
        this.group.draggable(false);
        this.initPromise = this.init();
    }
    async init() {
        try {
            let img = await this.loadImg('./assets/img/slide-resistor.png');
            this.group.add(new Konva.Image({
                x: 0,
                y: 0,
                height: this.height,
                width: this.width,
                image: img
            }))
        } catch(error) {
            console.error('图片加载失败:', error);
            return error;
        }
        this.connectors.forEach((v, k) => {
            let t = new Konva.Circle({
                x: v.x,
                y: v.y,
                radius: this.obj.connectorSize,
                fill: this.obj.connectorColor,
                stroke: 'black'
            });
            this.group.add(t);
            t.moveUp();
            t.on('mouseover', function() {
                t.fill('black');
            });
            t.on('mouseout', () => {
                //此处应使用箭头函数确保this指向正确
                t.fill(this.obj.connectorColor);
            });
            this.connectorShape.set(t, v);
        });
        this.slider = new Konva.Rect({
            x: 0.1 * this.width,
            y: 0.25 * this.height,
            draggable: true,
            height: this.height * 0.2,
            width: this.height * 0.2,
            fill: 'black',
            dragBoundFunc: function(pos) {
                return {
                x: pos.x,
                y: this.absolutePosition().y
                };
            }
        });
        this.group.add(this.slider);
        this.slider.on('dragmove', () => {
            var groupPos = this.group.getAbsolutePosition();
            console.log(this.group.width());
            this.#nowValue = ((this.slider.getAbsolutePosition().x - groupPos.x) / this.obj.height * 1.5) * this.#maxValue;
            console.log(this.#nowValue);
        })
    }
    getValue() {
        return this.#nowValue;
    }
}

class Wire {

}

class Table {
    #instruments;
    #wires;
    constructor(layer) {
        this.#instruments = new Array();
        this.#wires = new Array();
        this.length = 0;
        this.layer = layer;
        this.firstConnector = null;
        window.onload = () => {
            t.reDraw();
        }
        //this.reDraw();
        //stage.add(this.layer);
    }
    addInstrument(newInstrument) {
        //该方法用以将一个仪器对象添加到工作台上，传入参数应是仪器对象
        this.#instruments.push(newInstrument);
        newInstrument.id = this.#instruments.length - 1;
        this.length = this.update();
        this.layer.add(newInstrument.group);
        newInstrument.initPromise.then(() => {
            newInstrument.connectorShape.forEach((v, k) => {
                //k为图像对象，v为接线柱对象
            k.addEventListener('click', () => {
                if (this.firstConnector == null) {
                    this.firstConnector = {shape: k, object: v};
                    console.log(typeof(this.firstConnector));
                }
                else {
                    this.addWire(this.firstConnector.shape, k, this.firstConnector.object, v);
                    this.firstConnector = null;
                }
            })
        })
        this.layer.batchDraw();
        })
    }
    update() {
        for (var i = 0; i <= this.#instruments.length - 1; ++i) {
            this.#instruments[i].id = i;
        }
        this.layer.batchDraw();
        return this.#instruments.length;
    }
    reDraw() {
        //定期刷新屏幕
        this.layer.batchDraw();
        countLimited(true);
        requestAnimationFrame(this.reDraw.bind(this));
    }
    removeInstrumentById(id) {
        //通过id移除仪器
        if (id < 0 || id > this.#instruments.length - 1) {
            return -1;
        }
        this.#instruments[id].destroy();
        this.#instruments[id].group.remove();
        this.#instruments.splice(id, 1);
        this.length = this.update();
        this.layer.batchDraw();
        return this.length;
    }
    addWire(startShape, endShape, start, end) {
        //console.log(start.x);
        let s = startShape.getAbsolutePosition(), e = endShape.getAbsolutePosition();
        let t = new Konva.Line({
            points: [s.x, s.y, e.x, e.y],
            stroke: 'black'
        });
        this.layer.add(t);
        start.addWire(end);
        start.addResistanceTo(end);
        end.addResistanceTo(start);
    }
    getInstrumentById(id) {
        if (id < 0 || id > this.#instruments.length - 1) {
            return undefined;
        }
        return this.#instruments[id];
    }
}

class Console {
    //控制台类，明天再写
    constructor(layer, table) {
        this.layer = layer;
        this.table = table;
        this.layer.add(new Konva.Rect({
            x: 0,
            y: window.innerHeight * 0.8,
            width: window.innerWidth,
            height: window.innerHeight * 0.2,
            fill: 'rgba(144, 144, 144, 1)'
        }));
        layer.moveToTop();
        this.layer.batchDraw();
    }
    reDraw() {
        //定期刷新屏幕
        this.layer.batchDraw();
        requestAnimationFrame(this.reDraw.bind(this));
    }
}