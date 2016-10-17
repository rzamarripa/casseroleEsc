angular
.module("casserole")
.controller("GerenteVendedoresCtrl", GerenteVendedoresCtrl);
function GerenteVendedoresCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
  let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;
  this.vendedor_id = "";
  this.buscar = {};  
  this.buscar.fechaInicial = new Date();
  this.buscar.fechaFinal = new Date();
  this.vendeores_id = [];
  this.fechaInicial = new Date();
  this.fechaFinal = new Date();
  this.mensajeNuevo = true;
  this.mensaje = {};
  this.datosGrafica = {};
  this.objeto = {};
  moment.locale("es");
	
	let vend = this.subscribe('vendedores',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});

	this.subscribe('etapasVenta',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "", estatus : true}]
	});
	
	this.subscribe('inscripciones',()=>{
		return [{campus_id : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "" }]
	});
	
	this.subscribe('prospectosPorVendedor',()=>{
		return [{
			"profile.campus_id" : Meteor.user() != undefined ? Meteor.user().profile.campus_id : "",  
			"profile.vendedor_id" : {$in:this.getCollectionReactively('vendedores_id')}}]
	});
 
  this.helpers({
	  vendedores : () => {
		  if(Meteor.user()){
			  var usuarios = Meteor.users.find({roles : ["vendedor"]}).fetch();
			  var vendedoresDelGerente = [];
			  _.each(usuarios, function(usuario){
					  vendedoresDelGerente.push(usuario);
			  });
			  rc.vendedores_id = _.pluck(vendedoresDelGerente, "_id");
			  
			  return vendedoresDelGerente;
		  }
	  },
	  ultimosProspectos : () => {
		  
		  return Prospectos.find({"profile.vendedor_id" : this.getReactively("vendedor_id")}).fetch();		  
	  },
	  etapasVenta : () => {
		  
		  return EtapasVenta.find();
	  },
	  cantidadProspectosPorVendedor : () => {
		  
		  var arreglo = [];
		  if(vend.ready()){
			  _.each(rc.vendedores, function(vendedor){
				  arreglo.push(Prospectos.find({"profile.vendedor_id" : vendedor._id, 
					fecha : { $gte : rc.getReactively("fechaInicial"), $lt: rc.getReactively("fechaFinal")}}).count());
			  });
		  }
		  		  
		  return arreglo;
	  },
	  cantidadInscritosPorVendedor : () => {		  
		  var cantidadInscritos = [];
		  if(vend.ready()){
			  _.each(rc.vendedores, function(vendedor){
				  cantidadInscritos.push(Inscripciones.find({vendedor_id : vendedor._id, 
					fechaInscripcion : { $gte : rc.getReactively("fechaInicial"), $lt: rc.getReactively("fechaFinal")}}).count());
			  });
		  }
		  
		  return cantidadInscritos;
	  },
	  vendedoresNombres : () => {
		  vendedoresNombre = [];
		  if(vend.ready()){
			  _.each(this.vendedores, function(vendedor){
				  var nombre = vendedor.profile.nombre + " " + vendedor.profile.apPaterno + " " + vendedor.profile.apMaterno;
				  vendedoresNombre.push(nombre);
			  });
		  }
		  
		  return vendedoresNombre;
	  },
	  graficaVendedores : () => {
		  data = [];
		  
		  if(vend.ready()){
				data.push({
				  name: "Prospectos",
				  data: rc.cantidadProspectosPorVendedor
				});
				
				data.push({
					name: "Inscritos",
					data: rc.cantidadInscritosPorVendedor
				});
			}
			$('#container').highcharts( {
			    chart: { type: 'column' },
			    title: { text: 'Resumen de productividad de ventas' },
			    subtitle: {
		        text: 'Del ' + moment(rc.fechaInicial).format('LL') + 
		        			' al ' + moment(rc.fechaFinal).format('LL')
			    },
			    xAxis: {
		        categories: rc.vendedoresNombres,
		        crosshair: true
			    },
			    yAxis: {
		        min: 0,
		        title: {
		          text: 'Prospectos e Inscritos'
		        }
			    },
			    tooltip: {
		        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
		        pointFormat:  '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
		            					'<td style="color:{series.color};padding:0"><b>{point.y:.0f} </b></td></tr>',
		        footerFormat: '</table>',
		        shared: true,
		        useHTML: true
			    },
			    plotOptions: {
		        column: {
		          pointPadding: 0.2,
		          borderWidth: 0
		        }
			    },
			    series: data
				}
			);
			return data;
	  }
  });
  
  
  
  //Cantidad de prospectos por vendedor y por fecha
  this.getCantidadProspectos = function(vendedor_id){
	  rc.vendedor_id = vendedor_id;
	  var query = {"profile.vendedor_id" : this.getReactively("vendedor_id"), 
		fecha : { $gte : this.getReactively("fechaInicial"), $lt: this.getReactively("fechaFinal")}};
	  
	  return Prospectos.find(query).count();;
  };
  
  //Cantidad de inscritos por vendedor y por fecha
  this.getCantidadInscritos = function(vendedor_id){
	  return Inscripciones.find({vendedor_id : vendedor_id, 
		fechaInscripcion : { $gte : this.getReactively("fechaInicial"), $lt: this.getReactively("fechaFinal")}}).count();
  }
  
  //Cantidad total de prospectos por vendedor
  this.getCantidadTotalDeProspectosPorVendedor = function(vendedor_id){
	  return Prospectos.find({"profile.vendedor_id" : vendedor_id}).count();
  }
  
  //Cantidad total de inscritos por vendedor
  this.getCantidadTotalDeInscritosPorVendedor = function(vendedor_id){
	  return Inscripciones.find({vendedor_id : vendedor_id}).count();
  }
  
  //Listado de prospectos por vendedor
  this.getProspectos = function(vendedor_id){
	  return Prospectos.find({"profile.vendedor_id" : vendedor_id}).fetch();
  }
  
  //Cantidad de prospectos por etapa de venta (no se usa)
  this.getProspectosPorEtapa = function(etapaVenta_id){
	  return Prospectos.find({"profile.etapaVenta_id" : etapaVenta_id}).count();
  }
  
  //Cantidad de prospectos por etapa de venta y por vendedor
  this.getCantidadProspectosPorEtapaVenta = function(vendedor_id, etapaVenta_id){
	  return Prospectos.find({"profile.vendedor_id" : vendedor_id, "profile.etapaVenta_id" : etapaVenta_id, "profile.fecha" : { $gte : this.getReactively("fechaInicial"), $lt: this.getReactively("fechaFinal")}}).count();
  };
  
  //Buscar prospectos entre fechas
  this.buscarProspectos = function(buscar){
	  //rc.fechaInicial = buscar.fechaInicial;
	  //rc.fechaFinal = buscar.fechaFinal;
  }
  
  //Actualizar el destinatario para enviar mensaje a un vendedor
  this.nuevoMensaje = function(vendedor_id){
	  rc.mensaje.destinatario_id = vendedor_id;
  }
  
  //Enviar el mensaje a un vendedor
  this.enviarMensaje = function(mensaje,form){
	  if(form.$invalid){
      toastr.error('Error al guardar los datos.');
      return;
	  }
	  
	  mensaje.estatus = true;
		mensaje.campus_id = Meteor.user().profile.campus_id;
		mensaje.usuarioInserto = Meteor.userId();
		mensaje.fecha = new Date();
		MensajesVendedores.insert(mensaje);
		toastr.success('Enviado correctamente.');
		this.mensaje = {};
		$('.collapse').collapse('hide');
		this.mensajeNuevo = true;
  }
  
  //Validar si tiene foto el vendedor
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
  };
};
