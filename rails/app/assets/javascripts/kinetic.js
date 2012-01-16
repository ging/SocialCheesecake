/**
 * KineticJS JavaScript Library v3.5.2
 * http://www.kineticjs.com/
 * Copyright 2012, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Jan 14 2012
 *
 * Copyright (C) 2012 by Eric Rowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Kinetic = {};

/****************************************
 * Layer
 */
Kinetic.Layer = function(stage, isInvisible){
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = stage.width;
    this.canvas.height = stage.height;
    this.canvas.style.position = 'absolute';
    this.shapes = [];
    
    if (isInvisible) {
        var that = this;
        this.context.stroke = function(){
        };
        this.context.fill = function(){
        };
        this.context.fillRect = function(x, y, width, height){
            that.context.rect(x, y, width, height);
        };
        this.context.strokeRect = function(x, y, width, height){
            that.context.rect(x, y, width, height);
        };
        this.context.drawImage = function(){
        };
        this.context.fillText = function(){
        };
        this.context.strokeText = function(){
        };
    }
    
    stage.container.appendChild(this.canvas);
}
/*
 * clear layer
 */
Kinetic.Layer.prototype.clear = function(){
    var context = this.getContext();
    var canvas = this.getCanvas();
    context.clearRect(0, 0, canvas.width, canvas.height);
}
/*
 * get layer canvas
 */
Kinetic.Layer.prototype.getCanvas = function(){
    return this.canvas;
}
/*
 * get layer context
 */
Kinetic.Layer.prototype.getContext = function(){
    return this.context;
}
/*
 * get layer shapes
 */
Kinetic.Layer.prototype.getShapes = function(){
    return this.shapes;
}
/*
 * draw all shapes in layer
 */
Kinetic.Layer.prototype.draw = function(){
    this.clear();
    var context = this.getContext();
    
    for (var n = 0; n < this.getShapes().length; n++) {
        this.getShapes()[n].draw(this);
    }
};
/*
 * set zIndices
 */
Kinetic.Layer.prototype.setIndices = function(){
    var shapes = this.getShapes();
    
    for (var n = 0; n < shapes.length; n++) {
        shapes[n].index = n;
    }
};
/****************************************
 * Stage
 */
