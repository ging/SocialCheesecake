var socialCheesecake = {}

socialCheesecake.text = {
	writeCurvedText : function(text, context, x, y, r, phi, delta) {
		context.font = "bold 14px sans-serif";
		context.fillStyle = '#000';
		context.textBaseline = "middle";
		var medium_alpha = Math.tan(context.measureText(text).width / (text.length * r));
		if(medium_alpha * text.length <= delta) {
			context.translate(x, y);
			var orientation = 0;
			if((phi + delta / 2 >= Math.PI ) && (phi + delta / 2 < Math.PI * 2)) {
				orientation = -1;
				context.rotate(-( delta - (medium_alpha * text.length)) / 2 - phi - Math.PI / 2);
			} else {
				orientation = 1;
				context.rotate(( delta - (medium_alpha * text.length)) / 2 + Math.PI / 2 - delta - phi);
			}
			for(var i = 0; i < text.length; i++) {
				context.fillText(text[i], 0, -(orientation * r));
				var alpha = Math.tan(context.measureText(text[i]).width / r);
				context.rotate(orientation * alpha);
			}
			return true;
		} else {
			return false;
		}
	},
	writeCenterText : function(text, context, centerX, centerY){
		context.fillText(text, centerX - context.measureText(text).width/2, centerY);
	}
}

