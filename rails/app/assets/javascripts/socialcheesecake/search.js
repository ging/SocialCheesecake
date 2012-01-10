var socialCheesecake = socialCheesecake || {};
(function() {
	socialCheesecake.SearchEngine = function(settings){
		this.parent = settings.parent;
	}
	
	socialCheesecake.SearchEngine.prototype.filter = function(pattern){
		var actors = this.parent.grid.actors;
		var patt = new RegExp(pattern.toLowerCase());
		
		for (var i in actors){
			var actor = actors[i];
			if(actor.name.toLowerCase().match(patt)){
				actor.unfilter();
			}else{
				actor.filter();
			}
		}
	}
})();