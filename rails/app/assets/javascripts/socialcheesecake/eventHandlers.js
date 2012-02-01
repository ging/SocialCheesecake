var socialCheesecake = socialCheesecake || {}; 
(function() {
	socialCheesecake.eventHandlers = {
		normalSector : {
			mouseover : function(sector) {
				var cheesecake = sector.getCheesecake();
				
				document.body.style.cursor = "pointer";
				cheesecake.grid.focus(sector.actors);
				sector.focus();
				if(cheesecake.highlightedSector != null) {
					cheesecake.highlightedSector.fan(false, function() {
						sector.fan(true);
					});
				} else {
					sector.fan(true);
				}
				cheesecake.setHighlightedSector(sector);
			},
			mouseout : function(sector) {
				var cheesecake = sector.getCheesecake();
				
				document.body.style.cursor = "default";
				cheesecake.grid.unfocusAll();
				sector.unfocus();
				cheesecake.setHighlightedSector(null);
				sector.fan(false);
			},
			click : function(sector) {
				var cheesecake = sector.getCheesecake();
				
				cheesecake.focusAndBlurCheesecake(sector);
				cheesecake.grid.hideAll();
				cheesecake.grid.fadeIn(sector.actors, 300, true);
			}
		},
		extraSector : {
			mouseover : function(sector) {
				var cheesecake = sector.getCheesecake();
				
				document.body.style.cursor = "pointer";
				sector.focus();
				cheesecake.grid.hideAll();
			},
			mouseout : function(sector) {
				var cheesecake = sector.getCheesecake();
				
				document.body.style.cursor = "default";
				sector.unfocus();
				cheesecake.grid.fadeInAll(300, true);
			},
			click : function(sector){
				var cheesecake = sector.getCheesecake();
				
				cheesecake.focusAndBlurCheesecake(sector);
				cheesecake.addNewSector();
			}
		},
		greySector : {
			mouseout : function() {
					document.body.style.cursor = "default";
			},
			click : {
				
			},
			mouseup : {
				
			},
			mouseover : function() {
					document.body.style.cursor = "pointer";
			}
		}
	}
}) ();