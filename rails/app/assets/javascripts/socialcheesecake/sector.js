var socialCheesecake = socialCheesecake || {};
(function() {
	socialCheesecake.Sector = function(settings) {
		var defaultSettings = {
			center : { x : 0,  y : 0 },
			rIn : 0,
			rOut : 300,
			delta : Math.PI /2 ,
			phi : 0,
			label : "",
			color : socialCheesecake.colors.normalSector.background,
			auxiliar : false,
			type : "normalSector"
		}
		if(!settings){
			settings = defaultSettings;
			console.log("no hay settings");
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
		if(settings.fontColor) this.fontColor = settings.fontColor;
		if(settings.borderColor) this.borderColor = settings.borderColor;
		if(settings.mouseover) this.mouseover = settings.mouseover;
		if(settings.mouseup) this.mouseup = settings.mouseup;
		if(settings.mouseout) this.mouseout = settings.mouseout;
		if(settings.click) this.click = settings.click;
		this.subsectors = [];
		this.extraSubsectors = [];
		this.actors = [];
		if(settings.parent != null) this.parent = settings.parent;
		if(settings.simulate != null) this.simulate = settings.simulate;
		this.auxiliar = settings.auxiliar;
		this.type = settings.type;
		
		if(settings.subsectors != null) {
			var rInSubsector = this.rIn;
			var separation = (this.rOut - this.rIn) / settings.subsectors.length;
			for(var i in settings.subsectors) {
				var rOutSubsector = rInSubsector + separation;
				var subsector = new socialCheesecake.Subsector({
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
					color : socialCheesecake.colors.normalSector.background,
				});
				rInSubsector = rOutSubsector;
				this.subsectors.push(subsector);
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
			simulate : this.simulate,
			subsectors : this.subsectors,
			auxiliar : this.auxiliar,
			type: this.type
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
		var actors = this.actors;
		var type = this.type;
		var fontColor = this.fontColor || socialCheesecake.colors[type]["font"];
		
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
		context.strokeStyle = this.borderColor || socialCheesecake.colors[type]["border"];
		context.stroke();
		if((this.auxiliar)&&(label=="+")){
			socialCheesecake.text.addPlusCharacter(context, x, y, 0.5*(rOut-rIn) + rIn, 
				phi, delta, fontColor);
		}else if((this.parent.auxiliar)&&(this.parent.label=="+")){
			socialCheesecake.text.writeCurvedText(label, context, x, y, 0.7*(rOut-rIn) + rIn, 
				phi, delta, fontColor, "newStyle");
		}else{
			socialCheesecake.text.writeCurvedText(label, context, x, y, 0.7*(rOut-rIn) + rIn, 
				phi, delta, fontColor);
		}				
		if(!this.auxiliar)
			socialCheesecake.text.writeCurvedText("(" + actors.length + ")", context, x, y, 
				0.55*(rOut-rIn) + rIn, phi, delta, fontColor);
	}
	
	socialCheesecake.Sector.prototype.getRegion = function() {
		if(this._region == null) {
			var sector = this;
			sector._region = new Kinetic.Shape(function() {
				var context = this.getContext();
				sector._draw(context);
			});
			sector._region.on('mouseover', function() {
				sector.eventHandler('mouseover');
			});
			sector._region.on('mouseout', function() {
				sector.eventHandler('mouseout');
			});
			sector._region.on('click', function() {
				sector.eventHandler('click');
			});
			sector._region.on('mouseup', function() {
				sector.eventHandler('mouseup');
			});
		}
		return this._region
	}
	
	socialCheesecake.Sector.prototype.eventHandler = function(eventName) {
		this.colorHandler(eventName);
		this.callbackHandler(eventName);
	}
	
	socialCheesecake.Sector.prototype.colorHandler = function(eventName) {
		var sector = this;
		var type = sector.type;

		if(sector[eventName] != null && sector[eventName].color != null){
			sector.changeColor(sector[eventName].color);
		}else if(socialCheesecake.colors[type] && socialCheesecake.colors[type][eventName]){
			sector.changeColor(socialCheesecake.colors[type][eventName]);
		}
	}
	
	socialCheesecake.Sector.prototype.callbackHandler = function(eventName) {
		var sector = this;
		var type = sector.type;

		if(sector[eventName] != null && sector[eventName].callback != null){
			sector[eventName].callback(sector);
		}else	if(socialCheesecake.eventCallbackHandlers[type] && socialCheesecake.eventCallbackHandlers[type][eventName]){
			socialCheesecake.eventCallbackHandlers[type][eventName](sector);
		}
	}
	
	socialCheesecake.Sector.prototype.getCheesecake = function () {
		var sector = this;
		return sector.parent;
	}
	
	socialCheesecake.Sector.prototype.splitUp = function() {
		var cheesecake = this.getCheesecake();
		var callback = cheesecake.onSectorFocusEnd;
		var mainLayer = cheesecake.stage.mainLayer;
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
			parent : sector,
			auxiliar : true,
			color : socialCheesecake.colors.extraSector.background,
			type : "extraSubsector"
		}		
		//Add sector's subsectors
		for(var i in subsectors){			
			rIn += extraWidth;
			subsectors[i].rIn = rIn;
			subsectors[i].rOut = rIn + sectorWidth;
			subsectors[i].phi = phi;
			subsectors[i].delta = delta;
			mainLayer.add(subsectors[i].getRegion());
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
					parent : sector,
					auxiliar : true,
					color : socialCheesecake.colors.extraSector.background,
					mouseover : {
						callback : function (sector){
							sector.resizeWidth({
								width : extraWidth*1.5,
								anchor : "rin",
								step : 1 
							});
						}
					},
					mouseout : {
						callback : function(sector){
							sector.resizeWidth({
								width : extraWidth,
								anchor : "rin",
								step : 1,
								priority : true 
							})
						}
					},
					type : "extraSubsector",
					simulate : i
				}
				var extraSector = new socialCheesecake.Subsector(extraSettingsFirst);  
			}else{
				extraSettings["rIn"]= rIn;
				extraSettings["rOut"]= rIn + extraWidth;
				extraSettings["simulate"] = i;
				var extraSector = new socialCheesecake.Subsector(extraSettings); 
			}
			mainLayer.add(extraSector.getRegion());
			this.extraSubsectors.push(extraSector);
			rIn += extraWidth + sectorWidth;
		}
		if(callback){
			callback(cheesecake);
		}
		mainLayer.draw();
	}
	
	socialCheesecake.Sector.prototype.putTogether = function() {
		var cheesecake = this.getCheesecake();
		var mainLayer = cheesecake.stage.mainLayer;
		var sector = (this.simulate != null) ? cheesecake.sectors[this.simulate] : this;
		var subsectors = sector.subsectors;
		var extraSubsectors = this.extraSubsectors;
		//Clear subsectors from stage
		for(var i = extraSubsectors.length ; i>0 ; i--){
			mainLayer.remove((extraSubsectors.pop()).getRegion());
		}
		for(var i in subsectors) {
			mainLayer.remove(subsectors[i].getRegion());
		}
	}
	
	socialCheesecake.Sector.prototype.changeColor = function(color) {
		this.changeProperty("color", color);
	}
	
	socialCheesecake.Sector.prototype.changeLabel = function(label){
		this.changeProperty("label", label);
	}
	
	socialCheesecake.Sector.prototype.changeProperty = function (name, value){
		var sector = this;
		var stage = sector.getCheesecake().stage;
		var context = stage.mainLayer.getContext();
		sector[name] = value;
		context.restore();
		context.save();
		stage.draw();
	}
	
	/**
	 	* Options: 
		*	delta - new delta to achieve (default: Math.PI/2)
		*	step - sets the animation speed (default: 0.05)
		*	anchor - 	"beginning" , "b", "B"
		*						"middle", "m", "M"
		*						"end", "e", "E"
		* priority - true to terminate other resizeDelta methods running
		* callback - function to execute at the end of the animation
	 */
	socialCheesecake.Sector.prototype.resizeDelta = function(options) {
		if(!options)
			throw "No arguments passed to the function";
		var sector = this;
		var stage = sector.getCheesecake().stage;
		var context = stage.mainLayer.getContext();
		var currentDelta = sector.delta;
		var currentPhi = sector.phi;
		var step = 0.05;
		var goalDelta = Math.PI / 2;
		var anchor = 1;
		var goOn = true;
		var grow = 0;
		
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
			grow = -1;
		} else if(currentDelta < goalDelta) {
			if(goalDelta - currentDelta < step) step = goalDelta - currentDelta;
			currentDelta += step;
			currentPhi -= anchor * step;
			grow = 1;
		}
		if(options.priority) sector.growDelta =grow;
		if((sector.growDelta !=null)&&(grow != sector.growDelta)){
			goOn = false;
		}else{
			goOn = true;
			sector.growDelta = grow;
		}
		sector.delta = currentDelta;
		sector.phi = currentPhi;
		
		//Redraw
		context.restore();
		context.save();
		stage.draw();
		//Repeat if necessary
		if(goOn && (Math.round(currentDelta*1000) != Math.round(goalDelta*1000))) {
			requestAnimFrame(function() {
				sector.resizeDelta(options);
			});
		}else{
			sector.growDelta = undefined;
			if(options.callback) {
				options.callback();
			}
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
		* callback - function to execute at the end of the animation
	 */
	socialCheesecake.Sector.prototype.resizeWidth = function(options) {
		var sector = this;
		var stage = sector.getCheesecake().stage;
		var context = stage.mainLayer.getContext();
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
		var stage = sector.getCheesecake().stage;
		var context = stage.mainLayer.getContext();
		sector.rOut = sector.originalAttr.rOut * 1.05;
		context.restore();
		context.save();
		stage.draw();
	}
	
	socialCheesecake.Sector.prototype.unfocus = function() {
		var sector = this;
		var stage = sector.getCheesecake().stage;
		var context = stage.mainLayer.getContext();
		sector.rOut = sector.originalAttr.rOut;
		context.restore();
		context.save();
		stage.draw();
	}
	
	/**
	 * open - true: expand sector
	 * 			- false: shrink sector
	 * resizeDeltaCallback - callback to execute at the end of the animation
	 */	
	socialCheesecake.Sector.prototype.fan = function(open, resizeDeltaCallback){
		var sector = this;
		var minDelta = Math.PI/5;

		if(open && (sector.delta >= minDelta)) return; 
		if(open){
			sector.getRegion().moveToTop();
			sector.resizeDelta({
				anchor: "m",
				delta: minDelta,
				callback : resizeDeltaCallback
			});
		}else{
			sector.resizeDelta({
				anchor: "m",
				delta: sector.originalAttr.delta,
				priority : true,
				callback : resizeDeltaCallback
			});
		}
	}
	
	socialCheesecake.Sector.prototype.rotateTo = function(options) {
		// update stage
		var sector = this;
		var currentPhi = this.phi % (2 * Math.PI);
		var delta = this.delta;
		var step = 0.05;
		var anchor = 0;
		var stage = sector.getCheesecake().stage;
		var context = stage.mainLayer.getContext();
		if(!options) throw "No arguments passed to the function";
		if(options.step) step = options.step;
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
		while(currentPhi < 0) {
			currentPhi += (2 * Math.PI);
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
	
	socialCheesecake.Sector.prototype.addNewSubsector = function (sectorIndex){
		var subsectors = this.subsectors;
		var settings = {
			parent : this,
			x : this.x,
			y : this.y,
			delta : this.delta,
			phi : this.phi /*,
			id : jsonSectors[i].id,*/
		};
		var rOut = this.rOut;
		var rIn = this.rIn;
		var separation = (rOut - rIn)/ (subsectors.length + 1);
		/*Rearrange subsectors*/		
		for(var i = subsectors.length ; i >= 0 ; i--){
			rIn = rOut - separation;
			console.log(i);
			if( i > sectorIndex){
				subsectors[i] = subsectors[i-1];
				console.log(subsectors[i].label);
			}
			if( i == sectorIndex ){
				console.log("new subsector "+ i);
				settings.rIn = rIn;
				settings.rOut = rOut;
				settings.label = "New Subsector "+ i;
				subsectors[i]= new socialCheesecake.Subsector(settings);
			}else{
				subsectors[i].rIn = rIn;
				subsectors[i].rOut = rOut;
			}
			rOut = rIn;
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
})();