Kinetic.Stage = function(containerId, width, height){
    this.container = document.getElementById(containerId);
    this.width = width;
    this.height = height;
    this.scale = {
        x: 1,
        y: 1
    }
    this.idCounter = 0;
    this.dblClickWindow = 400;
    this.targetShape = {};
    this.clickStart = false;
    
    // desktop flags
    this.mousePos = null;
    this.mouseDown = false;
    this.mouseUp = false;
    
    // mobile flags
    this.touchPos = null;
    this.touchStart = false;
    this.touchEnd = false;
    
    /*
     * Layer roles
     *
     * buffer - canvas compositing
     * backstage - path detection
     * stage - classic canvas drawings with no shapes
     * background - static shapes without event listeners
     * props - static shapes with event listeners
     * extras - moveable shapes without event listeners
     * actors - moveable shapes with event listeners
     */
    var that = this;
    this.layers = {
        buffer: new Kinetic.Layer(that),
        backstage: new Kinetic.Layer(that, true),
        stage: new Kinetic.Layer(that),
        background: new Kinetic.Layer(that),
        props: new Kinetic.Layer(that),
        extras: new Kinetic.Layer(that),
        actors: new Kinetic.Layer(that)
    };
    
    this.layers.buffer.getCanvas().style.display = 'none';
    this.layers.backstage.getCanvas().style.display = 'none';
    this.listen();
    
    this.addEventListener("mouseout", function(evt){
        that.shapeDragging = undefined;
    }, false);
    
    /*
     * prepare drag and drop
     */
    var types = [{
        end: "mouseup",
        move: "mousemove"
    }, {
        end: "touchend",
        move: "touchmove"
    }];
    
    for (var n = 0; n < types.length; n++) {
        var pubType = types[n];
        (function(){
            var type = pubType;
            that.on(type.move, function(evt){
                if (that.shapeDragging) {
                    // execute user defined ondragend if defined
                    var dragmove = that.shapeDragging.eventListeners.ondragmove;
                    if (dragmove) {
                        var events = dragmove;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(that.shapeDragging, [evt]);
                        }
                    }
                    
                    var pos = type.move == "mousemove" ? that.getMousePosition() : that.getTouchPosition();
                    if (that.shapeDragging.drag.x) {
                        that.shapeDragging.x = pos.x - that.shapeDragging.offset.x;
                    }
                    if (that.shapeDragging.drag.y) {
                        that.shapeDragging.y = pos.y - that.shapeDragging.offset.y;
                    }
                    that.layers.actors.draw();
                }
            }, false);
            that.on(type.end, function(evt){
                // execute user defined ondragend if defined
                if (that.shapeDragging) {
                    var dragend = that.shapeDragging.eventListeners.ondragend;
                    if (dragend) {
                        var events = dragend;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(that.shapeDragging, [evt]);
                        }
                    }
                }
                that.shapeDragging = undefined;
            });
        })();
    }
    
    this.on("touchend", function(evt){
        // execute user defined ondragend if defined
        if (that.shapeDragging) {
            var dragend = that.shapeDragging.eventListeners.ondragend;
            if (dragend) {
                var events = dragend;
                for (var i = 0; i < events.length; i++) {
                    events[i].func.apply(that.shapeDragging, [evt]);
                }
            }
        }
        that.shapeDragging = undefined;
    });
};
/*
 * get layer by name
 */
Kinetic.Stage.prototype.getLayer = function(layer){
    return this.layers[layer];
};
/*
 * set stage size
 */
Kinetic.Stage.prototype.setSize = function(width, height){
    var layers = this.layers;
    for (var key in layers) {
        var layer = layers[key];
        layer.getCanvas().width = width;
        layer.getCanvas().height = height;
        layer.draw();
    }
};
/*
 * scale stage
 */
Kinetic.Stage.prototype.setScale = function(scaleX, scaleY){
    if (scaleY) {
        this.scale.x = scaleX;
        this.scale.y = scaleY;
    }
    else {
        this.scale.x = scaleX;
        this.scale.y = scaleX;
    }
};
/*
 * Composite toDataURL
 */
Kinetic.Stage.prototype.toDataURL = function(callback){
    var bufferLayer = this.layers.buffer;
    var bufferContext = bufferLayer.getContext();
    var stageLayer = this.layers.stage;
    var propsLayer = this.layers.props;
    var actorsLayer = this.layers.actors;
    var layers = [stageLayer, propsLayer, actorsLayer];
    
    function addLayer(n){
        var dataURL = layers[n].getCanvas().toDataURL();
        var imageObj = new Image();
        imageObj.onload = function(){
            bufferContext.drawImage(this, 0, 0);
            n++;
            if (n < layers.length) {
                addLayer(n);
            }
            else {
                callback(bufferLayer.getCanvas().toDataURL());
            }
        };
        imageObj.src = dataURL;
    }
    
    
    bufferLayer.clear();
    addLayer(0);
};
Kinetic.Stage.prototype.clear = function(){
    this.layers.stage.clear();
};
/*
 * draw shapes
 */
Kinetic.Stage.prototype.draw = function(){
    this.layers.background.draw();
    this.layers.props.draw();
    this.layers.extras.draw();
    this.layers.actors.draw();
};
/*
 * remove a shape from the stage
 */
Kinetic.Stage.prototype.remove = function(shape){
    // remove from shapes array
    var layer = shape.getLayer();
    var shapes = layer.getShapes();
    for (var n = 0; n < shapes.length; n++) {
        var id = shapes[n].id;
        if (id == shape.id) {
            shape.getLayer().getShapes().splice(n, 1);
        }
    }
    
    layer.setIndices();
};
/*
 * remove all shapes from the stage
 */
