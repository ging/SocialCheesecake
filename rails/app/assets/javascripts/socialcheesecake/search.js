var socialCheesecake = socialCheesecake || {}; 
(function() {
	socialCheesecake.SearchEngine = {
		filter : function(pattern, actors) {
			var actors = actors;
			var patt = new RegExp(pattern.toLowerCase());
	
			for(var i in actors) {
				var actor = actors[i];
				if(actor.name.toLowerCase().match(patt)) {
					actor.unfilter();
				} else {
					actor.filter();
				}
			}
		}
	}
})();
