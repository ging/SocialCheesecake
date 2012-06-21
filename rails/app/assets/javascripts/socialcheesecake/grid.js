var socialCheesecake = socialCheesecake || {}; 
(function() {
	
	socialCheesecake.Grid = function(settings) {
		if(!settings)
			throw "No arguments passed to the function";

		//Actors dimensions and positions
		this.actorsList = {};
		this.actors = [];
		this.parent = settings.parent;
		this.id = settings.grid_id;
		this.divIdPrefix = settings.divIdPrefix;
		this.maxOpacity = settings.maxOpacity;
		this.minOpacity = settings.minOpacity;
	};

	// The HTML Element that contains all the available actors
	socialCheesecake.Grid.prototype.getAvailableActorsContainer = function() {
		if (this.availableActorsContainer)
			return this.availableActorsContainer;

		this.availableActorsContainer = $('#' + this.id + '_available');
		return this.availableActorsContainer;
	};

	socialCheesecake.Grid.prototype.getActor = function(id) {
		this.actorsList[id] = this.actorsList[id] || new socialCheesecake.Actor({
			id: id,
			grid: this
		});

		this.actors.push(this.actorsList[id]);

		return this.actorsList[id];
	};

	socialCheesecake.Grid.prototype.getSelectedActors = function() {
		var selectedActors = [];

		$.each(this.actorsList, function(id, obj) {
			if (obj.isSelected())
				selectedActors.push(obj);
		});

		return selectedActors;
	};

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
	};

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
