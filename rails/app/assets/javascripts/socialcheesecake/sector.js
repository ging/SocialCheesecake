var socialCheesecake = socialCheesecake || {};
(function() {
	socialCheesecake.Sector = function(settings) {
		var defaultSettings = {
			center : { x : 0,  y : 0 },
			rIn : 0,
			rOut : 300,
			delta : Math.PI / 2,
			phi : 0,
			label : "",
			color : "#eeffee",
			textAndStrokeColor : "#1F4A75",
			mouseover : { color : "#aaffaa" },
			mouseout : { color : "#eeffee" },
			mouseup : { color : "#77ff77" },
			mousedown : { color : "#aaffaa" },
			auxiliar : false
		}
		for(var property in defaultSettings) {
			if(!(property in settings)) {
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
		this.textAndStrokeColor = settings.textAndStrokeColor;
		this.mouseover = settings.mouseover;
		this.mouseup = settings.mouseup;
		this.mouseout = settings.mouseout;
		this.mousedown = settings.mousedown;
		this.subsectors = [];
		this.actors = [];
		if(settings.parent != null) this.parent = settings.parent;
		if(settings.simulate != null) this.simulate = settings.simulate;
		this.auxiliar = settings.auxiliar;
		
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
					actors : settings.subsectors[i].actors,
					mouseover : { color : "#aaffaa",
						callback : function(subsector) {
							/* FIX FOR EXECUTING MOUSEOUT BEFORE MOUSEOVER */					
							for(var i in subsector.parent.subsectors){
								subsector.parent.subsectors[i].getRegion().removeEventListener("mouseout");
								if(subsector.parent.subsectors[i]!= subsector){
								 subsector.parent.subsectors[i].changeColor(subsector.parent.subsectors[i].mouseout.color);
								}
							}
							subsector.getRegion().addEventListener("mouseout", function() {
								subsector.eventHandler('mouseout');
							});
							
							document.body.style.cursor = "pointer";
							subsector.parent.parent.grid.hideAll();
							subsector.parent.parent.grid.fadeIn(subsector.actors, 300, true);				
						}
					},
					mouseout :{
						color : "#eeffee",
						callback : function(subsector) {
							document.body.style.cursor = "default";
							subsector.parent.parent.grid.fadeIn(subsector.parent.actors, 300, true);
						}
					} 
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
			textAndStrokeColor : this.textAndStrokeColor,
			label : this.label,
			mouseover : this.mouseover,
			mouseout : this.mouseout,
			mousedown : this.mousedown,
			mouseup : this.mouseup,
			simulate : this.simulate,
			subsectors : this.subsectors,
			auxiliar : this.auxiliar
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
		var textAndStrokeColor = this.textAndStrokeColor;
		var label = this.label;
		var actors = this.actors;
		if(options != null) {
			if(options.x != null) x = options.x;
			if(options.y != null) y = options.y;
			if(options.phi != null) phi = options.phi;
			if(options.delta != null)  delta = options.delta;
			if(options.rIn != null)  rIn = options.rIn;
			if(options.rOut != null) rOut = options.rOut;
			if(options.color != null)  color = options.color;
			if(options.label != null) label = options.label;
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
		context.lineWidth = 2;
		context.strokeStyle = textAndStrokeColor;
		context.stroke();
		socialCheesecake.text.writeCurvedText(label, context, x, y, 0.7*(rOut-rIn) + rIn, 
			phi, delta, textAndStrokeColor);		
		if(!this.auxiliar)
			socialCheesecake.text.writeCurvedText("(" + actors.length + ")", context, x, y, 
				0.55*(rOut-rIn) + rIn, phi, delta, textAndStrokeColor);
	}
	
	socialCheesecake.Sector.prototype.getRegion = function() {
		if(this._region == null) {
			console.log("getRegion!");
			console.log(this.rOut);
			console.log(this.rIn);
			var sector = this;
			sector._region = new Kinetic.Shape(function() {
				var context = this.getContext();
				sector._draw(context);
			});
			sector._region.addEventListener('mouseover', function() {
				sector.eventHandler('mouseover');
			});
			sector._region.addEventListener('mouseout', function() {
				sector.eventHandler('mouseout');
			});
			sector._region.addEventListener('mousedown', function() {
				sector.eventHandler('mousedown');
			});
			sector._region.addEventListener('mouseup', function() {
				sector.eventHandler('mouseup');
			});
		}
		return this._region
	}
	
	socialCheesecake.Sector.prototype.eventHandler = function(eventName) {
		var sector = this;
		if(sector[eventName] != null){
			if(sector[eventName].color != null) {
				var color = sector[eventName].color;
				sector.changeColor(color);
			}
			if(sector[eventName].callback != null) {
				sector[eventName].callback(sector);
			}
		}
	}
	
	socialCheesecake.Sector.prototype.getCheesecake = function () {
		var sector = this;
		return sector.parent;
	}
	
	socialCheesecake.Sector.prototype.splitUp = function() {
		var cheesecake = this.getCheesecake();
		var phi = this.phi;
		var delta = this.delta;
		var rOut = this.rOut;
		var rIn = this.rIn;
		var sector = (this.simulate != null) ? cheesecake.sectors[this.simulate] :  this;
		var subsectors = sector.subsectors;
		var parts = subsectors.length * 2 + 1;

		//Draw sector's subsectors over it
		var subsectorRIn = rIn;
		var extraWidth = (rOut - rIn) * 0.05;
		var separation = (rOut - rIn - (parts - subsectors.length) * extraWidth) / subsectors.length;
		for(var i = 0; i<parts; i++){
			if(i%2 == 0){
				//Extra sectors
				rIn += extraWidth;
			}else{
				//Actual subsectors
				var subsectorIndex = Math.floor(i/2);
				subsectors[subsectorIndex].rIn = rIn;
				subsectors[subsectorIndex].rOut = rIn + separation;
				subsectors[subsectorIndex].phi = phi;
				subsectors[subsectorIndex].delta = delta;
				console.log("SPLITUP: SUBSECTOR "+ subsectorIndex);
				cheesecake.stage.add(subsectors[subsectorIndex].getRegion());
				rIn += separation;
			}
			
		}
		/*
		for(var i in subsectors) {
			subsectors[i].rIn = rIn;
			subsectors[i].rOut = rIn + separation;
			subsectors[i].phi = phi;
			subsectors[i].delta = delta;
			cheesecake.stage.add(subsectors[i].getRegion());
			rIn += separation;
		}*/
	}
	
	socialCheesecake.Sector.prototype.putTogether = function() {
		var cheesecake = this.getCheesecake();
		var sector; (this.simulate != null) ? sector = cheesecake.sectors[this.simulate] : sector = this;
		var subsectors = sector.subsectors;
		//Clear subsectors from stage
		for(var i in subsectors) {
			cheesecake.stage.remove(subsectors[i].getRegion());
		}
	}
	
	socialCheesecake.Sector.prototype.changeColor = function(color) {
		var sector = this;
		if (sector.getRegion().layer){
			var context = sector.getRegion().layer.getContext();
			var stage = sector.getCheesecake().stage;
			sector.color = color;
			context.restore();
			context.save();
			stage.draw();
		}
	}
	
	/**
	*
	* Options: 
	*	delta - new delta to achieve
	*	context - sector context to work with
	*	step - sets the animation speed
	*	anchor - "beginning" , "b", "B"
	*	"middle", "m", "M"
	*	"end", "e", "E"
	*
	**/
	socialCheesecake.Sector.prototype.resize = function(options) {
		if(!options)
			throw "No arguments passed to the function";
		var sector = this;
		var context = sector.getRegion().layer.getContext();
		var stage = sector.getCheesecake().stage;
		var currentDelta = sector.delta;
		var currentPhi = sector.phi;
		var step = 0.05;
		var goalDelta = Math.PI / 2;
		var anchor = 1;
		if(options.step) step = options.step;
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
			if(currentDelta - goalDelta < step) step = currentDelta - goalDelta;
			currentDelta -= step;
			currentPhi += anchor * step;
		} else if(currentDelta < goalDelta) {
			if(goalDelta - currentDelta < step) step = goalDelta - currentDelta;
			currentDelta += step;
			currentPhi -= anchor * step;
		}
		sector.delta = currentDelta;
		sector.phi = currentPhi;

		context.restore();
		context.save();
		stage.draw();
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
		var context = sector.getRegion().layer.getContext();
		var stage = sector.getCheesecake().stage;
		sector.rOut = sector.originalAttr.rOut * 1.05;
		context.restore();
		context.save();
		stage.draw();
	}
	
	socialCheesecake.Sector.prototype.unfocus = function() {
		var sector = this;
		var context = sector.getRegion().layer.getContext();
		var stage = sector.getCheesecake().stage;
		sector.rOut = sector.originalAttr.rOut;
		context.restore();
		context.save();
		stage.draw();
	}
	
	socialCheesecake.Sector.prototype.rotateTo = function(options) {
		// update stage
		var sector = this;
		var currentPhi = this.phi;
		var delta = this.delta;
		var step = 0.05;
		var anchor = 0;
		var stage = sector.getCheesecake().stage;
		var context = sector.getRegion().layer.getContext();
		if(!options) throw "No arguments passed to the function";
		if(options.step) step = options.step;
		/*if(options.context == null) throw "context must be defined";
		var context = options.context;*/
		if(options.destination == null) throw "destination must be defined";
		if(options.anchor){
			if((options.anchor.toLowerCase() == "b") || (options.anchor == "beginning"))
				anchor = 0;
			if((options.anchor.toLowerCase() == "m") || (options.anchor == "middle"))
				anchor = 0.5;
			if((options.anchor.toLowerCase() == "e") || (options.anchor == "end"))
				anchor = 1;
		}
		var phiDestination = (options.destination- anchor*delta) % (2 * Math.PI) ;
		while(phiDestination < 0) {
			phiDestination += (2 * Math.PI);
		}

		var grow = 0;
		if(phiDestination > currentPhi) {
			grow = 1;
		} else if(phiDestination < currentPhi) {
			grow = -1;
		}
		if(Math.round(((2 * Math.PI) - Math.abs(phiDestination - currentPhi) ) * 1000) / 1000 >= Math.round(Math.abs(phiDestination - currentPhi) * 1000) / 1000) {
			if(Math.abs(phiDestination - currentPhi) < step)
				step = Math.abs(phiDestination - currentPhi);
			currentPhi += (grow * step);

			// if (grow>0) console.log("giro al contrario agujas. Caso 1 ");
			//if(grow<0) console.log("giro segun agujas. Caso 1");
		} else {
			if((2 * Math.PI) - Math.abs(phiDestination - currentPhi) < step)
				step = (2 * Math.PI) - Math.abs(phiDestination - currentPhi);
			phiDestination -= (grow * 2 * Math.PI);
			currentPhi -= (grow * step);
			//if (grow<0) console.log("giro al contrario agujas. Caso 2");
			//if(grow>0) console.log("giro segun agujas. Caso 2 ");
		}
		sector.phi = currentPhi;

		// redraw
		context.restore();
		context.save();
		stage.draw();

		// request new frame
		if(Math.abs(currentPhi - phiDestination) > 0.001) {
			sector.phi = currentPhi % (2 * Math.PI);
			requestAnimFrame(function() {
				sector.rotateTo({
					context : context,
					destination : options.destination,
					step : step,
					callback : options.callback,
					anchor : options.anchor
				});
			});
		} else {
			if(options.callback) options.callback();
		}
	}
	
	socialCheesecake.Sector.prototype.addActor = function(actor_info , subsector){
		var actors = this.actors;
		var actor;
		
		//Check if the actor is already in the array
		var actorAlreadyDeclared = false;
		for (var i in actors){
			if (actors[i].id == actor_info.id){
				actorAlreadyDeclared = true;
				actor = actors[i];
				//Check if the subsector has already been declared a parent of the actor
				var subsectorAlreadyDeclared = false;
				for ( var parent in actor.parents){
					if (actor.parents[parent] == subsector) subsectorAlreadyDeclared=true;
				}
				if (!subsectorAlreadyDeclared) actor.parents.push(subsector);
			}
		}
		// If the actor was not in the array, ask the parent or the grid for it
		if(!actorAlreadyDeclared){		
			if (this == subsector){
				actor = this.parent.addActor(actor_info, subsector);
			}else{
				actor = this.parent.grid.addActor(actor_info, subsector);
			}
			actors.push(actor);
		}
		return actor;
	}
	
	/*SUBSECTOR*/
	socialCheesecake.Subsector = function(settings) {
		if(settings.parent != null) this.parent = settings.parent;		
		this.label = "";
		if(settings.label != null) this.label = settings.label;
		this.x = settings.x; 
		this.y = settings.y; 
		this.rOut = settings.rOut;
		this.rIn = settings.rIn;
		this.phi = settings.phi;
		this.delta = settings.delta;
		this.actors = [];
		if(settings.mousedown != null) this.mousedown = settings.mousedown;
		if(settings.mouseup != null) this.mouseup = settings.mouseup; 
		if(settings.mouseover != null) this.mouseover = settings.mouseover; 
		if(settings.mouseout != null) this.mouseout = settings.mouseout;

		var grid = this.getCheesecake().grid;
		if (settings.actors){
			for( var actor in settings.actors){
				var actor_info = {
					id : settings.actors[actor][0]
				}
				this.addActor(actor_info ,this);
			}
		}
	}
	
	socialCheesecake.Subsector.prototype = new socialCheesecake.Sector({
		parent : this.parent,
		center : {  x : this.x, y : this.y },
		label : this.label,
		rIn : this.rIn,
		rOut : this.rOut,
		phi : this.phi,
		delta : this.delta,
		
		mouseover : this.mouseover,
		mouseout : this.mouseout,
		mouseup : this.mouseup,
		mousedown : this.mousedown
	});
	
	socialCheesecake.Subsector.prototype.getCheesecake = function () {
		var subsector = this;
		return subsector.parent.parent;
	}
})();
