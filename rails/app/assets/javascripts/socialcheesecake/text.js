var socialCheesecake = socialCheesecake || {}; (function() {
	socialCheesecake.text = {
		writeCurvedText : function(text, context, x, y, r, phi, delta, color) {
			context.font = "bold 14px sans-serif";
			context.fillStyle = color || "#000";
			context.textBaseline = "middle";
			var medium_alpha = Math.tan(context.measureText(text).width / (text.length * r));
			var old_text = null;
			var original_text = text;
			while(medium_alpha * (text.length + 4) > delta) {
				if(old_text==text){
					console.log("WARNING: Infinite loop detected and stopped. Text '" + original_text + "' failed to be " + 
								"correctly truncated. Proccesed serveral times as '" + text + "' and will be returned as '" + 
								words[0].substring(0, delta/medium_alpha - 7) + "'. Space too small to even be able to truncate.")								
					text = words[0].substring(0, delta/medium_alpha - 7);
					break;
				}else{
					old_text = text;
				}
				words = text.split(" ");
				if(words.length > 1){
					words.splice(words.length - 1, 1);
					text = words.join(" ") + "...";
				}else{
					text = words[0].substring(0, delta/medium_alpha - 7) + "...";
				}
				medium_alpha = Math.tan(context.measureText(text).width / (text.length * r));			
			}
			context.translate(x, y);
			var orientation = 0;
			if((phi + delta / 2 >= Math.PI ) && (phi + delta / 2 < Math.PI * 2)) {
				orientation = -1;
				context.rotate(-(delta - (medium_alpha * text.length)) / 2 - phi - Math.PI / 2);
			} else {
				orientation = 1;
				context.rotate((delta - (medium_alpha * text.length)) / 2 + Math.PI / 2 - delta - phi);
			}
			for(var i = 0; i < text.length; i++) {
				context.fillText(text[i], 0, -(orientation * r));
				var alpha = Math.tan(context.measureText(text[i]).width / r);
				context.rotate(orientation * alpha);
			}
			context.restore();
			context.save();
		},
		writeCenterText : function(text, context, centerX, centerY) {
			context.fillText(text, centerX - context.measureText(text).width / 2, centerY);
		}
	}
})();
