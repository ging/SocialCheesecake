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
		// Possible exceptions
		if(settings.delta <= 0 || settings.delta > 2 * Math.PI) 
			throw "Delta must be greater than 0 and less than 2*pi";
		if(settings.id != undefined) this.id = settings.id;
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
			for(var i in settings.subsectors) {
				var subsector = new socialCheesecake.Subsector({
					id : settings.subsectors[i].id,
					label : settings.subsectors[i].name,
					parent : this,
					x : this.x,
					y : this.y,
					phi : null,
					delta : null,
					rIn : null,
					rOut : null,
					actors : settings.subsectors[i].actors,
					color : socialCheesecake.colors.normalSector.background
				});
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
	//ID beginning fot the new subsectors created by the user.
	socialCheesecake.Sector.newSubsectorIdRoot = "new_";
	
	socialCheesecake.Sector.prototype._draw = function(context) {
		var x = this.x;
		var y = this.y;
		var phi = this.phi;
		var delta = this.delta;
		var rIn = this.rIn;
		var rOut = this.rOut;
		var color = this.color || socialCheesecake.colors[type]["background"];
		var label = this.label;
		var actors = this.actors;
		var type = this.type;
		var fontColor = this.fontColor || socialCheesecake.colors[type]["font"];
		var rLabel = 0.7*(rOut-rIn) + rIn;
		var rNumber = rLabel;
		
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
		
		//Write on them
		if((this.auxiliar)&&(label=="+")){
			socialCheesecake.text.addPlusCharacter(context, x, y, 0.5*(rOut-rIn) + rIn, 
				phi, delta, fontColor);
		}else if((this.parent.auxiliar)&&(this.parent.label=="+")){
			socialCheesecake.text.writeCurvedText(label, context, x, y, rLabel, 
				phi, delta, fontColor, "newStyle");
		}else{
			socialCheesecake.text.writeCurvedText(label, context, x, y, rLabel, 
				phi, delta, fontColor);
		}				
		if(!this.auxiliar){
			rNumber -= socialCheesecake.text.getTextHeight(label);
			socialCheesecake.text.writeCurvedText("(" + actors.length + ")", context, x, y, 
				rNumber, phi, delta, fontColor);
		}
	}
	
	socialCheesecake.Sector.prototype.getRegion = function() {
		if(this._region == null) {
			var sector = this;
			sector._region = new Kinetic.Geometry({
				drawFunc : function() {
					var context = this.getContext();
					sector._draw(context);
				}, 
				name : sector.label
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
	
	socialCheesecake.Sector.prototype.getLayer = function(){
		if(this.getRegion().getParent()) return this.getRegion().getLayer(); /*KINETIC FIX*/
		return undefined;
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
		return this.parent;
	}
	/*
	 * Returns the sector's index IN CHEESECAKE
	 */
	socialCheesecake.Sector.prototype.getIndex = function(){
		var sector = this;
		var cheesecake = sector.getCheesecake();
		var index = null;
		for(var i in cheesecake.sectors){
			if(cheesecake.sectors[i] === sector ) index = i;
		}
		return index;
	}
	
	socialCheesecake.Sector.prototype.turnExtraIntoNewSubsector = function (subsectorIndex){
		var sector = this;
		var cheesecake = this.getCheesecake();
		var allSubsectors = (this.extraSubsectors).concat(this.subsectors);
		var dummyNormal = [];
		var dummyExtra = [];
		var step = 1.5;
		var mainExtraAnchor = "m"
		
		if(this.subsectors.length >= 4){
			console.log("Reached subsectors limit. No new subsectors will be added");
			return;
		}
		
		//Create dummies for the animation
		for(var i in allSubsectors){
			var settings = {
				label : allSubsectors[i].label,
				x 		: allSubsectors[i].x,
				y 		: allSubsectors[i].y,
				rIn 	: allSubsectors[i].rIn,
				rOut	: allSubsectors[i].rOut,
				phi 	: allSubsectors[i].phi,
				delta : allSubsectors[i].delta,
				type 	: allSubsectors[i].type,
				auxiliar : true,
				parent : allSubsectors[i].parent,
				color : allSubsectors[i].color
			};
			if(i < this.extraSubsectors.length){
				dummyExtra.push(new socialCheesecake.Subsector(settings));
			}else{
				dummyNormal.push(new socialCheesecake.Subsector(settings));
			}
		}
		cheesecake.disable();
		cheesecake.addToLayer(dummyNormal.concat(dummyExtra));
		//Add new Subsector and calculate subsector's new sizes
		cheesecake.removeFromLayer(allSubsectors);
		this.addNewSubsector(subsectorIndex);
		//Initial callback
		if(cheesecake.onSubsectorAddedBegin != null) cheesecake.onSubsectorAddedBegin(sector.subsectors[subsectorIndex]);
		var normalSubsectors = this.subsectors;
		this.extraSubsectors = [];
		var extraSubsectors = sector.extraSubsectors;
		var clone = this.getCheesecake().getAuxiliarClone();
		clone.calculateSubportions();
		clone.label ="";
		clone.color =socialCheesecake.colors.normalSector.background;
		
		for(var i in dummyExtra){
			if(i != subsectorIndex){
				dummyExtra[i].resizeWidth({
					width : 0,
					anchor : 'm',
					step : step
				});
			}
		}
		
		var dummyNormalResizeCallback = function(){
			for (var i = 0; i< dummyNormal.length; i++){
				dummyNormal[i].changeMediumRadius({
					radius: (i < subsectorIndex) ? normalSubsectors[i].getMediumRadius() : normalSubsectors[i+1].getMediumRadius(),
					step : step
				});
			}
			dummyExtra[subsectorIndex].type = "normalSubsector";
			dummyExtra[subsectorIndex].color = normalSubsectors[subsectorIndex].color;
			dummyExtra[subsectorIndex].label = "";
			if(subsectorIndex == 0){
				mainExtraAnchor = "rin";
			}else if(subsectorIndex == dummyExtra.length -1){
				mainExtraAnchor = "rout";
			}
			dummyExtra[subsectorIndex].resizeWidth({
				width : (mainExtraAnchor == 'm' || extraSubsectors.length == 0) ?  normalSubsectors[subsectorIndex].getWidth() : extraSubsectors[subsectorIndex].getWidth() + normalSubsectors[subsectorIndex].getWidth(),
				anchor : mainExtraAnchor,
				step : step,
				callback : mainDummyExtraCallback
			});
		};
		
		var mainDummyExtraCallback = function (){
			dummyExtra[subsectorIndex].label = normalSubsectors[subsectorIndex].label;
			dummyExtra[subsectorIndex].changeMediumRadius({
				radius :  normalSubsectors[subsectorIndex].getMediumRadius(),
				step : step,
				callback : (normalSubsectors.length >= 4 ) ? finalAnimationCallback : function(){return;}
			});
			if(normalSubsectors.length < 4 ){
				sector.createExtraSubsectors();
				clone.calculateSubportions();
				extraSubsectors = sector.extraSubsectors;
				var settings = {
					label : "+",
					x : extraSubsectors[subsectorIndex].x,
					y : extraSubsectors[subsectorIndex].y,
					phi : dummyExtra[subsectorIndex].phi,
					delta : dummyExtra[subsectorIndex].delta,
					type : "extraSubsector",
					auxiliar : true ,
					parent : dummyExtra[subsectorIndex].parent,
					color : extraSubsectors[subsectorIndex].color
				};
				dummyExtra.push(new socialCheesecake.Subsector(settings));
				dummyExtra.push(new socialCheesecake.Subsector(settings));
				var done = false;
				for(var i = 0; i < dummyExtra.length; i++){
					if(i != subsectorIndex){
						dummyExtra[i].rIn = (i < subsectorIndex) ? extraSubsectors[i].getMediumRadius() : extraSubsectors[i-1].getMediumRadius();
						dummyExtra[i].rOut = dummyExtra[i].rIn;
						cheesecake.addToLayer(dummyExtra[i]);
						dummyExtra[i].resizeWidth({
							width : (i < subsectorIndex) ? extraSubsectors[i].getWidth() : extraSubsectors[i-1].getWidth(),
							anchor : "m",
							step : step,
							callback : function (){
								if(done) return;
								done = true;
								return finalAnimationCallback;
							}()
						});
					}
				}
			}
		};
		var finalAnimationCallback = function(){
			cheesecake.removeFromLayer(dummyNormal.concat(dummyExtra));
			cheesecake.addToLayer(normalSubsectors);
			if(extraSubsectors) cheesecake.addToLayer(extraSubsectors);
			cheesecake.drawLayer();
			cheesecake.enable();
			if(cheesecake.onSubsectorAddedEnd != null) cheesecake.onSubsectorAddedEnd(sector.subsectors[subsectorIndex]);
		};
		for (var i = 0; i< dummyNormal.length; i++){
			dummyNormal[i].resizeWidth({
				width : (i < subsectorIndex) ? normalSubsectors[i].getWidth() : normalSubsectors[i+1].getWidth(),
				anchor : 'm',
				step : step,
				callback : (i == 0) ? dummyNormalResizeCallback :function (){ return ;}
			});
		}
	}
	
	socialCheesecake.Sector.prototype.splitUp = function() {
		var cheesecake = this.getCheesecake();
		var callback = cheesecake.onSectorFocusEnd;
		var sector = (this.simulate != null) ? cheesecake.sectors[this.simulate] :  this;
		var subsectors = sector.subsectors;

		//Create extra subsectors
		if(subsectors.length < 4) sector.createExtraSubsectors();
		//Calculate sizes and add regions to the layer
		this.calculateSubportions();
		cheesecake.addToLayer(subsectors.concat(sector.extraSubsectors));
		cheesecake.drawLayer();
		if(callback){
			callback(cheesecake);
		}
	}
	
	socialCheesecake.Sector.prototype.putTogether = function() {
		var cheesecake = this.getCheesecake();
		var layer = null;
		var sector = (this.simulate != null) ? cheesecake.sectors[this.simulate] : this;
		var subsectors = sector.subsectors;
		var extraSubsectors = sector.extraSubsectors;
		//Clear subsectors from stage
		cheesecake.removeFromLayer(subsectors.concat(extraSubsectors));
		sector.extraSubsectors = [];
	}
	
	socialCheesecake.Sector.prototype.createExtraSubsectors = function(){
		var cheesecake = this.getCheesecake();
		var sector = this;
		var subsectors = this.subsectors;
		var extraSubsectors = this.extraSubsectors || [];
		var extraSettings = {
			x : cheesecake.center.x,
			y : cheesecake.center.y,
			label : "+",
			parent : sector,
			auxiliar : true,
			color : socialCheesecake.colors.extraSector.background,
			type : "extraSubsector"
		}		
		//Remove extra subsectors if any
		extraSubsectors.splice(0, extraSubsectors.length);
		//Add extra subsectors
		for(var i = 0; i< subsectors.length + 1; i++){			
			extraSettings["simulate"] = i;
			var extraSector = new socialCheesecake.Subsector(extraSettings);
			extraSubsectors.push(extraSector);
		}
	}
	
	socialCheesecake.Sector.prototype.calculateSubportions = function(){
		var cheesecake = this.getCheesecake();
		var sector = (this.simulate != null) ? cheesecake.sectors[this.simulate] :  this;
		var subsectors = sector.subsectors;
		var extraSubsectors = sector.extraSubsectors;
		var phi = this.phi;
		var delta = this.delta;
		var rOut = this.rOut;
		var rIn = this.rIn;
		var extraWidth = (extraSubsectors.length == subsectors.length + 1) ? ((rOut - rIn) * 0.06) : 0;
		var sectorWidth = (rOut - rIn - (extraSubsectors.length * extraWidth)) / subsectors.length;
		
		for(var i in subsectors){			
			rIn += extraWidth;
			subsectors[i].rIn = rIn;
			subsectors[i].originalAttr.rIn = subsectors[i].rIn;
			subsectors[i].rOut = rIn + sectorWidth;
			subsectors[i].originalAttr.rOut = subsectors[i].rOut;
			subsectors[i].phi = phi;
			subsectors[i].originalAttr.phi = subsectors[i].phi;
			subsectors[i].delta = delta;
			subsectors[i].originalAttr.delta = subsectors[i].delta;
			rIn += sectorWidth;
		}
		rIn = this.rIn;
		for(var i in extraSubsectors){
			extraSubsectors[i].rIn = rIn;
			extraSubsectors[i].originalAttr.rIn = extraSubsectors[i].rIn;
			extraSubsectors[i].rOut = rIn + extraWidth;
			extraSubsectors[i].originalAttr.rOut = extraSubsectors[i].rOut;
			extraSubsectors[i].delta = delta;
			extraSubsectors[i].originalAttr.delta = extraSubsectors[i].delta;
			extraSubsectors[i].phi = phi;
			extraSubsectors[i].originalAttr.phi = extraSubsectors[i].phi;
			rIn += extraWidth + sectorWidth;
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
		var cheesecake = sector.getCheesecake();
		var layer = sector.getLayer();
		sector[name] = value;
		if((sector.type == "normalSector") && (name == "label")) cheesecake.updateSectorChanges(sector);
		if(layer) cheesecake.drawLayer(layer);
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
		sector.getCheesecake().drawLayer(sector.getLayer());
		//Repeat if necessary
		if(goOn && (Math.round(currentDelta*1000) != Math.round(goalDelta*1000))) {
			requestAnimFrame(function() {
				sector.resizeDelta(options);
			});
		}else{
			sector.growDelta = null;
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
		var currentRIn = this.rIn;
		var currentROut = this.rOut;
		var currentWidth = (currentROut - currentRIn);
		var step = 0.05;
		var goalWidth = currentWidth;
		var anchor = 1;
		var grow = 0;
		var goOn = true;
		if(options.step) step = options.step;
		if(options.width != null) goalWidth = options.width;
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
		if(currentRIn <0 ){
			currentROut += (this.rIn - currentRIn);
			currentRIn = 0;
		}
		if(currentWidth <= 0) sector.getCheesecake().removeFromLayer(sector);
		sector.rOut = currentROut;
		sector.rIn = currentRIn;
		//Redraw
		sector.getCheesecake().drawLayer(sector.getLayer());
		//Repeat if necessary
		if ((goOn) &&(Math.round(currentWidth *1000) != Math.round(goalWidth *1000))) {
			requestAnimFrame(function() {
				sector.resizeWidth(options);
			});
		} else{
			sector.grow= null;
			if(options.callback) {
				options.callback();
			}
		}
	}
	
	socialCheesecake.Sector.prototype.changeMediumRadius = function(options){
		var sector = this;
		var currentRIn = this.rIn;
		var currentROut = this.rOut;
		var currentMedRad = this.getMediumRadius();
		if(options.radius - this.getWidth()/2 < 0) options.radius = this.getWidth()/2;
		var goalMedRad = options.radius || currentMedRad;
		var step = options.step || 0.05;
		
		if(goalMedRad > currentMedRad){
			if(goalMedRad - currentMedRad < step) step = goalMedRad - currentMedRad;
			currentRIn += step;
			currentROut += step;
		}else{
			if(currentMedRad - goalMedRad < step) step = currentMedRad - goalMedRad;
			currentRIn -= step;
			currentROut -= step;
		}
		this.rIn = Math.round(currentRIn *1000)/1000;
		this.rOut = Math.round(currentROut *1000)/1000;
		currentMedRad = this.getMediumRadius();
		//Redraw
		sector.getCheesecake().drawLayer(sector.getLayer());
		//Repeat if necessary
		if ((Math.round(currentMedRad *1000) != Math.round(goalMedRad *1000))) {
			requestAnimFrame(function() {
				sector.changeMediumRadius(options);
			});
		} else{
			if(options.callback) {
				options.callback();
			}
		}
	}
	
	socialCheesecake.Sector.prototype.focus = function() {
		var sector = this;
		sector.changeProperty("rOut", sector.originalAttr.rOut * 1.05);
	}
	
	socialCheesecake.Sector.prototype.unfocus = function() {
		var sector = this;
		sector.changeProperty("rOut", sector.originalAttr.rOut);
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
		var sector = this;
		var currentPhi = this.phi % (2 * Math.PI);
		var delta = this.delta;
		var step = 0.05;
		var anchor = 0;
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
		sector.getCheesecake().drawLayer(sector.getLayer());

		// request new frame
		if(Math.abs(currentPhi - phiDestination) > 0.001) {
			sector.phi = currentPhi % (2 * Math.PI);
			requestAnimFrame(function() {
				sector.rotateTo({
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
	
	socialCheesecake.Sector.prototype.addNewSubsector = function (subectorIndex){
		var subsectors = this.subsectors;
		var settings = {
			parent : this,
			x : this.x,
			y : this.y,
			delta : this.delta,
			phi : this.phi,
			id : socialCheesecake.Sector.newSubsectorIdRoot +'S'+ this.getIndex() +'s'+subectorIndex
		};
		//Rearrange subsectors
		for(var i = subsectors.length ; i >= 0 ; i--){
			if( i > subectorIndex) subsectors[i] = subsectors[i-1];
			if( i == subectorIndex ){
				settings.label = "New Subsector "+ i;
				subsectors[i]= new socialCheesecake.Subsector(settings);
			}
		}
		//Communicate changes to Cheesecake
		this.getCheesecake().updateSectorChanges(this);
		return subsectors[subectorIndex];
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
		var grid = this.getCheesecake().grid;
		
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
					grid.removeActor(actor);
				}
			}
		}
	}
	
	socialCheesecake.Sector.prototype.getWidth = function (){
		return (this.rOut - this.rIn);
	}
	
	socialCheesecake.Sector.prototype.getMediumRadius = function (){
		return (this.rOut + this.rIn)/2;
	}
	
	socialCheesecake.Sector.prototype.getSubsectorsIds = function(){
		var subsectors = [];
		for(var subsector in this.subsectors){
			subsectors.push(this.subsectors[subsector].id);
		}
		return subsectors;
	}
	
	socialCheesecake.Sector.prototype.listen = function (on){
		var region = this.getRegion();
		var sector = this;
		if(on === undefined) on = true;
		if(on){
			region.on('mouseover', function() {
				sector.eventHandler('mouseover');
			});
			region.on('mouseout', function() {
				sector.eventHandler('mouseout');
			});
			region.on('click', function() {
				sector.eventHandler('click');
			});
			region.on('mouseup', function() {
				sector.eventHandler('mouseup');
			});
		}else{
			region.off('mouseover');
			region.off('mouseout');
			region.off('click');
			region.off('mouseup');
		}
	}
	
})();
