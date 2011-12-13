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
			x : 0,
			y : 0,
			width : 64,
			height : 64,
			name : ""
		}
		for(var property in defaultSettings) {
			if(!( property in settings)) {
				settings[property] = defaultSettings[property];
			}
		}

		this.id = settings.id;
		this.parents = [];
		this.avatarRegion;
		this.x = settings.x;
		this.y = settings.y;
		this.width = settings.width;
		this.height = settings.height;
		this.name = settings.name;

		this.parents.push(settings.parent);
		var avatarImageObject = new Image();
		avatarImageObject.src = settings.imgSrc;

		var actor = this;
		avatarImageObject.onload = function() {
			actor._draw({ image : this });
		}
	}

	socialCheesecake.Actor.prototype._draw = function(settings) {
		var actor = this;
		var stage = this.parents[0].parent.parent.stage;
		var avatarImage = Kinetic.drawImage(settings.image, this.x, this.y, this.width, this.height);
		this.avatarRegion = new Kinetic.Shape(avatarImage);
		var avatarRegion = this.avatarRegion;
		var percentage = 10; (settings.permanent == null) ? avatarRegion.permanent = true : avatarRegion.permanent = false;
		//Listeners
		var mouseoverListener = function() {
			document.body.style.cursor = "pointer";
			actor.addBackground({
				percentage : percentage,
				backgroundColor : "#1F4A75"
			});
		};
		var mouseoutListener = function() {
			document.body.style.cursor = "default";
			actor.addBackground({
				percentage : percentage,
				backgroundColor : "#FFF"
			});
		};
		avatarRegion.addEventListener("mouseover", mouseoverListener);
		avatarRegion.addEventListener("mouseout", mouseoutListener);

		avatarRegion.addEventListener("mousedown", function() {
			if(arguments.callee.activeActor) {
				//Deactive Actor
				mouseoverListener();
				avatarRegion.addEventListener("mouseout", mouseoutListener);
				avatarRegion.addEventListener("mouseover", mouseoverListener);
				arguments.callee.activeActor = false;
			} else {
				//Activate Actor
				actor.addBackground({
					percentage : percentage,
					backgroundColor : "#DEEFF8",
					strokeColor : "#1F4A75"
				});
				avatarRegion.addEventListener("mouseout", function() {
					document.body.style.cursor = "default";
				});
				avatarRegion.addEventListener("mouseover", undefined);
				arguments.callee.activeActor = true;
			}
		});

		stage.add(avatarRegion);
		avatarRegion.getContext().save();
		socialCheesecake.text.writeCenterText(this.name, avatarRegion.getContext(), this.x + this.width / 2, this.y + this.height * (1 + 2 * percentage / 100));
	}

	socialCheesecake.Actor.prototype.addBackground = function(settings) {
		var defaultSettings = {
			percentage : 0,
			backgroundColor : "#FFF"
		}
		for(var property in defaultSettings) {
			if(!( property in settings)) {
				settings[property] = defaultSettings[property];
			}
		}
		var context = this.avatarRegion.getContext();
		var width = this.width * (1 + settings.percentage / 100);
		var height = this.height * (1 + settings.percentage / 100);
		var x = this.x - this.width * settings.percentage / (2 * 100);
		var y = this.y - this.height * settings.percentage / (2 * 100);
		this.avatarRegion.clear();
		context.beginPath();
		context.rect(x, y, width, height);
		context.closePath();
		context.fillStyle = settings.backgroundColor;
		context.fill();
		if(settings.strokeColor) {
			context.strokeStyle = settings.strokeColor;
			context.stroke();
		}
		context.restore();
		context.save();
		this.avatarRegion.drawFunc();
		socialCheesecake.text.writeCenterText(this.name, context, this.x + this.width / 2, this.y + this.height * (1 + 2 * settings.percentage / 100));
	}
});  
  