/* CHEESECAKE */
socialCheesecake.Cheesecake = function(cheesecakeData) {
	var jsonSectors = cheesecakeData.sectors;
	var cheesecake = this;
	//Properties
	cheesecake.center = {
		x : cheesecakeData.center.x, 
		y : cheesecakeData.center.y
	};
	cheesecake.rMax = cheesecakeData.rMax;
	cheesecake.sectors = [];
	cheesecake.auxiliarSectors = [];
	cheesecake.stage = new Kinetic.Stage("container", 780, 600);
	cheesecake.grid;

	var phi = 0;
	var delta = 2 * Math.PI / jsonSectors.length;
	var actors = [];
	for(var i = 0; i < jsonSectors.length; i++) {
		var settings = {
			parent : cheesecake,
			center : { x : cheesecakeData.center.x, y : cheesecakeData.center.y },
			label : jsonSectors[i].name,
			phi : phi,
			delta : delta,
			rOut : cheesecakeData.rMax,
			subsectors : jsonSectors[i].subsectors,
			mouseover : { color : "#aaffaa",
								callback : function(sector) {
													document.body.style.cursor = "pointer";
													sector.focus();
												}
								},
			mouseout : { color : "#eeffee",
								callback : function(sector) {
									document.body.style.cursor = "default";
									sector.unfocus();
								}
							},
			mousedown : { color : "#77ff77",
									callback : function(sector) {
										cheesecake.focusAndBlurCheesecake(sector);
									}
								},
			mouseup : { color : "#aaffaa" }
		};
		cheesecake.sectors[i] = new socialCheesecake.Sector(settings);
		cheesecake.stage.add(cheesecake.sectors[i].getRegion());
		phi += delta;
		for ( var j in jsonSectors[i].subsectors) {
			if (jsonSectors[i].subsectors[j].actors) {
				for(var k in jsonSectors[i].subsectors[j].actors) 
					jsonSectors[i].subsectors[j].actors[k].push(cheesecake.sectors[i]);
				actors= actors.concat(jsonSectors[i].subsectors[j].actors);
			}
		}
	}
	cheesecake.grid = new socialCheesecake.Grid ({ 
		parent: this, 
		x : 500, 
		y : 80, 
		width : 270, 
		height : 520,
		actors : actors
	});
}
socialCheesecake.Cheesecake.prototype.focusAndBlurCheesecake = function(sector) {
	var cheesecake = this;
	var regions = cheesecake.stage.shapes;
	var sectorIndex;
	for(var i in cheesecake.sectors) {
		if(cheesecake.sectors[i] === sector)
			sectorIndex = i;
	}
	if(sectorIndex == null)
		throw "sector doesn't belong to this cheesecake"
	for(var i = (regions.length - 1); i >= 0; i--) {
		if(!regions[i].permanent){
			cheesecake.stage.remove(regions[i]);
		}
	}

	//Add auxiliar sectors
	var greySettings = {
		parent : cheesecake,
		center : {x : cheesecake.center.x, y : cheesecake.center.y},
		phi : sector.phi + sector.delta,
		delta : 2 * Math.PI - sector.delta,
		rOut : cheesecake.rMax,
		mouseout : { color : "#f5f5f5",
							callback : function (){
												document.body.style.cursor = "default";
											}
							},
		mousedown : { color : "#f5f5f5" },
		mouseup : { color : "#f5f5f5" },
		mouseover : { color : "#f5f5f5",
							callback : function(){
									document.body.style.cursor = "pointer";
								}
							},
		color : "#f5f5f5"
	};
	var dummySettings = {
		parent : cheesecake,
		center : { x : cheesecake.center.x, y : cheesecake.center.y },
		phi : sector.phi,
		delta : sector.delta,
		rOut : sector.rOut,
		label : sector.label,
		simulate : sectorIndex,
		mouseout : { callback : function (){
												document.body.style.cursor = "default";
											}
						},
		mouseover : { callback : function (){
												document.body.style.cursor = "pointer";
											}
							}
	};
	var greySector = new socialCheesecake.Sector(greySettings);
	cheesecake.auxiliarSectors.push(greySector);
	var dummySector = new socialCheesecake.Sector(dummySettings)
	cheesecake.auxiliarSectors.push(dummySector);

	cheesecake.stage.add(greySector.getRegion());
	cheesecake.stage.add(dummySector.getRegion());
	var greySectorContext = greySector.getRegion().getContext();
	var dummySectorContext = dummySector.getRegion().getContext();

	//Animations
	var greyMousedownCallback = function() {
		cheesecake.unfocusAndUnblurCheesecake();
	}
	var greyResizeCallback = function() {
		greySector.mousedown.callback = greyMousedownCallback;
	}
	var greyRotateToCallback = function() {
		greySector.resize({
			context : greySectorContext,
			delta : 3 * Math.PI / 2,
			anchor : "B",
			callback : greyResizeCallback
		});
	}
	
	var dummyResizeCallback = function() {
		dummySector.splitUp();
	}
	var dummyRotateToCallback = function() {
		dummySector.resize({
			context : dummySectorContext,
			anchor : "E",
			callback : dummyResizeCallback
		});
	}
	
	greySector.rotateTo({
		context : greySectorContext,
		phiDestination : Math.PI / 2,
		callback : greyRotateToCallback
	});

	dummySector.rotateTo({
		context : dummySectorContext,
		phiDestination : Math.PI / 2 - dummySector.delta,
		callback : dummyRotateToCallback
	});
}
socialCheesecake.Cheesecake.prototype.recoverCheesecake = function() {
	var cheesecake = this;
	var regions = cheesecake.stage.shapes;

	//Delete the auxiliar sectors
	for(var i = (regions.length - 1); i >= 0; i--) {
		if(!regions[i].permanent){
			cheesecake.stage.remove(regions[i]);
		}
	}
	cheesecake.auxiliarSectors.pop();

	// Add the former sectors
	for(var i in cheesecake.sectors) {
		cheesecake.stage.add(cheesecake.sectors[i].getRegion());
	}
}
socialCheesecake.Cheesecake.prototype.unfocusAndUnblurCheesecake = function() {
	var cheesecake = this;
	var auxiliarSectors = this.auxiliarSectors;
	var sector;
	var greySector;

	//Localize the dummy and grey sectors
	for(var i in auxiliarSectors) {
		if(auxiliarSectors[i].simulate != null) {
			sector = auxiliarSectors[i];
		} else {
			greySector = auxiliarSectors[i];
		}
	}

	//Animate and go back to the general view
	sector.putTogether();
	sector.resize({
		context : sector.getRegion().getContext(),
		anchor : "B",
		delta : sector.originalAttr.delta,
		callback : function() {
			sector.rotateTo({
				context : sector.getRegion().getContext(),
				phiDestination : sector.originalAttr.phi
			});
		}
	});
	greySector.resize({
		context : greySector.getRegion().getContext(),
		anchor : "E",
		delta : greySector.originalAttr.delta,
		callback : function() {
			greySector.rotateTo({
				context : greySector.getRegion().getContext(),
				phiDestination : greySector.originalAttr.phi,
				callback : function() {
					cheesecake.recoverCheesecake();
				}
			});
		}
	});
}
/*SECTOR*/
socialCheesecake.Sector = function(settings) {

	var defaultSettings = {
		center : { x : 0, y : 0 },
		rIn : 0,
		rOut : 300,
		delta : Math.PI / 2,
		phi : 0,
		label : "",
		color : "#eeffee",
		mouseover : { color : "#aaffaa" },
		mouseout : { color : "#eeffee" },
		mouseup : { color : "#77ff77" },
		mousedown : { color : "#aaffaa" }
	}
	for(var property in defaultSettings) {
		if(!( property in settings)) {
			settings[property] = defaultSettings[property];
		}
	}
	if(settings.phi < 0 || settings.phi > 2 * Math.PI) {
		throw "Phi must be greater or equal to 0 and less than 2*pi";
	}
	if(settings.delta <= 0 || settings.delta > 2 * Math.PI) {
		throw "Delta must be greater than 0 and less than 2*pi";
	}
	this.x = settings.center.x;
	this.y = settings.center.y;
	this.rOut = settings.rOut;
	this.rIn = settings.rIn;
	this.phi = settings.phi;
	this.delta = settings.delta;
	this.label = settings.label;
	this.color = settings.color;
	this.mouseover = settings.mouseover;
	this.mouseup = settings.mouseup;
	this.mouseout = settings.mouseout;
	this.mousedown = settings.mousedown;
	this.subsectors = [];
	if(settings.parent != null)
		this.parent = settings.parent;
	if(settings.simulate != null)
		this.simulate = settings.simulate;

	if(settings.subsectors != null) {
		var rInSubsector = this.rIn;
		var separation = (this.rOut - this.rIn) / settings.subsectors.length;
		for(var i in settings.subsectors) {
			var rOutSubsector = rInSubsector + separation;
			var layer = new socialCheesecake.Subsector({
				label : settings.subsectors[i].name,
				parent : this,
				x : this.x,
				y : this.y,
				phi : this.phi,
				delta : this.delta,
				rIn : rInSubsector,
				rOut : rOutSubsector,
			});
			rInSubsector = rOutSubsector;
			this.subsectors.push(layer);
		}
	}
	this.originalAttr = {
		x : this.x,
		y : this.y,
		phi : this.phi,
		delta : this.delta,
		rIn : this.rIn,
		rOut : this.rOut,
		color : this.color,
		label : this.label,
		mouseover : this.mouseover,
		mouseout : this.mouseout,
		mousedown : this.mousedown,
		mouseup : this.mouseup,
		simulate : this.simulate,
		subsectors : this.subsectors
	};
	this._region = null;
}
socialCheesecake.Sector.prototype._draw = function(context, options) {
	var x = this.x;
	var y = this.y;
	var phi = this.phi;
	var delta = this.delta;
	var rIn = this.rIn;
	var rOut = this.rOut;
	var color = this.color;
	var label = this.label;
	if(options != null) {
		if(options.x != null)
			x = options.x;
		if(options.y != null)
			y = options.y;
		if(options.phi != null)
			phi = options.phi;
		if(options.delta != null)
			delta = options.delta;
		if(options.rIn != null)
			rIn = options.rIn;
		if(options.rOut != null)
			rOut = options.rOut;
		if(options.color != null)
			color = options.color;
		if(options.label != null)
			label = options.label;
	}
	context.restore();
	context.save();
	context.beginPath();
	context.arc(x, y, rOut, -phi, -(phi + delta), true);
	context.lineTo(x + rIn * Math.cos(-phi - delta), y + rIn * Math.sin(-phi - delta));
	context.arc(x, y, rIn, -(phi + delta), -phi, false);
	context.closePath();
	context.fillStyle = color;
	context.fill();
	context.lineWidth = 4;
	context.stroke();
	socialCheesecake.text.writeCurvedText(label, context, x, y, (rOut + rIn) / 2, phi, delta);
}
socialCheesecake.Sector.prototype.getRegion = function(regenerate) {
	if((this._region == null) || (regenerate == true)) {
		var sector = this;
		if(sector._region != null) {
			/* TO-DO!!!
			 if(sector.parent != null){
			 var cheesecake=sector.parent;
			 var regions= cheesecake.stage.regions;
			 var regionIndex;
			 for(var j in regions){
			 if(regions[j]==sector._region){
			 regionIndex= j;
			 }
			 }
			 }
			 var canvas=sector.getRegion().getCanvas();
			 if((canvas!=null)&&(canvas.parentNode!=null)){
			 canvas.parentNode.removeChild(canvas);
			 }*/
		}
		sector._region = new Kinetic.Shape(function() {
			var context = this.getContext();
			sector._draw(context);
		});
		/*
		 if(regionIndex!=null){
		 regions[regionIndex]=this._region;
		 } */
		sector._region.addEventListener('mouseover', function() {
			
			if((sector.mouseover != null) && (sector.mouseover.color != null)) {
				var color = sector.mouseover.color;
				sector.changeColor(color);
			}
			if((sector.mouseover != null) && (sector.mouseover.callback != null)) {
				sector.mouseover.callback(sector);
			}
		});
		sector._region.addEventListener('mouseout', function() {
			if((sector.mouseout != null) && (sector.mouseout.color != null)) {
				var color = sector.mouseout.color;
				sector.changeColor(color);
			}
			if((sector.mouseout != null) && (sector.mouseout.callback != null)) {
				sector.mouseout.callback(sector);
			}
		});
		sector._region.addEventListener('mousedown', function() {
			if((sector.mousedown != null) && (sector.mousedown.color != null)) {
				var color = sector.mousedown.color;
				sector.changeColor(color);
			}
			if((sector.mousedown != null) && (sector.mousedown.callback != null)) {
				sector.mousedown.callback(sector);
			}
		});
		sector._region.addEventListener('mouseup', function() {
			if((sector.mouseup != null) && (sector.mouseup.color != null)) {
				var color = sector.mouseup.color;
				sector.changeColor(color);
			}
			if((sector.mouseup != null) && (sector.mouseup.callback != null)) {
				sector.mouseup.callback(sector);
			}
		});
	}
	return this._region
}
socialCheesecake.Sector.prototype.splitUp = function() {
	var cheesecake = this.parent;
	var phi = this.phi;
	var delta = this.delta;
	var rOut = this.rOut;
	var rIn = this.rIn;
	var sector; 
	(this.simulate != null) ? sector = cheesecake.sectors[this.simulate] : sector = this;
	var subsectors = sector.subsectors;

	//Draw sector's subsectors over it
	var subsectorRIn = rIn;
	var separation = 0;
	if(subsectors.length > 0)
		separation = (rOut + rIn) / subsectors.length;
	for(var i in subsectors) {
		subsectors[i].rIn = rIn;
		subsectors[i].rOut = rIn + separation;
		subsectors[i].phi = phi;
		subsectors[i].delta = delta;
		cheesecake.stage.add(subsectors[i].getRegion());
		rIn += separation;
	}
}
socialCheesecake.Sector.prototype.putTogether = function() {
	var cheesecake = this.parent;
	var sector; 
	(this.simulate != null) ? sector = cheesecake.sectors[this.simulate] : sector = this;
	var subsectors = sector.subsectors;
	//Clear subsectors from stage
	for(var i in subsectors) {
		cheesecake.stage.remove(subsectors[i].getRegion());
	}

}
socialCheesecake.Sector.prototype.changeColor = function(color) {
	var sector = this;
	var context = sector._region.getContext();
	sector.color = color;
	context.fillStyle = color;
	context.fill();
	context.lineWidth = 4;
	context.stroke();
	sector._region.getContext().restore();
	sector._region.getContext().save();
	socialCheesecake.text.writeCurvedText(sector.label, sector._region.getContext(), 
											sector.x, sector.y, 
											(sector.rOut + sector.rIn) / 2, 
											sector.phi, sector.delta);
}
/**
 *
 * Options: delta - new delta to achieve
 context - sector context to work with
 step - sets the animation speed
 anchor - "beginning" , "b", "B"
 "middle", "m", "M"
 "end", "e", "E"
 *
 **/
