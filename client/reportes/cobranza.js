angular
  .module('casserole')
  .controller('CobranzaCtrl', CobranzaCtrl);
 
function CobranzaCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
  this.semanaActual = moment(new Date()).isoWeek();
  this.semanas = [this.semanaActual-1,this.semanaActual,this.semanaActual+1];
  this.diaActual = moment(new Date()).weekday();
  dias = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"];
  this.diasActuales = [];
  for(i = 0; i < this.diaActual; i++){this.diasActuales.push(dias[i])};
console.log(pagaronFunc(30))
  this.subscribe('inscripciones', () => {
    return [{estatus: true, seccion_id: Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ''}];
  });

	this.subscribe('pagos', () =>{
		return [{semana: {$in:this.semanas}}]
	});

  this.helpers({
		alumnos : () => {
			return Inscripciones.find();
		}
  });

  this.semanasObj = [];
  var key = 0;
  _.each(this.semanas,function(semana){
  	obj = {};
  	obj.semana = semana;
  	obj.pagaron = pagaronFunc(semana);
  	obj.cantidadAlumnos = cantidadAlumnosFunc(key);
  	key++;
  	rc.semanasObj.push(obj);
  });
console.log(this.semanasObj);

		function pagaronFunc(semana){
	  	return Pagos.find({concepto:"Colegiatura", tipo:"Cobro", semana:semana}).count()
	  }
   function cantidadAlumnosFunc(key){
  	if(key == 0){
  		dias = this.diaActual + 6;
  		desde = moment().subtract(10,'year').toDate();
  		hasta = moment().subtract(this.diaActual,'days').toDate();
  		alumnos = Inscripciones.find({fechaInscripcion:{$gte:desde,$lte:hasta}}).count();
  		return alumnos
  	}
  	if(key == 1){
  		dias = this.diaActual -1;
  		var desde = moment().subtract(10,'year').toDate();
  		dias = 6 - dias;
			var hasta = moment().add(dias,'days').toDate();
  		alumnos = Inscripciones.find({fechaInscripcion:{$gte:desde,$lte:hasta}}).count();
  		return alumnos
  	}
  	if(key == 2){
  		dias = this.diaActual -1;
  		var desde = moment().subtract(10,'year').toDate();
			var hasta = moment().add(dias,'days').toDate();
  		alumnos = Inscripciones.find({fechaInscripcion:{$gte:desde,$lte:hasta}}).count();
  		return alumnos
  	}
  }
};