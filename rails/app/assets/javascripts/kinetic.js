/**
 * KineticJS JavaScript Library v3.4.0
 * http://www.kineticjs.com/
 * Copyright 2011, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Dec 31 2011
 *
 * Copyright (C) 2011 by Eric Rowell
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
/****************************************
 * Stage
 */
Kinetic.Stage = function(containerId, width, height){
    this.container = document.getElementById(containerId);
    this.width = width;
    this.height = height;
    this.zIndexCounter = 9999;
    this.idCounter = 0;
    this.dblClickWindow = 400;
    // desktop flags
    this.mousePos = null;
    this.mouseDown = false;
    this.mouseUp = false;
    
    // mobile flags
    this.touchPos = null;
    this.touchStart = false;
    this.touchEnd = false;
    
    // create layers
    this.bufferLayer = new Kinetic.Layer(this);
    this.backstageLayer = new Kinetic.Layer(this, true);
    this.stageLayer = new Kinetic.Layer(this);
    this.propsLayer = new Kinetic.Layer(this);
    this.actorsLayer = new Kinetic.Layer(this);
    
    this.bufferLayer.getCanvas().style.display = 'none';
    this.backstageLayer.getCanvas().style.display = 'none';
    this.listen();
    
    this.addEventListener("mouseout", function(evt){
        that.shapeDragging = undefined;
    }, false);
    
    // prepare stage for drag and drop
    var that = this;
    this.addEventListener("mousemove", function(evt){
        if (that.shapeDragging) {
            var mousePos = that.getMousePos();
            that.shapeDragging.x = mousePos.x - that.shapeDragging.offset.x;
            that.shapeDragging.y = mousePos.y - that.shapeDragging.offset.y;
            that.drawActors();
        }
    }, false);
    this.addEventListener("mouseup", function(evt){
        // execute user defined ondragend if defined
        
        if (that.shapeDragging) {
            var dragend = that.shapeDragging.eventListeners.ondragend;
            if (dragend) {
                for (var i = 0; i < dragend.length; i++) {
                    dragend[i].func(evt);
                }
            }
        }
        that.shapeDragging = undefined;
    });
};
/*
 * get buffer layer
 */
Kinetic.Stage.prototype.getBufferLayer = function(){
    return this.bufferLayer;
};
/*
 * get backstage layer
 */
Kinetic.Stage.prototype.getBackstageLayer = function(){
    return this.backstageLayer;
};
/*
 * get stage layer
 */
Kinetic.Stage.prototype.getStageLayer = function(){
    return this.stageLayer;
};
/*
 * get props layer
 */
Kinetic.Stage.prototype.getPropsLayer = function(){
    return this.propsLayer;
};
/*
 * get actors layer
 */
Kinetic.Stage.prototype.getActorsLayer = function(){
    return this.actorsLayer;
};
/*
 * clear stage
 */
Kinetic.Stage.prototype.clear = function(){
    this.stageLayer.clear();
};
/*
 * clear all canvases
 */
Kinetic.Stage.prototype.clearAll = function(){
    this.backstageLayer.clear();
    this.stageLayer.clear();
    this.propsLayer.clear();
    this.actorsLayer.clear();
};
/*
 * Composite toDataURL
 */
