angular
.module("casserole")
.controller("GruposActivosCtrl", GruposActivosCtrl);
function GruposActivosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	
  this.action = true;
  this.nuevo = true;  
	this.grupos_id = [];
	this.maestros_id = [];
	this.materias_id = [];
	this.grupos = {};
	this.cant = 0;
	
	this.subscribe('grupo', () => {
		return [{_id : $stateParams.id, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}];
	});
	
	this.subscribe('maestros', () => {		
		return [{
			_id : { $in : this.getCollectionReactively('maestros_id')}
		}]
	});
	
	$(document).ready(function() {
			
		
			
			// PAGE RELATED SCRIPTS
		
			$('.tree > ul').attr('role', 'tree').find('ul').attr('role', 'group');
			$('.tree').find('li:has(ul)').addClass('parent_li').attr('role', 'treeitem').find(' > span').attr('title', 'Collapse this branch').on('click', function(e) {
				var children = $(this).parent('li.parent_li').find(' > ul > li');
				if (children.is(':visible')) {
					children.hide('fast');
					$(this).attr('title', 'Expand this branch').find(' > i').removeClass().addClass('fa fa-lg fa-plus-circle');
				} else {
					children.show('fast');
					$(this).attr('title', 'Collapse this branch').find(' > i').removeClass().addClass('fa fa-lg fa-minus-circle');
				}
				e.stopPropagation();
			});			
		
		})

  this.helpers({
	  grupos : () => {
		  return Grupos.find();
	  },
	  gruposActivos : () => {
		  var misAsignaciones = {};
			_.each(this.getReactively("grupos"), function(grupo){
				_.each(grupo.asignaciones, function(asignacion){
					if(asignacion.estatus == true){
						rc.maestros_id.push(asignacion.maestro_id);
						if(undefined == misAsignaciones[asignacion.maestro_id]){
							misAsignaciones[asignacion.maestro_id] = {};
							misAsignaciones[asignacion.maestro_id].asignaciones = [];
							misAsignaciones[asignacion.maestro_id].maestro = Maestros.findOne(asignacion.maestro_id);
							asignacion.grupo = grupo.nombre;
							asignacion.grupo_id = grupo._id;
							misAsignaciones[asignacion.maestro_id].asignaciones.push(asignacion)
						}else{
							asignacion.grupo = grupo.nombre;
							asignacion.grupo_id = grupo._id;
							misAsignaciones[asignacion.maestro_id].asignaciones.push(asignacion)
						}
					}
				});
			});
			
			return _.toArray(misAsignaciones);
	  }	  
  });
};