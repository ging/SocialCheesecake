var socialCheesecake = socialCheesecake || {};
(function() {
	//General variable settings (with default values)
	socialCheesecake.colors = {
		normalSector : {
			background : "#FEEEBD",
			border : "#D19405",
			font : "#D19405",
			click : "#FFE481",
			mouseover : "#FFE481",
			mouseup : "#FEEEBD",
			mouseout : "#FEEEBD"
		},
		extraSector : {
			background : "#FFBABA",
			border : "#BD1823",
			font : "#BD1823",
			click	: "#FF5964",
			mouseover : "#FF5964",
			mouseup : "#FFBABA",
			mouseout : "#FFBABA"
		},
		greySector : {
			background : "#f5f5f5",
			click : "#f5f5f5",
			mouseover : "#f5f5f5",
			mouseout : "#f5f5f5",
			mouseup : "#f5f5f5",
			font : "#666",
			border : "#666"
		}
	};
	socialCheesecake.colors.normalSubsector = socialCheesecake.colors.normalSector;
	socialCheesecake.colors.extraSubsector = socialCheesecake.colors.extraSector;
	socialCheesecake.colors.greySubsector = socialCheesecake.colors.greySector;	
}) ();
