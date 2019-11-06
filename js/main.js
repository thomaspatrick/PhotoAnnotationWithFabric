
// Beacon Annotation Demo
// uses fabric.js drawing library
// tpatrick 11/5/19

let canvasTarget;

let currentUrl;
let currentColor = '#FF0000';
let currentStrokeWidth = 6;
let currentShape = null;
let shapeToMake = 'rect';

// drag to create shapes
let preDragging = false;
let dragging = false;
let startX, startY;
let endX, endY;

// undo state
let state = [];
let mods = 0;

const dragHandleProps = {
    hasBorders: true,
    borderColor: 'white',
    strokeUniform: true,
    transparentCorners: false,
    cornerStrokeColor: 'white',
    cornerColor: '#082e5b',
    cornerStyle: 'circle',
    cornerSize: 24,
    lockRotation: true,
    hasRotatingPoint: false,
    noScaleCache: false,
};

function buildGenericProps(color, strokeSize, fromx, fromy, tox, toy) {
    const width = Math.abs(tox - fromx);
    const height = Math.abs(toy - fromy);

    return {
        left: fromx > tox ? tox : fromx,
        top: fromy > toy ? toy : fromy,
        width: width,
        height: height,
        originX: 'left',
        originY: 'top',
        strokeWidth: strokeSize,
        stroke: color,
        strokeUniform: true,
        fill: 'rgba(0,0,0,0)',
        angle: 0,
        scaleX: 1,
        scaleY: 1,
        selectable: true
    }
}

function buildArrowShapePoints(fromx, fromy, tox, toy) {
    const size = 15;  // arrow head size
    const angle = Math.atan2(toy - fromy, tox - fromx);
    const x1 = size * Math.cos(angle - Math.PI / 2);
    const y1 = size * Math.sin(angle - Math.PI / 2);
    const x2 = size * Math.cos(angle + Math.PI);
    const y2 = size * Math.sin(angle + Math.PI);
    return  [
        { // end of tail
            x: fromx,
            y: fromy
        }, { // where tail touches arrowhead
            x: tox + x2 ,
            y: toy + y2
        }, { // arrowhead corner
            x: tox + x2 + x1,
            y: toy + y2 + y1,
        }, { // arrowhead tip
            x: tox,
            y: toy
        }, { // other arrowhead corner
            x: tox + x2 - x1,
            y: toy + y2 - y1
        }, { // back to where tail touches arrowhead
            x: tox + x2,
            y: toy + y2
        }
    ];
}

function buildShape(fabricCanvas, type, color, strokeSize, fromx, fromy, tox, toy) {
    const props = buildGenericProps(color, strokeSize, fromx, fromy, tox, toy);

    let shapeCanRotate = false;

    let shape;
    switch(type) {
        case "arrow":
            const points = buildArrowShapePoints(fromx, fromy, tox, toy)
            shapeCanRotate = true;
            shape = new fabric.Polyline(points, {...props, fill: color, lockUniScaling: true});
            break;
        case "rect":
            shape = new fabric.Rect({...props, rx: 10, ry: 10});
        break;
        case "dotted-rect":
            shape = new fabric.Rect({...props, strokeDashArray: [10, 5], strokeWidth: 2, rx: 10, ry: 10});
        break;
        case "ellipse":
            const width = Math.abs(tox - fromx);
            const height = Math.abs(toy - fromy);
            shape = new fabric.Ellipse({...props, rx: width/2, ry: height/2});
        break;
        case "txt":
            shape = new fabric.Textbox("", {...props, fill: currentColor, fontSize: 32, padding: 7, strokeWidth: 1});
        break;
    }

    fabricCanvas.add(shape);

    shape.set(dragHandleProps);

    if(shapeCanRotate) {
        shape.set({ lockRotation: false, hasRotatingPoint: true });
    }

    fabricCanvas.renderAll();
    return shape;
}

function selectPhoto(url, clear) {
    currentUrl = url;

    fabric.Image.fromURL(url, (oImg) => {
        const ratio = Math.min(canvasTarget.width / oImg.width, canvasTarget.height / oImg.height);
        if(clear) canvasTarget.clear();
        canvasTarget.setBackgroundImage(oImg, canvasTarget.renderAll.bind(canvasTarget), {
            scaleX: ratio,
            scaleY: ratio,
            flipY: false
        });
    });
}

function trash() {
    selectPhoto(currentUrl, true);
}

function updateModifications() {
    state.push(JSON.stringify(canvasTarget));
    console.log('pushed modification on undo stack (len=' + state.length + ', mods=' + mods + ')');
}

function undo() {
    if (mods < state.length) {
        canvasTarget.clear();
        canvasTarget.loadFromJSON(state[state.length - 1 - mods - 1]);
        selectPhoto(currentUrl, false);
        mods += 1;
        console.log('changed mod value for undo stack (len=' + state.length + ', mods=' + mods + ')');
    }
}

