angular
.module("casserole")
.controller("PlanEstudiosIndexCtrl", PlanEstudiosIndexCtrl);
function PlanEstudiosIndexCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr){
	let rc = $reactive(this).attach($scope);
	rc.action = $stateParams.id ? false : true; 
	rc.plan = {};
  	rc.plan.grados = [];
  rc.action = true;
  rc.subscribe('planesEstudios',function(){
		if($stateParams.id){			
			rc.plan = PlanesEstudios.findOne({ _id: $stateParams.id });
			if(!rc.plan){
				rc.plan={};
				rc.plan.grados = [];
			}

			rc.action = false;
			rc.nuevo = false;
		}
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }] 
  });
  rc.subscribe('secciones',()=>{
		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	 });
  rc.subscribe('materias',()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });
  rc.subscribe('ciclos', ()=>{
	  return [{
		  estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
	  }]
  });
  rc.subscribe('rvoe', ()=>{
	  return [{
		  estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""
	  }]
  });

	rc.helpers({
	  planesEstudios : () => {
		  return PlanesEstudios.find();
	  },
	  secciones : () => {
		  return Secciones.find();
	  },
	  materias : () => {
		  return Materias.find();
	  },
	  ciclos : () => {
		  return Ciclos.find();
	  },
	  
	  rvoes : () => {
		  return Rvoe.find();
	  },
  });	
  	
	function crearGrados(gradosActuales){
		if(gradosActuales <1 ){
			rc.plan.grados = [];
			return;
		}
		if(!rc.plan.grados){
			rc.plan.grados = [];
			for (var i = 0; i < gradosActuales; i++) {
				rc.plan.grados[i]=[];
			};
		}
		
		while(gradosActuales < rc.plan.grados.length)rc.plan.grados.pop();
		while(gradosActuales > rc.plan.grados.length)rc.plan.grados.push([]);
	}
	
	rc.getGrados = function() {
		var gradosActuales=rc.plan? (rc.plan.grado? rc.plan.grado:0 ):0;		
		crearGrados(gradosActuales)
		return _.range(gradosActuales);   
	};

	rc.agregarMateria = function(nuevaMateria){
		var gradosActuales=rc.plan? (rc.plan.grado? rc.plan.grado:0 ):0;
		crearGrados(gradosActuales);
		rc.plan.grados[nuevaMateria.grado].push(nuevaMateria);
		rc.nuevaMateria="";
	};

	rc.quitarMateria = function(_materia){
		var i=rc.plan.grados[_materia.grado].indexOf(_materia);
		rc.plan.grados[_materia.grado].splice( i, 1 );
	}

	rc.guardar = function(plan,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		plan.estatus = true;
		plan.campus_id = Meteor.user().profile.campus_id;
		plan.seccion_id = Meteor.user().profile.seccion_id;
		delete plan.$$hashKey;
		for (var i = 0; i < plan.grados.length; i++) {
			for (var j = 0; j < plan.grados[i].length; j++) {
				delete plan.grados[i][j].$$hashKey;
			};
		};
		plan.usuarioInserto = Meteor.userId();
		PlanesEstudios.insert(plan);	
		toastr.success('Guardado correctamente.');	
		rc.plan = {}; 
		$('.collapse').collapse('hide');
		rc.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go("root.planEstudio");
	};

	rc.editar = function(id)
	{
	    rc.plan = PlanesEstudios.findOne({_id:id});
	    rc.action = false;
	    $('.collapse').coll
	    rc.nuevo = false;
	};

	rc.actualizar = function(plan,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
			var idTemp = rc.plan._id;
			delete rc.plan._id;	
			delete rc.plan.$$hashKey;
			for (var i = 0; i < rc.plan.grados.length; i++) {
				for (var j = 0; j < rc.plan.grados[i].length; j++) {
					delete rc.plan.grados[i][j].$$hashKey;
				};
			};
			plan.usuarioActualizo = Meteor.userId(); 
			PlanesEstudios.update({_id:idTemp},{$set:rc.plan});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			rc.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	    $state.go("root.planEstudio");	
	};


	rc.cambiarEstatus = function(id)
	{
			var plan = PlanesEstudios.findOne({_id:id});
			if(plan.estatus == true)
				plan.estatus = false;
			else
				plan.estatus = true;
			
			PlanesEstudios.update({_id: id},{$set :  {estatus : plan.estatus}});
  };
	/*rc.action = true;  

  
  	rc.guardar = function(asd)
	{
		rc.plan.estatus = true;
		rc.planesEstudios.save(rc.plan).then(function(docto){			
			$state.go("root.planEstudioDetalle",{"id":docto[0]._id});
		});
	};
	
	rc.nuevoAlumno = function()
	{
		rc.action = true;
	    rc.alumno = "";
	    
	};*/
};