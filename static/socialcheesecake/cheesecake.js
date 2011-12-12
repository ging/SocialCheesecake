socialCheesecake.defineModule(
    'SocialCheesecake#Cheesecake'
)
.dependsOn(
    'SocialCheesecake#Sector',
    'SocialCheesecake#Grid'  
)
.withCode(function() {
  socialCheesecake.Cheesecake = function(cheesecakeData) {
    var jsonSectors = cheesecakeData.sectors;
    var cheesecake = this;
    //Properties
    cheesecake.center = {
      x : cheesecakeData.center.x,
      y : cheesecakeData.center.y
    };
    cheesecake.rMax = cheesecakeData.rMax;
    cheesecake.sectors = [];
    cheesecake.auxiliarSectors = [];
    cheesecake.stage = new Kinetic.Stage(socialCheesecake.where, 780, 600);
    cheesecake.grid
  
    var phi = 0;
    var delta = 2 * Math.PI / jsonSectors.length;
    var actors = [];
    for(var i = 0; i < jsonSectors.length; i++) {
      var settings = {
        parent : cheesecake,
        center : {
          x : cheesecakeData.center.x,
          y : cheesecakeData.center.y
        },
        label : jsonSectors[i].name,
        phi : phi,
        delta : delta,
        rOut : cheesecakeData.rMax,
        subsectors : jsonSectors[i].subsectors,
        mouseover : {
          color : "#aaffaa",
          callback : function(sector) {
            document.body.style.cursor = "pointer";
            sector.focus();
          }
        },
        mouseout : {
          color : "#eeffee",
          callback : function(sector) {
            document.body.style.cursor = "default";
            sector.unfocus();
          }
        },
        mousedown : {
          color : "#77ff77",
          callback : function(sector) {
            cheesecake.focusAndBlurCheesecake(sector);
          }
        },
        mouseup : {
          color : "#aaffaa"
        }
      };
      cheesecake.sectors[i] = new socialCheesecake.Sector(settings);
      cheesecake.stage.add(cheesecake.sectors[i].getRegion());
      phi += delta;
      for(var j in jsonSectors[i].subsectors) {
        if(jsonSectors[i].subsectors[j].actors) {
          for(var k in jsonSectors[i].subsectors[j].actors)
          jsonSectors[i].subsectors[j].actors[k].push(cheesecake.sectors[i]);
          actors = actors.concat(jsonSectors[i].subsectors[j].actors);
        }
      }
    }
    cheesecake.grid = new socialCheesecake.Grid({
      parent : this,
      x : 500,
      y : 80,
      width : 270,
      height : 520,
      actors : actors
    });
  }
  socialCheesecake.Cheesecake.prototype.focusAndBlurCheesecake = function(sector) {
    var cheesecake = this;
    var regions = cheesecake.stage.shapes;
    var sectorIndex;
    for(var i in cheesecake.sectors) {
      if(cheesecake.sectors[i] === sector)
        sectorIndex = i;
    }
    if(sectorIndex == null)
      throw "sector doesn't belong to this cheesecake"
    for(var i = (regions.length - 1); i >= 0; i--) {
      if(!regions[i].permanent) {
        cheesecake.stage.remove(regions[i]);
      }
    }
  
    //Add auxiliar sectors
    var greySettings = {
      parent : cheesecake,
      center : {
        x : cheesecake.center.x,
        y : cheesecake.center.y
      },
      phi : sector.phi + sector.delta,
      delta : 2 * Math.PI - sector.delta,
      rOut : cheesecake.rMax,
      mouseout : {
        color : "#f5f5f5",
        callback : function() {
          document.body.style.cursor = "default";
        }
      },
      mousedown : {
        color : "#f5f5f5"
      },
      mouseup : {
        color : "#f5f5f5"
      },
      mouseover : {
        color : "#f5f5f5",
        callback : function() {
          document.body.style.cursor = "pointer";
        }
      },
      color : "#f5f5f5"
    };
    var dummySettings = {
      parent : cheesecake,
      center : {
        x : cheesecake.center.x,
        y : cheesecake.center.y
      },
      phi : sector.phi,
      delta : sector.delta,
      rOut : sector.rOut,
      label : sector.label,
      simulate : sectorIndex,
      mouseout : {
        callback : function() {
          document.body.style.cursor = "default";
        }
      },
      mouseover : {
        callback : function() {
          document.body.style.cursor = "pointer";
        }
      }
    };
    var greySector = new socialCheesecake.Sector(greySettings);
    cheesecake.auxiliarSectors.push(greySector);
    var dummySector = new socialCheesecake.Sector(dummySettings)
    cheesecake.auxiliarSectors.push(dummySector);
  
    cheesecake.stage.add(greySector.getRegion());
    cheesecake.stage.add(dummySector.getRegion());
    var greySectorContext = greySector.getRegion().getContext();
    var dummySectorContext = dummySector.getRegion().getContext();
  
    //Animations
    var greyMousedownCallback = function() {
      cheesecake.unfocusAndUnblurCheesecake();
    }
    var greyResizeCallback = function() {
      greySector.mousedown.callback = greyMousedownCallback;
    }
    var greyRotateToCallback = function() {
      greySector.resize({
        context : greySectorContext,
        delta : 3 * Math.PI / 2,
        anchor : "B",
        callback : greyResizeCallback
      });
    }
    var dummyResizeCallback = function() {
      dummySector.splitUp();
    }
    var dummyRotateToCallback = function() {
      dummySector.resize({
        context : dummySectorContext,
        anchor : "E",
        callback : dummyResizeCallback
      });
    }
  
    greySector.rotateTo({
      context : greySectorContext,
      phiDestination : Math.PI / 2,
      callback : greyRotateToCallback
    });
  
    dummySector.rotateTo({
      context : dummySectorContext,
      phiDestination : Math.PI / 2 - dummySector.delta,
      callback : dummyRotateToCallback
    });
  }
  socialCheesecake.Cheesecake.prototype.recoverCheesecake = function() {
    var cheesecake = this;
    var regions = cheesecake.stage.shapes;
  
    //Delete the auxiliar sectors
    for(var i = (regions.length - 1); i >= 0; i--) {
      if(!regions[i].permanent) {
        cheesecake.stage.remove(regions[i]);
      }
    }
    cheesecake.auxiliarSectors.pop();
  
    // Add the former sectors
    for(var i in cheesecake.sectors) {
      cheesecake.stage.add(cheesecake.sectors[i].getRegion());
    }
  }
  socialCheesecake.Cheesecake.prototype.unfocusAndUnblurCheesecake = function() {
    var cheesecake = this;
    var auxiliarSectors = this.auxiliarSectors;
    var sector;
    var greySector;
  
    //Localize the dummy and grey sectors
    for(var i in auxiliarSectors) {
      if(auxiliarSectors[i].simulate != null) {
        sector = auxiliarSectors[i];
      } else {
        greySector = auxiliarSectors[i];
      }
    }
  
    //Animate and go back to the general view
    sector.putTogether();
    sector.resize({
      context : sector.getRegion().getContext(),
      anchor : "B",
      delta : sector.originalAttr.delta,
      callback : function() {
        sector.rotateTo({
          context : sector.getRegion().getContext(),
          phiDestination : sector.originalAttr.phi
        });
      }
    });
    greySector.resize({
      context : greySector.getRegion().getContext(),
      anchor : "E",
      delta : greySector.originalAttr.delta,
      callback : function() {
        greySector.rotateTo({
          context : greySector.getRegion().getContext(),
          phiDestination : greySector.originalAttr.phi,
          callback : function() {
            cheesecake.recoverCheesecake();
          }
        });
      }
    });
  }
});

