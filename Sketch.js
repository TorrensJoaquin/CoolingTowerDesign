let DryGas = new FlowStream();
let WetGas = new FlowStream();
let aux;
let Background = [];
let webButtons = [];
let IsCircleIncreasing = false;
let SizeOfCircle = 0;
let WaterOverMouse = new WaterProperties();
let WaterSaturation = new WaterProperties();
let AbsoluteMolarHumidity = 0;
let Screen = {
    XCanvas: 1360,
    YCanvas: 768,
    Xmin: 0,
    Xmax: 1360,
    Ymin: 92,
    Ymax: 768,
    EnthalpyMin: -30,       // kJ/Kg d.a.
    EnthalpyMax: 120,    // kJ/Kg d.a.
    EnthalpyMinSP: -30,     // kJ/Kg d.a.
    EnthalpyMaxSP: 120,  // kJ/Kg d.a.
    EnthalpyVelMax: 0.5,
    tempMin: 273.15 - 10,  //°K
    tempMax: 273.15 + 55,  //°K
    tempMinSP: -10, //°C
    tempMaxSP: 55,  //°C
    tempVelMax: 0.5,
    SelectedHumidity: 0
}
function MoveToTheRequestedRange() {
    if (isNumber(Screen.EnthalpyMinSP)) {
        if (Screen.EnthalpyMin > Screen.EnthalpyMinSP + Screen.EnthalpyVelMax) {
            Screen.EnthalpyMin = Screen.EnthalpyMin - Screen.EnthalpyVelMax;
        } else if (Screen.EnthalpyMin < Screen.EnthalpyMinSP - Screen.EnthalpyVelMax) {
            Screen.EnthalpyMin = Screen.EnthalpyMin + Screen.EnthalpyVelMax;
        } else {
            Screen.EnthalpyMin = Screen.EnthalpyMinSP;
        }
    }
    if (isNumber(Screen.EnthalpyMaxSP)) {
        if (Screen.EnthalpyMax > Screen.EnthalpyMaxSP + Screen.EnthalpyVelMax) {
            Screen.EnthalpyMax = Screen.EnthalpyMax - Screen.EnthalpyVelMax;
        } else if (Screen.EnthalpyMax < Screen.EnthalpyMaxSP - Screen.EnthalpyVelMax) {
            Screen.EnthalpyMax = Screen.EnthalpyMax + Screen.EnthalpyVelMax;
        } else {
            Screen.EnthalpyMax = Screen.EnthalpyMaxSP;
        }
    }
    if (isNumber(Screen.tempMinSP)) {
        if (Screen.tempMin > Screen.tempMinSP + 273.15 + Screen.tempVelMax) {
            Screen.tempMin = Screen.tempMin - Screen.tempVelMax;
        } else if (Screen.tempMin < Screen.tempMinSP + 273.15 - Screen.tempVelMax) {
            Screen.tempMin = Screen.tempMin + Screen.tempVelMax;
        } else {
            Screen.tempMin = Screen.tempMinSP + 273.15;
        }
    }
    if (isNumber(Screen.tempMaxSP)) {
        if (Screen.tempMax > Screen.tempMaxSP + 273.15 + Screen.tempVelMax) {
            Screen.tempMax = Screen.tempMax - Screen.tempVelMax;
        } else if (Screen.tempMax < Screen.tempMaxSP + 273.15 - Screen.tempVelMax) {
            Screen.tempMax = Screen.tempMax + Screen.tempVelMax;
        } else {
            Screen.tempMax = Screen.tempMaxSP + 273.15;
        }
    }
    function isNumber(val) {
        return (val >= 0 || val < 0);
    }
}
function preload() {
    Background[0] = loadImage('Images/Background.png');
    Background[1] = loadImage('Images/Background_x.png');
    webButtons[0] = new WebButton([750, 0], loadImage('Images/ChangeGasComposition_A.jpg'), loadImage('Images/ChangeGasComposition_B.jpg'), loadImage('Images/ChangeGasComposition_C.jpg'));
    webButtons[1] = new WebButton([380, 620], loadImage('Images/Clear_A.jpg'), loadImage('Images/Clear_B.jpg'), loadImage('Images/Clear_C.jpg'));
    webButtons[2] = new WebButton([430, 230], loadImage('Images/Update_Gas_Composition_A.jpg'), loadImage('Images/Update_Gas_Composition_B.jpg'), loadImage('Images/Update_Gas_Composition_C.jpg'));
}
function setup() {
    createCanvas(Screen.XCanvas, Screen.YCanvas);
    SetupFlowStreamSimulator();
    ButtonsConfiguration();
    CreateTheXInputs();
    // DOM Inputs
    inpPressure = createInput(DryGas.Pressure.toString());
    inpPressure.size(40, 30);
    inpPressure.position(1100, 33);
    inpMinTemperarure = createInput(Screen.tempMinSP.toString());
    inpMinTemperarure.size(30, 15);
    inpMinTemperarure.position(21, 751);
    inpMaxTemperarure = createInput(Screen.tempMaxSP.toString());
    inpMaxTemperarure.size(30, 15);
    inpMaxTemperarure.position(1277, 751);
    inpMinEnthalpy = createInput(Screen.EnthalpyMinSP.toString());
    inpMinEnthalpy.size(33, 15);
    inpMinEnthalpy.position(1303, 716);
    inpMaxEnthalpy = createInput(Screen.EnthalpyMax.toString());
    inpMaxEnthalpy.size(33, 15);
    inpMaxEnthalpy.position(1303, 109);
    //// Air
    DryGas.addNitrogen(0.78);
    DryGas.addOxygen(.21);
    DryGas.addArgon(0.01);
    disappearTheDOMs(true);
    FromXToDOMs();
}
function draw() {
    MoveToTheRequestedRange();
    if (webButtons[0].activated) {
        image(Background[1], 0, 0);
        let SumOfComponents = 0;
        SumOfComponents += UpdateComponent(inpMethane);
        SumOfComponents += UpdateComponent(inpNitrogen);
        SumOfComponents += UpdateComponent(inpCarbonDioxide);
        SumOfComponents += UpdateComponent(inpEthane);
        SumOfComponents += UpdateComponent(inpPropane);
        SumOfComponents += UpdateComponent(inpIsoButane);
        SumOfComponents += UpdateComponent(inpnButane);
        SumOfComponents += UpdateComponent(inpIsopentane);
        SumOfComponents += UpdateComponent(inpnPentane);
        SumOfComponents += UpdateComponent(inpnHexane);
        SumOfComponents += UpdateComponent(inpnHeptane);
        SumOfComponents += UpdateComponent(inpnOctane);
        SumOfComponents += UpdateComponent(inpnNonane);
        SumOfComponents += UpdateComponent(inpnDecane);
        SumOfComponents += UpdateComponent(inpHydrogen);
        SumOfComponents += UpdateComponent(inpOxygen);
        SumOfComponents += UpdateComponent(inpCarbonMonoxide);
        SumOfComponents += UpdateComponent(inpHydrogenSulfide);
        SumOfComponents += UpdateComponent(inpHelium);
        SumOfComponents += UpdateComponent(inpArgon);
        push();
        textSize(25);
        textStyle(BOLD);
        fill([0, 0, 0]);
        if (SumOfComponents < 1.25) {
            text(SumOfComponents.toFixed(3), 575, 674);
        } else {
            text(SumOfComponents.toFixed(1), 575, 674);
        }
        pop();
    } else {
        image(Background[0], 0, 0);
        // Draw iso relative humidity
        let Old = {
            Temperature: 0,
            Enthalpy: 0,
            TemperatureScreen: map(Screen.tempMin, Screen.tempMin, Screen.tempMax, Screen.Xmin, Screen.Xmax),
            EnthalpyScreen: map(Screen.EnthalpyMax, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymin, Screen.Ymax)
        }
        let New = {
            TemperatureScreen: map(Screen.tempMin, Screen.tempMin, Screen.tempMax, Screen.Xmin, Screen.Xmax),
            EnthalpyScreen: map(Screen.EnthalpyMin, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymin, Screen.Ymax),
        }
        let Resolution = 100;
        for (let i = 0; i < Resolution; i++){
            WaterSaturation.Temperature = map(i, 0, Resolution - 1, Screen.tempMin, Screen.tempMax);
            WaterSaturation.EnthalpyVaporization = Vapor.GetEnthalpy(WaterSaturation.Temperature, 1, DryGas);
            // Draw
            New.TemperatureScreen = map(WaterSaturation.Temperature, Screen.tempMin, Screen.tempMax, Screen.Xmin, Screen.Xmax);
            New.EnthalpyScreen = map(WaterSaturation.EnthalpyVaporization, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymax, Screen.Ymin);
            line(Old.TemperatureScreen, Old.EnthalpyScreen, New.TemperatureScreen, New.EnthalpyScreen);
            //
            Old.TemperatureScreen = New.TemperatureScreen;
            Old.EnthalpyScreen = New.EnthalpyScreen;
        }
        if (mouseX > Screen.Xmin && mouseX < Screen.Xmax && mouseY > Screen.Ymin && mouseY < Screen.Ymax) {
            // Vapor where the mouse is.
            WaterOverMouse.Temperature = map(mouseX, Screen.Xmin, Screen.Xmax, Screen.tempMin, Screen.tempMax);
            WaterOverMouse.EnthalpyVaporization = map(mouseY, Screen.Ymin, Screen.Ymax, Screen.EnthalpyMax, Screen.EnthalpyMin);
            Screen.SelectedHumidity = Vapor.GetRelativeHumidity(WaterOverMouse.EnthalpyVaporization, WaterOverMouse.Temperature, DryGas)
            WaterOverMouse.DensityVapor = RegretionByPoints(WaterOverMouse.Temperature, Vapor.Temperature, Vapor.DensityVapor) * Screen.SelectedHumidity;
            WaterOverMouse.DewTemperature = Vapor.GetDewTemperature(WaterOverMouse.DensityVapor);
            WaterOverMouse.WetBulbTemperature = Vapor.GetWetBulbTemperature(WaterOverMouse.EnthalpyVaporization, DryGas);
            // Vapor if the Relative Humidity were 100%
            WaterSaturation.Temperature = WaterOverMouse.Temperature;
            WaterSaturation.Pressure = RegretionByPoints(WaterSaturation.Temperature, Vapor.Temperature, Vapor.Pressure);
            WaterSaturation.DensityVapor = RegretionByPoints(WaterSaturation.Temperature, Vapor.Temperature, Vapor.DensityVapor);
            WaterSaturation.molDensityVapor = RegretionByPoints(WaterOverMouse.Temperature, Vapor.Temperature, Vapor.molDensityVapor);
            // Gas without taking into account tha vapor content.
            DryGas.Temperature = WaterOverMouse.Temperature;
            DryGas.CalculateDensity(1);
            DryGas.MassDensity = DryGas.Density * DryGas.MolarMass;
            // Gas taking in account tha vapor content.
            AbsoluteMolarHumidity = WaterSaturation.molDensityVapor / DryGas.Density * Screen.SelectedHumidity;
            let AbsoluteMassHumidity = WaterOverMouse.DensityVapor / DryGas.MassDensity;
            WetGas = WetGasCalculations(DryGas, AbsoluteMolarHumidity);
            // Enthalpy
            let AirContributionToEntropy = DryGas.H / DryGas.MolarMass;
            // Vapor Enthalpy.
            let WaterContributionToEntropy = RegretionByPoints(WaterOverMouse.Temperature, Vapor.Temperature, Vapor.EnthalpyVaporization);
            // Balance
            Entropy = AirContributionToEntropy + WaterContributionToEntropy * AbsoluteMassHumidity;
            //
            if(Screen.SelectedHumidity < 0.995){
                aux = 115;
                text('Temperatura: ' + (WaterOverMouse.Temperature - 273.15).toFixed(2) + ' °C', 10, aux);aux += 20;
                text('Temperatura de rocío: ' + (WaterOverMouse.DewTemperature-273.15).toFixed(1) + '°C', 10, aux);aux += 20;
                text('Temperatura de bulbo húmedo: ' + (WaterOverMouse.WetBulbTemperature-273.15).toFixed(1) + '°C', 10, aux);aux += 20;
                text('Humedad Relativa: ' + (100 * Screen.SelectedHumidity).toFixed(1) + ' %', 10, aux);aux += 20;
                text('Humedad Absoluta: ' + (1000 * AbsoluteMassHumidity).toFixed(3) + ' g agua / kg gas seco', 10, aux);aux += 20;
                text('Humedad Absoluta Volumetrica: ' + WaterOverMouse.DensityVapor.toFixed(3) + ' kg Agua/m3', 10, aux);aux += 20;
                text('Humedad Absoluta Molar: ' + (AbsoluteMolarHumidity).toFixed(3) + '% mol agua / mol gas seco', 10, aux);aux += 20;
                text('Entalpia: ' + (WaterOverMouse.EnthalpyVaporization).toFixed(2) + ' kJ/kg gas seco', 10, aux);aux += 20;
                text('Entropia: ' + (Entropy).toFixed(2) + ' kJ/[kg gas seco K]', 10, aux);aux += 20;
                text('Presión: ' + WetGas.Pressure.toFixed(1) + ' kPa', 10, aux);aux += 20;
                text('Densidad: ' + WetGas.MassDensity.toFixed(3) + ' kg/m3', 10, aux);aux += 20;
                text('Velocidad del Sonido: ' + WetGas.SpeedOfSound.toFixed(2) + ' m/s', 10, aux);aux += 20;
                text('Composición: ', 10, aux);aux += 20;
                WriteElementIfExist('Metano', 1);
                WriteElementIfExist('Nitrogeno', 2);
                WriteElementIfExist('Dioxido de carbono', 3);
                WriteElementIfExist('Etano', 4);
                WriteElementIfExist('Propano', 5);
                WriteElementIfExist('Isobutano', 6);
                WriteElementIfExist('n-Butano', 7);
                WriteElementIfExist('Isopentano', 8);
                WriteElementIfExist('n-Pentano', 9);
                WriteElementIfExist('Hexano', 10);
                WriteElementIfExist('Heptano', 11);
                WriteElementIfExist('Octano', 12);
                WriteElementIfExist('Nonano', 13);
                WriteElementIfExist('Decano', 14);
                WriteElementIfExist('Hidrogeno', 15);
                WriteElementIfExist('Oxígeno', 16);
                WriteElementIfExist('Monoxido de carbono', 17);
                WriteElementIfExist('Sulfuro de hidrogeno', 19);
                WriteElementIfExist('Helio', 20);
                WriteElementIfExist('Argón', 21);
                AnimationsOverTheMouse();
            }
        }
    }
    UploadTheInputs();
    webButtons[0].drawMe();
    webButtons[1].drawMe();
    webButtons[2].drawMe();
}
function UploadTheInputs() {
    DryGas.Pressure = UpdateComponent(inpPressure);
    Screen.tempMinSP = UpdateComponent(inpMinTemperarure);
    Screen.tempMaxSP = UpdateComponent(inpMaxTemperarure);
    Screen.EnthalpyMinSP = UpdateComponent(inpMinEnthalpy);
    Screen.EnthalpyMaxSP = UpdateComponent(inpMaxEnthalpy);
}
function AnimationsOverTheMouse(){
    push();
    strokeWeight(2+SizeOfCircle*0.25);
    line(mouseX, mouseY, mouseX, Screen.YCanvas);
    pop();
    push();
    strokeWeight(2+(8-SizeOfCircle)*0.25);
    line(Screen.XCanvas, mouseY, mouseX, mouseY);
    pop();
    DrawIsoEntalphyCoolingLine();
    DrawIsoTemperatureCoolingLine();
    if(IsCircleIncreasing){
        SizeOfCircle += 0.1;
    }else{
        SizeOfCircle -= 0.1;
    }
    if (SizeOfCircle > 8){IsCircleIncreasing = false}
    if (SizeOfCircle < 0){IsCircleIncreasing = true }
    circle(mouseX, mouseY, 13 + SizeOfCircle);
    text((Screen.SelectedHumidity*100).toFixed(1) + ' %', mouseX + 10, mouseY - 10);
    text((WaterOverMouse.Temperature - 273.15).toFixed(2) + ' °C', mouseX + 10, Screen.YCanvas - 10);
    text(WaterOverMouse.EnthalpyVaporization.toFixed(3) + ' kJ/kg', Screen.XCanvas - 95, mouseY - 10);
    function DrawIsoTemperatureCoolingLine(){
        let Enthalpy = Vapor.GetEnthalpy(WaterOverMouse.Temperature, 1, DryGas);
        // Draw
        let YScreen = map(Enthalpy, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymax, Screen.Ymin);
        if((mouseY - YScreen) > (Screen.Ymax - Screen.Ymin)*0.05){
            push();
            strokeWeight(0.5);
            stroke(50,50,50+SizeOfCircle*8);
            line(mouseX, mouseY, mouseX, YScreen);
            line(mouseX, YScreen, Screen.Xmax, YScreen);
            fill(80);
            pop();
            text(Enthalpy.toFixed(3) + ' kJ/kg', Screen.XCanvas - 95, YScreen - 10);
            return;
        }
    }
    function DrawIsoEntalphyCoolingLine(){
        let XScreen = map(WaterOverMouse.WetBulbTemperature,Screen.tempMin,Screen.tempMax,Screen.Xmin,Screen.Xmax);
        if((mouseX-XScreen) > (Screen.Xmax-Screen.Xmin)*0.01){
            push();
            line(mouseX, mouseY, XScreen, mouseY);
            line(XScreen, mouseY, XScreen, Screen.Ymax);
            text((WaterOverMouse.WetBulbTemperature - 273.15).toFixed(2) + ' °C', XScreen - 55, Screen.Ymax - 10);
            pop();
        }
    }
}
function UpdateComponent(ComponentOfDOM) {
    if (ComponentOfDOM.value() == '') {
        return 0;
    }
    return parseFloat(ComponentOfDOM.value());
}
function WriteElementIfExist(Name, Position) {
    if (DryGas.x[Position] > 0) {
        text(Name + ': ' + (DryGas.x[Position] * 100).toFixed(2) + ' %', 20, aux);
        aux += 20;
    }
}
function mousePressed() {
    webButtons[0].checkIfThisClickIsForMe();
    webButtons[1].checkIfThisClickIsForMe();
    webButtons[2].checkIfThisClickIsForMe();
}
class WebButton {
    constructor(position, picture_standby, picture_mouseover, picture_pressed) {
        this.position = position;
        this.height = 0;
        this.width = 0;
        this.picture_standby = picture_standby;
        this.picture_mouseover = picture_mouseover;
        this.picture_pressed = picture_pressed;
        this.visible = true;
        this.activated = false;
        this.brothers = null;
        this.father = null;
        this.pressAndHold = false;
        this.favoriteSon = null;
        this.WhatShouldIDoAfterYouCallMe = null;
        this.AvoidDoubleClickProblemsOnMobiles = 0;
    }
    shouldIBeVisible() {
        if (this.father != null) {
            if (this.father.activated && this.father.visible) {
                this.visible = true;
                return;
            }
            this.visible = false;
        }
    }
    checkIfThisClickIsForMe() {
        if (this.AvoidDoubleClickProblemsOnMobiles == 0) {
            if (mouseX > this.position[0] && mouseX < this.position[0] + this.width) {
                if (mouseY > this.position[1] && mouseY < this.position[1] + this.height) {
                    this.activateMe();
                }
            }
        }
    }
    activateMe() {
        if (Array.isArray(this.brothers)) {
            for (let i = 0; i < this.brothers.length; i++) {
                this.brothers[i].activated = false;
            }
        } else if (this.brothers != null) { this.brothers.activated = false; }
        this.activated = !this.activated;
        this.activateMyFavoriteSon();
        if (this.WhatShouldIDoAfterYouCallMe != null) { this.WhatShouldIDoAfterYouCallMe() }
        this.AvoidDoubleClickProblemsOnMobiles = 15;
    }
    activateMyFavoriteSon() {
        if (this.favoriteSon != null && this.activated == true) {
            this.favoriteSon.activated = true;
            this.ShutUpMyNonFavoriteBrothers();
        }
    }
    ShutUpMyNonFavoriteBrothers() {
        if (Array.isArray(this.favoriteSon.brothers)) {
            for (let i = 0; i < this.favoriteSon.brothers.length; i++) {
                this.favoriteSon.brothers[i].activated = false;
            }
            return;
        }
        if (this.favoriteSon.brothers != null) {
            this.favoriteSon.brothers.activated = false;
            return;
        }
    }
    drawMe() {
        if (this.pressAndHold) { this.activated = false }
        if (this.AvoidDoubleClickProblemsOnMobiles > 0) { this.AvoidDoubleClickProblemsOnMobiles = this.AvoidDoubleClickProblemsOnMobiles - 1 }
        this.shouldIBeVisible();
        if (this.visible) {
            this.height = this.picture_standby.height;
            this.width = this.picture_standby.width;
            if (this.activated == true) { image(this.picture_pressed, this.position[0], this.position[1]); return }
            if (mouseX > this.position[0] && mouseX < this.position[0] + this.width) {
                if (mouseY > this.position[1] && mouseY < this.position[1] + this.height) {
                    if (mouseIsPressed) {
                        image(this.picture_pressed, this.position[0], this.position[1]); return;
                    }
                    image(this.picture_mouseover, this.position[0], this.position[1]); return;
                }
            }
            image(this.picture_standby, this.position[0], this.position[1]);
        }
    }
}
function ButtonsConfiguration() {
    webButtons[0].pressAndHold = false;
    webButtons[1].brothers = [webButtons[2]];
    webButtons[1].pressAndHold = true;
    webButtons[1].father = webButtons[0];
    webButtons[2].brothers = [webButtons[1]];
    webButtons[2].pressAndHold = true;
    webButtons[2].father = webButtons[0];
    webButtons[0].WhatShouldIDoAfterYouCallMe = function () {
        if (webButtons[0].activated) {
            disappearTheDOMs(false);
        } else {
            disappearTheDOMs(true);
        }

    }
    webButtons[1].WhatShouldIDoAfterYouCallMe = function () {
        DryGas.x = Array(22).fill(0);
        FromXToDOMs();
    }
    webButtons[2].WhatShouldIDoAfterYouCallMe = function () {
        FromDOMsToX();
        FromXToDOMs();
    }
}
function mouseWheel(event){
    let newPressure = (parseFloat(inpPressure.value()) - event.delta * 0.01).toFixed(2);
    inpMaxEnthalpy.value(Screen.EnthalpyMaxSP * newPressure / inpPressure.value());
    inpMinEnthalpy.value(Screen.EnthalpyMinSP * newPressure / inpPressure.value());
    inpPressure.value(newPressure);
}
function WetGasCalculations(Gas, MolarHumidity){
    NewGas = new FlowStream();
    NewGas.Temperature = Gas.Temperature;
    NewGas.Pressure = Gas.Pressure;
    NewGas.x[1] = Gas.x[1];
    NewGas.x[2] = Gas.x[2];
    NewGas.x[3] = Gas.x[3];
    NewGas.x[4] = Gas.x[4];
    NewGas.x[5] = Gas.x[5];
    NewGas.x[6] = Gas.x[6];
    NewGas.x[7] = Gas.x[7];
    NewGas.x[8] = Gas.x[8];
    NewGas.x[9] = Gas.x[9];
    NewGas.x[10] = Gas.x[10];
    NewGas.x[11] = Gas.x[11];
    NewGas.x[12] = Gas.x[12];
    NewGas.x[13] = Gas.x[13];
    NewGas.x[14] = Gas.x[14];
    NewGas.x[15] = Gas.x[15];
    NewGas.x[16] = Gas.x[16];
    NewGas.x[17] = Gas.x[17];
    NewGas.x[18] = Gas.x[18];
    NewGas.x[19] = Gas.x[19];
    NewGas.x[20] = Gas.x[20];
    NewGas.x[21] = Gas.x[21];
    NewGas.addWater(MolarHumidity * 0.01);
    let SumOfComponents = 0;
    for (let i = 1; i <= 21; i++){
        SumOfComponents += NewGas.x[i];
    }
    SumOfComponents = 1/SumOfComponents;
    for (let i = 1; i <= 21; i++){
        NewGas.x[i] = NewGas.x[i]*SumOfComponents;
    }
    NewGas.CalculateDensity(1);
    NewGas.MassDensity = NewGas.Density * NewGas.MolarMass;
    return NewGas;
}