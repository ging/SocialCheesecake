var socialCheesecake = socialCheesecake || {};
(function() {
	socialCheesecake.Subsector = function(settings) {
		this.id = settings.id || null;
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
		this.type = (settings.type) ? settings.type : "normalSubsector";
		if(settings.simulate != null) this.simulate = settings.simulate;
		this.color = settings.color || socialCheesecake.colors.normalSubsector.background;
		if(settings.fontColor) this.fontColor = settings.fontColor;
		if(settings.borderColor) this.borderColor = settings.borderColor;
		if(settings.click != null) this.click = settings.click;
		if(settings.mouseup != null) this.mouseup = settings.mouseup; 
		if(settings.mouseover != null) this.mouseover = settings.mouseover; 
		if(settings.mouseout != null) this.mouseout = settings.mouseout;

		var grid = this.getCheesecake().grid;
		if (settings.actors){
			for(var actor in settings.actors){
				var actor_info = {
					id : settings.actors[actor][0],
					name : settings.actors[actor][1],
					extraInfo : settings.actors[actor][2]
				}
				this.addActor(actor_info ,this);
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
			fontColor : this.fontColor,
			borderColor : this.borderColor,
			label : this.label,
			auxiliar : this.auxiliar,
			type: this.type,
			simulate : this.simulate
		};
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
		fontColor : this.fontColor,
		borderColor : this.borderColor,
		type : this.type,
		simulate : this.simulate,
		
		mouseover : this.mouseover,
		mouseout : this.mouseout,
		mouseup : this.mouseup,
		click : this.click
	});
	
	socialCheesecake.Subsector.prototype.getCheesecake = function () {
		var subsector = this;
		return subsector.parent.parent;
	}
	
	/*
	 * Returns the subsector's index IN SOCIALCHEESECAKE
	 */
	socialCheesecake.Subsector.prototype.getIndex = function(){
		var subsector = this;
		var sector = subsector.parent;
		var index = null;
		for(var i in sector.subsectors){
			if(sector.subsectors[i] === subsector ) index = i;
		}
		return index;
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
			this.getCheesecake().updateActorMembership(actors[i]);
			isMember = false;
		}
		this.getCheesecake().calculatePortions();
	}
}) ();