angular
  .module('casserole')
  .controller('CiclosCtrl', CiclosCtrl);
 
function CiclosCtrl($scope, $meteor, $reactive, $state, toastr, SaveService) {
	let rc = $reactive(this).attach($scope);
	this.action = true;
	this.subscribe('ciclos',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});

  this.helpers({
		ciclos : () => {
		  return Ciclos.find();
	  }
  });
  	  
  this.nuevo = true;	  
  this.nuevoCiclo = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.ciclo = {};		
    this.ciclo.vacaciones = [];
    this.vaca = {};
    this.nuevasVacaciones = true;
  };
	
  this.guardar = function(ciclo,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
    }
		
		ciclo.estatus = true;
		ciclo.campus_id = Meteor.user().profile.campus_id;
		ciclo.seccion_id = Meteor.user().profile.seccion_id;
		ciclo.usuarioInserto = Meteor.userId();
		Ciclos.insert(ciclo)
		SaveService.save('ciclos', ciclo, function(err, message){
			if(err){
				toastr.error(err);
				return
			}
			ciclo = {};
			rc.nuevo = true;
			$('.collapse').collapse('hide');
			toastr.success(message);
		});
	};
	
	this.editar = function(id)
	{
    this.ciclo = Ciclos.findOne({_id:id});
    this.action = false;
    $('.collapse').collapse('show');
    this.nuevo = false;
	};
	
	this.actualizar = function(ciclo,form)
	{
    if(form.$invalid){
        toastr.error('Error al actualizar los datos.');
        return;
    }
		var idTemp = ciclo._id;
		delete ciclo._id;		
		ciclo.usuarioActualizo = Meteor.userId(); 
		Ciclos.update({_id:idTemp},{$set:ciclo});
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
		
	this.cambiarEstatus = function(id)
	{
		var ciclo = Ciclos.findOne({_id:id});
		if(ciclo.estatus == true)
			ciclo.estatus = false;
		else
			ciclo.estatus = true;
		
		Ciclos.update({_id:id}, {$set : {estatus : ciclo.estatus}});
	};	
	
	this.agregarVacaciones = function(vacaciones, form){
		if(form.$invalid){
      toastr.error('Error al agregar las vacaciones, por favor llene todos los campos.');
      return;
    }
    
    if(rc.ciclo.vacaciones == undefined){
	    rc.ciclo.vacaciones = [];
    }
    
    rc.ciclo.vacaciones.push({
	    semana : vacaciones.semana,
	    anio : vacaciones.anio
    });
    
    rc.vaca = {};
	}
	
	this.confirmarVacaciones = function(vacaciones){
		delete vacaciones.editando;
	}
	
	this.editarVacaciones = function(vacaciones){
		vacaciones.editando = true;
	}
	
	this.quitarVacaciones = function(vacaciones, index){
		rc.ciclo.vacaciones.splice(index, 1);
	}
};