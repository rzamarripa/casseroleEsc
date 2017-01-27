angular
	.module('casserole')
	.controller('ConceptosComisionCtrl', ConceptosComisionCtrl);
 
function ConceptosComisionCtrl($scope, $meteor, $reactive, $state, toastr) {
	$reactive(this).attach($scope);
	var self = this;

	self.action = true;
	self.subscribe('conceptosComision',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	});

	self.helpers({
		conceptosComision : () => {
			return ConceptosComision.find();
		}
	});

	self.nuevo = true;	
	self.nuevoConcepto = function()
	{
		self.action = true;
		self.nuevo = !self.nuevo;
		self.conceptoComision= {};		
	};

	self.guardar = function(conceptoComision,form)
	{
		if(form.$invalid){
			toastr.error('Error al guardar los datos.');
			return;
		}
		conceptoComision.nombre = conceptoComision.cantInicial + conceptoComision.signo + conceptoComision.cantFinal;
		conceptoComision.estatus = true;
		conceptoComision.campus_id = Meteor.user().profile.campus_id;
		conceptoComision.seccion_id = Meteor.user().profile.seccion_id;
		conceptoComision.usuarioInserto = Meteor.userId();
		//console.log(self.conceptoComision);
		ConceptosComision.insert(conceptoComision);
		toastr.success('Guardado correctamente.');
		conceptoComision = {};
		$('.collapse').collapse('hide');
		self.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
	};

	self.editar = function(id)
	{
		self.conceptoComision = ConceptosComision.findOne({_id:id});
		self.action = false;
		$('.collapse').collapse('show');
		self.nuevo = false;
	};
	
	self.actualizar = function(conceptoComision,form)
	{
		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var idTemp = conceptoComision._id;
		delete conceptoComision._id;
		conceptoComision.nombre = conceptoComision.cantInicial + conceptoComision.signo + conceptoComision.cantFinal;
		conceptoComision.usuarioActualizo = Meteor.userId();
		ConceptosComision.update({_id:idTemp},{$set:conceptoComision});
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		self.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
	};
		
	self.cambiarEstatus = function(id)
	{
		var conceptoComision = ConceptosComision.findOne({_id:id});
		if(conceptoComision.estatus == true)
			conceptoComision.estatus = false;
		else
			conceptoComision.estatus = true;
		
		ConceptosComision.update({_id:id}, {$set : {estatus : conceptoComision.estatus}});
	};
	
	self.probar = function(){
		cant = this.cantInscritos;
		console.log(cant);
		conceptos = ConceptosComision.find({estatus : true}).fetch();
		_.each(conceptos, function(concepto){
			switch(concepto.signo){
				case "<=" :
					if(cant >= concepto.cantInicial && cant <= concepto.cantFinal){
						self.mensaje = "Entró en la categoría de mayor o igual a " + concepto.cantInicial + " y menor o igual a " + concepto.cantFinal;
					}
					break;
				case ">=" :
					if(cant >= concepto.cantInicial && cant >= concepto.cantFinal){
						self.mensaje = "Entró en la categoría de mayor o igual a " + concepto.cantInicial + " y mayor o igual a " + concepto.cantFinal;
					}
					break;
			}
		})
	}
}
