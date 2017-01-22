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
				return "img/badmenprofile.jpeg";
			else if(sexo === "femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
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
	  rc.planPagos = [];
		var dia = 1;
		var mfecha = moment(this.cambioSemanasPlanPagos.fechaInicial);
		mfecha = mfecha.day(dia);
		var inicio = mfecha.toDate();
		
		var plan = [];
		for (var i = 0; i < this.cambioSemanasPlanPagos.totalPagos; i++) {
			var pago = {
				semana 			    : mfecha.isoWeek(),
				fecha 			    : new Date(mfecha.toDate().getTime()),
				dia                 : mfecha.weekday(),
				tipoPlan 		    : 'Semanal',
				numeroPago 	        : i + 1,
				importeRegular      : this.cambioSemanasPlanPagos.importeRegular,
				importeRecargo      : this.cambioSemanasPlanPagos.importeRecargo,
				importeDescuento    : this.cambioSemanasPlanPagos.importeDescuento,
				diasRecargo         : this.cambioSemanasPlanPagos.diasRecargo,
				diasDescuento       : this.cambioSemanasPlanPagos.diasDescuento,
				importe             : this.cambioSemanasPlanPagos.importeRegular,
				alumno_id						: this.alumno_id,
				fechaPago           : undefined,
				semanaPago          : undefined,
				diaPago             : undefined,
				pago                : 0,
				estatus             : 0,
				tiempoPago          : 0,
				modificada          : false,
				mes					: mfecha.get('month') + 1,
				anio				: mfecha.get('year')
			}
			
			if(i == 0){
				pago.pagada = 1;
			}
			
			rc.planPagos.push(pago);
			mfecha = mfecha.day(8);
		}

		return plan;
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