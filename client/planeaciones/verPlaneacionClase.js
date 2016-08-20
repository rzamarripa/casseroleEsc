angular.module("casserole")
.controller("VerPlaneacionClaseCtrl",VerPlaneacionClaseCtrl);  
function VerPlaneacionClaseCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr, $compile) {
	let rc=$reactive(this).attach($scope);
 /*
	this.subscribe('grupos',()=>{
		return [{id:$stateParams.id, estatus:true}]
	 });
	this.subscribe('alumnos',()=>{
		return [{estatus:true}]
	 });
	 this.subscribe('asistencias',()=>{
		return [{grupo_id : $stateParams.id, materia_id : $stateParams.materia_id}]
	});

	this.helpers({
	  grupo : () => {
		  return Grupos.findOne();
	  },
	  alumnos : () => {
		  return Alumnos.find();
	  },
	  asistencias : () => {
	  	 return Asistencias.find();
	  } 
	 
  });
	*/
	this.asistencia = {};
	this.alumnos = [];
  $meteor.call("getAsistencias", $stateParams.id, $stateParams.materia_id).then(function (data) {
		this.asistencias = data;
		console.log(data);
		var transmutar = {};
		_.each(this.asistencias, function(asistencia){
			_.each(asistencia.alumnos, function(alumno){
				if("undefined" == typeof transmutar[alumno.nombre]){
					transmutar[alumno.nombre]={};
					transmutar[alumno.nombre].nombre = alumno.nombre + " " + alumno.apPaterno + " " + alumno.apMaterno; 
					transmutar[alumno.nombre].matricula = alumno.matricula; 
					transmutar[alumno.nombre].dias = [];
				}
				transmutar[alumno.nombre].dias.push(alumno.checked);
			})
		});
		rc.alumnosAsistidos = _.toArray(transmutar);
		console.log("Asistidos", rc.alumnosAsistidos);
  });
  
};
