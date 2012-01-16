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
		this.name = settings.name;
		this.opacity = 1;
		this._focused = false;
		this._selected = false;
		this._hidden = true;
		this._filtered = false;
		this.fading = "none";
		this.parents = [];
		if(settings.parent) this.parents.push(settings.parent);
		
		var actor = this;
		var actor_div = actor.getDiv();
		var mouseoverCallback = function(){
			var sector;
			actor.focus();
			for (var subsector in actor.parents){
				sector = actor.parents[subsector].parent;
				sector.focus();
				sector.changeColor(sector.mouseover.color);
				actor.parents[subsector].changeColor(actor.parents[subsector].mouseover.color);
			}
		}
		var mouseoutCallback = function(){
			var sector;
			actor.unfocus();
			for (var subsector in actor.parents){
				sector = actor.parents[subsector].parent;
				sector.unfocus();
				sector.changeColor(sector.mouseout.color);
				actor.parents[subsector].changeColor(sector.mouseout.color);
			}
		}
		actor_div.addEventListener("mouseover", mouseoverCallback, false);
		actor_div.addEventListener("mouseout", mouseoutCallback, false);
		actor_div.addEventListener("mousedown", function(){
			var sector;
			if( actor.isSelected()){
				// Deactivate actor
				actor._selected = false;
				actor.unfocus();
				actor_div.addEventListener("mouseover", mouseoverCallback, false);
				actor_div.addEventListener("mouseout", mouseoutCallback, false);
			}else{
				//Activate actor
				actor._selected = true;
				actor.focus();
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
		this.setDivOpacity(0);
		this.fading= "none";
	}
	
	socialCheesecake.Actor.prototype.show = function() {
		if(this.isFiltered()) return;
		var actor_div = this.getDiv();
		var newStyle=" display: inline;";
		this._hidden = false;
		if (actor_div.getAttribute("style")){
			if (actor_div.getAttribute("style").match(/display\s*:\s*[a-z]*;/)){
				newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*[a-z]*;/, "display: inline;");	
			}else{
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
		var newStyle="opacity: "+this.opacity + ";";
		
		if (actor_div.getAttribute("style")){
			newStyle = actor_div.getAttribute("style").replace(/opacity\s*:\s*[a-zA-Z0-9.]*;/g, "");
			newStyle = newStyle.concat("opacity: "+this.opacity + ";");			
		}
		actor_div.setAttribute("style", newStyle);
	}
	
	socialCheesecake.Actor.prototype.fade = function(time, modifyDisplay) {
		var actor = this;	
		var deltaOpacity = 1000.0/ (60.0 *time);
		var grow = 0;
		
		if (this.fading == "out"){
			grow = -1;
		}else if (this.fading == "in"){
			grow = 1;
			if (modifyDisplay) actor.show();
		}
		var opacity = this.opacity + grow * deltaOpacity;
		opacity = Math.round(opacity*1000)/1000;
		actor.setDivOpacity(opacity);
		var x = actor.opacity;
				
		if (((this.fading == "out") && (opacity >= 0))||
	 			((this.fading == "in") && (opacity <= 1))){
		  requestAnimFrame(function() {
				actor.fade(time, modifyDisplay);
      });
    }else{
    	this.fading = "none";
    	if((modifyDisplay) && (opacity <= 0)) actor.hide();
    }
	}
	
	socialCheesecake.Actor.prototype.fadeOut = function(time, modifyDisplay) {
		this.fading = "out";
		this.fade(time, modifyDisplay);
	}
	
	socialCheesecake.Actor.prototype.fadeIn = function(time, modifyDisplay) {
		if(this.isFiltered()) return;
		this.fading = "in";
		this.fade(time, modifyDisplay);
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
  
