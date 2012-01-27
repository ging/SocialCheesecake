var sectorsCounter = 0;
var subsectorsCounter = [0];
var newSectorModel;
var cheese;
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
	onChange : function() {
		console.log("Cambio detectado");
	}
};
window.onload = function() {
	newSectorModel = $("#s0").clone();
}
window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};

})();
function addSector() {
	var prevSector = "#s" + sectorsCounter;
	if(sectorsCounter >= 15) return false;
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

	var actors = newSector.find(".actors");
	for(var i = 0; i < actors.length; i++) {
		actors[i].setAttribute("name", "actors_s" + sectorsCounter + "s0");
	}
	newSector.find('button').attr('onclick', "addSubsector(" + sectorsCounter + ")");
	$("#sectors").tabs("add", "#tabs-" + sectorsCounter, "S" + sectorsCounter);
	$("#tabs-" + sectorsCounter).append(newSector);
	return true;
}

function addSubsector(sector) {
	var prevSubsector = "#s" + sector + "s" + subsectorsCounter[sector];
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
	$(newSubsector).insertAfter(prevSubsector);
}

function checkboxesToActorsArray(name) {
	var checkboxes = document.settings[name];
	var result = [];
	for(var i = 0; i < checkboxes.length; i++) {
		if(checkboxes[i].checked) {
			var actor = [];
			actor.push(i);$(document)
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
			subsectors : subsectors
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
}

function deleteCheese() {
	$('canvas').detach();
	cheese.grid.hideAll();
	cheese = 0;
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
			} else {cheesecake
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