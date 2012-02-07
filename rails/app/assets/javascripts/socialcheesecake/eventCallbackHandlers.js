var socialCheesecake = socialCheesecake || {}; 
(function() {
	socialCheesecake.eventCallbackHandlers = {
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
			}
		},
		extraSector : {
			mouseover : function(sector) {
				var cheesecake = sector.getCheesecake();

				document.body.style.cursor = "pointer";
				sector.focus();
			},
			mouseout : function(sector) {
				var cheesecake = sector.getCheesecake();

				document.body.style.cursor = "default";
				sector.unfocus();
			},
			click : function(sector) {
				var cheesecake = sector.getCheesecake();

				cheesecake.focusAndBlurCheesecake(sector);
				cheesecake.addNewSector();
			}
		},
		greySector : {
			mouseout : function() {
				document.body.style.cursor = "default";
			},
			click : function() {
				return;
			},
			mouseup : function() {
				return;
			},
			mouseover : function() {
				document.body.style.cursor = "pointer";
			}
		},
		normalSubsector : {
			mouseover : function(subsector) {
				var cheesecake = subsector.getCheesecake();
				document.body.style.cursor = "pointer";
				if(subsector.parent.subsectors.length < 1) cheesecake.grid.focus(subsector.actors);
				cheesecake.setHighlightedSector(subsector);
			},
			mouseout : function(subsector) {
				var cheesecake = subsector.getCheesecake();
				document.body.style.cursor = "default";
				if(subsector.parent.subsectors.length < 1) cheesecake.grid.unfocus(subsector.actors);
				cheesecake.setHighlightedSector(subsector.parent);
			},
			click : function(subsector) {
				var cheesecake = subsector.getCheesecake();
				var selectedActors = cheesecake.grid.getSelectedActors();
				if(selectedActors.length > 0)
					subsector.changeMembership(selectedActors);
			},
			mouseup : function() {
				return;
			}
		},
		extraSubsector : {
			mouseover : function(sector) {
				sector.resizeWidth({
					width : (sector.originalAttr.rOut - sector.originalAttr.rIn) * 1.5,
					anchor : "m",
					step : 1
				});
			},
			mouseout : function(sector) {
				sector.resizeWidth({
					width : (sector.originalAttr.rOut - sector.originalAttr.rIn),
					anchor : "m",
					step : 1,
					priority : true
				})
			},
			click : function(subsector) {
				subsector.getRegion().off("mouseover");
				subsector.getRegion().off("mouseout");
				var newSubsector = subsector.parent.addNewSubsector(subsector.simulate);
				subsector.resizeWidth({
					width : newSubsector.rOut - newSubsector.rIn,
					anchor : "m",
					step : 1
				});
			},
			mouseup : function() {
				return;
			}
		}
	}
})();
