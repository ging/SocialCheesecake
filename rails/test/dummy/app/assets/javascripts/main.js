window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();
var sectorsCounter = 0;
var subsectorsCounter = [0];
var cheese;
var newSectorModel;
var cheesecakeData = {
	container : {
		id : "cheesecake",
		width : 440,
		height : 440
	},
	grid : {
		id : "grid",
		divIdPrefix : "actor_"
	},
	callbacks : {
		onChange : function() {
			console.log("Cambio detectado");
		},
		onSubsectorAddedBegin : function(subsector){
			console.log("New subsector is going to be added.");
			console.log(subsector);
		},
		onSubsectorAddedEnd : function(subsector){
			console.log("New subsector "+ subsector.getIndex() +" added in sector "+subsector.parent.getIndex());
			console.log(subsector.getCheesecake());
		},
		onSectorHighlight : function(){
			console.log("sector HIGHLIGHTED");
		},
		onSectorFocusBegin : function(){
			console.log("going to FOCUS sector ");
		},
		onSectorFocusEnd : function(){
			console.log("sector FOCUSED");
		},
		onSectorUnfocusBegin : function(){
			console.log("going to UNFOCUS sector");
		},
		onSectorUnfocusEnd : function(sector){
			console.log("sector UNFOCUSED");
		}
	},
	text : {
		newStyle : "bold italic 14px sans-serif"
	}
};
function addSector() {
	if(newSectorModel == null)
		newSectorModel = $("#s0").clone();
	var prevSector = "#s" + sectorsCounter;
	if(sectorsCounter >= 15)
		return false;
	sectorsCounter++;
	subsectorsCounter.push(0);
	var newSector = newSectorModel.clone();
	newSector.attr("id", "s" + sectorsCounter);
	newSector.find('.subtitle').text("Sector " + sectorsCounter);
	newSector.find('.subsubtitle').text("Subsector 0");

	var nameSector = newSector.find("#label_s0");
	nameSector.attr("id", "label_s" + sectorsCounter);
	nameSector.attr("value", randomName());
	//Default

	newSector.find("#s0s0").attr("id", "s" + sectorsCounter + "s0");
	var nameSubsector = newSector.find("#label_s0s0");
	nameSubsector.attr("id", "label_s" + sectorsCounter + "s0");
	nameSubsector.attr("value", randomName());
	//Default
	newSector.find("#add_subsector_button_s0").attr("id", "add_subsector_button_s" + sectorsCounter);

	var actors = newSector.find(".actors");
	for(var i = 0; i < actors.length; i++) {
		actors[i].setAttribute("name", "actors_s" + sectorsCounter + "s0");
	}
	newSector.find('button').attr('onclick', "addSubsector(" + sectorsCounter + ")");
	$("#sectors").tabs("add", "#tabs-" + sectorsCounter, sectorsCounter);
	$("#tabs-" + sectorsCounter).append(newSector);
	if(sectorsCounter >= 15) {
		$("#add_sector_button").attr("disabled", "true").slideToggle("slow");
		$("#add_tab").remove();
	} else {
		$("#sectors").find("ul").append($("#add_tab"));
	}
	return true;
}

function addSubsector(sector) {
	var prevSubsector = "#s" + sector + "s" + subsectorsCounter[sector];
	if(subsectorsCounter[sector] >= 3)
		return false;
	subsectorsCounter[sector]++;
	var newSubsector = $("#s0s0").clone();
	newSubsector.attr("id", "s" + sector + "s" + subsectorsCounter[sector]);
	newSubsector.find('.subsubtitle').text("Subsector " + subsectorsCounter[sector]);

	var nameSubsector = newSubsector.find("#label_s0s0");
	nameSubsector.attr("id", "label_s" + sector + "s" + subsectorsCounter[sector]);
	nameSubsector.attr("value", randomName());
	//Default
	var actors = newSubsector.find(".actors");
	for(var i = 0; i < actors.length; i++) {
		actors[i].setAttribute("name", "actors_s" + sector + "s" + subsectorsCounter[sector]);
	}
	$(newSubsector).hide();
	$(newSubsector).insertAfter(prevSubsector);
	$(newSubsector).slideToggle("slow");
	if(subsectorsCounter[sector] >= 3) {
		$("#add_subsector_button_s" + sector).attr("disabled", "true").slideToggle("slow");
	}
	return true;
}

