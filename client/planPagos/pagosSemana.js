angular
.module("casserole")
.controller("PagosSemanaCtrl", PagosSemanaCtrl);
function PagosSemanaCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
	this.alumnos_id = [];
	this.semanaActual = parseInt($stateParams.semana);
	this.anio = parseInt($stateParams.anio);
	this.totalPagos = 0.00;
	this.pagos = [];
	
	this.subscribe('pagosPorSemana',()=>{
		var query = {campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", semanaPago : parseInt(this.getReactively("semanaActual")), estatus : 1, anioPago : parseInt(this.getReactively("anio"))};
		console.log(query);
		return [query]
	});
	  
  this.subscribe('grupos', () => {
		return [{estatus : true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : ""}];
	});
	
	this.subscribe('alumnos', () => {		
		return [{
			_id : { $in : this.getCollectionReactively("alumnos_id")}
		}]
	});

  this.helpers({
	  pagos : () => {
		  var pagos = PlanPagos.find().fetch();
		  _.each(pagos, function(pago){
			  rc.alumnos_id.push(pago.usuarioInserto_id);
			  rc.alumnos_id.push(pago.alumno_id);
		  });
		  
		  return pagos;
	  },
	  pagosPorSemana : () => {
		  
		  var pagosPorGrupo = {};
		  var arreglo = {};
		  if(this.getReactively("pagos")){
			  
			  
				_.each(rc.getReactively("pagos"), function(pago){
					//Listado de Pagos realizados
					if(undefined == arreglo[pago.alumno_id]){
						arreglo[pago.alumno_id] = {};
						arreglo[pago.alumno_id].semanasPagadas = [];
						arreglo[pago.alumno_id].alumno = Meteor.users.findOne({_id : pago.alumno_id});
						arreglo[pago.alumno_id].usuario = Meteor.users.findOne({_id : pago.usuarioInserto_id});
						arreglo[pago.alumno_id].semanasPagadas.push(pago.semana);
						arreglo[pago.alumno_id].tipoPlan = pago.tipoPlan;
						arreglo[pago.alumno_id].fechaPago = pago.fechaPago;
					}else{
						arreglo[pago.alumno_id].semanasPagadas.push(pago.semana);
					}
				});

		  }
			
		  return arreglo;
	  },
  });
  
 this.imprimir = function(elem)
  {
		var mywindow = window.open('', 'PRINT', 'height=400,width=600');
		mywindow.document.write('<html><head><title>' + document.title  + '</title>');
		
		mywindow.document.write('</head><body >');
		mywindow.document.write('<h1>' + document.title  + '</h1>');
		mywindow.document.write(document.getElementById(elem).innerHTML);
		mywindow.document.write('</body></html>');
		
		mywindow.document.close(); // necessary for IE >= 10
		mywindow.focus(); // necessary for IE >= 10*/
		
		mywindow.print();
		mywindow.close();
		
		return true;

  }
}

//XFSrD4ZL34Dn8nG2Q