Kinetic.Stage.prototype.toDataURL = function(callback){
    var bufferLayer = this.getBufferLayer();
    var bufferContext = bufferLayer.getContext();
    var stageLayer = this.getStageLayer();
    var propsLayer = this.getPropsLayer();
    var actorsLayer = this.getActorsLayer();
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
/*
 * draw actors layer
 */
Kinetic.Stage.prototype.drawActors = function(){
    this.getActorsLayer().draw();
};
/*
 * draw props layer
 */
Kinetic.Stage.prototype.drawProps = function(){
    this.getPropsLayer().draw();
};
/*
 * draw actors and props layer.  This method should be used
 * in combination with makeActor() or makeProp()
 */
Kinetic.Stage.prototype.draw = function(){
    this.drawProps();
    this.drawActors();
};
/*
 * remove a shape from the stage
 */
Kinetic.Stage.prototype.remove = function(shape){
    // remove from shapes array
    var shapes = this.getShapes();
    for (var n = 0; n < shapes.length; n++) {
        var id = shapes[n].id;
        if (id == shape.id) {
            shape.getLayer().getShapes().splice(n, 1);
        }
    }
};
/*
 * remove all shapes from the stage
 */
Kinetic.Stage.prototype.removeAll = function(){
    // remove all shapes
    this.getPropsLayer().shapes = [];
    this.getActorsLayer().shapes = [];
};
/*
 * get stage canvas
 */
Kinetic.Stage.prototype.getCanvas = function(){
    return this.stageLayer.getCanvas();
};
/*
 * get stage context
 */
Kinetic.Stage.prototype.getContext = function(){
    return this.stageLayer.getContext();
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
    if (shape.isProp) {
        shape.layer = this.propsLayer;
    }
    else {
        shape.layer = this.actorsLayer;
    }
    
    shape.getLayer().shapes.push(shape);
    
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
    
    var backstageLayer = this.backstageLayer;
    var backstageLayerContext = backstageLayer.getContext();
    var that = this;
    
    backstageLayer.clear();
    
    for (var n = this.getShapes().length - 1; n >= 0; n--) {
        var pubShape = this.getShapes()[n];
        (function(){
            var shape = pubShape;
            shape.draw(backstageLayer);
            var pos = that.touchPos || that.mousePos;
            var el = shape.eventListeners;
            
            if (shape.visible && pos !== null && backstageLayerContext.isPointInPath(pos.x, pos.y)) {
                // handle onmousedown
                if (that.mouseDown) {
                    that.mouseDown = false;
                    shape.clickStart = true;
                    
                    if (el.onmousedown) {
                        for (var i = 0; i < el.onmousedown.length; i++) {
                            el.onmousedown[i].func(evt);
                        }
                    }
                    n = -1;
                }
                // handle onmouseup & onclick
                else if (that.mouseUp) {
                    that.mouseUp = false;
                    if (el.onmouseup) {
                        for (var i = 0; i < el.onmouseup.length; i++) {
                            el.onmouseup[i].func(evt);
                        }
                    }
                    
                    // detect if click or double click occurred
                    if (shape.clickStart) {
                        if (el.onclick) {
                            for (var i = 0; i < el.onclick.length; i++) {
                                el.onclick[i].func(evt);
                            }
                        }
                        
                        if (el.ondblclick && shape.inDoubleClickWindow) {
                            for (var i = 0; i < el.ondblclick.length; i++) {
                                el.ondblclick[i].func(evt);
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
                        for (var i = 0; i < el.touchstart.length; i++) {
                            el.touchstart[i].func(evt);
                        }
                    }
                    n = -1;
                }
                
                // handle touchend
                else if (that.touchEnd) {
                    that.touchEnd = false;
                    if (el.touchend) {
                        for (var i = 0; i < el.touchend.length; i++) {
                            el.touchend[i].func(evt);
                        }
                    }
                    n = -1;
                }
                
                // handle touchmove
                else if (el.touchmove) {
                    for (var i = 0; i < el.touchmove.length; i++) {
                        el.touchmove[i].func(evt);
                    }
                    n = -1;
                }
                
                // handle onmouseover
                else if (!shape.mouseOver) {
                    shape.mouseOver = true;
                    if (el.onmouseover) {
                        for (var i = 0; i < el.onmouseover.length; i++) {
                            el.onmouseover[i].func(evt);
                        }
                    }
                    n = -1;
                }
                
                // handle onmousemove
                else if (el.onmousemove) {
                    for (var i = 0; i < el.onmousemove.length; i++) {
                        el.onmousemove[i].func(evt);
                    }
                    n = -1;
                }
            }
            // handle mouseout condition
            else if (shape.mouseOver) {
                shape.mouseOver = false;
                if (el.onmouseout) {
                    for (var i = 0; i < el.onmouseout.length; i++) {
                        el.onmouseout[i].func(evt);
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
        
        // clear all click starts
        for (var i = 0; i < that.getShapes().length; i++) {
            that.getShapes()[i].clickStart = false;
        }
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
Kinetic.Stage.prototype.getMousePos = function(evt){
    return this.mousePos;
};
/*
 * get touch position for mobile apps
 */
Kinetic.Stage.prototype.getTouchPos = function(evt){
    return this.touchPos;
};
/*
 * set mouse positon for desktop apps
 */
Kinetic.Stage.prototype.setMousePosition = function(evt){
    var mouseX = evt.clientX - this.getContainerPos().left + window.pageXOffset;
    var mouseY = evt.clientY - this.getContainerPos().top + window.pageYOffset;
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
        var touchX = touch.clientX - this.getContainerPos().left + window.pageXOffset;
        var touchY = touch.clientY - this.getContainerPos().top + window.pageYOffset;
        
        this.touchPos = {
            x: touchX,
            y: touchY
        };
    }
};
/*
 * get container position
 */
Kinetic.Stage.prototype.getContainerPos = function(){
    var obj = this.container;
    var top = 0;
    var left = 0;
    while (obj.tagName != "BODY") {
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
 * get all shapes
 */
Kinetic.Stage.prototype.getShapes = function(){
    return (this.getPropsLayer().getShapes()).concat(this.getActorsLayer().getShapes());
};
/****************************************
 * Shape
 */
Kinetic.Shape = function(drawFunc, isProp){
    this.drawFunc = drawFunc;
    this.isProp = isProp === undefined ? false : isProp;
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
    this.mouseOver = false;
    this.clickStart = false;
    this.inDblClickWindow = false;
    
    this.visible = true;
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
        
        this.drawFunc.call(layer);
        context.restore();
    }
};
/*
 * enable/disable drag and drop
 */
Kinetic.Shape.prototype.draggable = function(setDraggable){
    if (setDraggable) {
        var that = this;
        this.addEventListener("mousedown.initdrag", function(evt){
            var stage = that.getStage();
            stage.shapeDragging = that;
            var mousePos = stage.getMousePos();
            
            stage.shapeDragging.offset = {};
            stage.shapeDragging.offset.x = mousePos.x - that.x;
            stage.shapeDragging.offset.y = mousePos.y - that.y;
            
            // execute dragstart events if defined
            var dragstart = that.eventListeners.ondragstart;
            if (dragstart) {
                for (var i = 0; i < dragstart.length; i++) {
                    dragstart[i].func(evt);
                }
            }
        });
    }
    else {
        this.removeEventListener("mousedown.initdrag");
    }
};
/*
 * set shape scale
 */
Kinetic.Shape.prototype.setScale = function(scale){
    this.scale.x = scale;
    this.scale.y = scale;
};
/*
 * scale shape
 */
Kinetic.Shape.prototype.scale = function(scale){
    this.scale.x *= scale;
    this.scale.y *= scale;
};
/*
 * move shape to position
 */
Kinetic.Shape.prototype.setPosition = function(x, y){
    this.x = x;
    this.y = y;
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
Kinetic.Shape.prototype.on = function(type, func){
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
    
    if (parts.length > 1) {
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
    var layer = this.getLayer();
    var shapes = layer.getShapes();
    
    for (var n = 0; n < shapes.length; n++) {
        var shape = shapes[n];
        if (shape.id == this.id) {
            layer.shapes.splice(n, 1);
            layer.shapes.push(this);
            break;
        }
    }
};
/*
 * get shape layer
 */
Kinetic.Shape.prototype.getLayer = function(){
    return this.layer;
};
/*
 * get shape layer
 */
Kinetic.Shape.prototype.makeActor = function(){
    var stage = this.stage;
    var layer = this.getLayer();
    var propsLayer = stage.getPropsLayer();
    var actorsLayer = stage.getActorsLayer();
    var shapes = layer.getShapes();
    
    for (var n = 0; n < shapes.length; n++) {
        var shape = shapes[n];
        if (shape.id == this.id) {
            layer.shapes.splice(n, 1);
            actorsLayer.getShapes().push(this);
            break;
        }
    }
};
/*
 * make shape into an actor
 */
Kinetic.Shape.prototype.makeActor = function(){
    var stage = this.stage;
    var layer = this.getLayer();
    var propsLayer = stage.getPropsLayer();
    var actorsLayer = stage.getActorsLayer();
    var shapes = layer.getShapes();
    
    for (var n = 0; n < shapes.length; n++) {
        var shape = shapes[n];
        if (shape.id == this.id) {
            layer.shapes.splice(n, 1);
            actorsLayer.getShapes().push(this);
            this.layer = stage.actorsLayer;
            break;
        }
    }
};
/*
 * make shape into a prop
 */
Kinetic.Shape.prototype.makeProp = function(){
    var stage = this.stage;
    var layer = this.getLayer();
    var propsLayer = stage.getPropsLayer();
    var actorsLayer = stage.getActorsLayer();
    var shapes = layer.getShapes();
    for (var n = 0; n < shapes.length; n++) {
        var shape = shapes[n];
        if (shape.id == this.id) {
            layer.shapes.splice(n, 1);
            propsLayer.getShapes().push(this);
            this.layer = stage.propsLayer;
            break;
        }
    }
};
/****************************************
 * Image constructor
 */
Kinetic.Image = function(config){
    var imageObj = config.imageObj;
    var x = config.x;
    var y = config.y;
    var width = config.width;
    var height = config.height;
    var isProp = config.isProp;
    
    if (!width) {
        width = imageObj.width;
    }
    if (!height) {
        height = imageObj.height;
    }
    var drawImage = function(){
        var context = this.getContext();
        context.drawImage(imageObj, x, y, width, height);
        context.beginPath();
        context.rect(x, y, width, height);
        context.closePath();
    };
    
    var shape = new Kinetic.Shape(drawImage, isProp);
    
    /*
     * copy shape methods and properties to
     * Image object
     */
    for (var key in shape) {
        this[key] = shape[key];
    }
};
