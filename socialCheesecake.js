var socialCheesecake = socialCheesecake || {};

(function() {
	var scripts = document.head.getElementsByTagName('script');
	var rootPath = null;
	for(var i in scripts){
		if((scripts[i].getAttribute)&&(scripts[i].getAttribute('src').match("socialCheesecake.js"))){
			rootPath = scripts[i].getAttribute('src').replace("socialCheesecake.js", "");
		}else if((scripts[i].getAttribute)&&(scripts[i].getAttribute('src').match("application.js"))){
			//In case you are using rails, a compiled application.js is required instead of socialCheesecake.js
			rootPath = scripts[i].getAttribute('src').replace("application.js", "");
		}
	}
	if((rootPath)||(rootPath=="")){
		rootPath = rootPath.replace(/\s/g, "");
		if(rootPath==""){
			var href = document.location.href;
			rootPath = href.slice(0, href.lastIndexOf("/")+1); 
		} 
	}
    socialCheesecake = {
        modules : {},
        currentModule : undefined,
        moduleQueue : [],
        rootPath : rootPath || 'static/',
        log: function(message, level){
            var now = new Date();
            var timestamp = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "," + now.getMilliseconds();
            if(level!=undefined){
                level=level.toUpperCase() + ": ";
            }else{
                level="";
            }
            console.log("#" + timestamp + " >>  " + level + message)
        },
        defineModule : function(name) {
            if(socialCheesecake.modules[name] && socialCheesecake.modules[name].isDefined()) {
                socialCheesecake.log("You are redefining module '" + name + "'. This may break the game.", "warning");
            }
            socialCheesecake.currentModule = new socialCheesecake.Module(name);
            socialCheesecake.modules[name] = socialCheesecake.currentModule;
            socialCheesecake.moduleQueue.push(socialCheesecake.currentModule);
            return socialCheesecake;
        },
        dependsOn : function() {
            socialCheesecake.currentModule.dependencies = [].splice.call(arguments, 0);
            if(socialCheesecake.currentModule.isDefined()) {
                socialCheesecake._activateModules();
            } else {
                return socialCheesecake;
            }
        },
        withCode : function(code) {
            socialCheesecake.currentModule.code = code;
            if(socialCheesecake.currentModule.isDefined()) {
                socialCheesecake._activateModules();
            } else {
                return socialCheesecake;
            }
        },
        _downloadModule : function(name, origin) {
            if(socialCheesecake.modules[name] == undefined) {
                socialCheesecake.modules[name] = new socialCheesecake.Module(name);
            }

            var scriptTag = document.createElement("script");
            scriptTag.type = 'text/javascript';
            scriptTag.src = socialCheesecake.rootPath + name.toLowerCase().split("#").join("/") + '.js';
            scriptTag.onload = function() {
                socialCheesecake.log(name + " module downloaded.")
                socialCheesecake._activateModules();
            };
            scriptTag.onerror = function() {
                throw ('Module ' + name + ' (' + scriptTag.src + ') required from ' + origin + ' failed to load.');
            };
            document.getElementsByTagName("head")[0].appendChild(scriptTag);
        },
        _activateModules : function() {
            var modsReady = false;
            for(var i in socialCheesecake.moduleQueue) {
                var mod = socialCheesecake.moduleQueue[i];
                var depsReady = true;

                for(var j in mod.dependencies) {
                    var depName = mod.dependencies[j];
                    if(!socialCheesecake.modules[depName]) {
                        depsReady = false;
                        socialCheesecake._downloadModule(depName, mod.name);
                    } else if(!socialCheesecake.modules[depName].ready) {
                        depsReady = false;
                    }
                }

                if(depsReady && mod.isDefined()) {
                    socialCheesecake.moduleQueue.splice(i, 1);
                    mod.ready = true;
                    mod.execute();
                    modsReady = true;
                    i--;
                }
            }

            if(modsReady) {
                socialCheesecake._activateModules();
            }

            // Check everything correct
        }
    }

    /*************************************************************************************************
     *                              SocialCheesecake Module prototype
     *************************************************************************************************/
    socialCheesecake.Module = function(name) {
        this.name = name;
        this.dependencies = [];
        this.code = undefined;
        this.ready = false;
    }
    socialCheesecake.Module.prototype.isDefined = function() {
        return this.code != undefined;
    }
    socialCheesecake.Module.prototype.execute = function() {
        if(this.isDefined()){
            socialCheesecake.log(this.name + " module executed.");
            return this.code();
        }else{
            throw(this.name + " module is undefined and can't be executed.'");
        }        
    }
})();

socialCheesecake.defineModule(
    'SocialCheesecake#SocialCheesecake'
)
.dependsOn(
    'SocialCheesecake#Actor',
    'SocialCheesecake#Cheesecake',
    'SocialCheesecake#Grid',
    'SocialCheesecake#Sector',
    'SocialCheesecake#Text'
)
.withCode(function() {
    
});

/*
socialCheesecake.defineModule(
    'SocialCheesecake#X'
)
.dependsOn(
  
)
.withCode(function() {
    
});
*/




