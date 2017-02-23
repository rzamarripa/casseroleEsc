angular
.module("casserole")
.controller("CambiarRangoPlanPagosCtrl", CambiarRangoPlanPagosCtrl);
function CambiarRangoPlanPagosCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	this.nuevo = true;
	this.action = false;
	this.fechaActual = new Date();
	this.nuevoMasivo = true;
	this.nuevoMasivoSemanas = true;
	this.buscar = {};
	this.buscar.nombre = "";
	this.alumno_id = "";
	this.planPagos = [];
	window.rc = rc;
	
  
  this.subscribe('buscarAlumnosAdmin', () => {
		if(this.getReactively("buscar.nombre").length > 3){
			return [{
		    options : { limit: 50 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre'), 
				} 		   
	    }];
		}else{
			rc.alumno_id = "";
		}
  });
	
  this.subscribe("planPagos",()=>{
		return [{alumno_id : this.getReactively("alumno_id")}]
	});
	
	this.subscribe("inscripciones",()=>{
		return [{alumno_id : this.getReactively("alumno_id")}]
	});
	
	this.helpers({
		alumnos : () => {
			return Meteor.users.find({roles : ["alumno"]});
		},
		alumno : () => {
			return Meteor.users.findOne({_id : this.getReactively("alumno_id")});
		},
		planPagosViejo : () => {
			 return PlanPagos.find().fetch();
		},
		inscripcion : () => {
			return Inscripciones.findOne({alumno_id : this.getReactively("alumno_id")});
		}
	});
	
	this.nuevoConvenio = function()
  {
    this.nuevo = !this.nuevo;
    this.nuevoMasivo = true;
    this.nuevoMasivoSemanas = true;
    this.action = !this.action;
    this.pago = {};
    $('#collapseMasiva').collapse('hide');
    $('#collapseMasivaSemanas').collapse('hide');
  };
  
  this.nuevoConvenioMasivo = function()
  {
	  this.nuevo = true;
    this.nuevoMasivo = !this.nuevoMasivo;
    this.nuevoMasivoSemanas = true;
    this.modificacion = {};		
		this.action = false;
    $('#collapseExample').collapse('hide');
    $('#collapseMasivaSemanas').collapse('hide');
  };
  
  this.nuevoConvenioMasivoSemanas = function()
  {
    this.nuevo = true;
    this.nuevoMasivo = true;
    this.nuevoMasivoSemanas = !this.nuevoMasivoSemanas;
    this.modificacion = {};
		this.action = false;
    $('#collapseExample').collapse('hide');
    $('#collapseMasiva').collapse('hide');
  };
  
  this.guardar = function(convenio,form)
	{
		if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
		convenio.estatus = 0;
		convenio.campus_id = Meteor.user().profile.campus_id;
		convenio.usuarioInserto = Meteor.userId();
		convenio.alumno_id = rc.alumno._id;
		PlanPlagos.insert({});
		toastr.success('Guardado correctamente.');
		this.escuela = {}; 
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
		
	};
	
	this.editar = function(pago)
	{
	    this.pago = pago;
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.cambiarEstatus = function(pago, estatus, tipoMov){
		var res = confirm("Está seguro que quiere " + tipoMov + " el pago?");
		if(res == true){
			PlanPagos.update(pago._id, { $set : {estatus : estatus}});
			toastr.success('Cancelado correctamente.');
		}
	}
	
	this.actualizar = function(pago,form)
	{
		if(form.$invalid){
      toastr.error('Error al actualizar los datos.');
      return;
	  }
		var idTemp = pago._id;
		delete pago._id;		
		pago.usuarioActualizo = Meteor.userId(); 
		pago.convenio = 1;
		PlanPagos.update({_id:idTemp},{$set:pago});
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
    form.$setUntouched();
	};
	
	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "masculino")
				return "img/badmenprofile.png";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
		}else{
			return foto;
		}
	}
	
	this.modificacionMasiva = function(modificacion, form){
		if(form.$invalid){
      toastr.error('Error al hacer la modificación masiva, por favor revise el llenado del formulario.');
      return;
	  }
	  var pagosPendientes = PlanPagos.find({ semana : { $gte : modificacion.semanaInicial, $lte : modificacion.semanaFinal }, anio : modificacion.anio, estatus : { $ne :  1}}).fetch();
	  
	  _.each(pagosPendientes, function(pago){
		  PlanPagos.update({_id : pago._id},
		  		{ $set : { modificada : true, pagoTiempo : 0, importeRegular : modificacion.importeRegular, importe : modificacion.importeRegular, importeRecargo : modificacion.recargo, importeDescuento : modificacion.descuento, descripcion : modificacion.descripcion}});
	  })
	  toastr.success('Se modificaron correctamente los ' + pagosPendientes.length + ' pagos');
	  this.modificacion = {};
	  $('#collapseMasiva').collapse('hide');
	  this.nuevoMasivo = !this.nuevoMasivo;
	}
	
	this.getFocus = function(){
	  document.getElementById('buscar').focus();
  }; 
  
  this.seleccionarAlumno = function(alumno_id){
		rc.alumno_id = alumno_id;
  }
  
  this.planPagosSemana =function () {
	  if(form.$invalid){
      toastr.error('Error al calcular el nuevo plan de pagos, llene todos los campos.');
      return;
	  }
	  
	  var modeloPago = PlanPagos.findOne({alumno_id : this.alumno_id});
	  
	  rc.planPagos = [];
		var dia = 1;
		var mfecha = moment(this.cambioSemanasPlanPagos.fechaInicial);
		mfecha = mfecha.day(dia);
		var inicio = mfecha.toDate();
		
		for (var i = 0; i < this.cambioSemanasPlanPagos.totalPagos; i++) {
			
			var anio = mfecha.get('year');
			
			if(mfecha.isoWeek() == 52){
				var ultimoPago = _.last(rc.planPagos);
				anio = moment(new Date(ultimoPago.fecha)).year();
			}
			
			if(rc.planPagos.length > 0){
				var ultimoPago = _.last(rc.planPagos);
				if(mfecha.isoWeek() < ultimoPago.semana){					
					anio = moment(ultimoPago.fecha).get("year") + 1;
				}
			}

			var pago = {
				semana 			    		: mfecha.isoWeek(),
				fecha 			    		: new Date(new Date(mfecha.toDate().getTime()).setHours(23,59,59)),
				dia                 : mfecha.weekday(),
				tipoPlan 		    		: 'Semanal',
				numeroPago 	        : i + 1,
				alumno_id						: this.alumno_id,
				inscripcion_id			: modeloPago.inscripcion_id,
				vendedor_id					: modeloPago.vendedor_id,
				seccion_id					: modeloPago.seccion_id,
				campus_id						: modeloPago.campus_id,
				cuenta_id						: modeloPago.cuenta_id,
				fechaInscripcion		: modeloPago.fechaInscripcion,
				importeRegular      : this.cambioSemanasPlanPagos.importeRegular,
				importeRecargo      : this.cambioSemanasPlanPagos.importeRecargo,
				importeDescuento    : this.cambioSemanasPlanPagos.importeDescuento,
				diasRecargo         : this.cambioSemanasPlanPagos.diasRecargo,
				diasDescuento       : this.cambioSemanasPlanPagos.diasDescuento,
				importe             : this.cambioSemanasPlanPagos.importeRegular,		
				fechaCreacion				: new Date(),
				faltante						: null,
				fechaPago           : null,
				anioPago						: null,
				mesPago							: null,
				semanaPago          : null,
				diaPago             : null,
				fechaPago						: null,
				pago                : 0,
				estatus             : 0,
				tiempoPago          : 0,
				modificada          : true,
				mes									: mfecha.get('month') + 1,
				anio								: anio,
				modulo							: "colegiatura"
			}
			
			if(i == 0){
				pago.estatus = 1;
			}
			
			rc.planPagos.push(pago);
			mfecha = mfecha.day(8);
		}
		
		return rc.planPagos;
	}
	
	this.confirmarCambio = function(){
		Meteor.apply('modificarSemanasPlanPagos', [this.alumno_id, this.planPagos], function(error, result){
		  if(result == "hecho"){
			  toastr.success('Se modificaron correctamente los ' + rc.planPagos.length + ' pagos');
			  rc.planPagos = [];
		  }
	    $scope.$apply();
	  });
	}
};