Kinetic.Stage.prototype.removeShapes = function(){
    // remove all shapes
    this.layers.background.shapes = [];
    this.layers.props.shapes = [];
    this.layers.extras.shapes = [];
    this.layers.actors.shapes = [];
};
/*
 * get stage canvas
 */
Kinetic.Stage.prototype.getCanvas = function(){
    return this.layers.stage.getCanvas();
};
/*
 * get stage context
 */
Kinetic.Stage.prototype.getContext = function(){
    return this.layers.stage.getContext();
};
/*
 * short-hand add event listener to stage (which is essentially
 * the container DOM)
 */
Kinetic.Stage.prototype.on = function(type, func){
    this.container.addEventListener(type, func);
};
/*
 * long-hand add event listener to stage (which is essentially
 * the container DOM)
 */
Kinetic.Stage.prototype.addEventListener = function(type, func){
    this.on(type, func);
};
/* 
 * add shape to stage
 */
Kinetic.Stage.prototype.add = function(shape){
    shape.stage = this;
    shape.layer = this.layers[shape.layerKey];
    shape.layer.shapes.push(shape);
    shape.index = shape.layer.shapes.length - 1;
    shape.id = this.idCounter++;
    shape.draw(shape.layer);
};
/*
 * handle incoming event
 */
Kinetic.Stage.prototype.handleEvent = function(evt){
    if (!evt) {
        evt = window.event;
    }
    
    this.setMousePosition(evt);
    this.setTouchPosition(evt);
    
    var backstageLayer = this.layers.backstage;
    var backstageLayerContext = backstageLayer.getContext();
    var that = this;
    
    backstageLayer.clear();
    
    for (var n = this.getEventShapes().length - 1; n >= 0; n--) {
        var pubShape = this.getEventShapes()[n];
        (function(){
            var shape = pubShape;
            shape.draw(backstageLayer);
            var pos = that.getUserPosition();
            var el = shape.eventListeners;
            
            if (shape.visible && pos !== null && backstageLayerContext.isPointInPath(pos.x, pos.y)) {
                // handle onmousedown
                if (that.mouseDown) {
                    that.mouseDown = false;
                    that.clickStart = true;
                    
                    if (el.onmousedown) {
                        var events = el.onmousedown;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(shape, [evt]);
                        }
                    }
                    n = -1;
                }
                // handle onmouseup & onclick
                else if (that.mouseUp) {
                    that.mouseUp = false;
                    if (el.onmouseup) {
                        var events = el.onmouseup;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(shape, [evt]);
                        }
                    }
                    
                    // detect if click or double click occurred
                    if (that.clickStart) {
                        if (el.onclick) {
                            var events = el.onclick;
                            for (var i = 0; i < events.length; i++) {
                                events[i].func.apply(shape, [evt]);
                            }
                        }
                        
                        if (el.ondblclick && shape.inDoubleClickWindow) {
                            var events = el.ondblclick;
                            for (var i = 0; i < events.length; i++) {
                                events[i].func.apply(shape, [evt]);
                            }
                        }
                        
                        shape.inDoubleClickWindow = true;
                        
                        setTimeout(function(){
                            shape.inDoubleClickWindow = false;
                        }, that.dblClickWindow);
                    }
                    n = -1;
                }
                
                // handle touchstart
                else if (that.touchStart) {
                    that.touchStart = false;
                    if (el.touchstart) {
                        var events = el.touchstart;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(shape, [evt]);
                        }
                    }
                    
                    if (el.ondbltap && shape.inDoubleClickWindow) {
                        var events = el.ondbltap;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(shape, [evt]);
                        }
                    }
                    
                    shape.inDoubleClickWindow = true;
                    
                    setTimeout(function(){
                        shape.inDoubleClickWindow = false;
                    }, that.dblClickWindow);
                    n = -1;
                }
                
                // handle touchend
                else if (that.touchEnd) {
                    that.touchEnd = false;
                    if (el.touchend) {
                        var events = el.touchend;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(shape, [evt]);
                        }
                    }
                    n = -1;
                }
                
                // handle touchmove
                else if (el.touchmove) {
                    var events = el.touchmove;
                    for (var i = 0; i < events.length; i++) {
                        events[i].func.apply(shape, [evt]);
                    }
                    n = -1;
                }
                
                /*
                 * this condition is used to identify a new target shape.
                 * A new target shape occurs if a target shape is not defined or
                 * if the current shape is different from the current target shape and
                 * the current shape is beneath the target
                 */
                else if (that.targetShape.id === undefined || (that.targetShape.id != shape.id && that.targetShape.getZIndex() < shape.getZIndex())) {
                    /*
                     * check if old target has an onmouseout event listener
                     */
                    var oldEl = that.targetShape.eventListeners;
                    if (oldEl && oldEl.onmouseout) {
                        var events = oldEl.onmouseout;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(shape, [evt]);
                        }
                    }
                    
                    // set new target shape
                    that.targetShape = shape;
                    
                    // handle onmouseover
                    if (el.onmouseover) {
                        var events = el.onmouseover;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(shape, [evt]);
                        }
                    }
                    n = -1;
                }
                
                // handle onmousemove
                else if (el.onmousemove) {
                    var events = el.onmousemove;
                    for (var i = 0; i < events.length; i++) {
                        events[i].func.apply(shape, [evt]);
                    }
                    n = -1;
                }
            }
            // handle mouseout condition
            else if (that.targetShape.id == shape.id) {
                that.targetShape = {};
                if (el.onmouseout) {
                    var events = el.onmouseout;
                    for (var i = 0; i < events.length; i++) {
                        events[i].func.apply(shape, [evt]);
                    }
                }
                n = -1;
            }
        }());
    }
};
/*
 * begin listening for events by adding event handlers
 * to the container
 */
