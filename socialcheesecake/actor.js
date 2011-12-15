socialCheesecake.defineModule(
    'SocialCheesecake#Actor'
)
.dependsOn(
    'SocialCheesecake#Text'  
)
.withCode(function() {
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
		this.parents = [];
		if(settings.parent) this.parents.push(settings.parent);
		
		var actor = this;
		var gridIdPrefix = this.parents[0].parent.parent.grid.divIdPrefix;
		var actor_div = document.getElementById(gridIdPrefix+this.id);
		actor_div.addEventListener("mouseover", function(){
			var sector;
			actor.focus();
			for (var subsector in actor.parents){
				sector = actor.parents[subsector].parent;
				sector.eventHandler("mouseover");
				actor.parents[subsector].eventHandler("mouseover");
			}
		});
		actor_div.addEventListener("mouseout", function(){
			var sector;
			actor.unfocus();
			for (var subsector in actor.parents){
				sector = actor.parents[subsector].parent;
				sector.eventHandler("mouseout");
				actor.parents[subsector].eventHandler("mouseout");
			}
		});
	}
	
	socialCheesecake.Actor.prototype.focus = function() {
		var cheesecake = this.parents[0].parent.parent;
		var gridIdPrefix = cheesecake.grid.divIdPrefix;
		var actor_id = this.id;
		var actor_div = document.getElementById(gridIdPrefix+actor_id);
		var newClass="";
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
		var cheesecake = this.parents[0].parent.parent;
		var gridIdPrefix = cheesecake.grid.divIdPrefix;
		var actor_id = this.id;
		var actor_div = document.getElementById(gridIdPrefix+actor_id);
		var newClass="";
		if (actor_div.getAttribute("class")){
			newClass = actor_div.getAttribute("class").replace(/\sfocused/, "");
			actor_div.setAttribute("class", newClass);
		}	
	}
	
	socialCheesecake.Actor.prototype.hide = function() {
		var cheesecake = this.parents[0].parent.parent;
		var gridIdPrefix = cheesecake.grid.divIdPrefix;
		var actor_id = this.id;
		var actor_div = document.getElementById(gridIdPrefix+actor_id);
		var newStyle=" display: none;";
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
		var cheesecake = this.parents[0].parent.parent;
		var gridIdPrefix = cheesecake.grid.divIdPrefix;
		var actor_id = this.id;
		var actor_div = document.getElementById(gridIdPrefix+actor_id);
		if (actor_div.getAttribute("style")){
			var newStyle = actor_div.getAttribute("style").replace(/display\s*:\s*none;/, "");
			actor_div.setAttribute("style", newStyle);
		}
	}
});  
  
