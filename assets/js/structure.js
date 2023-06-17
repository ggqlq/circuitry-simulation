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
        height: 100
    }) {
        this.height = obj.height;
        this.width = 0.75 * obj.height;
        this.id = -1;
        this.connectors = new Map;
        this.group = new Konva.Group({
            x: obj.x,
            y: obj.y,
            draggable: true
        })
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
        super(obj);  //继承父类instrument构造函数，继承了两个属性height和width以及一个konval组对象
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
        this.group.add(new Konva.Text({
            x: (this.width * 0.1) / 2,
            y: (this.height / 2) * 0.1,
            text: String(this.#value),
            fontSize: this.height / 2
        }))
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
            nameArr: [ '-','+15','+3' ],
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
            nameArr: [ '-','+0.6','+3' ],
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
        this.reDraw();
        //stage.add(this.layer);
    }
    addInstrument(newInstrument) {
        //该方法用以将一个仪器对象添加到工作台上，传入参数应是仪器对象
        this.#instruments.push(newInstrument);
        newInstrument.id = this.#instruments.length - 1;
        this.length = this.update();
        this.layer.add(newInstrument.group);
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
        requestAnimationFrame(this.reDraw.bind(this));
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