Kinetic.Stage.prototype.listen = function(){
    var that = this;
    
    // desktop events
    this.container.addEventListener("mousedown", function(evt){
        that.mouseDown = true;
        that.handleEvent(evt);
    }, false);
    
    this.container.addEventListener("mousemove", function(evt){
        that.mouseUp = false;
        that.mouseDown = false;
        that.handleEvent(evt);
    }, false);
    
    this.container.addEventListener("mouseup", function(evt){
        that.mouseUp = true;
        that.mouseDown = false;
        that.handleEvent(evt);
        
        that.clickStart = false;
    }, false);
    
    this.container.addEventListener("mouseover", function(evt){
        that.handleEvent(evt);
    }, false);
    
    this.container.addEventListener("mouseout", function(evt){
        that.mousePos = null;
    }, false);
    // mobile events
    this.container.addEventListener("touchstart", function(evt){
        evt.preventDefault();
        that.touchStart = true;
        that.handleEvent(evt);
    }, false);
    
    this.container.addEventListener("touchmove", function(evt){
        evt.preventDefault();
        that.handleEvent(evt);
    }, false);
    
    this.container.addEventListener("touchend", function(evt){
        evt.preventDefault();
        that.touchEnd = true;
        that.handleEvent(evt);
    }, false);
};
/*
 * get mouse position for desktop apps
 */
Kinetic.Stage.prototype.getMousePosition = function(evt){
    return this.mousePos;
};
/*
 * get touch position for mobile apps
 */
Kinetic.Stage.prototype.getTouchPosition = function(evt){
    return this.touchPos;
};
/*
 * get user position (mouse position or touch position)
 *
 */
Kinetic.Stage.prototype.getUserPosition = function(evt){
    return this.getTouchPosition() || this.getMousePosition();
};
/*
 * set mouse positon for desktop apps
 */