function checkboxesToActorsArray(name) {
	var checkboxes = document.settings[name];
	var result = [];
	for(var i = 0; i < checkboxes.length; i++) {
		if(checkboxes[i].checked) {
			var actor = [];
			actor.push(i);
			result.push(actor);
		}
	}
	return result;
}

function createCheese() {
	var rMax = parseInt(document.getElementById("rmax").value);
	var x = parseInt(document.getElementById("x").value);
	var y = parseInt(document.getElementById("y").value);
	var sectors = [];

	for(var i = 0; i <= sectorsCounter; i++) {
		var subsectors = [];
		for(var j = 0; j <= subsectorsCounter[i]; j++) {
			subsectors[j] = {
				name : $("#label_s" + i + "s" + j).val(),
				actors : checkboxesToActorsArray("actors_s" + i + "s" + j),
				id : parseInt(i + "" + j)
			}
		}
		var sector = {
			name : $("#label_s" + i).val(),
			subsectors : subsectors,
			id : i
		};
		sectors.push(sector);
	}

	cheesecakeData.rMax = rMax;
	cheesecakeData.center = {
		x : x,
		y : y
	};
	cheesecakeData.sectors = sectors;
	if(cheese)
		deleteCheese();
	cheese = new socialCheesecake.Cheesecake(cheesecakeData);
	$('.actor').css('display','none');
	cheese.grid.showAll();
}

function deleteCheese() {
	$('canvas').detach();
	cheese.grid.hideAll();
	cheese = 0;
	var clone = $("#cheesecake").clone();
	clone.attr("id","cheesecake2");
	$("#cheesecake").after(clone);
	$("#cheesecake").remove();
	clone.attr("id","cheesecake");
}

function randomName() {
	function caseName(txtString) {
		strConv = txtString;
		strConv = strConv.toLowerCase();
		var strResult = "";
		var blnIsFirstChar = 1;
		for(var intI = 0; intI < strConv.length; intI++) {
			var strConvChar = strConv.charAt(intI);
			if(blnIsFirstChar == 1) {
				strConvChar = strConvChar.toUpperCase();
			}
			strResult += strConvChar;
			if(strConvChar == " " || strConvChar == "-") {
				blnIsFirstChar = 1;
			} else {
				blnIsFirstChar = 0;
			}
		}
		return strResult;
	}

	var strSet1 = "ddkkbblmmngppfrrssttwxyvy";
	var strSet2 = "aieou";
	var strSet3 = " '- - ";
	var intRandTitle = Math.ceil(10 * Math.random() - 1);
	var intRandNames = Math.ceil(2 * Math.random());
	var strName = "";
	for( intNames = 1; intNames <= intRandNames; intNames++) {
		if(intRandTitle < 8) {
			var intRandChars = Math.round(6 * Math.random()) + 2;
		} else {
			var intRandChars = Math.round(2 * Math.random()) + 4;
		}
		var blnStartSet = Math.ceil(2 * Math.random());
		for( intChars = 1; intChars <= intRandChars; intChars++) {
			if(blnStartSet == 1) {
				strName += strSet1.substr(Math.ceil(strSet1.length * Math.random()) - 1, 1);
				blnStartSet = 2;
			} else {
				strName += strSet2.substr(Math.ceil(strSet2.length * Math.random()) - 1, 1);
				blnStartSet = 1;
			}
		}
		if(intNames < intRandNames) {
			strName += strSet3.substr(Math.ceil(strSet3.length * Math.random()) - 1, 1);
		}
	}
	return caseName(strName);
}

