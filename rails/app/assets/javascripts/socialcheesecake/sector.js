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
			color : socialCheesecake.Cheesecake.getSectorFillColor(),
			textAndStrokeColor : socialCheesecake.Cheesecake.getSectorTextAndStrokeColor(),
			mouseover : { color : socialCheesecake.Cheesecake.getSectorHoverColor() },
			mouseout : { color : socialCheesecake.Cheesecake.getSectorFillColor() },
			mouseup : { color : socialCheesecake.Cheesecake.getSectorFillColor() },
			mousedown : { color : socialCheesecake.Cheesecake.getSectorFocusColor() },
			auxiliar : false
		}
		for(var property in defaultSettings) {
			if(!(property in settings) || (settings[property]===undefined)) {
				settings[property] = defaultSettings[property];
			}
		}
		settings.phi %= 2*Math.PI;
		while(settings.phi <0){
			settings.phi += 2*Math.PI;
		}
		if(settings.delta <= 0 || settings.delta > 2 * Math.PI) {
			throw "Delta must be greater than 0 and less than 2*pi";
		}
		if(settings.id) this.id = settings.id;
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
		this.extraSubsectors = [];
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
					id : settings.subsectors[i].id,
					label : settings.subsectors[i].name,
					parent : this,
					x : this.x,
					y : this.y,
					phi : this.phi,
					delta : this.delta,
					rIn : rInSubsector,
					rOut : rOutSubsector,
					actors : settings.subsectors[i].actors,
					mouseover : { color : socialCheesecake.Cheesecake.getSectorHoverColor(),
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
							subsector.getCheesecake().grid.hideAll();
							subsector.getCheesecake().grid.fadeIn(subsector.actors, 300, true);				
						}
					},
					mouseout :{
						color : socialCheesecake.Cheesecake.getSectorFillColor(),
						callback : function(subsector) {
							document.body.style.cursor = "default";
							subsector.getCheesecake().grid.fadeIn(subsector.parent.actors, 300, true);
						}
					},
					mousedown : {
						callback : function(subsector) {
							var selectedActors = subsector.getCheesecake().grid.getSelectedActors();
							subsector.changeMembership(selectedActors);
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
		if((this.auxiliar)&&(label=="+")){
			socialCheesecake.text.addPlusCharacter(context, x, y, 0.5*(rOut-rIn) + rIn, 
			phi, delta, textAndStrokeColor);
		}else{
			socialCheesecake.text.writeCurvedText(label, context, x, y, 0.7*(rOut-rIn) + rIn, 
			phi, delta, textAndStrokeColor);
		}				
		if(!this.auxiliar)
			socialCheesecake.text.writeCurvedText("(" + actors.length + ")", context, x, y, 
				0.55*(rOut-rIn) + rIn, phi, delta, textAndStrokeColor);
	}
	
	socialCheesecake.Sector.prototype.getRegion = function() {
		if(this._region == null) {
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
		var extraWidth = (rOut - rIn) * 0.06;
		var sectorWidth = (rOut - rIn - (parts - subsectors.length) * extraWidth) / subsectors.length;
		var extraSettings = {
			x : cheesecake.center.x,
			y : cheesecake.center.y,
			delta : delta,
			phi : phi,
			label : "+",
			parent : this,
			auxiliar : true,
			color : socialCheesecake.Cheesecake.getExtraSectorFillColor(),
			mouseover : {
				color : socialCheesecake.Cheesecake.getExtraSectorHoverColor(),
				callback : function (sector){
					sector.resizeWidth({
						width : extraWidth*1.5,
						anchor : "m",
						step : 1 
					});
				}
			},
			mouseout : {
				color : socialCheesecake.Cheesecake.getExtraSectorFillColor(),
				callback : function(sector){
					sector.resizeWidth({
						width : extraWidth,
						anchor : "m",
						step : 1,
						priority : true 
					})
				}
			}
		}		
		//Add sector's subsectors
		for(var i in subsectors){			
			rIn += extraWidth;
			subsectors[i].rIn = rIn;
			subsectors[i].rOut = rIn + sectorWidth;
			subsectors[i].phi = phi;
			subsectors[i].delta = delta;
			cheesecake.stage.add(subsectors[i].getRegion());
			rIn += sectorWidth;
		}
		//Add extra subsectors 
		rIn = 0;
		for(var i = 0; i< parts- subsectors.length; i++){			
			if(i == 0){
				var extraSettingsFirst = {
					x : cheesecake.center.x,
					y : cheesecake.center.y,
					rIn : rIn,
					rOut : rIn +extraWidth,
					delta : delta,
					phi : phi,
					label : "+",
					parent : this,
					auxiliar : true,
					color : socialCheesecake.Cheesecake.getExtraSectorFillColor(),
					mouseover : {
						color : socialCheesecake.Cheesecake.getExtraSectorHoverColor(),
						callback : function (sector){
							sector.resizeWidth({
								width : extraWidth*1.5,
								anchor : "rin",
								step : 1 
							});
						}
					},
					mouseout : {
						color : socialCheesecake.Cheesecake.getExtraSectorFillColor(),
						callback : function(sector){
							sector.resizeWidth({
								width : extraWidth,
								anchor : "rin",
								step : 1,
								priority : true 
							})
						}
					}
				}
				var extraSector = new socialCheesecake.Subsector(extraSettingsFirst);  
			}else{
				extraSettings["rIn"]= rIn;
				extraSettings["rOut"]= rIn + extraWidth;
				var extraSector = new socialCheesecake.Subsector(extraSettings); 
			}
			cheesecake.stage.add(extraSector.getRegion());
			this.extraSubsectors.push(extraSector);
			rIn += extraWidth + sectorWidth;
		}
	}
	
	socialCheesecake.Sector.prototype.putTogether = function() {
		var cheesecake = this.getCheesecake();
		var sector = (this.simulate != null) ? cheesecake.sectors[this.simulate] : this;
		var subsectors = sector.subsectors;
		var extraSubsectors = this.extraSubsectors;
		//Clear subsectors from stage
		for(var i = extraSubsectors.length ; i>0 ; i--){
			cheesecake.stage.remove((extraSubsectors.pop()).getRegion());
		}
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
	 	* Options: 
		*	delta - new delta to achieve (default: Math.PI/2)
		*	step - sets the animation speed (default: 0.05)
		*	anchor - 	"beginning" , "b", "B"
		*						"middle", "m", "M"
		*						"end", "e", "E"
	 */
	socialCheesecake.Sector.prototype.resizeDelta = function(options) {
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
		//Calculate new parameters
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
		
		//Redraw
		context.restore();
		context.save();
		stage.draw();
		//Repeat if necessary
		if(currentDelta != goalDelta) {
			requestAnimFrame(function() {
				sector.resizeDelta(options);
			});
		} else if(options.callback) {
			options.callback();
		}
	}

	/**
	 	* Options: 
		*	width - new width to achieve
		*	step - sets the animation speed
		*	anchor - 	"rIn" , "rin", "in", "I", "i"
		*						"middle", "m", "M"
		*						"rOut", "rout", "out", "O", "o"
		* priority - true to terminate other resizeWidth methods running
	 */
	socialCheesecake.Sector.prototype.resizeWidth = function(options) {
		var sector = this;
		var context = sector.getRegion().layer.getContext();
		var stage = sector.getCheesecake().stage;
		var currentRIn = this.rIn;
		var currentROut = this.rOut;
		var currentWidth = (currentROut - currentRIn);
		var step = 0.05;
		var goalWidth = currentWidth;
		var anchor = 1;
		var grow = 0;
		var error = false;
		var goOn = true;
		if(options.step) step = options.step;
		if(options.width) goalWidth = options.width;
		if(goalWidth < 0) throw "Width must be greater than or equal to zero";
		if(options.anchor) {
			if((options.anchor.toLowerCase() == "i") || (options.anchor == "in") 
					|| (options.anchor.toLowerCase() == "rin")){
				anchor = 1;
			}
			if((options.anchor.toLowerCase() == "m") || (options.anchor == "middle")){
				anchor = 0.5;
			}
			if((options.anchor.toLowerCase() == "o") || (options.anchor == "out")
					|| (options.anchor.toLowerCase() == "rout")){
				anchor = 0;
			}
		}
		//Calculate new parameters
		if(currentWidth > goalWidth) {
			//Make more little
			if(currentWidth - goalWidth < step) step = currentWidth - goalWidth;	
			grow = -1;
		} else if(currentWidth < goalWidth) {
			//Make bigger
			if(goalWidth - currentWidth < step)	step = goalWidth - currentWidth;
			grow = 1;
		}
		if(options.priority) sector.grow =grow;
		if((sector.grow!=null)&&(grow != sector.grow)){
			goOn =false;
		}else{
			goOn = true;
			sector.grow = grow;
		}
		currentROut = currentROut + (grow * anchor * step);
		currentRIn = currentRIn - (grow * (1 - anchor) * step);
		currentWidth = currentROut - currentRIn;
		if(currentRIn <0 || currentROut <0){
			console.log("WARNING!! Width cannot change anymore. It has reached it maximum/ minimum level.");
			error =true;
		}else{
			sector.rOut = currentROut;
			sector.rIn = currentRIn;
			//Redraw
			context.restore();
			context.save();
			stage.draw();
		}
		//Repeat if necessary
		if ((goOn) &&(!error && Math.round(currentWidth *1000) != Math.round(goalWidth *1000))) {
			requestAnimFrame(function() {
				sector.resizeWidth(options);
			});
		} else{
			sector.grow= undefined;
			if(options.callback) {
				options.callback();
			}
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
		if(Math.round(((2 * Math.PI) - Math.abs(phiDestination - currentPhi) ) * 1000) / 1000 
			>= Math.round(Math.abs(phiDestination - currentPhi) * 1000) / 1000) {
				
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
	
	socialCheesecake.Sector.prototype.addActor = function(actorInfo , subsector){
		var actors = this.actors;
		var actor;
		
		//Check if the actor is already in the array
		var actorAlreadyDeclared = false;
		for (var i in actors){
			if (actors[i].id == actorInfo.id){
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
				actor = this.parent.addActor(actorInfo, subsector);
			}else{
				actor = this.parent.grid.addActor(actorInfo, subsector);
			}
			actors.push(actor);
		}
		return actor;
	}
	
	socialCheesecake.Sector.prototype.removeActor = function (actor){
		var actors = this.actors;
		var actorParents;
		var actorPresentInSector = false;
		
		for(var actorIndex in actors){
			if(actors[actorIndex].id == actor.id){
				actorParents = actor.parents;
				//Find out if there is a subsector in this sector with this actor
				for (var parent in actorParents){
					for (var subsector in this.subsectors){
						if(actorParents[parent] === this.subsectors[subsector]){
							actorPresentInSector = true;
							break;
						}
					}						
				}
				//If there isn't, remove the actor from the array and tell the Grid
				if(!actorPresentInSector){
					actors.splice(actorIndex,1);
				}
			}
		}
	}
	
	/*SUBSECTOR*/
	socialCheesecake.Subsector = function(settings) {
		this.id = settings.id;
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
		this.auxiliar = (settings.auxiliar) ? settings.auxiliar : false;
		if(settings.color) this.color = settings.color;
		if(settings.textAndStrokeColor) this.textAndStrokeColor = settings.textAndStrokeColor;
		if(settings.mousedown != null) this.mousedown = settings.mousedown;
		if(settings.mouseup != null) this.mouseup = settings.mouseup; 
		if(settings.mouseover != null) this.mouseover = settings.mouseover; 
		if(settings.mouseout != null) this.mouseout = settings.mouseout;

		var grid = this.getCheesecake().grid;
		if (settings.actors){
			for(var actor in settings.actors){
				var actor_info = {
					id : settings.actors[actor][0],
					name : settings.actors[actor][1]
				}
				this.addActor(actor_info ,this);
			}
		}
	}
	
	socialCheesecake.Subsector.prototype = new socialCheesecake.Sector({
		id : this.id,
		parent : this.parent,
		center : {  x : this.x, y : this.y },
		label : this.label,
		rIn : this.rIn,
		rOut : this.rOut,
		phi : this.phi,
		delta : this.delta,
		auxiliar : this.auxiliar,
		color : this.color,
		textAndStrokeColor : this.textAndStrokeColor,
		
		mouseover : this.mouseover,
		mouseout : this.mouseout,
		mouseup : this.mouseup,
		mousedown : this.mousedown
	});
	
	socialCheesecake.Subsector.prototype.getCheesecake = function () {
		var subsector = this;
		return subsector.parent.parent;
	}
	
	socialCheesecake.Subsector.prototype.removeActor = function(actor){
		var actors = this.actors;
		var actorParents;
		for(var actorIndex in actors){
			if(actors[actorIndex].id == actor.id){
				actorParents = actor.parents;
				//Remove subsector from actors parents array
				for( var parent in actorParents){
					if (actorParents[parent] === this){
						actorParents.splice(parent,1);
					}
				}
				//Remove from actors array and tell the sector parent
				actors.splice(actorIndex,1);
				this.parent.removeActor(actor);
			}
		}
	}
	
	socialCheesecake.Subsector.prototype.changeMembership = function(actors){
		var actualActors = this.actors;
		var actorInfo;
		var isMember = false;
		
		for(var i in actors){
			for ( var j in actualActors){
				if (actualActors[j].id == actors[i].id){
					isMember = true;
					this.removeActor(actors[i]);
					break;
				}
			}
			if(!isMember){
				actorInfo = { id : actors[i].id};
				this.addActor(actorInfo, this);
			}
			this.getCheesecake().updateActorMembership(actors[i].id);
			isMember = false;
		}
	}

})();
