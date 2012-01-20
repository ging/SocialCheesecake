var socialCheesecake = socialCheesecake || {};
(function() { 
	socialCheesecake.Grid = function (settings){
		if (!settings) throw "No arguments passed to the function";
		
		//Actors dimensions and positions
		this.actors = [];
		this.parent = settings.parent;
		this.id = settings.grid_id;
		this.divIdPrefix = settings.divIdPrefix;
		this.visibleActors = [];
	}
  
	socialCheesecake.Grid.prototype.addActor = function (actor_info, subsector) {
		var actors = this.actors;
		var visibleActors = this.visibleActors;
		var maxVisibleActors = socialCheesecake.Cheesecake.getMaxVisibleActors();
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
		// If the actor was not in the array, create it and add it to the array
		if(!actorAlreadyDeclared){
			actor_info.parent = subsector;
			actor = new socialCheesecake.Actor(actor_info);
			actors.push(actor);
			if(actors.length <= maxVisibleActors ){
				actor.show();
				visibleActors.push(actor);
			}
		}
		return actor;
	}
	
	socialCheesecake.Grid.prototype.removeActor = function(actor){
		var actors = this.actors;
		for(var actorIndex in actors){
			if((actors[actorIndex].id==actor.id)&&(actor.parents.length <= 0 )){
					actors.splice(actorIndex,1);
			}
		}
	}
	
	socialCheesecake.Grid.prototype.getActor = function (id) {
		var actors = this.actors;
		for (var i in actors){
			if (this.actors[i].id == id){
				return this.actors[i];
			}
		}
		return null
	}
	
	socialCheesecake.Grid.prototype.getSelectedActors = function(){
		var actors = this.visibleActors;
		var selectedActors = [];
		for (var i in actors){
			if(actors[i] && actors[i].isSelected()) selectedActors.push(actors[i]);
		}
		return selectedActors;
	}
	
	socialCheesecake.Grid.prototype.getShownActors = function(){
		return this.visibleActors;
	}
	
	socialCheesecake.Grid.prototype.select = function (actor_ids) {
		var actor;
		
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				actor = actor_ids[i];
				if (actor){
					if(!(actor instanceof socialCheesecake.Actor)){
						actor = this.getActor(actor);
					}
					actor.select();
				}
			}
		} else {
			actor = actor_ids;
			if(!(actor_ids instanceof socialCheesecake.Actor)){
				actor = this.getActor(actor_ids);
			}
			actor.select();
		}
	}
	
	socialCheesecake.Grid.prototype.selectAll = function () {
		this.select(this.visibleActors);
	}
	
	socialCheesecake.Grid.prototype.unselect = function (actor_ids) {
		var actor;
		
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				actor = actor_ids[i];
				if (actor){
					if(!(actor instanceof socialCheesecake.Actor)){
						actor = this.getActor(actor);
					}
					actor.unselect();
				}
			}
		} else {
			actor = actor_ids;
			if(!(actor_ids instanceof socialCheesecake.Actor)){
				actor = this.getActor(actor_ids);
			}
			actor.unselect();
		}
	}
	
	socialCheesecake.Grid.prototype.unselectAll = function () {
		this.unselect(this.visibleActors);
	}
	
	socialCheesecake.Grid.prototype.focus = function (actor_ids) {
		var actor;
		
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				actor = actor_ids[i];
				if (actor){
					if(!(actor instanceof socialCheesecake.Actor)){
						actor = this.getActor(actor);
					}
					actor.focus();
				}
			}
		} else {
			actor = actor_ids;
			if(!(actor_ids instanceof socialCheesecake.Actor)){
				actor = this.getActor(actor_ids);
			}
			actor.focus();
		}
	}
	
	socialCheesecake.Grid.prototype.focusAll = function () {
		this.focus(this.visibleActors);
	}
	
	socialCheesecake.Grid.prototype.hide = function (actor_ids, ignoreSelected) {
		var actor;
		var visibleActors = this.visibleActors;
		var visibleActorIndex = -1;
		
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				actor = actor_ids[i];
				if (actor){
					if (!(actor instanceof socialCheesecake.Actor)){
						actor = this.getActor(actor);
					}
					if((!actor.isSelected())||(ignoreSelected)){
						actor.hide();
						visibleActors[visibleActors.indexOf(actor)] = false;
					}
				}
			}			
		} else {
			if(actor_ids instanceof socialCheesecake.Actor){
				actor = actor_ids;
			}else{
				actor = this.getActor(actor_ids);
			}
			actor.hide();
			visibleActors[visibleActors.indexOf(actor)] = false;
		}
		visibleActorIndex = visibleActors.indexOf(false);
		while(visibleActorIndex >= 0){
			visibleActors.splice(visibleActorIndex,1);
			visibleActorIndex = visibleActors.indexOf(false);
		}
	}
	
	socialCheesecake.Grid.prototype.hideAll = function () {
		this.hide(this.visibleActors);		
	}
	
	socialCheesecake.Grid.prototype.show = function (actor_ids) {
		var actor;
		var visibleActors = this.visibleActors;
		var maxActors = Math.min(actor_ids.length, socialCheesecake.Cheesecake.getMaxVisibleActors());
		
		if (actor_ids instanceof Array) {
			for(var i = 0; visibleActors.length < maxActors ; i++){
				actor = actor_ids[i];
					if (actor){
					if (!(actor instanceof socialCheesecake.Actor)){
						actor = this.getActor(actor);
					}
					if((!actor.isSelected())||(ignoreSelected)){
						actor.show();
						if(visibleActors.indexOf(actor) == -1) visibleActors.push(actor);
					}
				}
			}
		} else if(visibleActors.length < maxActors){
			if(actor_ids instanceof socialCheesecake.Actor){
				actor = actor_ids;
			}else{
				actor = this.getActor(actor_ids);
			}	
			if((!actor.isSelected())||(ignoreSelected)){
				actor.show();
				if(visibleActors.indexOf(actor) == -1) visibleActors.push(actor);
			}
		}
	}
	
	socialCheesecake.Grid.prototype.showAll = function () {
		this.show(this.actors);
	}
	
	socialCheesecake.Grid.prototype.unfocus = function (actor_ids) {
		var actor;
		
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				actor = actor_ids[i];
					if (actor){
					if(!(actor instanceof socialCheesecake.Actor)){
						actor = this.getActor(actor);
					}
					actor.unfocus();
				}				
			}
		} else {
			actor = actor_ids;
			if(!(actor_ids instanceof socialCheesecake.Actor)){
				actor = this.getActor(actor_ids);
			}
			actor.unfocus();
		}
	}
	
	socialCheesecake.Grid.prototype.unfocusAll = function () {
		this.unfocus(this.visibleActors);
	}
	
	socialCheesecake.Grid.prototype.fadeOut = function (actor_ids, time, modifyDisplay, ignoreSelected) {
		var actor;
		var visibleActors = this.visibleActors;
		var visibleActorIndex = -1;
		
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				actor = actor_ids[i];
				if (actor){
					if (!(actor instanceof socialCheesecake.Actor)){
						actor = this.getActor(actor);
					}	
					if((!actor.isSelected())||(ignoreSelected)){
						actor.fadeOut(time, modifyDisplay);
						visibleActors[visibleActors.indexOf(actor)] = false;
					}
				}
			}
		} else {
			if(actor_ids instanceof socialCheesecake.Actor){
				actor = actor_ids;
			}else{
				actor = this.getActor(actor_ids);
			}
			if((!actor.isSelected())||(ignoreSelected)){
				actor.fadeOut(time, modifyDisplay);
				visibleActors[visibleActors.indexOf(actor)] = false;
			}
		}
		visibleActorIndex = visibleActors.indexOf(false);
		while(visibleActorIndex >= 0){
			visibleActors.splice(visibleActorIndex,1);
			visibleActorIndex = visibleActors.indexOf(false);
		}
	}
	
	socialCheesecake.Grid.prototype.fadeOutAll = function (time, modifyDisplay) {
		this.fadeOut(this.visibleActors, time, modifyDisplay);
	}
	
	socialCheesecake.Grid.prototype.fadeIn = function (actor_ids, time, modifyDisplay, ignoreSelected) {
		var actor;
		var visibleActors = this.visibleActors;
		var maxActors = Math.min(actor_ids.length, socialCheesecake.Cheesecake.getMaxVisibleActors());
		if (actor_ids instanceof Array) {
			for(var i = 0; visibleActors.length < maxActors ; i++){
				actor = actor_ids[i];
				if (actor){
					if (!(actor instanceof socialCheesecake.Actor)){
						actor = this.getActor(actor);
					}
					if((!actor.isSelected())||(ignoreSelected)){
						actor.fadeIn(time, modifyDisplay);
						if(visibleActors.indexOf(actor) == -1) visibleActors.push(actor);
					}	
				}
			}
		} else if(visibleActors.length < maxActors){
			if(actor_ids instanceof socialCheesecake.Actor){
				actor = actor_ids;
			}else{
				actor = this.getActor(actor_ids);
			}	
			if((!actor.isSelected())||(ignoreSelected)){
				actor.fadeIn(time, modifyDisplay);
				if(visibleActors.indexOf(actor) == -1) visibleActors.push(actor);
			}
		}
	}
	
	socialCheesecake.Grid.prototype.fadeInAll = function (time, modifyDisplay) {
		this.fadeIn(this.actors, time, modifyDisplay);
	}
	
})();