Kinetic.Stage.prototype.setMousePosition = function(evt){
    var mouseX = evt.clientX - this.getContainerPosition().left + window.pageXOffset;
    var mouseY = evt.clientY - this.getContainerPosition().top + window.pageYOffset;
    this.mousePos = {
        x: mouseX,
        y: mouseY
    };
};
/*
 * set touch position for mobile apps
 */
Kinetic.Stage.prototype.setTouchPosition = function(evt){
    if (evt.touches !== undefined && evt.touches.length == 1) {// Only deal with
        // one finger
        var touch = evt.touches[0];
        // Get the information for finger #1
        var touchX = touch.clientX - this.getContainerPosition().left + window.pageXOffset;
        var touchY = touch.clientY - this.getContainerPosition().top + window.pageYOffset;
        
        this.touchPos = {
            x: touchX,
            y: touchY
        };
    }
};
/*
 * get container position
 */
Kinetic.Stage.prototype.getContainerPosition = function(){
    var obj = this.container;
    var top = 0;
    var left = 0;
    while (obj && obj.tagName != "BODY") {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }
    return {
        top: top,
        left: left
    };
};
/*
 * get container DOM element
 */
Kinetic.Stage.prototype.getContainer = function(){
    return this.container;
};
/*
 * get event shapes
 */
Kinetic.Stage.prototype.getEventShapes = function(){
    return (this.layers.props.shapes).concat(this.layers.actors.shapes);
};
/*
 * get all shapes
 */
Kinetic.Stage.prototype.getShapes = function(){
    return (this.layers.background.shapes).concat(this.layers.props.shapes, this.layers.extras.shapes, this.layers.actors.shapes);
};
/*
 * move all shapes from layer1 to a layer2
 */
Kinetic.Stage.prototype.moveShapes = function(fromLayerKey, toLayerKey){
    var fromLayer = this.layers[fromLayerKey];
    var toLayer = this.layers[toLayerKey];
    
    var shapes = fromLayer.shapes;
    for (var n = 0; n < shapes.length; n++) {
        shapes[n].layer = toLayer;
    }
    
    toLayer.shapes = (toLayer.shapes).concat(fromLayer.shapes);
    fromLayer.shapes = [];
    toLayer.setIndices();
};
/****************************************
 * Shape
 */
Kinetic.Shape = function(drawFunc, layerType){
    this.drawFunc = drawFunc;
    if (layerType) {
        this.layerKey = layerType;
        /*
         * if layer type is "prop", "extra", or "actor"
         * then make it plural
         */
        if (layerType != "background") {
            this.layerKey += "s";
        }
    }
    else {
        this.layerKey = "actors";
    }
    
    this.x = 0;
    this.y = 0;
    this.scale = {
        x: 1,
        y: 1
    };
    this.rotation = 0;
    // radians
    // store state for next clear
    this.lastX = 0;
    this.lastY = 0;
    this.lastRotation = 0;
    // radians
    this.lastScale = {
        x: 1,
        y: 1
    };
    
    this.eventListeners = {};
    this.visible = true;
    this.drag = {
        x: false,
        y: false
    };
};
/*
 * get shape temp layer context
 */
Kinetic.Shape.prototype.getContext = function(){
    return this.tempLayer.getContext();
};
/*
 * get shape temp layer canvas
 */
Kinetic.Shape.prototype.getCanvas = function(){
    return this.tempLayer.getCanvas();
};
/*
 * get stage
 */
Kinetic.Shape.prototype.getStage = function(){
    return this.stage;
};
/*
 * draw shape
 */
