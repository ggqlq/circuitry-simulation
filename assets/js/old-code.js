/* class meter {
    constructor(maxValue, nowValue, step, inr) {
        this.maxValue;
        this.nowValue;
        this.step;
        this.inr;
    }
};
var isDown = false, 
    sr = document.getElementById("sliding-rheostat"),
    power = document.getElementById("power-borad"),
    ammeter = new meter(3, 0, 0.1, 0.02), //分度值0.02, 0.1 电阻取0.02
    voltmeter = new meter(15, 0, 0.1, 5000);
var //canvas = document.getElementById("canvas-area");
    //ctx = canvas.getContext("2d");
    voltNow = 0,
    ampNow = 0;
    voltmeter.inr = 5000,
    ammeter.inr = 0.02;
var vFixed = 1,
    aFixed = 2;
    voltmeter.maxValue = 15;
    ammeter.maxValue = 0.6;

function valueOfRange() {
    var range = document.getElementById("sliding-rheostat");
    var v = range.value;
    document.getElementById("show-value").innerHTML = v;
    //var tar = v + "%";
    //valueText.innerHTML = tar;
}

function valueOfPower() {
    var range = document.getElementById("sliding-power");
    var v = range.value;
    document.getElementById("show-power").innerHTML = v;
}
 */
function countLimited(flag) {
    var e = 50,
        sliderValue = t.getInstrumentById(5).getValue(),
        resistor = t.getInstrumentById(2).getValue();
        
    if (flag) {
        //外接
        /*var e = document.getElementById("sliding-power").value;
        var sr = document.getElementById("sliding-rheostat");
        var ttr = document.getElementById("rheostatToTest").value;
        var srv = document.getElementById("max-rheostat").value * sr.value;
        var a = e / (Number(srv) + 1 / (1 / Number(ttr)) + (1 / voltmeter.inr) + ammeter.inr);
        document.getElementById("a").innerHTML = a;
        document.getElementById("v").innerHTML = e * (ttr / (Number(ttr) + Number(srv)));
        console.log(e / (srv + ttr) + " " + e + " " + Number((srv + ttr)) +' ' + srv)
        console.log(ttr / (ttr + sr.value) + " " + ttr + " " + (Number(ttr) + Number(srv)) + " " + srv);*/
        voltmeter = {};
        ammeter = {};
        voltmeter.inr = 15000;
        ammeter.inr = 0.002;
        let valueOfVoltmeterAndresistor = voltmeter.inr * resistor / (voltmeter.inr + resistor);
        console.log(e + " " + voltmeter.inr + " " + (valueOfVoltmeterAndresistor + ammeter.inr + sliderValue) + " " + valueOfVoltmeterAndresistor);
        voltNow = e * (valueOfVoltmeterAndresistor / (valueOfVoltmeterAndresistor + ammeter.inr + sliderValue));
        ampNow = e / (valueOfVoltmeterAndresistor + ammeter.inr + sliderValue);//这里需要修改<---------
        if (!t.getInstrumentById(4).getState()) {
            voltNow =  0;
            ampNow = 0;
        }
        t.getInstrumentById(0).setValue(voltNow.toFixed(2));
        t.getInstrumentById(1).setValue(ampNow.toFixed(2));
    }
    else {
        //内接
        let innerSumValue = voltmeter.inr * (resistor + ammeter.inr) / (voltmeter.inr + resistor + ammeter.inr);
        voltNow = e * (innerSumValue / (innerSumValue + sliderValue));
        ampNow = voltNow / innerSumValue;
    }
}

