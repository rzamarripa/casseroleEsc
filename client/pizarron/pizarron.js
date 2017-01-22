angular
  .module('casserole')
  .controller('PizarronCtrl', PizarronCtrl);
 
function PizarronCtrl($scope, $meteor, $reactive, $stateParams, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	
	var myCanvas = document.getElementById("myCanvas");
	ctx = myCanvas.getContext("2d");
	//console.log(this.pizarron );
	this.grupo = $stateParams.grupoId;

	this.subscribe("pizarrones",()=>{
		return [{grupo_id:this.grupo}]
	});

  
  this.guardarPizarron = function(imagen){
	  var pizarra = Pizarrones.findOne();
	  //console.log('me estoy guardando')
	  if(pizarra){
		  Pizarrones.update(pizarra._id, {$set:{imagen:imagen}});
		  
		}else{
			Pizarrones.insert({imagen:imagen,grupo_id:this.grupo});
		}
  }
  
  this.autorun(() => {
   	var imagsrc = this.getReactively('pizarrones');
   	var image = new Image();
   	//console.log(imagsrc);
   	if(imagsrc && imagsrc.imagen ){
   		image.src = imagsrc.imagen;
   		ctx.drawImage(image,0,0);
   	}
  });
  
  this.helpers({
	  pizarrones : () => {
		  return Pizarrones.findOne();
	  }
  })
  
  $(document).ready(function() {
		
	    
    // Fill Window Width and Height
    myCanvas.width = window.innerWidth;
		myCanvas.height = window.innerHeight;
		
		// Set Background Color
    ctx.fillStyle="#fff";
    ctx.fillRect(0,0,myCanvas.width,myCanvas.height);
		
		// Mouse Event Handlers
		if(myCanvas){
			rc.isDown = false;
			var canvasX, canvasY;
			ctx.lineWidth = 5;
			
			$(myCanvas)
			.mousedown(function(e){
				
				rc.isDown = true;
				ctx.beginPath();
				canvasX = e.pageX - myCanvas.offsetLeft;
				canvasY = e.pageY - myCanvas.offsetTop;
				ctx.moveTo(canvasX, canvasY);
			})
			.mousemove(function(e){
				if(rc.isDown !== false) {
					canvasX = e.pageX - myCanvas.offsetLeft;
					canvasY = e.pageY - myCanvas.offsetTop;
					ctx.lineTo(canvasX, canvasY);
					ctx.strokeStyle = "#000";
					ctx.stroke();					
				}
			})
			.mouseup(function(e){
				rc.guardarPizarron(myCanvas.toDataURL("image/png"));
				rc.isDown = false;
				ctx.closePath();

				
			});
		}
		
		// Touch Events Handlers
		draw = {
			started: false,
			start: function(evt) {
				ctx.beginPath();
				ctx.moveTo(
					evt.touches[0].pageX,
					evt.touches[0].pageY
				);
	
				this.started = true;
				
			},
			move: function(evt) {
	
				if (this.started) {
					ctx.lineTo(
						evt.touches[0].pageX,
						evt.touches[0].pageY
					);
	
					ctx.strokeStyle = "#000";
					ctx.lineWidth = 5;
					ctx.stroke();
				}
			
	
			},
			end: function(evt) {
				this.started = false;
				
			}
		};
		// Touch Events
		myCanvas.addEventListener('touchstart', draw.start, false);
		myCanvas.addEventListener('touchend', draw.end, false);
		myCanvas.addEventListener('touchmove', draw.move, false);
		
		// Disable Page Move
		document.body.addEventListener('touchmove',function(evt){
			evt.preventDefault();
		},false);
	});
	
}