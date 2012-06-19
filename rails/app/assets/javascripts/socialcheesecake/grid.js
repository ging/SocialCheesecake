var socialCheesecake = socialCheesecake || {}; 
(function() {
	
	socialCheesecake.Grid = function(settings) {
		if(!settings)
			throw "No arguments passed to the function";

		//Actors dimensions and positions
		this.actors = [];
		this.orphans = [];
		this.parent = settings.parent;
		this.id = settings.grid_id;
		this.divIdPrefix = settings.divIdPrefix;
		this.maxOpacity = settings.maxOpacity;
		this.minOpacity = settings.minOpacity;
	};


	socialCheesecake.Grid.prototype.newActorElement = function(info) {
		var grid = document.getElementById(this.id + '_available');
		var div = document.createElement('div');
		div.setAttribute('id', 'actor_' + info.id);
		div.setAttribute('class', 'actor orphan');
		div.appendChild(info.html);

		grid.appendChild(div);

		info.grid = this;
		actor = new socialCheesecake.Actor(info);

		this.actors.push(actor);
	};

	socialCheesecake.Grid.prototype.addActor = function(actorInfo, subsector) {
		var actors = this.actors;
		var orphans = this.orphans;
		var actor = null;

		//Check if the actor is already in the array
		var actorAlreadyDeclared = false;
		for(var i in actors) {
			if(actors[i].id == actorInfo.id) {
				actorAlreadyDeclared = true;
				actor = actors[i];
				//Check if the subsector has already been declared a parent of the actor
				var subsectorAlreadyDeclared = false;
				for(var parent in actor.parents) {
					if(actor.parents[parent] == subsector)
						subsectorAlreadyDeclared = true;
				}
				if(!subsectorAlreadyDeclared)
					actor.parents.push(subsector);
			}
		}
		// If the actor was not in the array:
		if(!actorAlreadyDeclared) {
			//Check if the actor exists as an orphan (with no subsectors parents)
			var orphanActor = false;
			for(var i in orphans){
				//If it exists, take it out from this array and add its new parent
				if(orphans[i].id == actorInfo.id){
					orphanActor = true;
					actor = orphans[i];
					orphans.splice(i, 1);
					actor.removeClass("orphan");
					actor.parents.push(subsector);
				}
			}//If it doesn't, create new Actor and add its parent.
			if(!orphanActor){
				actorInfo.parent = subsector;
				actorInfo.grid = this;
				actor = new socialCheesecake.Actor(actorInfo);
			}
			actors.push(actor);
		}
		return actor;
	}

	socialCheesecake.Grid.prototype.removeActor = function(actor) {
		var actors = this.actors;
		var orphans = this.orphans;
		for(var actorIndex in actors) {
			if((actors[actorIndex].id == actor.id) && (actor.isOrphan())) {
				actors.splice(actorIndex, 1);
				orphans.push(actor);
				actor.addClass("orphan");
			}
		}
	}

	socialCheesecake.Grid.prototype.getActor = function(id) {
		var actors = this.actors;
		for(var i in actors) {
			if(this.actors[i].id == id) {
				return this.actors[i];
			}
		}
		return null
	}

	socialCheesecake.Grid.prototype.getSelectedActors = function() {
		var actors = this.actors;
		var orphans = this.orphans;
		var selectedActors = [];
		for(var i in actors) {
			if(actors[i].isSelected())
				selectedActors.push(actors[i]);
		}
		for (var i in orphans){
			if(orphans[i].isSelected())
				selectedActors.push(orphans[i]);
		}
		return selectedActors;
	}

	socialCheesecake.Grid.prototype.select = function(actor_ids) {
		var actor;

		if( actor_ids instanceof Array) {
			for(var i in actor_ids) {
				actor = actor_ids[i];
				if(actor) {
					if(!( actor instanceof socialCheesecake.Actor)) {
						actor = this.getActor(actor);
					}
					actor.select();
				}
			}
		} else {
			actor = actor_ids;
			if(!( actor_ids instanceof socialCheesecake.Actor)) {
				actor = this.getActor(actor_ids);
			}
			actor.select();
		}
	}

	socialCheesecake.Grid.prototype.selectAll = function() {
		this.select(this.actors);
	}

	socialCheesecake.Grid.prototype.unselect = function(actor_ids) {
		var actor;

		if( actor_ids instanceof Array) {
			for(var i in actor_ids) {
				actor = actor_ids[i];
				if(actor) {
					if(!( actor instanceof socialCheesecake.Actor)) {
						actor = this.getActor(actor);
					}
					actor.unselect();
				}
			}
		} else {
			actor = actor_ids;
			if(!( actor_ids instanceof socialCheesecake.Actor)) {
				actor = this.getActor(actor_ids);
			}
			actor.unselect();
		}
	}

	socialCheesecake.Grid.prototype.unselectAll = function() {
		this.unselect(this.actors);
	}

	socialCheesecake.Grid.prototype.focus = function(actor_ids) {
		var actor;

		if( actor_ids instanceof Array) {
			for(var i in actor_ids) {
				actor = actor_ids[i];
				if(actor) {
					if(!( actor instanceof socialCheesecake.Actor)) {
						actor = this.getActor(actor);
					}
					actor.focus();
				}
			}
		} else {
			actor = actor_ids;
			if(!( actor_ids instanceof socialCheesecake.Actor)) {
				actor = this.getActor(actor_ids);
			}
			actor.focus();
		}
	}

	socialCheesecake.Grid.prototype.focusAll = function() {
		this.focus(this.actors);
	}

	socialCheesecake.Grid.prototype.hide = function(actor_ids, ignoreSelected) {
		var actor;

		if( actor_ids instanceof Array) {
			for(var i in actor_ids) {
				actor = actor_ids[i];
				if(actor) {
					if(!( actor instanceof socialCheesecake.Actor)) {
						actor = this.getActor(actor);
					}
					if((!actor.isSelected()) || (ignoreSelected)) {
						actor.hide();
					}
				}
			}
		} else {
			if( actor_ids instanceof socialCheesecake.Actor) {
				actor = actor_ids;
			} else {
				actor = this.getActor(actor_ids);
			}
			actor.hide();
		}
	};

	socialCheesecake.Grid.prototype.hideAll = function() {
		this.hide(this.actors);
	};

	socialCheesecake.Grid.prototype.show = function(actor_ids, ignoreSelected) {
		var actor;

		if( actor_ids instanceof Array) {
			for(var i = 0; i < actor_ids.length; i++) {
				actor = actor_ids[i];
				if(!( actor instanceof socialCheesecake.Actor)) {
					actor = this.getActor(actor);
				}
				if((!actor.isSelected()) || (ignoreSelected)) {
					actor.show();
				}
			}
		} else {
			if( actor_ids instanceof socialCheesecake.Actor) {
				actor = actor_ids;
			} else {
				actor = this.getActor(actor_ids);
			}
			if((!actor.isSelected()) || (ignoreSelected)) {
				actor.show();
			}
		}
	}

	socialCheesecake.Grid.prototype.showAll = function() {
		this.show(this.actors);
	}

	socialCheesecake.Grid.prototype.unfocus = function(actor_ids) {
		var actor;

		if( actor_ids instanceof Array) {
			for(var i in actor_ids) {
				actor = actor_ids[i];
				if(!( actor instanceof socialCheesecake.Actor)) {
					actor = this.getActor(actor);
				}
				actor.unfocus();
			}
		} else {
			actor = actor_ids;
			if(!( actor_ids instanceof socialCheesecake.Actor)) {
				actor = this.getActor(actor_ids);
			}
			actor.unfocus();
		}
	}

	socialCheesecake.Grid.prototype.unfocusAll = function() {
		this.unfocus(this.actors);
	}

	socialCheesecake.Grid.prototype.fadeOut = function(actor_ids, time, modifyDisplay, ignoreSelected) {
		var actor;

		if( actor_ids instanceof Array) {
			for(var i in actor_ids) {
				actor = actor_ids[i];
				if(actor) {
					if(!( actor instanceof socialCheesecake.Actor)) {
						actor = this.getActor(actor);
					}
					if((!actor.isSelected()) || (ignoreSelected)) {
						actor.fadeOut(time, modifyDisplay);
					}
				}
			}
		} else {
			if( actor_ids instanceof socialCheesecake.Actor) {
				actor = actor_ids;
			} else {
				actor = this.getActor(actor_ids);
			}
			if((!actor.isSelected()) || (ignoreSelected)) {
				actor.fadeOut(time, modifyDisplay);
			}
		}
	}

	socialCheesecake.Grid.prototype.fadeOutAll = function(time, modifyDisplay) {
		this.fadeOut(this.actors, time, modifyDisplay);
	}

	socialCheesecake.Grid.prototype.fadeIn = function(actor_ids, time, modifyDisplay, ignoreSelected) {
		var actor;

		if( actor_ids instanceof Array) {
			for(var i = 0; i < actor_ids.length; i++) {
				actor = actor_ids[i];
				if(!( actor instanceof socialCheesecake.Actor)) {
					actor = this.getActor(actor);
				}
				if((!actor.isSelected()) || (ignoreSelected)) {
					actor.fadeIn(time, modifyDisplay);
				}
			}
		} else {
			if( actor_ids instanceof socialCheesecake.Actor) {
				actor = actor_ids;
			} else {
				actor = this.getActor(actor_ids);
			}
			if((!actor.isSelected()) || (ignoreSelected)) {
				actor.fadeIn(time, modifyDisplay);
			}
		}
	}

	socialCheesecake.Grid.prototype.fadeInAll = function(time, modifyDisplay) {
		this.fadeIn(this.actors, time, modifyDisplay);
	}
})();
