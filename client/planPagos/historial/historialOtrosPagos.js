angular
	.module('casserole')
	.controller('HistorialOtrosPagosCtrl', HistorialOtrosPagosCtrl);
 
function HistorialOtrosPagosCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
		
	this.masInfo = true;
	this.totalPagar = 0.00;
	this.alumno = {};
	this.fechaActual = new Date();
	this.diaActual = moment(new Date()).weekday();
	this.semanaPago = moment(new Date()).isoWeek();
	this.hayParaPagar = true;
	this.tipoPlanes=["Semanal","Quincenal","Mensual"];
	this.planEstudios_id = [];
	this.ocupacion_id = "";
	this.semanasSeleccionadas = [];
	this.otroPago = {}; 
	
	this.subscribe("ocupaciones",()=>{
		return [{_id : this.getReactively("ocupacion_id"), estatus : true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe("planPagos",()=>{
		return [{alumno_id : $stateParams.alumno_id }]
	});
	
	this.subscribe("turnos",()=>{

		return [{estatus:true, campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe("curriculas",()=>{

		return [{estatus:true, alumno_id : $stateParams.alumno_id, planEstudios_id : { $in : this.getCollectionReactively("planEstudios_id")}}]
	});

	this.subscribe('inscripciones', () => {
		return [{
			alumno_id : $stateParams.alumno_id,
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});
	
	this.subscribe('alumno', () => {
		return [{
			id : $stateParams.alumno_id,
			campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
		}];
	});

	this.subscribe("cuentas",()=>{

		return [{activo:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	});

	this.subscribe("grupos",() => {

		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }];
	});
	
	this.subscribe('pagosAlumno', () => {

		return [{
			alumno_id : $stateParams.alumno_id
		}];
	});
	
	
	this.subscribe('conceptosPago',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}]
	});
	
	this.subscribe("mediosPublicidad",()=>{
		return [{estatus:true }]
	});
		
	this.helpers({
		alumno : () => {
			var al = Meteor.users.findOne({_id : $stateParams.alumno_id});
			if(al){
				this.ocupacion_id = al.profile.ocupacion_id;
				return al;
			}			
		},
	
		planPagos : () => {
			 // var raw = 
			 // var planes = [];
			 // for(var id in raw){
			 // 	pago = raw[id];
			 // 	if(!planes[pago.inscripcion_id])
			 // 		planes[pago.inscripcion_id]=[];
			 // 	planes[pago.inscripcion_id].push(pago);

			 // }


		 var pagos = PlanPagos.find({modulo:"Otro"}).fetch();
		  	if (pagos) {
		  		_.each(pagos, function(pago){
		  			pago.concepto = ConceptosPago.findOne(pago.concepto_id)

		  	});
	  	}

			 return pagos
		},
		inscripciones : () =>{
			var inscripciones = Inscripciones.find({
				alumno_id : $stateParams.alumno_id,
				campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : ""
			}).fetch();
			
			if(inscripciones.length > 0){
				_.each(inscripciones, function(inscripcion){
					inscripcion.grupo = Grupos.findOne(inscripcion.grupo_id);
					inscripcion.grupo.turno = Turnos.findOne(inscripcion.grupo.turno_id);
				})
			}
			return inscripciones;
		},
	
		conceptosPago : () => {
		  return ConceptosPago.find({modulo:"otros"});
	  },
		mediosPublicidad : () => {
			return MediosPublicidad.find();
		}
	});



	


	this.getOcupacion = function(ocupacion_id){
		var ocupacion = Ocupaciones.findOne(ocupacion_id);
		if(ocupacion)
			return ocupacion.nombre;
	};
    
	this.guardarOtroPago = function(pago)
	{  
		var semanasPagadas = [];
			diaActual = moment(new Date()).weekday();
			semanaPago = moment(new Date()).isoWeek();
			anioPago = moment(new Date()).get('year');
		
			pago.estatus = 1;
			pago.usuarioAtendio = Meteor.user()._id;
			pago.inscripcion_id = rc.inscripciones[0]._id
			pago.dia = diaActual;
			pago.semana = semanaPago;
			pago.anio = anioPago;
			pago.alumno_id = $stateParams.alumno_id;
			pago.modulo = "Otro";


			//this.aula.seccion_id = Meteor.user().profile.seccion_id;
			//aula.usuarioInserto = Meteor.userId();	
			PlanPagos.insert(pago);
			toastr.success('Guardado correctamente.');
			otroPago = {}; 

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
	
	this.obtenerColorEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "bg-color-blue txt-white";
	  }else if(estatus == 2){
		  return "bg-color-purple txt-white"
	  }else if(estatus == 3){
		  return "bg-color-yellow txt-white"
	  }else if(estatus == 4){
		  return "bg-color-blueLight txt-white"
	  }else if(estatus == 5){
		  return "bg-color-greenLight txt-white"
	  }else if(estatus == 6){
		  return "bg-color-red txt-white"
	  }else if(estatus == 7){
		  return "bg-color-blueDark txt-white"
	  }else if(estatus == 8){
		  return "label-primary txt-white"
	  }
  }
  
  this.obtenerNombreEstatus = function(estatus){
	  if(estatus == 1){ //Registrado
		  return "Registrado";
	  }else if(estatus == 2){
		  return "Inicio"
	  }else if(estatus == 3){
		  return "Pospuesto"
	  }else if(estatus == 4){
		  return "Fantasma"
	  }else if(estatus == 5){
		  return "Activo"
	  }else if(estatus == 6){
		  return "Baja"
	  }else if(estatus == 7){
		  return "Term.Pago"
	  }else if(estatus == 8){
		  return "Egresado"
	  }
  }
	
}