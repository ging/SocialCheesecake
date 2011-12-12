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
    
    //Dimensions
    this.x = settings.x;
    this.y = settings.y;
    this.width = settings.width;
    this.height = settings.height;
    this.actors = [];
    
    var imageX = this.x;
    var imageY = this.y;
    var imageWidth = settings.imageWidth | 64;
    var imageHeight = settings.imageWidth | 64;
    var xSeparation = settings.xSeparation | 30;
    var ySeparation = settings.ySeparation | 30;
    
    //Create actors
    for ( var i in settings.actors){
      var actor = new socialCheesecake.Actor ({ 
        parent : settings.actors[i][2],
        imgSrc : settings.actors[i][1],
        width: imageWidth, 
        height: imageHeight, 
        x : imageX, 
        y : imageY,
        name : settings.actors[i][0]
      });
      this.actors.push( actor);   
      imageX += imageWidth + xSeparation;
      if (imageWidth > (this.width + this.x - imageX )) {
        if (imageHeight < (this.height + this.y - imageY )) {
          imageY += imageHeight + ySeparation;
          imageX = this.x;
        } else{
          break;
        }
      }
    }
  }
});

