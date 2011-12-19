socialCheesecake.defineModule(
    'SocialCheesecake#Grid'
)
.dependsOn(
    'SocialCheesecake#Actor'  
)
.withCode(function() { 
	socialCheesecake.Grid = function (settings){
		if (!settings) throw "No arguments passed to the function";
		console.log(settings.actors);
		
		//Actors dimensions and positions
		this.actors = [];
		this.parent = settings.parent;
		this.id = settings.grid_id;
		this.divIdPrefix = settings.divIdPrefix;
	}
  
	socialCheesecake.Grid.prototype.addActor = function (actor_info, subsector) {
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
		// If the actor was not in the array, create it and add it to the array
		if(!actorAlreadyDeclared){
			actor = new socialCheesecake.Actor({
				id : actor_info.id, 
				parent: subsector
			});
			actors.push(actor);
		}
		return actor;
	}
	
	socialCheesecake.Grid.prototype.getActor = function (id) {
		for (var i in actors){
			if (this.actors[i].id == id){
				return this.actors[i];
			}
		}
		return null
	}
	
	socialCheesecake.Grid.prototype.focus = function (actor_ids) {
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				var actor = actor_ids[i];
				if(actor instanceof socialCheesecake.Actor){
					actor.focus();
				}else{
					this.getActor(actor).focus();
				}				
			}
		} else {
			if(actor_ids instanceof socialCheesecake.Actor){
				actor_ids.focus();
			}else{
				this.getActor(actor_ids).focus();
			}		
		}
	}
	
	socialCheesecake.Grid.prototype.focusAll = function () {
		this.focus(this.actors);
	}
	
	socialCheesecake.Grid.prototype.hide = function (actor_ids) {
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				var actor = actor_ids[i];
				if(actor instanceof socialCheesecake.Actor){
					actor.hide();
				}else{
					this.getActor(actor).hide();
				}				
			}
		} else {
			if(actor_ids instanceof socialCheesecake.Actor){
				actor_ids.hide();
			}else{
				this.getActor(actor_ids).hide();
			}		
		}
	}
	
	socialCheesecake.Grid.prototype.hideAll = function () {
		this.hide(this.actors)		
	}
	
	socialCheesecake.Grid.prototype.show = function (actor_ids) {
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				var actor = actor_ids[i];
				if(actor instanceof socialCheesecake.Actor){
					actor.show();
				}else{
					this.getActor(actor).show();
				}				
			}
		} else {
			if(actor_ids instanceof socialCheesecake.Actor){
				actor_ids.show();
			}else{
				this.getActor(actor_ids).show();
			}		
		}
	}
	
	socialCheesecake.Grid.prototype.showAll = function () {
		this.show(this.actors)
	}
	
	socialCheesecake.Grid.prototype.unfocus = function (actor_ids) {
		if (actor_ids instanceof Array) {
			for(var i in actor_ids){
				var actor = actor_ids[i];
				if(actor instanceof socialCheesecake.Actor){
					actor.unfocus();
				}else{
					this.getActor(actor).unfocus();
				}				
			}
		} else {
			if(actor_ids instanceof socialCheesecake.Actor){
				actor_ids.unfocus();
			}else{
				this.getActor(actor_ids).unfocus();
			}		
		}
	}
	
	socialCheesecake.Grid.prototype.unfocusAll = function () {
		this.unfocus(this.actors)
	}
});
