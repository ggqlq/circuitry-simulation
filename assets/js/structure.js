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
        this.obj = obj;
        this.height = obj.height;
        this.width = obj.width;
        this.id = -1;
        this.connectors = new Map;
        this.group = new Konva.Group({
            x: obj.x,
            y: obj.y,
            draggable: true
        })
        this.connectorShape = new Array();
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
            this.connectorShape.push(t);
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
            
        }
        catch(error) {
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
            /*t.on('click', () => {
                t.dispatchEvent(new CustomEvent('connectorClick', {detail: this}));
            })*/
            //console.log(this.connectorShape);
            //console.log(t);
            this.connectorShape.push(t);
            //console.log(this.connectorShape.length);
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

class Wire {
    connectors(start, end) {
        
    }
}

class Table {
    #instruments
    #wires
    constructor(layer) {
        this.#instruments = new Array();
        this.#wires = new Array();
        this.length = 0;
        this.layer = layer;
        this.firstConnector = null;
        this.reDraw();
        //stage.add(this.layer);
    }
    addInstrument(newInstrument) {
        //该方法用以将一个仪器对象添加到工作台上，传入参数应是仪器对象
        this.#instruments.push(newInstrument);
        newInstrument.id = this.#instruments.length - 1;
        this.length = this.update();
        this.layer.add(newInstrument.group);
        newInstrument.initPromise.then(() => {
            console.log(newInstrument.connectorShape.length)
            newInstrument.connectorShape.forEach(c => {
            console.log(c);
            c.addEventListener('click', () => {
                if (this.firstConnector == null) {
                    this.firstConnector = c;
                    console.log(typeof(this.firstConnector));
                }
                else {
                    this.addWire(this.firstConnector, c);
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
    addWire(start, end) {
        console.log([start.x, start.y, end.x, end.y]);
        let t = new Konva.Line({
            points: [start.x, start.y, end.x, end.y],
            stroke: 'black'
        });
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