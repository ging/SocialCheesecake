/**
 * KineticJS JavaScript Library v3.0.0
 * http://www.kineticjs.com/
 * Copyright 2011, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Dec 17 2011
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
Kinetic.Layer = function(stage, stripStyling){
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = stage.width;
    this.canvas.height = stage.height;
    this.canvas.style.position = 'absolute';
    
    if (stripStyling) {
        this.context.stroke = function(){
        };
        this.context.fill = function(){
        };
    }
    
    stage.container.appendChild(this.canvas);
}

Kinetic.Layer.prototype.clear = function(){
    var context = this.getContext();
    var canvas = this.getCanvas();
    context.clearRect(0, 0, canvas.width, canvas.height);
}

Kinetic.Layer.prototype.getCanvas = function(){
    return this.canvas;
}

Kinetic.Layer.prototype.getContext = function(){
    return this.context;
}

/****************************************
 * Stage
 */
Kinetic.Stage = function(containerId, width, height){
    this.container = document.getElementById(containerId);
    this.width = width;
    this.height = height;
    this.staticShapes = [];
    this.dynamicShapes = [];
    this.zIndexCounter = 9999;
    this.idCounter = 0;
    this.dblClickWindow = 400; // ms
    // desktop flags
    this.mousePos = null;
    this.mouseDown = false;
    this.mouseUp = false;
    
    // mobile flags
    this.touchPos = null;
    this.touchStart = false;
    this.touchEnd = false;
    
    // add canvases
    this.backStageLayer = new Kinetic.Layer(this, true);
    this.stageLayer = new Kinetic.Layer(this);
    this.staticLayer = new Kinetic.Layer(this);
    this.dynamicLayer = new Kinetic.Layer(this);
    
    this.backStageLayer.getCanvas().style.display = 'none';
    this.listen();
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
    this.backStageLayer.clear();
    this.stageLayer.clear();
    this.staticLayer.clear();
    this.dynamicLayer.clear();
};

/*
 * draw all dynamic shapes
 */
Kinetic.Stage.prototype.draw = function(){
    var dynamicLayer = this.dynamicLayer;
    dynamicLayer.clear();
    
    var shapesContext = dynamicLayer.getContext();
    
    for (var n = 0; n < this.dynamicShapes.length; n++) {
        this.dynamicShapes[n].draw(dynamicLayer);
    }
};

/*
 * remove a shape from the stage
 */
Kinetic.Stage.prototype.remove = function(shape){
    var shapes = shape.isStatic ? this.staticShapes : this.dynamicShapes;
    
    // remove from shapes array
    for (var n = 0; n < shapes.length; n++) {
        var id = shapes[n].id;
        if (id == shape.id) {
            if (shape.isStatic) {
                this.staticShapes.splice(n, 1);
            }
            else {
                this.dynamicShapes.splice(n, 1);
            }
        }
    }
};

/*
 * remove all shapes from the stage
 */