function openPopup(id) {
	var darkener = $('<div/>', {
		id : "popup_darkener"
	});
	darkener.css("position", "fixed").css("top", 0).css("left", 0);
	var height = Math.max($(document).height(), $(window).height());
	var width = Math.max($(document).width(), $(window).width());
	darkener.css("height", height).css("width", width).css("z-index", 1000);
	darkener.on("click", function() {
		closePopup(id);
	})
	darkener.appendTo('body');
	$("#" + id).css("position", "fixed").css("top", 400).css("left", $(window).width() / 2);
	$("#" + id).css("height", 0).css("width", 0).css("z-index", 2000).show().animate({
		width : 900,
		height : 500,
		top : "-=263",
		left : "-=463"
	}, 1000);
	$(window).on("resize.popup_" + id, function() {
		var height = Math.max($(document).height(), $(window).height());
		var width = Math.max($(document).width(), $(window).width());
		$("#popup_darkener").css("height", height).css("width", width);
		$("#" + id).css("top", 137).css("left", ($(window).width() / 2) - 463);
	});
}

function closePopup(id) {
	$(window).off("resize.popup_" + id);
	$("#" + id).animate({
		width : 0,
		height : 0,
		top : "+=263",
		left : "+=463"
	}, 1000, function() {
		$("#" + id).hide()
		$("#popup_darkener").remove();
	})
}

function togglePopup(id) {
	if($("#" + id).is(":visible")) {
		closePopup(id);
	} else {
		openPopup(id);
	}
}

$(function() {
	$("#label_s0").val(randomName());
	$("#label_s0s0").val(randomName());
	$("#add_sector_button").click(addSector).button();
	$("#create_button").click(createCheese).button();
	$(".add_subsector_button").button();
	$("#settings").tabs({
		fx : {
			opacity : 'toggle',
			duration : 'slow'
		}
	});
	$("#sectors").tabs({
		fx : {
			opacity : 'toggle',
			duration : 'slow'
		}
	});
	addSector();
	addSubsector(1);
	addSubsector(1);
	addSector();
	addSubsector(2);

	$("#sectors").find("ul").append($("#add_tab"));

	createCheese();
	// Popup funcitons -------------------------

	// END Popup funcitons -------------------------
	var flipped = false;
	var flipTime = 500;
	function flipin() {
		if((!flipped) && ($("#briefing #logo img").attr("src") != $("#briefing #logoback img").attr("src"))) {
			var width = 100;
			$("#briefing #logo img").animate({
				width : 0,
				height : "+=10",
				"margin-top" : "-=5"
			}, flipTime / 2, function() {
				$("#briefing #logo img").attr("src", $("#briefing #logoback img").attr("src"));
				$("#briefing #logo img").css("cursor", "pointer");
				$("#briefing #logo img").on("click.popup", function() {
					togglePopup("briefing_popup");
				})
				$("#briefing #logo img").animate({
					width : width,
					height : "-=10",
					"margin-top" : "+=5"
				}, flipTime / 2, function() {
					flipped = true
				})
			})
		}
	}

	function flipout() {
		if((flipped) && ($("#briefing #logo img").attr("src") != $("#briefing #logofront img").attr("src"))) {
			var width = 100;
			$("#briefing #logo img").animate({
				width : 0,
				height : "+=10",
				"margin-top" : "-=5"
			}, flipTime / 2, function() {
				$("#briefing #logo img").attr("src", $("#briefing #logofront img").attr("src"));
				$("#briefing #logo img").css("cursor", "inherited");
				$("#briefing #logo img").off("click.popup");
				$("#briefing #logo img").animate({
					width : width,
					height : "-=10",
					"margin-top" : "+=5"
				}, flipTime / 2, function() {
					flipped = false
				})
			})
		}
	}


	$("#briefing #logo").hover(function() {
		clearTimeout($(this).data('timeout1'));
		clearTimeout($(this).data('timeout2'));
		$(this).data('timeout1', setTimeout(flipin, 100));
	}, function() {
		clearTimeout($(this).data('timeout1'));
		clearTimeout($(this).data('timeout2'));
		$(this).data('timeout2', setTimeout(flipout, 1000));
	});
	// END Icon Effects ----------------------------

})