/* function countDivided(flag) {
    var maxSlider = Number(document.getElementById("max-rheostat").value);
    var e = document.getElementById("sliding-power").value,
        sliderValue = Number(document.getElementById("sliding-rheostat").value) * Number(document.getElementById("max-rheostat").value),
        resistor = Number(document.getElementById("rheostatToTest").value);
        
    if (flag) {
        //外接
        let valueOfVoltmeterAndresistor = voltmeter.inr * resistor / (voltmeter.inr + resistor);
        let inTotalResistor = valueOfVoltmeterAndresistor + ammeter.inr + sliderValue;
        let inTotalVolt = e * (inTotalResistor / (inTotalResistor + maxSlider - sliderValue));
        voltNow = inTotalVolt * (valueOfVoltmeterAndresistor / (valueOfVoltmeterAndresistor + ammeter.inr + sliderValue));
        ampNow = inTotalVolt / (valueOfVoltmeterAndresistor + ammeter.inr + sliderValue);
        console.log(voltNow + ' ' + inTotalVolt + ' ' + sliderValue);
        }
    else {
        //内接
        let innerSumValue = voltmeter.inr * (resistor + ammeter.inr) / (voltmeter.inr + resistor + ammeter.inr);
        let inTotalResistor = innerSumValue + ammeter.inr + sliderValue;
        let inTotalVolt = e * ((inTotalResistor + sliderValue) / (inTotalResistor + maxSlider - sliderValue));
        voltNow = inTotalVolt * (innerSumValue / innerSumValue + sliderValue);
        ampNow = voltNow / (resistor + ammeter.inr);
    }
}

function checkSelect() {
    //选择内外接
    var flag = 1;
    if(document.getElementById("nei").checked) {
        flag = 0;
    }
    else {
        flag = 1;
    }
    if (document.getElementById("xianliu").checked) {
        console.log("限流");
        countLimited(flag);
    }
    else {
        console.log("分压"); 
        countDivided(flag);
    }
    //drawMeter(10, 10, 400, ampNow, ammeter.maxValue);
}

function deviation(flag, u, e) {
    if (flag) {
        return Math.random() * (Math.round(Math.random()) ? 1 : -1) / 10;
    }
    else {
        return 0;
    }
}

sr.onmousedown = function (e) {
    isDown = true;
}

power.onmousedown = function (e) {
    isDown = true;
}


window.onmousemove = function (e) {
    if (isDown)
    {
        valueOfRange(); 
        checkSelect(); 
        valueOfPower();
        console.log("meter");
        //drawMeter(10, 10, 400, ampNow, ammeter.maxValue);
    }
    if (document.getElementById("fifteenv").checked) {
        vFixed = 1;
        voltmeter.maxValue = 15;
    }
    else {
        voltmeter.maxValue = 3
        vFixed = 2;
    }
    if (document.getElementById("threea").checked) {
        aFixed = 2;
        ammeter.maxValue = 3;
    }
    else {
        aFixed = 2;
        ammeter.maxValue = 0.6;
    }
    document.getElementById("a").innerHTML = ampNow < 1.01 * ammeter.maxValue ? ampNow.toFixed(aFixed) : -1;
    document.getElementById("v").innerHTML = voltNow < 1.01 * voltmeter.maxValue ? voltNow.toFixed(vFixed) : -1;
}
window.onclick = function(e) {
    valueOfRange(); 
    checkSelect(); 
    valueOfPower();
    console.log("meter");
    //drawMeter(10, 10, 400, ampNow, ammeter.maxValue); 
    if (document.getElementById("fifteenv").checked) {
        vFixed = 1;
        voltmeter.maxValue = 15;
    }
    else {
        voltmeter.maxValue = 3
        vFixed = 2;
    }
    if (document.getElementById("threea").checked) {
        aFixed = 2;
        ammeter.maxValue = 3;
    }
    else {
        aFixed = 2;
        ammeter.maxValue = 0.6;
    }
    document.getElementById("a").innerHTML = ampNow < 1.01 * ammeter.maxValue ? ampNow.toFixed(aFixed) : -1;
    document.getElementById("v").innerHTML = voltNow < 1.01 * voltmeter.maxValue ? voltNow.toFixed(vFixed) : -1;
    var img = document.getElementById("img");
    if (document.getElementById("nei").checked) {
        if (document.getElementById("fenya").checked) {
            img.src = "./assets/img/internal_divided.png";
        }
        else {
            img.src = "./assets/img/internal_limiting.png";
        }
    }
    else {
        if (document.getElementById("fenya").checked) {
            img.src = "./assets/img/external_divided.png";
        }
        else {
            img.src = "./assets/img/external_limiting.png";
        }
    }
}

sr.onmouseup = function (e) {
    isDown = false;
}

power.onmouseup = function (e) {
    isDown = false;
}

sr.addEventListener("onchange", function (e) {
    if (isDown)
    {
        valueOfRange(); 
        checkSelect(); 
        valueOfPower()
    }
})

/*window.onmousemove = function (e) {
    if (isDown)
    {
        valueOfRange(); 
        checkSelect(); 
        valueOfPower();
        document.getElementById("a").innerHTML = ampNow < 1.01 * ammeter.maxValue ? ampNow.toFixed(vFixed) : -1;
        document.getElementById("v").innerHTML = voltNow < 1.01 * voltmeter.maxValue ? voltNow.toFixed(aFixed) : -1;
    }
}*/

//drawMeter(100, 100, 400, 10, 100);

function startCount() {

} 