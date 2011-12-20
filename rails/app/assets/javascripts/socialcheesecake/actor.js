var socialCheesecake = socialCheesecake || {};
(function() {
	socialCheesecake.Actor = function(settings) {
		if(!settings) throw "No arguments passed to the function"
		if(!settings.parent) throw "Actor must be associated to at least a subsector"
		var defaultSettings = {
		}
		for(var property in defaultSettings) {
			if(!( property in settings)) {
				settings[property] = defaultSettings[property];
			}
		}
		this.id = settings.id;
		this.opacity = 1;
		this._focused = false;
		this._selected = false;
		this._hidden = false;
		this.parents = [];
		if(settings.parent) this.parents.push(settings.parent);
		
		var actor = this;
		var actor_div = actor.getDiv();
		var mouseoverCallback = function(){
			var sector;
			actor.focus();
			for (var subsector in actor.parents){
				sector = actor.parents[subsector].parent;
				sector.eventHandler("mouseover");
				actor.parents[subsector].eventHandler("mouseover");
			}
		}
		var mouseoutCallback = function(){
			var sector;
			actor.unfocus();
			for (var subsector in actor.parents){
				sector = actor.parents[subsector].parent;
				sector.eventHandler("mouseout");
				actor.parents[subsector].eventHandler("mouseout");
			}
		}
		actor_div.addEventListener("mouseover", mouseoverCallback, false);
		actor_div.addEventListener("mouseout", mouseoutCallback, false);
		actor_div.addEventListener("mousedown", function(){
			var sector;
			if( actor.isSelected()){
				// Deactivate actor
				actor._selected = false;
				actor_div.addEventListener("mouseover", mouseoverCallback, false);
				actor_div.addEventListener("mouseout", mouseoutCallback, false);
			}else{
				//Activate actor
				actor._selected = true;
				actor_div.removeEventListener("mouseover", mouseoverCallback, false);
				actor_div.removeEventListener("mouseout", mouseoutCallback, false);
			}
		});
	}
	
	socialCheesecake.Actor.prototype.isSelected = function() {
		return this._selected;
	}
	
	socialCheesecake.Actor.prototype.focus = function() {
		var actor_div = this.getDiv();
		var newClass="";
		this._focused = true;
		if (actor_div.getAttribute("class")){
			if (!(actor_div.getAttribute("class").match(/\sfocused/) )){
				newClass = actor_div.getAttribute("class").concat(" focused");
				actor_div.setAttribute("class", newClass);
			}
		}else{
			newClass = "focused";
			actor_div.setAttribute("class", newClass);
		}
	}
	
	socialCheesecake.Actor.prototype.unfocus = function() {
		var actor_div = this.getDiv();
		var newClass="";
		this._focused = false;
		if (actor_div.getAttribute("class")){
			newClass = actor_div.getAttribute("class").replace(/(^|\s)focused($|\s)/, "");
			actor_div.setAttribute("class", newClass);
		}	
	}
	
	socialCheesecake.Actor.prototype.isFocused = function() {		var actor = this;
		var gridIdPrefix = this.getCheesecake().grid.divIdPrefix;
		return this._focused;
	}
	
	socialCheesecake.Actor.prototype.hide = function() {
		var actor_div = this.getDiv();
		var newStyle=" display: none;";
		this._hidden = true;
		if (actor_div.getAttribute("style")){
			if (actor_div.getAttribute("style").match(/display\s*:\s*[a-z]*;/)){
				newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*[a-z]*;/, "display: none;");			
			}else{
				newStyle = actor_div.getAttribute("style").concat("display: none;");
			}
		}
		actor_div.setAttribute("style", newStyle);
	}
	
	socialCheesecake.Actor.prototype.show = function() {
		var actor_div = this.getDiv();
		this._hidden = false;
		if (actor_div.getAttribute("style")){
			var newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*none;/, "");
			actor_div.setAttribute("style", newStyle);
		}
	}
	
	socialCheesecake.Actor.prototype.isHidden = function() {
		return this._hidden;
	}
	
	socialCheesecake.Actor.prototype.fadeOut = function() {
		var actor_div = this.getDiv();
		
		if (actor_div.getAttribute("style")){
			if (actor_div.getAttribute("style").match(/opacity\s*:\s*[a-zA-Z0-9]*;/)){
				newStyle = actor_div.getAttribute("style").replace(/opacity\s*:\s*[a-zA-Z0-9]*;/, "opacity: "+0.5 + ";");			
			}else{
				newStyle = actor_div.getAttribute("style").concat("opacity: 1;");
			}
		}
		actor_div.setAttribute("style", newStyle);
	}
	
	socialCheesecake.Actor.prototype.getCheesecake = function (){
		return this.parents[0].parent.parent;
	}
	
	socialCheesecake.Actor.prototype.getDiv = function () {
		var gridIdPrefix = this.getCheesecake().grid.divIdPrefix;
		var actor_id = this.id;
		var actor_div = document.getElementById(gridIdPrefix+actor_id);
		return actor_div;
	}
	
})();  
  