Kinetic.Shape.prototype.draw = function(layer){
    if (this.visible) {
        var stage = this.getStage();
        var context = layer.getContext();
        
        // layer transform
        context.save();
        if (stage.scale.x != 1 || stage.scale.y != 1) {
            context.scale(stage.scale.x, stage.scale.y);
        }
        
        // shape transform
        context.save();
        if (this.x !== 0 || this.y !== 0) {
            context.translate(this.x, this.y);
        }
        if (this.rotation !== 0) {
            context.rotate(this.rotation);
        }
        if (this.scale.x != 1 || this.scale.y != 1) {
            context.scale(this.scale.x, this.scale.y);
        }
        
        this.tempLayer = layer;
        this.drawFunc.call(this);
        
        context.restore();
        context.restore();
    }
};
/*
 * initialize drag and drop
 */
Kinetic.Shape.prototype.initDrag = function(){
    var that = this;
    var types = ["mousedown", "touchstart"];
    
    for (var n = 0; n < types.length; n++) {
        var pubType = types[n];
        (function(){
            var type = pubType;
            that.on(type + ".initdrag", function(evt){
                var stage = that.getStage();
                var pos = stage.getUserPosition();
                
                if (pos) {
                    stage.shapeDragging = that;
                    stage.shapeDragging.offset = {};
                    stage.shapeDragging.offset.x = pos.x - that.x;
                    stage.shapeDragging.offset.y = pos.y - that.y;
                    
                    // execute dragstart events if defined
                    var dragstart = that.eventListeners.ondragstart;
                    if (dragstart) {
                        var events = dragstart;
                        for (var i = 0; i < events.length; i++) {
                            events[i].func.apply(that, [evt]);
                        }
                    }
                }
            });
        })();
    }
};
/*
 * remove drag and drop event listener
 */
Kinetic.Shape.prototype.dragCleanup = function(){
    if (!this.drag.x && !this.drag.y) {
        this.off("mousedown.initdrag");
        this.off("touchstart.initdrag");
    }
};
/*
 * enable/disable drag and drop for box x and y direction
 */
Kinetic.Shape.prototype.draggable = function(setDraggable){
    if (setDraggable) {
        var needInit = !this.drag.x && !this.drag.y;
        this.drag = {
            x: true,
            y: true
        };
        if (needInit) {
            this.initDrag();
        }
    }
    else {
        this.drag = {
            x: false,
            y: false
        };
        this.dragCleanup();
    }
};
/*
 * enable/disable drag and drop for x only
 */
Kinetic.Shape.prototype.draggableX = function(setDraggable){
    if (setDraggable) {
        var needInit = !this.drag.x && !this.drag.y;
        this.drag.x = true;
        if (needInit) {
            this.initDrag();
        }
    }
    else {
        this.drag.x = false;
        this.dragCleanup();
    }
};
/*
 * enable/disable drag and drop for y only
 */
Kinetic.Shape.prototype.draggableY = function(setDraggable){
    if (setDraggable) {
        var needInit = !this.drag.x && !this.drag.y;
        this.drag.y = true;
        if (needInit) {
            this.initDrag();
        }
    }
    else {
        this.drag.y = false;
        this.dragCleanup();
    }
};
/*
 * get zIndex
 */
Kinetic.Shape.prototype.getZIndex = function(){
    return this.index;
};
/*
 * set shape scale
 */
Kinetic.Shape.prototype.setScale = function(scaleX, scaleY){
    if (scaleY) {
        this.scale.x = scaleX;
        this.scale.y = scaleY;
    }
    else {
        this.scale.x = scaleX;
        this.scale.y = scaleX;
    }
};
/*
 * move shape to position
 */
Kinetic.Shape.prototype.setPosition = function(x, y){
    this.x = x;
    this.y = y;
};
/*
 * get shape position
 */
Kinetic.Shape.prototype.getPosition = function(){
    return {
        x: this.x,
        y: this.y
    };
};
/*
 * move shape by amount
 */
Kinetic.Shape.prototype.move = function(x, y){
    this.x += x;
    this.y += y;
};
/*
 * set shape rotation
 */
Kinetic.Shape.prototype.setRotation = function(theta){
    this.rotation = theta;
};
/*
 * rotate shape by amount
 */
