var sectorsCounter = 0;
var subsectorsCounter = [0];
var newSectorModel;
var defaultSettings = [["John Connor Lider de la revolucion", "Cassidy", "Cassidy2"], ["3,14159265358979323846264338327950288419716939937510", "Abc", "Def"], ["Luke I am your father", "Luke I am your father", "Darth Vader"], ["Olivia", "Dunham", "FBI"], ["Altivia", "Duham2", "FBI2"], ["Walter", "Bishop", "Craziness"], ["Nina", "Massive", "Dynamic"], ["Alibabá", "Cave", "Treasure"], ["Mudito", "Enchanted Forest", "Aiho"], ["Ewook", "Endor Forest", "Cool"]];
var cheese;
var cheesecakeData = {
	container : {
		id : "container",
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
	sectorsCounter++;
	subsectorsCounter.push(0);
	var newSector = newSectorModel.clone();
	newSector.attr("id", "s" + sectorsCounter);
	newSector.find('.subtitle').text("Sector " + sectorsCounter);
	newSector.find('.subsubtitle').text("Subsector 0");

	var nameSector = newSector.find("#label_s0");
	nameSector.attr("id", "label_s" + sectorsCounter);
	nameSector.attr("value", defaultSettings[sectorsCounter][0]);
	//Default

	newSector.find("#s0s0").attr("id", "s" + sectorsCounter + "s0");
	var nameSubsector = newSector.find("#label_s0s0");
	nameSubsector.attr("id", "label_s" + sectorsCounter + "s0");
	nameSubsector.attr("value", defaultSettings[sectorsCounter][1]);
	//Default

	var actors = newSector.find(".actors");
	for(var i = 0; i < actors.length; i++) {
		actors[i].setAttribute("name", "actors_s" + sectorsCounter + "s0");
	}
	newSector.find('button').attr('onclick', "addSubsector(" + sectorsCounter + ")");
	$("#sectors").tabs("add","#tabs-" + sectorsCounter, "S" + sectorsCounter);
	$("#tabs-" + sectorsCounter).append(newSector);
}

function addSubsector(sector) {
	var prevSubsector = "#s" + sector + "s" + subsectorsCounter[sector];
	subsectorsCounter[sector]++;
	var newSubsector = $("#s0s0").clone();
	newSubsector.attr("id", "s" + sector + "s" + subsectorsCounter[sector]);
	newSubsector.find('.subsubtitle').text("Subsector " + subsectorsCounter[sector]);

	var nameSubsector = newSubsector.find("#label_s0s0");
	nameSubsector.attr("id", "label_s" + sector + "s" + subsectorsCounter[sector]);
	nameSubsector.attr("value", defaultSettings[sectorsCounter][2]);
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