let Background = [];
let webButtons = [];
class PointInChart {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.AbsoluteMolarHumidity = 0;
        this.AbsoluteMassHumidity = 0;
        this.SelectedHumidity = 0;
        this.Circle = {
            IsIncreasing: false,
            Size: Math.random() * 7
        }
        this.Water = new WaterProperties();
        this.DryGas = new FlowStream();
        this.WetGas = new FlowStream();
        this.WaterSaturation = new WaterProperties();
        this.Color = [0, 0, 0];
    }
    CalculateProperties() {
        // Vapor where the mouse is.
        this.Water.Temperature = map(this.mouseX, Screen.Xmin, Screen.Xmax, Screen.tempMin, Screen.tempMax);
        this.Water.EnthalpyVaporization = map(this.mouseY, Screen.Ymin, Screen.Ymax, Screen.EnthalpyMax, Screen.EnthalpyMin);
        this.SelectedHumidity = Vapor.GetRelativeHumidity(this.Water.EnthalpyVaporization, this.Water.Temperature, this.DryGas);
        this.Water.DensityVapor = RegretionByPoints(this.Water.Temperature, Vapor.Temperature, Vapor.DensityVapor) * this.SelectedHumidity;
        this.Water.DewTemperature = Vapor.GetDewTemperature(this.Water.DensityVapor);
        this.Water.WetBulbTemperature = Vapor.GetWetBulbTemperature(this.Water.EnthalpyVaporization, this.DryGas);
        // Vapor if the Relative Humidity were 100%
        this.WaterSaturation.Temperature = this.Water.Temperature;
        this.WaterSaturation.Pressure = RegretionByPoints(this.WaterSaturation.Temperature, Vapor.Temperature, Vapor.Pressure);
        this.WaterSaturation.DensityVapor = RegretionByPoints(this.WaterSaturation.Temperature, Vapor.Temperature, Vapor.DensityVapor);
        this.WaterSaturation.molDensityVapor = RegretionByPoints(this.WaterSaturation.Temperature, Vapor.Temperature, Vapor.molDensityVapor);
        // Gas without taking into account tha vapor content.
        this.DryGas.Temperature = this.Water.Temperature;
        this.DryGas.Pressure = MouseOver.DryGas.Pressure;
        this.DryGas.x = MouseOver.DryGas.x;
        this.DryGas.CalculateDensity(1);
        this.DryGas.MassDensity = this.DryGas.Density * this.DryGas.MolarMass;
        // Gas taking in account tha vapor content.
        this.AbsoluteMolarHumidity = this.WaterSaturation.molDensityVapor / this.DryGas.Density * this.SelectedHumidity;
        this.AbsoluteMassHumidity = this.Water.DensityVapor / this.DryGas.MassDensity;
        this.WetGas = WetGasCalculations(this.DryGas, this.AbsoluteMolarHumidity);
    }
}
let MouseOver = new PointInChart();
let AirInlet = new PointInChart();
let AirOutlet = new PointInChart();
let CoolingTowerCoefficient = 0;
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
    inpPressure = createInput(MouseOver.DryGas.Pressure.toString());
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
    MouseOver.DryGas.addNitrogen(0.78);
    MouseOver.DryGas.addOxygen(.21);
    MouseOver.DryGas.addArgon(0.01);
    //
    AirInlet.DryGas = MouseOver.DryGas.CopyAsValue();
    AirInlet.Water.Temperature = 290;
    AirInlet.Water.EnthalpyVaporization = 0;
    AirInlet.Color = [10, 30, 200];
    AirOutlet.DryGas = MouseOver.DryGas.CopyAsValue();
    AirOutlet.Water.Temperature = 310;
    AirOutlet.Water.EnthalpyVaporization = 60;
    AirOutlet.Color = [200, 30, 10];
    //
    AirOutlet.DryGas = MouseOver.DryGas.CopyAsValue();
    //
    disappearTheDOMs(true);
    FromXToDOMs(MouseOver);
}
function draw() {
    MoveToTheRequestedRange();
    AirInlet.mouseX = map(AirInlet.Water.Temperature, Screen.tempMin, Screen.tempMax, Screen.Xmin, Screen.Xmax),
    AirInlet.mouseY = map(AirInlet.Water.EnthalpyVaporization, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymax, Screen.Ymin),
    AirOutlet.mouseX = map(AirOutlet.Water.Temperature, Screen.tempMin, Screen.tempMax, Screen.Xmin, Screen.Xmax),
    AirOutlet.mouseY = map(AirOutlet.Water.EnthalpyVaporization, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymax, Screen.Ymin),
    MouseOver.mouseX = mouseX;
    MouseOver.mouseY = mouseY;
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
        DrawSaturationLine();
        AirInlet.CalculateProperties();
        AirOutlet.CalculateProperties();
        DrawAirEffects();
        if (mouseX > Screen.Xmin && mouseX < Screen.Xmax && mouseY > Screen.Ymin && mouseY < Screen.Ymax){
            MouseOver.CalculateProperties();
            DrawOverTheMouseEffects();
        }
    }
    UploadTheInputs();
    DraggingPointsArround();
    webButtons[0].drawMe();
    webButtons[1].drawMe();
    webButtons[2].drawMe();
}
function UploadTheInputs() {
    MouseOver.DryGas.Pressure = UpdateComponent(inpPressure);
    Screen.tempMinSP = UpdateComponent(inpMinTemperarure);
    Screen.tempMaxSP = UpdateComponent(inpMaxTemperarure);
    Screen.EnthalpyMinSP = UpdateComponent(inpMinEnthalpy);
    Screen.EnthalpyMaxSP = UpdateComponent(inpMaxEnthalpy);
}
function AnimationsOverTheMouse(Point) {
    push();
    strokeWeight(2 + Point.Circle.Size * 0.25);
    line(Point.mouseX, Point.mouseY, Point.mouseX, Screen.YCanvas);
    strokeWeight(2 + (8 - Point.Circle.Size) * 0.25);
    line(Screen.XCanvas, Point.mouseY, Point.mouseX, Point.mouseY);
    pop();
    if (Point.Circle.IsIncreasing) {
        Point.Circle.Size += 0.1;
    } else {
        Point.Circle.Size -= 0.1;
    }
    if (Point.Circle.Size > 8) { Point.Circle.IsIncreasing = false }
    if (Point.Circle.Size < 0) { Point.Circle.IsIncreasing = true }
    push();
    fill(Point.Color);
    circle(Point.mouseX, Point.mouseY, 13 + Point.Circle.Size);
    text((Point.SelectedHumidity * 100).toFixed(1) + ' %', Point.mouseX + 10, Point.mouseY - 10);
    text((Point.Water.Temperature - 273.15).toFixed(2) + ' °C', Point.mouseX + 10, Screen.YCanvas - 10);
    text(Point.Water.EnthalpyVaporization.toFixed(3) + ' kJ/kg', Screen.XCanvas - 95, Point.mouseY - 10);
    pop();
}
function DrawIsoTemperatureLine(Point) {
    let Enthalpy = Vapor.GetEnthalpy(Point.Water.Temperature, 1, Point.DryGas);
    // Draw
    let YScreen = map(Enthalpy, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymax, Screen.Ymin);
    if ((Point.mouseY - YScreen) > (Screen.Ymax - Screen.Ymin) * 0.05) {
        push();
        strokeWeight(0.5);
        stroke(Point.Color[0], Point.Color[1], Point.Color[2] + Point.Circle.Size * 8);
        line(Point.mouseX, Point.mouseY, Point.mouseX, YScreen);
        line(Point.mouseX, YScreen, Screen.Xmax, YScreen);
        pop();
        push();
        fill(Point.Color);
        text(Enthalpy.toFixed(3) + ' kJ/kg', Screen.XCanvas - 95, YScreen - 10);
        pop();
        return;
    }
}
function DrawIsoEntalphyCoolingLine(Point) {
    let XScreen = map(Point.Water.WetBulbTemperature, Screen.tempMin, Screen.tempMax, Screen.Xmin, Screen.Xmax);
    if ((Point.mouseX - XScreen) > (Screen.Xmax - Screen.Xmin) * 0.01) {
        push();
        stroke(Point.Color[0], Point.Color[1], Point.Color[2] + Point.Circle.Size * 8);
        line(Point.mouseX, Point.mouseY, XScreen, Point.mouseY);
        line(XScreen, Point.mouseY, XScreen, Screen.Ymax);
        pop();
        push();
        fill(Point.Color);
        text((Point.Water.WetBulbTemperature - 273.15).toFixed(2) + ' °C', XScreen - 55, Screen.Ymax - 10);
        pop();
    }
}
function DrawAirEffects() {
    DrawOperationalLine();
    DrawIsoEntalphyCoolingLine(AirInlet);
    DrawIsoTemperatureLine(AirInlet);
    AnimationsOverTheMouse(AirInlet);
    DrawIsoEntalphyCoolingLine(AirOutlet);
    DrawIsoTemperatureLine(AirOutlet);
    AnimationsOverTheMouse(AirOutlet);
    CalculateTowerCoefficient();
}
function CalculateTowerCoefficient() {
    let DeltaT = (AirOutlet.Water.Temperature - AirInlet.Water.Temperature);
    if (DeltaT > 1) {
        let Iterations = 50;
        let Resolutions = DeltaT / Iterations;
        let DeltaH = AirOutlet.Water.EnthalpyVaporization - AirInlet.Water.EnthalpyVaporization;
        let Initial = [AirInlet.Water.Temperature, AirInlet.Water.EnthalpyVaporization];
        let SlopeTimesRes = (DeltaH) / (DeltaT) * Resolutions;
        CoolingTowerCoefficient = 0;
        let SaturationEnthalpy = 0;
        let Final = [];
        for (let i = 0; i < Iterations; i++) {
            SaturationEnthalpy = Vapor.GetEnthalpy(Initial[0], 1, MouseOver.DryGas) - Initial[1];
            if(SaturationEnthalpy < 0){CoolingTowerCoefficient = 99999;return}
            Final = [Initial[0] + Resolutions, Initial[1] + SlopeTimesRes];
            CoolingTowerCoefficient += Resolutions * 1/(SaturationEnthalpy);
            Initial = Final;
        }
    }
}
function DrawOperationalLine() {
    let DeltaX = (AirOutlet.mouseX - AirInlet.mouseX);
    if (DeltaX > 1) {
        let Iterations = 5;
        let Resolutions = DeltaX / Iterations;
        let DeltaY = AirOutlet.mouseY - AirInlet.mouseY;
        let Initial = [AirInlet.mouseX, AirInlet.mouseY];
        let SlopeTimesRes = (DeltaY) / (DeltaX) * Resolutions;
        let Final = [];
        let Color = [];
        push();
        for (let i = 0; i < Iterations; i++) {
            Color[0] = map(i, 0, Iterations, AirInlet.Color[0], AirOutlet.Color[0]);
            Color[1] = map(i, 0, Iterations, AirInlet.Color[1], AirOutlet.Color[1]);
            Color[2] = map(i, 0, Iterations, AirInlet.Color[2], AirOutlet.Color[2]);
            stroke(Color);
            Final = [Initial[0] + Resolutions, Initial[1] + SlopeTimesRes];
            line(Initial[0], Initial[1], Final[0], Final[1]);
            Initial = Final;
        }
        pop();
    }
}
function DrawOverTheMouseEffects() {
    if (MouseOver.SelectedHumidity < 0.995) {
        let aux = 115;
        text('Temperature: ' + (MouseOver.Water.Temperature - 273.15).toFixed(2) + ' °C', 10, aux); aux += 20;
        text('Dew Temperature: ' + (MouseOver.Water.DewTemperature - 273.15).toFixed(1) + '°C', 10, aux); aux += 20;
        text('Wet bul Temperature: ' + (MouseOver.Water.WetBulbTemperature - 273.15).toFixed(1) + '°C', 10, aux); aux += 20;
        text('Relative Humidity: ' + (100 * MouseOver.SelectedHumidity).toFixed(1) + ' %', 10, aux); aux += 20;
        text('Absolute Humidity: ' + (1000 * MouseOver.AbsoluteMassHumidity).toFixed(3) + ' g water / kg dry gas', 10, aux); aux += 20;
        text('Enthalpy: ' + (MouseOver.Water.EnthalpyVaporization).toFixed(2) + ' kJ / kg dry gas', 10, aux); aux += 20;
        text('Pressure: ' + MouseOver.WetGas.Pressure.toFixed(1) + ' kPa', 10, aux); aux += 20;
        text('Density: ' + MouseOver.WetGas.MassDensity.toFixed(3) + ' kg/m3', 10, aux); aux += 20;
        text('Cooling Tower Coefficient: ' + CoolingTowerCoefficient.toFixed(2) + ' °C kg / KJ', 10, aux); aux += 20;
        text('Composition: ', 10, aux); aux += 20;
        WriteElementIfExist('Methane', 1);
        WriteElementIfExist('Nitrogen', 2);
        WriteElementIfExist('Carbon Dioxide', 3);
        WriteElementIfExist('Etane', 4);
        WriteElementIfExist('Propane', 5);
        WriteElementIfExist('Isobutane', 6);
        WriteElementIfExist('n-Butane', 7);
        WriteElementIfExist('Isopentane', 8);
        WriteElementIfExist('n-Pentane', 9);
        WriteElementIfExist('Hexane', 10);
        WriteElementIfExist('Heptane', 11);
        WriteElementIfExist('Octane', 12);
        WriteElementIfExist('Nonane', 13);
        WriteElementIfExist('Decane', 14);
        WriteElementIfExist('Hydrogen', 15);
        WriteElementIfExist('Oxigen', 16);
        WriteElementIfExist('Carbon monoxide', 17);
        WriteElementIfExist('Hydrogen sulphide', 19);
        WriteElementIfExist('Helium', 20);
        WriteElementIfExist('Argon', 21);
        function WriteElementIfExist(Name, Position) {
            if (MouseOver.DryGas.x[Position] > 0) {
                text(Name + ': ' + (MouseOver.DryGas.x[Position] * 100).toFixed(2) + ' %', 20, aux);
                aux += 20;
            }
        }
    }
}
function UpdateComponent(ComponentOfDOM) {
    if (ComponentOfDOM.value() == '') {
        return 0;
    }
    return parseFloat(ComponentOfDOM.value());
}
function mousePressed() {
    webButtons[0].checkIfThisClickIsForMe();
    webButtons[1].checkIfThisClickIsForMe();
    webButtons[2].checkIfThisClickIsForMe();
}
function DrawSaturationLine() {
    // Draw iso relative humidity
    let Old = {
        Temperature: 0,
        Enthalpy: 0,
        TemperatureScreen: map(Screen.tempMin, Screen.tempMin, Screen.tempMax, Screen.Xmin, Screen.Xmax),
        EnthalpyScreen: map(Screen.EnthalpyMax, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymin, Screen.Ymax)
    }
    let New = {
        TemperatureScreen: map(Screen.tempMin, Screen.tempMin, Screen.tempMax, Screen.Xmin, Screen.Xmax),
        EnthalpyScreen: map(Screen.EnthalpyMin, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymin, Screen.Ymax)
    }
    let Resolution = 100;
    let Temperature = 0;
    let Enthalpy = 0;
    for (let i = 0; i < Resolution; i++) {
        Temperature = map(i, 0, Resolution - 1, Screen.tempMin, Screen.tempMax);
        Enthalpy = Vapor.GetEnthalpy(Temperature, 1, MouseOver.DryGas);
        // Draw
        New.TemperatureScreen = map(Temperature, Screen.tempMin, Screen.tempMax, Screen.Xmin, Screen.Xmax);
        New.EnthalpyScreen = map(Enthalpy, Screen.EnthalpyMin, Screen.EnthalpyMax, Screen.Ymax, Screen.Ymin);
        line(Old.TemperatureScreen, Old.EnthalpyScreen, New.TemperatureScreen, New.EnthalpyScreen);
        //
        Old.TemperatureScreen = New.TemperatureScreen;
        Old.EnthalpyScreen = New.EnthalpyScreen;
    }
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
        MouseOver.DryGas.x = Array(22).fill(0);
        FromXToDOMs(MouseOver);
    }
    webButtons[2].WhatShouldIDoAfterYouCallMe = function () {
        FromDOMsToX(MouseOver);
        FromXToDOMs(MouseOver);
    }
}
function mouseWheel(event) {
    let newPressure = (parseFloat(inpPressure.value()) - event.delta * 0.01).toFixed(2);
    inpMaxEnthalpy.value(Screen.EnthalpyMaxSP * newPressure / inpPressure.value());
    inpMinEnthalpy.value(Screen.EnthalpyMinSP * newPressure / inpPressure.value());
    inpPressure.value(newPressure);
}
function WetGasCalculations(Gas, MolarHumidity) {
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
    for (let i = 1; i <= 21; i++) {
        SumOfComponents += NewGas.x[i];
    }
    SumOfComponents = 1 / SumOfComponents;
    for (let i = 1; i <= 21; i++) {
        NewGas.x[i] = NewGas.x[i] * SumOfComponents;
    }
    NewGas.CalculateDensity(1);
    NewGas.MassDensity = NewGas.Density * NewGas.MolarMass;
    return NewGas;
}
function DraggingPointsArround() {
    if (mouseIsPressed) {
        if (Math.abs(mouseX - AirInlet.mouseX) < 16 &&
            Math.abs(mouseY - AirInlet.mouseY) < 16) {
            AirInlet.mouseX = mouseX;
            AirInlet.mouseY = mouseY;
            AirInlet.CalculateProperties();
            return;
        }
        if (Math.abs(mouseX - AirOutlet.mouseX) < 16 &&
            Math.abs(mouseY - AirOutlet.mouseY) < 16) {
            AirOutlet.mouseX = mouseX;
            AirOutlet.mouseY = mouseY;
            AirOutlet.CalculateProperties();
            return;
        }
    }
}