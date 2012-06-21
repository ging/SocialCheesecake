var socialCheesecake = socialCheesecake || {}; 
(function() {
	socialCheesecake.eventCallbackHandlers = {
		normalSector : {
			mouseover : function(sector) {
				var cheesecake = sector.getCheesecake();

				document.body.style.cursor = "pointer";

				sector.focus();
				sector.focusActors();

				if(cheesecake.highlightedSector !== null) {
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

				sector.unfocus();
				sector.unfocusActors();

				cheesecake.setHighlightedSector(null);
				sector.fan(false);
			},
			click : function(sector) {
				var cheesecake = sector.getCheesecake();
				cheesecake.focusAndBlurCheesecake(sector);
				sector.unfocusActors();
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
				cheesecake.calculatePortions();
			}
		},
		greySector : {
			mouseout : function() {
				document.body.style.cursor = "default";
			},
			click : function(sector) {
				sector.changeProperty("label","");
				sector.getCheesecake().unfocusAndUnblurCheesecake();
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
				subsector.focusActors();
				cheesecake.setHighlightedSector(subsector);
			},
			mouseout : function(subsector) {
				var cheesecake = subsector.getCheesecake();
				document.body.style.cursor = "default";
				subsector.unfocusActors();
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
					anchor : (sector.rIn == 0 ) ? "rin" : "m",
					step : 1,
					priority : true
				})
			},
			click : function(subsector) {
				subsector.parent.turnExtraIntoNewSubsector(subsector.simulate);
			},
			mouseup : function() {
				return;
			}
		},
		onSectorHighlight : null,
		onSubsectorAddedBegin : null,
		onSubsectorAddedEnd : null,
		onSectorFocusBegin : null,
		onSectorFocusEnd : null,
		onSectorUnfocusBegin : null,
		onSectorUnfocusEnd : null,
		onChange : null
	}
})();