socialCheesecake.Sector.prototype.resize = function(options) {

	if(!options)
		throw "No arguments passed to the function";
	if(options.context == null)
		throw "context must be defined"
	var context = options.context;
	var sector = this;
	var currentDelta = sector.delta;
	var currentPhi = sector.phi;
	var step = 0.05;
	var goalDelta = Math.PI / 2;
	var anchor = 1;
	if(options.step)
		step = options.step;
	if(options.delta) {
		goalDelta = options.delta;
	}
	if(options.anchor) {
		if((options.anchor.toLowerCase() == "b") || (options.anchor == "beginning"))
			anchor = 0;
		if((options.anchor.toLowerCase() == "m") || (options.anchor == "middle"))
			anchor = 0.5;
		if((options.anchor.toLowerCase() == "e") || (options.anchor == "end"))
			anchor = 1;
	}

	if(currentDelta > goalDelta) {
		if( currentDelta - goalDelta < step)
			step = currentDelta - goalDelta;
		currentDelta -= step;
		currentPhi += anchor * step;
	} else if(currentDelta < goalDelta) {
		if( goalDelta - currentDelta < step)
			step = goalDelta - currentDelta;
		currentDelta += step;
		currentPhi -= anchor * step;
	}

	sector.delta = currentDelta;
	sector.phi = currentPhi;

	sector.clear();
	sector._draw(context);
	if(currentDelta != goalDelta) {
		requestAnimFrame(function() {
			sector.resize(options);
		});
	} else if(options.callback) {
		options.callback();
	}
}
socialCheesecake.Sector.prototype.focus = function() {
	var sector = this;
	var context = sector._region.getContext();
	sector.rOut *= 1.05;
	sector.clear();
	sector._draw(context);
}
socialCheesecake.Sector.prototype.unfocus = function() {
	var sector = this;
	var context = sector._region.getContext();
	sector.rOut = sector.originalAttr.rOut;
	sector.clear();
	sector._draw(context);
}
socialCheesecake.Sector.prototype.clear = function() {
	var sector = this;
	var context = sector.getRegion().getContext();
	if(context != undefined) {
		context.restore();
		context.save();
	}
	sector.getRegion().clear();
}
socialCheesecake.Sector.prototype.rotateTo = function(options) {
	// update stage
	var sector = this;
	var currentPhi = this.phi;
	var step = 0.05;
	if(!options)
		throw "No arguments passed to the function";
	if(options.step)
		step = options.step;
	if(options.context == null)
		throw "context must be defined";
	var context = options.context;
	if(options.phiDestination == null)
		throw "phiDestination must be defined";
	var phiDestination = options.phiDestination % (2 * Math.PI);
	while(phiDestination < 0) {
		phiDestination += (2 * Math.PI);
	}

	var grow = 0;
	if(phiDestination > currentPhi) {
		grow = 1;
	} else if(phiDestination < currentPhi) {
		grow = -1;
	}
	if(Math.round(((2 * Math.PI) -  Math.abs( phiDestination - currentPhi) ) * 1000) / 1000 >= 
		Math.round(Math.abs( phiDestination - currentPhi) * 1000) / 1000) {
		if(Math.abs( phiDestination - currentPhi) < step)
			step = Math.abs( phiDestination - currentPhi);
		currentPhi += (grow * step);

		// if (grow>0) console.log("giro al contrario agujas. Caso 1 ");
		//if(grow<0) console.log("giro segun agujas. Caso 1");
	} else {
		if((2 * Math.PI) -  Math.abs( phiDestination - currentPhi) < step)
			step = (2 * Math.PI) -  Math.abs( phiDestination - currentPhi);
		phiDestination -= (grow * 2 * Math.PI);
		currentPhi -= (grow * step);
		//if (grow<0) console.log("giro al contrario agujas. Caso 2");
		//if(grow>0) console.log("giro segun agujas. Caso 2 ");
	}
	sector.phi = currentPhi;

	// clear stage
	sector.clear();

	// draw stage
	this._draw(context);

	// request new frame
	if(Math.abs( currentPhi - phiDestination) > 0.001) {
		sector.phi = currentPhi % (2 * Math.PI);
		requestAnimFrame(function() {
			sector.rotateTo({
				context : context,
				phiDestination : options.phiDestination,
				step : step,
				callback : options.callback,
			});
		});
	} else {
		if(options.callback)
			options.callback();
	}
}
/* SUBSECTOR */
socialCheesecake.Subsector = function (settings) {
	if(settings.parent != null)
		this.parent = settings.parent;

	this.label = "";
	if(settings.label != null)
		this.label = settings.label;
	this.x = settings.x, this.y = settings.y, this.rOut = settings.rOut;
	this.rIn = settings.rIn;
	this.phi = settings.phi;
	this.delta = settings.delta;
}
socialCheesecake.Subsector.prototype = new socialCheesecake.Sector({
	parent : this.parent,
	center : { x : this.x, y : this.y },
	label : this.label,
	rIn : this.rIn,
	rOut : this.rOut,
	phi : this.phi,
	delta : this.delta
});