function redo() {
    if (mods > 0) {
        canvasTarget.clear();
        canvasTarget.loadFromJSON(state[state.length - 1 - mods + 1]);
        selectPhoto(currentUrl, false);
        console.log('changed mod value for undo stack (len=' + state.length + ', mods=' + mods + ')');
        mods -= 1;
    }
}

function onSelectPhoto(e) {
    selectPhoto(e.target.value, true);
}

function setShapeColor(fabricCanvas, shape, color) {
    shape.set('stroke', currentColor);
    if(shape.type !== 'rect' && shape.type !== 'ellipse') {
        shape.set('fill', currentColor);
    }
    fabricCanvas.renderAll();
}

function resizeCanvasToWindow(fabricCanvas, url) {
    fabricCanvas.setWidth(document.documentElement.clientWidth);
    fabricCanvas.setHeight(document.documentElement.clientHeight);
    fabricCanvas.calcOffset();
    selectPhoto(url, false); // reload photo and dont clear (reload to recalc scaling)
}


function bindPageControls() {

    let chooser = $('#photo-select');
    chooser.append(new Option('Warehouse Racks', 'img/amazon_racks.jpg'));
    chooser.append(new Option('Package Robot', 'img/amazon_robot.jpg'));
    chooser.append(new Option('Stacked Wall', 'img/amazon_wall.jpg'));
    chooser.append(new Option('Package', 'img/amazon_pkg.jpg'));
    chooser.on('change', onSelectPhoto);

    $('#ellipse-btn').on('click', () => {
        shapeToMake = 'ellipse';
        radioButtonSelect(shapeToMake);
    });

    $('#rect-btn').on('click', () => {
        shapeToMake = 'rect';
        radioButtonSelect(shapeToMake);
    });

    $('#arrow-btn').on('click', () => {
        shapeToMake = 'arrow';
        radioButtonSelect(shapeToMake);
    });

    $('#txt-btn').on('click', () => {
        shapeToMake = 'txt';
        radioButtonSelect(shapeToMake);
    });

    $('#undo-btn').on('click', undo);
    $('#eraser-btn').on('click', trash);

    $('#download-btn').on('click', () => {
        exportCanvas(canvasTarget, currentUrl);
    });

    let colorpicker = $('#colorpicker');
    colorpicker.val(currentColor);
    colorpicker.on('input', () => {
        currentColor = colorpicker.val();
        const active = canvasTarget.getActiveObject();
        if(active) {
            setShapeColor(canvasTarget, active, currentColor);
        }
    });

    // backspace/del removes the active shape
    $('html').keyup(function(e){
        if(e.keyCode == 8) { // backspace or delete
            const activeObject = canvasTarget.getActiveObject();
            if(activeObject && !activeObject.isEditing) canvasTarget.remove(activeObject);
            updateModifications();
        }
    });

    // actively resize canvas to match window
    resizeCanvasToWindow(canvasTarget, currentUrl);
    window.addEventListener("resize", () => {
        resizeCanvasToWindow(canvasTarget, currentUrl);
    }, false);
}

$(document).ready(()=> {
    canvasTarget = new fabric.Canvas('photo-canvas');
    canvasTarget.selection = false;

    bindPageControls();
    selectPhoto('img/amazon_racks.jpg', true)
    radioButtonSelect(shapeToMake);

    canvasTarget.on('mouse:down', function() {
        if(!canvasTarget.getActiveObject()) {
            const pointer = canvasTarget.getPointer(event.e);
            startX = pointer.x;
            startY = pointer.y;
            preDragging = true;
            dragging = false;
        }
    });

    canvasTarget.on('mouse:move', function () {
        if(currentShape) canvasTarget.remove(currentShape);
        if(preDragging && !canvasTarget.getActiveObject()) {
            const pointer = canvasTarget.getPointer(event.e);
            if (preDragging && distance(pointer.x, pointer.y, startX, startY) > 50) dragging = true;
            if (dragging) {
                endX = pointer.x;
                endY = pointer.y;

                // when dragging the initial outline of a text, replace with a dotted-rect
                const dragShape = (shapeToMake === 'txt') ? 'dotted-rect' : shapeToMake;
                currentShape = buildShape(canvasTarget, dragShape, currentColor, currentStrokeWidth, startX, startY, endX, endY);
            }
        }
    });

    canvasTarget.on('mouse:up', function() {
        if(currentShape) canvasTarget.remove(currentShape);
        if(!canvasTarget.getActiveObject() && dragging) {
            const pointer = canvasTarget.getPointer(event.e);
            endX = pointer.x;
            endY = pointer.y;

            let shape = buildShape(canvasTarget, shapeToMake, currentColor, currentStrokeWidth, startX, startY, endX, endY);
            if(shape) {
                // begin editing brand new textbox
                if(shapeToMake == 'txt') {
                    shape.enterEditing();
                }

                updateModifications();
                canvasTarget.setActiveObject(shape);
                canvasTarget.requestRenderAll();
            }
            currentShape = null;
        }
        dragging = preDragging = false;
    });

    canvasTarget.on(
        'object:modified', function () {
            updateModifications();
        });
});
