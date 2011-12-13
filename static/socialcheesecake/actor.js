socialCheesecake.defineModule(
    'SocialCheesecake#Actor'
)
.dependsOn(
    'SocialCheesecake#Text'  
)
.withCode(function() {
	socialCheesecake.Actor = function(settings) {
		if(!settings) throw "No arguments passed to the function"
		if(!settings.parent) throw "Actor must be associated to at least a subsector"
		var defaultSettings = {
		}
		for(var property in defaultSettings) {
			if(!( property in settings)) {
				settings[property] = defaultSettings[property];
			}
		}

		this.id = settings.id;
		this.parents = [];

		this.parents.push(settings.parent);
	}
});  
  
