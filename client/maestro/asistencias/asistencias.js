angular.module("casserole").controller
("MaestroAsistenciasCtrl",MaestroAsistenciasCtrl);
function MaestroAsistenciasCtrl($scope, $reactive, $meteor, $state, $stateParams, toastr) {
	let rc =$reactive(this).attach($scope);
	
	this.subscribe('grupos',()=>{
		return [{estatus:true, _id: $stateParams.id}]
	});
	
	this.asistencia = {};
	this.action = true;
	this.hoy = moment().startOf("day");
	this.manana = moment(this.hoy).add(1, "days");
	this.existe = 0;
	this.asistencia.fechaAsistencia = new Date();

	this.helpers({		
		grupo : () => {
		  return Grupos.findOne();
	  }
  });

  this.guardar = function(asistencia){
  	asistencia.grupo_id = $stateParams.id;

	  _.each(asistencia.alumnos, function(alumno){
		  delete alumno.$$hashKey;
	  });
	  
	  var asistenciaActual = {
		  alumnos : asistencia.alumnos,
		  fechaAsistencia : new Date(),
		  usuario : Meteor.user().username,
		  grupo_id : $stateParams.id,
		  materia_id : $stateParams.materia_id,
	  }

		$meteor.call("setAsistencia", asistenciaActual).then(function (data) {
			if(data == true){
				toastr.success("Gracias por tomar asistencia");
				$state.go("root.verAsistencias", {id:$stateParams.id, materia_id: $stateParams.materia_id});
			}else{
				toastr.success("Hubo un problema al tomar asistencia");
			}
	    
	  });
		
	}
	
	this.actualizar = function(asistencia){
		console.log(asistencia);
		_.each(asistencia.alumnos, function(alumno){
			delete alumno.$$hashKey;
		});
		Asistencias.update({_id:asistencia._id},{$set:{alumnos : asistencia.alumnos}});
		toastr.success("Ha actualizado la Asistencia");
		$state.go("root.verAsistencias", {id:$stateParams.id, materia_id: $stateParams.materia_id});
	}
	
	
	
	//TODO Me quedé validando la asistencia

	$meteor.call("getAsistencia", {grupo_id:$stateParams.id,
		materia_id: $stateParams.materia_id, 
	  fechaAsistencia : {
		  	$gte: this.hoy.toDate(),
		  	$lte: this.manana.toDate()
		  }
	 	}).then(function (data) {	

		 	console.log(data[0]);
		 	rc.existe = data.length;
		 	if(data.length == 0){
			 	$meteor.call("getAlumnosGrupo", {grupo_id:$stateParams.id}).then(function (data) {	
					console.log(data);
			    rc.asistencia.alumnos = data;
			  });
		 	}else{
 			 	rc.asistencia = data[0];
		 	}
  });
};