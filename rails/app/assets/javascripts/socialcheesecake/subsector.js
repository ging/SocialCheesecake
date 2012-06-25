var socialCheesecake = socialCheesecake || {};
(function() {
	socialCheesecake.Subsector = function(settings) {
		this.id = null;
		if(settings.id != undefined ) this.id = settings.id;
		if(settings.parent != null) this.parent = settings.parent;		
		this.label = settings.label || "";

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
			for(var i in settings.actors){
				this.addActor(settings.actors[i]);
			}
		}

		this.originalActors = this.actors.slice();
		this.actorChanges = [[], []];

		if (settings.status) {
			this.status = settings.status;
		} else {
			this.status = "added";
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
	};
	
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
		subsectors : [],
		
		mouseover : this.mouseover,
		mouseout : this.mouseout,
		mouseup : this.mouseup,
		click : this.click
	});

	socialCheesecake.Subsector.prototype.getCheesecake = function () {
		return this.parent.parent;
	};

	socialCheesecake.Subsector.prototype.addActor = function (obj) {
		var actor = this.parent.addActor(obj);

		if ($.inArray(actor.id, this.actors) === -1)
			this.actors.push(actor.id);

		if ($.inArray(this, actor.parents) === -1)
			actor.parents.push(this);

		this.recordAddActor(actor);

		return actor;
	};

	/*
	 * Returns the subsector's index in the cheesecake
	 */
	socialCheesecake.Subsector.prototype.getIndex = function(){
		var subsector = this;
		var sector = subsector.parent;
		var index = null;
		for(var i in sector.subsectors){
			if(sector.subsectors[i] === subsector ) index = i;
		}
		return index;
	};
	
	socialCheesecake.Subsector.prototype.removeActor = function(obj){
		var actor = this.getActor(obj);
		var index;

		// remove from subsector list
		index = $.inArray(actor.id, this.actors);

		if (index !== -1)
			this.actors.splice(index, 1);

		// remove subsector from actor parents
		index = $.inArray(this, actor.parents);

		if (index !== -1)
			actor.parents.splice(index, 1);

		// remove from sector
		this.parent.removeActor(actor);

		this.recordRemoveActor(actor);

		return actor;
	};
	
	/*
	 * Change the membership of several actors at the same
	 * time, in this sector
	 *
	 * @param {Array} the actors to be changed
	 *
	 */
	socialCheesecake.Subsector.prototype.changeMembership = function(diffActors){
		var subsector = this;

		$.each(diffActors, function(index, actor){
			if ($.inArray(actor.id, subsector.actors) === -1) {
				subsector.addActor(actor);
			} else {
				subsector.removeActor(actor);
			}

		});

		this.getCheesecake().calculatePortions();

		socialCheesecake.eventCallbackHandlers.onChange(this.getCheesecake());
	};

	socialCheesecake.Subsector.prototype.changed = function(){
		if (this.status !== "saved")
			return true;

		if (!$(this.actorChanges).compare([[], []]))
			return true;

		return false;
	};

	socialCheesecake.Subsector.prototype.getChanges = function(){
		var changes = {
			id: this.id,
			label: this.label,
			status: this.status,
			object: this
		};

		if (!$(this.actorChanges).compare([[], []]))
			changes.actors = this.actorChanges;

		return changes;
	};
})();