/* ACTOR */
socialCheesecake.Actor = function (settings){
	if (!settings) throw "No arguments passed to the function"
	if (!settings.parent) throw "Actor must be associated to a subsector"
	
	var defaultSettings = {
		x : 0,
		y : 0,
		width : 64,
		height : 64,
		name : ""
	}
	for(var property in defaultSettings) {
		if(!( property in settings)) {
			settings[property] = defaultSettings[property];
		}
	}
	
	this.parent = settings.parent;
	this.avatarRegion;
	this.x = settings.x;
	this.y = settings.y;
	this.width = settings.width;
	this.height = settings.height;
	this.name = settings.name;

	var avatarImageObject = new Image(); 
	avatarImageObject.src = settings.imgSrc;

	var actor = this;		
	avatarImageObject.onload = function () {
		actor._draw({image : this});
	}
}

socialCheesecake.Actor.prototype._draw = function (settings){
	var actor = this;
	var stage = this.parent.parent.stage;
	var avatarImage = Kinetic.drawImage(settings.image, this.x, this.y, 
										this.width, this.height);
	this.avatarRegion = new Kinetic.Shape(avatarImage);
	var avatarRegion = this.avatarRegion;
	var percentage = 10;
	
	(settings.permanent==null) ? 
		avatarRegion.permanent = true : avatarRegion.permanent = false;
	//Listeners
	var mouseoverListener = function(){
		document.body.style.cursor = "pointer";
		actor.addBackground({percentage : percentage, backgroundColor : "#1F4A75"});
	};
	var mouseoutListener = 	function(){
		document.body.style.cursor = "default";
		actor.addBackground({percentage : percentage, backgroundColor : "#FFF"});
	};
	avatarRegion.addEventListener("mouseover", mouseoverListener);
	avatarRegion.addEventListener("mouseout", mouseoutListener);
	
	avatarRegion.addEventListener("mousedown", function(){
		if(arguments.callee.activeActor){
			//Deactive Actor
			mouseoverListener();
			avatarRegion.addEventListener("mouseout", mouseoutListener);
			avatarRegion.addEventListener("mouseover", mouseoverListener);
			arguments.callee.activeActor= false;
		}else{
			//Activate Actor
			actor.addBackground({percentage : percentage, 
								backgroundColor : "#DEEFF8", 
								strokeColor : "#1F4A75"
								});
			avatarRegion.addEventListener("mouseout", function(){
				document.body.style.cursor = "default";
			});
			avatarRegion.addEventListener("mouseover", undefined);
			arguments.callee.activeActor= true;
		}
	});
	
	stage.add(avatarRegion);
	avatarRegion.getContext().save();
	socialCheesecake.text.writeCenterText(this.name, avatarRegion.getContext(), this.x + this.width/2, 
																this.y + this.height*(1+2*percentage/100));
}