Kinetic.Stage.prototype.removeAll = function(){
    // remove all shapes
    this.staticShapes = [];
    this.dynamicShapes = [];
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
 * add event listener to stage (which is essentially
 * the container DOM)
 */
Kinetic.Stage.prototype.addEventListener = function(type, func){
    this.container.addEventListener(type, func);
};

/*
 * add shape to stage
 */
Kinetic.Stage.prototype.add = function(shape){
    shape.stage = this;
    if (shape.isStatic) {
        this.staticShapes.push(shape);
        shape.layer = this.staticLayer;
    }
    else {
        this.dynamicShapes.push(shape);
        shape.layer = this.dynamicLayer;
    }
    
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
    
    var backStageLayer = this.backStageLayer;
    var backStageContext = backStageLayer.getContext();
    var that = this;
    
    backStageLayer.clear();
    
    for (var n = this.getShapes().length - 1; n >= 0; n--) {
        var pubShape = this.getShapes()[n];
        
        (function(){
            var shape = pubShape;
            shape.draw(backStageLayer);
            var pos = that.touchPos || that.mousePos;
            var el = shape.eventListeners;
            
            if (shape.visible && pos !== null && backStageContext.isPointInPath(pos.x, pos.y)) {
                // handle onmousedown   
                if (that.mouseDown) {
                    that.mouseDown = false;
                    shape.clickStart = true;
                    
                    if (el.onmousedown !== undefined) {
                        el.onmousedown(evt);
                    }
                    
                    n = -1;
                }
                // handle onmouseup & onclick
                else if (that.mouseUp) {
                    that.mouseUp = false;
                    if (el.onmouseup !== undefined) {
                        el.onmouseup(evt);
                    }
                    
                    // detect if click or double click occurred
                    if (shape.clickStart) {
                    
                        if (el.onclick !== undefined) {
                            el.onclick(evt);
                        }
                        
                        if (el.ondblclick !== undefined && shape.inDoubleClickWindow) {
                            el.ondblclick(evt);
                        }
                        
                        shape.inDoubleClickWindow = true;
                        
                        setTimeout(function(){
                            shape.inDoubleClickWindow = false;
                        }, that.dblClickWindow);
                    }
                    
                    n = -1;
                }
                
                // handle onmouseover
                else if (!shape.mouseOver) {
                    shape.mouseOver = true;
                    if (el.onmouseover !== undefined) {
                        el.onmouseover(evt);
                    }
                    
                    n = -1;
                }
                
                // handle onmousemove
                else if (el.onmousemove !== undefined) {
                    el.onmousemove(evt);
                    
                    n = -1;
                }
                
                // handle touchstart
                else if (that.touchStart) {
                    that.touchStart = false;
                    if (el.touchstart !== undefined) {
                        el.touchstart(evt);
                    }
                    
                    n = -1;
                }
                
                // handle touchend
                else if (that.touchEnd) {
                    that.touchEnd = false;
                    if (el.touchend !== undefined) {
                        el.touchend(evt);
                    }
                    
                    n = -1;
                }
                
                // handle touchmove
                else if (!that.touchMove) {
                    if (el.touchmove !== undefined) {
                        el.touchmove(evt);
                    }
                    
                    n = -1;
                }
            }
            // handle mouseout condition
            else if (shape.mouseOver) {
                shape.mouseOver = false;
                if (el.onmouseout !== undefined) {
                    el.onmouseout(evt);
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
    if (evt.touches !== undefined && evt.touches.length == 1) { // Only deal with
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
    return (this.staticShapes).concat(this.dynamicShapes);
};

/****************************************
 * Shape
 */
Kinetic.Shape = function(drawFunc, isStatic){
    this.drawFunc = drawFunc;
    this.isStatic = isStatic === undefined ? false : isStatic;
    this.x = 0;
    this.y = 0;
    this.scale = {
        x: 1,
        y: 1
    };
    this.rotation = 0; // radians
    // store state for next clear
    this.lastX = 0;
    this.lastY = 0;
    this.lastRotation = 0; // radians
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
 * draw method
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
 * set shape canvas scale
 */
Kinetic.Shape.prototype.setScale = function(scale){
    this.scale.x = scale;
    this.scale.y = scale;
};

/*
 * add event listener to shape
 */
Kinetic.Shape.prototype.addEventListener = function(type, func){
    var event = (type.indexOf('touch') == -1) ? 'on' + type : type;
    this.eventListeners[event] = func;
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
    var shapes = this.isStatic ? stage.staticShapes : stage.dynamicShapes;
    
    for (var n = 0; n < shapes.length; n++) {
        var shape = shapes[n];
        if (shape.id == this.id) {
            if (shape.isStatic) {
                stage.staticShapes.splice(n, 1);
                stage.staticShapes.push(this);
            }
            else {
                stage.dynamicShapes.splice(n, 1);
                stage.dynamicShapes.push(this);
            }
            
            break;
        }
    }
};

/****************************************
 * drawImage util
 * This util function draws a rectangular shape
 * over a canvas image to provide a detectable path
 */
Kinetic.drawImage = function(imageObj, x, y, width, height){
    if (!width) {
        width = imageObj.width;
    }
    if (!height) {
        height = imageObj.height;
    }
    return function(){
        var context = this.getContext();
        context.drawImage(imageObj, x, y, width, height);
        context.beginPath();
        context.rect(x, y, width, height);
        context.closePath();
    };
};
