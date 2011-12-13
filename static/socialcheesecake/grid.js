socialCheesecake.defineModule(
    'SocialCheesecake#Grid'
)
.dependsOn(
    'SocialCheesecake#Actor'  
)
.withCode(function() { 
	socialCheesecake.Grid = function (settings){
		if (!settings) throw "No arguments passed to the function";
		console.log(settings.actors);
		
		//Actors dimensions and positions
		this.actors = [];
	}
  
	socialCheesecake.Grid.prototype.addActor = function (actor_info, subsector) {
		var actors = this.actors;
		
		//Check if the actor is already in the array
		var actorAlreadyDeclared = false;
		for ( var actor in actors){
			if (actors[actor].id == actor_info.id){
				actorAlreadyDeclared = true;
				//Check if the subsector has already been declared a parent of the actor
				var subsectorAlreadyDeclared = false;
				for ( var parent in actors[actor].parents){
					if (actors[actor].parents[parent] == subsector) subsectorAlreadyDeclared=true;
				}
				if (!subsectorAlreadyDeclared) actors[actor].parents.push(subsector);
			}
		}
		// If the actor was not in the array, create it and add it to the array
		if(!actorAlreadyDeclared){
			var actor = new socialCheesecake.Actor({
				id : actor_info.id,
				parent : subsector
			});
			actors.push(actor);
		}
	}
});