Kinetic.Shape.prototype.rotate = function(theta){
    this.rotation += theta;
};
/*
 * short-hand add event listener to shape
 */
Kinetic.Shape.prototype.on = function(typesStr, func){
    var types = typesStr.split(" ");
    /*
     * loop through types and attach event listeners to
     * each one.  eg. "click mouseover.namespace mouseout"
     * will create three event bindings
     */
    for (var n = 0; n < types.length; n++) {
        var type = types[n];
        var event = (type.indexOf('touch') == -1) ? 'on' + type : type;
        var parts = event.split(".");
        var baseEvent = parts[0];
        var name = parts.length > 1 ? parts[1] : "";
        
        if (!this.eventListeners[baseEvent]) {
            this.eventListeners[baseEvent] = [];
        }
        
        this.eventListeners[baseEvent].push({
            name: name,
            func: func
        });
    }
};
/*
 * long-hand add event listener to shape
 */
Kinetic.Shape.prototype.addEventListener = function(type, func){
    this.on(type, func);
};
/*
 * short-hand remove event listener(s)
 */
Kinetic.Shape.prototype.off = function(type){
    var event = (type.indexOf('touch') == -1) ? 'on' + type : type;
    var parts = event.split(".");
    var baseEvent = parts[0];
    
    if (this.eventListeners[baseEvent] && parts.length > 1) {
        var name = parts[1];
        
        for (var i = 0; i < this.eventListeners[baseEvent].length; i++) {
            if (this.eventListeners[baseEvent][i].name == name) {
                this.eventListeners[baseEvent].splice(i, 1);
                if (this.eventListeners[baseEvent].length == 0) {
                    this.eventListeners[baseEvent] = undefined;
                }
                break;
            }
        }
    }
    else {
        this.eventListeners[baseEvent] = undefined;
    }
};
/*
 * long-hand remove event listener(s)
 */
Kinetic.Shape.prototype.removeEventListener = function(type){
    this.off(type);
};
/*
 * show shape
 */
Kinetic.Shape.prototype.show = function(){
    this.visible = true;
};
/*
 * hide shape
 */
Kinetic.Shape.prototype.hide = function(){
    this.visible = false;
};
/*
 * move shape to top
 */
Kinetic.Shape.prototype.moveToTop = function(){
    var stage = this.stage;
    var index = this.index;
    this.layer.shapes.splice(index, 1);
    this.layer.shapes.push(this);
    this.layer.setIndices();
};
/*
 * get shape layer
 */
Kinetic.Shape.prototype.getLayer = function(){
    return this.layer;
};
/*
 * move shape to layer
 */
Kinetic.Shape.prototype.moveToLayer = function(layerKey){
    var stage = this.stage;
    var index = this.index;
    this.layer.shapes.splice(index, 1);
    stage.layers[layerKey].shapes.push(this);
    this.layer = stage.layers[layerKey];
    this.index = this.layer.shapes.length - 1;
    this.layer.setIndices();
    stage.layers[layerKey].setIndices();
};
/****************************************
 * Image constructor
 */
Kinetic.Image = function(config, layerType){
    this.image = config.image;
    
    var x = config.x ? config.x : 0;
    var y = config.y ? config.y : 0;
    var width = config.width ? config.width : config.image.width;
    var height = config.height ? config.height : config.image.height;
    
    var drawImage = function(){
        var context = this.getContext();
        context.drawImage(this.image, x, y, width, height);
        context.beginPath();
        context.rect(x, y, width, height);
        context.closePath();
    };
    var shape = new Kinetic.Shape(drawImage, layerType);
    
    /*
     * copy shape methods and properties to
     * Image object
     */
    for (var key in shape) {
        this[key] = shape[key];
    }
};

/*
 * set Image image
 */
Kinetic.Image.prototype.setImage = function(img){
    this.image = img;
};