socialCheesecake.Actor.prototype.addBackground = function (settings){
	var defaultSettings = {
		percentage : 0,
		backgroundColor : "#FFF"
	}
	for(var property in defaultSettings) {
		if(!( property in settings)) {
			settings[property] = defaultSettings[property];
		}
	}
	var context = this.avatarRegion.getContext();	
	var width = this.width * (1+ settings.percentage/100);
	var height = this.height * (1+ settings.percentage/100);
	var x = this.x - this.width * settings.percentage/(2*100);
	var y = this.y - this.height * settings.percentage/(2*100);
	this.avatarRegion.clear();
	context.beginPath();
	context.rect(x, y, width, height);
	context.closePath();
	context.fillStyle = settings.backgroundColor;
    context.fill();
    if (settings.strokeColor){ 
    	context.strokeStyle = settings.strokeColor;
    	context.stroke();
	}
	context.restore();
	context.save();
    this.avatarRegion.drawFunc();
	socialCheesecake.text.writeCenterText(this.name, context, this.x + this.width/2, 
										this.y + this.height*(1+2*settings.percentage/100));
}

/* GRID */
socialCheesecake.Grid = function (settings){
	if (!settings) throw "No arguments passed to the function";
	console.log(settings.actors);
	
	//Dimensions
	this.x = settings.x;
	this.y = settings.y;
	this.width = settings.width;
	this.height = settings.height;
	this.actors = [];
	
	var imageX = this.x;
	var imageY = this.y;
	var imageWidth = settings.imageWidth | 64;
	var imageHeight = settings.imageWidth | 64;
	var xSeparation = settings.xSeparation | 30;
	var ySeparation = settings.ySeparation | 30;
	
	//Create actors
	for ( var i in settings.actors){
		var actor = new socialCheesecake.Actor ({ 
			parent : settings.actors[i][2],
			imgSrc : settings.actors[i][1],
			width: imageWidth, 
			height: imageHeight, 
			x : imageX, 
			y : imageY,
			name : settings.actors[i][0]
		});
		this.actors.push( actor);		
		imageX += imageWidth + xSeparation;
		if (imageWidth > (this.width + this.x - imageX )) {
			if (imageHeight < (this.height + this.y - imageY )) {
				imageY += imageHeight + ySeparation;
				imageX = this.x;
			} else{
				break;
			}
		}
	}
}
