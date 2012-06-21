var socialCheesecake = socialCheesecake || {}; 
(function() {
	socialCheesecake.Actor = function(settings) {
		if(!settings)
			throw "No arguments passed to the function";
		
		this.id = settings.id;
//		this.name = settings.name;
		this.grid = settings.grid;
		this.opacity = this.grid.maxOpacity || 1;
		this._focused = false;
		this._selected = false;
		this._hidden = true;
		this._filtered = false;
		this.fading = "none";
		this.parents = [];
		/*
		if(settings.parent)
			this.parents.push(settings.parent);
		*/

		this.buildGridElement();

	};

	socialCheesecake.Actor.prototype.buildGridElement = function() {
		var container = this.grid.getAvailableActorsContainer();
		html = '<div id="actor_' + this.id + '" class="actor"/>';
		this.gridElement = $(html);
		container.append(this.gridElement);

		this.setGridElementCallbacks();
	};

	socialCheesecake.Actor.prototype.setGridElementCallbacks = function() {
		var actor = this;
		var el = this.gridElement;

		el.on("mouseover", function() {
			var sector;

			actor.focus();
			if(!actor.isOrphan()){
				for(var subsector in actor.parents) {
					sector = actor.parents[subsector].parent;
					sector.focus();
					sector.colorHandler("mouseover");
					actor.parents[subsector].colorHandler("mouseover");
				}
			}
		});

		el.on("mouseout", function() {
			var sector;
			actor.unfocus();
			if(!actor.isOrphan()){
				for(var subsector in actor.parents) {
					sector = actor.parents[subsector].parent;
					sector.unfocus();
					sector.colorHandler("mouseout");
					actor.parents[subsector].colorHandler("mouseout");
				}
			}
		});

		el.on("click", function() {
			if (actor.isSelected()) {
				actor.unselect();
			} else {
				actor.select();
				actor.unfocus();
			}
		});
	};

	socialCheesecake.Actor.prototype.getParentsIds = function() {
		var parents = this.parents;
		var parentsIds = [];

		for(var i in parents) {
			parentsIds.push(parents[i].id);
		}
		return parentsIds;
	};


	socialCheesecake.Actor.prototype.isSelected = function() {
		return this._selected;
	};

	socialCheesecake.Actor.prototype.select = function() {
		this._selected = true;
		this.gridElement.addClass("selected");
	};

	socialCheesecake.Actor.prototype.unselect = function() {
		this._selected = false;
		this.gridElement.removeClass("selected");
	};

	socialCheesecake.Actor.prototype.focus = function() {
		this._focused = true;
		this.gridElement.addClass("focused");
	};

	socialCheesecake.Actor.prototype.unfocus = function() {
		this._focused = false;
		this.gridElement.removeClass("focused");
	};

	socialCheesecake.Actor.prototype.isFocused = function() {
		return this._focused;
	};
	
	socialCheesecake.Actor.prototype.isOrphan = function (){
		return this.parents.length < 1;
	};

	socialCheesecake.Actor.prototype.hide = function() {
		var actor_div = this.getDiv();
		var newStyle = " display: none;";
		this._hidden = true;
		if(actor_div.getAttribute("style")) {
			if(actor_div.getAttribute("style").match(/display\s*:\s*[a-z]*;/)) {
				newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*[a-z]*;/, "display: none;");
			} else {
				newStyle = actor_div.getAttribute("style").concat("display: none;");
			}
		}
		actor_div.setAttribute("style", newStyle);
		this.fading = "none";
	};
	
	socialCheesecake.Actor.prototype.show = function() {
		var actor_div = this.getDiv();
		var newStyle = " display: inline;";

		if(this.isFiltered())
			return;

		this._hidden = false;
		if(actor_div.getAttribute("style")) {
			if(actor_div.getAttribute("style").match(/display\s*:\s*[a-z]*;/)) {
				newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*[a-z]*;/, "display: inline;");
			} else {
				newStyle = actor_div.getAttribute("style").concat("display: inline;");
			}
		}
		actor_div.setAttribute("style", newStyle);
	}

	socialCheesecake.Actor.prototype.isHidden = function() {
		return this._hidden;
	}

	socialCheesecake.Actor.prototype.isFiltered = function() {
		return this._filtered;
	}

	socialCheesecake.Actor.prototype.isVisible = function() {
		return !(this.isHidden() || this.isFiltered());
	}

	socialCheesecake.Actor.prototype.filter = function() {
		this._filtered = true;
		this.fadeOut(100, true);
	}

	socialCheesecake.Actor.prototype.unfilter = function() {
		this._filtered = false;
	}

	socialCheesecake.Actor.prototype.setDivOpacity = function(opacity) {
		opacity = (opacity > 1) ? 1 : opacity;
		opacity = (opacity < 0) ? 0 : opacity;
		var actor = this;
		var actor_div = this.getDiv();

		this.opacity = opacity;
		var newStyle = "opacity: " + this.opacity + ";";

		if(actor_div.getAttribute("style")) {
			newStyle = actor_div.getAttribute("style").replace(/opacity\s*:\s*[a-zA-Z0-9.]*;/g, "");
			newStyle = newStyle.concat("opacity: " + this.opacity + ";");
		}
		actor_div.setAttribute("style", newStyle);
	}

	socialCheesecake.Actor.prototype.fade = function(time, modifyDisplay) {
		var actor = this;
		var time = (time) ? time : 300;
		var minOpacity = this.grid.minOpacity;
		var maxOpacity = this.grid.maxOpacity;
		var deltaOpacity = ((maxOpacity - minOpacity)* 1000.0) / (60.0 * time);
		var grow = 0;
		
		if(this.fading == "out") {
			grow = -1;
			if(deltaOpacity > (this.opacity - minOpacity)) deltaOpacity = this.opacity - minOpacity;
		} else if(this.fading == "in") {
			grow = 1;
			if(deltaOpacity > (maxOpacity - this.opacity)) deltaOpacity = maxOpacity - this.opacity;
		}
		
		var opacity = this.opacity + grow * deltaOpacity;
		opacity = Math.round(opacity * 1000) / 1000;
		actor.setDivOpacity(opacity);

		if(((this.fading == "out") && (opacity > minOpacity)) || ((this.fading == "in") && (opacity < maxOpacity))) {
			requestAnimFrame(function() {
				actor.fade(time, modifyDisplay);
			});
		} else {
			this.fading = "none";
			if((modifyDisplay) && (opacity <= minOpacity))
				actor.hide();
		}
	}

	socialCheesecake.Actor.prototype.fadeOut = function(time, modifyDisplay) {
		var maxOpacity = this.grid.maxOpacity;
		this.fading = "out";
		this.setDivOpacity(maxOpacity);
		this.fade(time, modifyDisplay);
	}

	socialCheesecake.Actor.prototype.fadeIn = function(time, modifyDisplay) {
		var actor = this;
		var minOpacity = this.grid.minOpacity;

		if(actor.isFiltered())
			return;
		actor.fading = "in";
		actor.setDivOpacity(minOpacity);
		if(modifyDisplay)
			actor.show();
		actor.fade(time, modifyDisplay);
	};

	socialCheesecake.Actor.prototype.getCheesecake = function() {
		return this.grid.parent;
	};


	socialCheesecake.Actor.prototype.getDiv = function() {
		return this.gridElement[0];
	};
})();
