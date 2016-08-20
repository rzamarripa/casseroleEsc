angular
  .module('casserole')
  .controller('PeriodosCtrl', PeriodosCtrl);
 
function PeriodosCtrl($scope, $meteor, $reactive, $state, toastr) {
	let rc = $reactive(this).attach($scope);
	
  	this.action = true;
  	this.nuevo = true;	  
  
  	this.periodo = {};	
  	this.periodo.planPago = [];
  	this.periodo.recargos = [];
  	this.periodo.descuentos = [];
  	this.tipoFormulario ="";

  	var quitarhk=function(obj){
		if(Array.isArray(obj)){
			for (var i = 0; i < obj.length; i++) {
				obj[i] =quitarhk(obj[i]);
			}
		}
		else if(obj !== null && typeof obj === 'object')
		{
			delete obj.$$hashKey;
			for (var name in obj) {
	  			obj[name] = quitarhk(obj[name]);
			}

		}
		return obj;
	}

	this.subscribe('periodos',()=>{
		return [{seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});

	this.subscribe('subCiclos',()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});
	this.subscribe('ciclos',()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	});
	this.subscribe('conceptosPago',()=>{
		return [{estatus:true, seccion_id : Meteor.user() != undefined ? Meteor.user().profile.seccion_id : "" }]
	 });

  	this.helpers({
	  	subCiclos : () => {
		  	return SubCiclos.find({ciclo_id:this.getReactively('periodo.ciclo_id')});
	 	},
	  	periodos : () => {
		  	return Periodos.find();
	  	},
	  	ciclos : () =>{
	  		return Ciclos.find();
	  	},
	  	conceptos :()=>{
	  		console.log(ConceptosPago.find({modulo:this.getReactively('periodo.modulo')}).fetch());
	  		return ConceptosPago.find({modulo:this.getReactively('periodo.modulo')})
	  	}
  	});  	  


  	this.autorun(() => {
	  	var sub=undefined;
	  	//console.log("hola",this.getReactively("periodo.subCiclo_id"));
	  	if(this.getReactively("periodo.subCiclo_id"))
			sub = SubCiclos.findOne(this.getReactively("periodo.subCiclo_id"));
	  	if(!sub)
	  		this.tipoFormulario = "no se";	  
		else if(sub.tipo === "Administrativo")
			this.tipoFormulario = "administrativo";
		else if(sub.tipo === "Academico")
			this.tipoFormulario = "academico";
		
  	});

  
		this.nuevoPeriodo = function()
  	{
	    	this.action = true;
	    	this.nuevo = !this.nuevo;
	    	this.periodo = {};		

  	};
	
  	this.guardar = function(periodo,form)
		{
				if(form.$invalid){
			        toastr.error('Error al guardar los datos.');
			        return;
			  }
	
			
				var sub = SubCiclos.findOne(this.periodo.subCiclo_id);
				if(sub && sub.tipo === "Administrativo")
					this.generar(periodo);
		
				periodo.estatus = true;
				periodo.campus_id = Meteor.user().profile.campus_id;
				periodo.seccion_id = Meteor.user().profile.seccion_id;
				periodo.conceptos = [];
				var conceptos = ConceptosPago.find().fetch();
				console.log(periodo);
				for (var i = 0; i < conceptos.length; i++) {
						if(periodo.modulo==conceptos[i].modulo){
								var procc=[];
								if(periodo.procedimiento &&  periodo.procedimiento[conceptos[i].nombre] )
										procc= periodo.procedimiento[conceptos[i].nombre];
								periodo.conceptos.push( { nombre : conceptos[i].nombre, 
								importe : conceptos[i].importe,
								procedimientos : procc,
								estatus : 1 })
						}
				}
				var _perdiodo = quitarhk(periodo);
			
				periodo.usuarioInserto = Meteor.userId();
				Periodos.insert(_perdiodo);
		
				toastr.success('Guardado correctamente.');
				this.periodo = {};
				$('.collapse').collapse('hide');
				this.nuevo = true;
				form.$setPristine();
		    form.$setUntouched();
	};
	
	this.editar = function(id)
	{
    	this.periodo = Periodos.findOne({_id:id});
    	console.log(this.tipoFormulario);
    	this.action = false;
    	$('.collapse').collapse('show');
    	this.nuevo = false;
	};
	
	this.actualizar = function(periodo,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			
			var idTemp = periodo._id;
			delete periodo._id;
			var sub = SubCiclos.findOne(this.periodo.subCiclo_id);
			if(sub && sub.tipo === "Administrativo")
					this.generar(periodo);
			var conceptos = ConceptosPago.find().fetch();
			periodo.conceptos=[];
			for (var i = 0; i < conceptos.length; i++) {
					if(conceptos[i].modulo==periodo.modulo){
							var procc=[];
							if(periodo.procedimiento &&  periodo.procedimiento[conceptos[i].nombre] )
									procc= periodo.procedimiento[conceptos[i].nombre];		
									periodo.conceptos.push( { nombre : conceptos[i].nombre, 
									importe : conceptos[i].importe,
									procedimientos : procc,
									estatus : 1 });
					}
			}
			var _perdiodo = quitarhk(periodo);
			console.log(_perdiodo);
			periodo.usuarioActualizo = Meteor.userId();
			Periodos.update({_id:idTemp},{$set:_perdiodo});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	};

	this.getSubCiclo= function(subCiclo_id)
	{
			var subCiclo = SubCiclos.findOne(subCiclo_id);
			if(subCiclo)
				return subCiclo.nombre;
	};
	
	this.getCiclo= function(ciclo_id)
	{
			var ciclo = Ciclos.findOne(ciclo_id);
			if(ciclo)
				return ciclo.nombre;
	};
		
	this.cambiarEstatus = function(id)
	{
			var periodo = Periodos.findOne({_id:id});
			if(periodo.estatus == true)
				periodo.estatus = false;
			else
				periodo.estatus = true;
			
			Periodos.update({_id:id}, {$set : {estatus : periodo.estatus}});
		//Periodos.remove(id);
	};
	
	/*this.planPagos = function(subCiclo){
		var sub = SubCiclos.findOne(subCiclo.subCiclo_id);
		if(sub.tipo === "Administrativo"){
			rc.tipoFormulario = "administrativo";
		}else if(sub.tipo === "Academico"){
			rc.tipoFormulario = "academico";
		}
	}*/
	this.nuevoProcedimiento = function(nombreProcedimiento){
		if(!this.periodo)
			this.periodo={};
		if(!this.periodo.procedimiento)
			this.periodo.procedimiento={};
		if(!this.periodo.procedimiento[nombreProcedimiento])
			this.periodo.procedimiento[nombreProcedimiento]=[];
		this.periodo.procedimiento[nombreProcedimiento].push({});
	}

	this.nuevoRecargo = function(){
		if(!this.periodo)
			this.periodo={};
		if(!this.periodo.recargos)
			this.periodo.recargos=[];
		this.periodo.recargos.push({});
	}
	this.nuevoDescuento = function(){
		if(!this.periodo)
			this.periodo={};
		if(!this.periodo.descuentos)
			this.periodo.descuentos=[];
		this.periodo.descuentos.push({});
	}


	this.eliminarProcedimiento = function(procedimiento,concepto){
		if(!this.periodo)
			this.periodo={};
		if(!this.periodo.procedimiento)
			this.periodo.procedimiento={};
		if(!this.periodo.procedimiento[concepto])
			this.periodo.procedimiento[concepto]=[];
		//console.log();
		var itemToDelete = this.periodo.procedimiento[concepto].indexOf(procedimiento);
		if(itemToDelete>=0)
			this.periodo.procedimiento[concepto].splice(itemToDelete,1);
	}


	this.generar = function(periodo){
		var periodo = this.periodo;
		console.log(periodo);
		
		var diaInicio = periodo.fechaInicio.getDate();
		var mesInicio = periodo.fechaInicio.getMonth();
		mesInicio++;
		var anioInicio = periodo.fechaInicio.getFullYear();
		var fechaInicio = anioInicio + " " + mesInicio + " " + diaInicio;
		var fechaInicial = moment(fechaInicio,"YYYY MM DD");
		
		var diaFinal = periodo.fechaFin.getDate();
		var mesFinal = periodo.fechaFin.getMonth();
		mesFinal++;
		var anioFinal = periodo.fechaFin.getFullYear();
		var fechaFin = anioFinal + " " + mesFinal + " " + diaFinal;
		var fechaFinal = moment(fechaFin, "YYYY MM DD");
		
	  	var plazo = "";
	  	if(periodo.plazo == "Semanal"){
		  	plazo = 'week';
		  	aumento = 'weeks';
	  	}else {
		  	plazo = 'month';
		  	aumento = 'months';
	  	}
	  
	  	var cant = fechaFinal.diff(fechaInicial, plazo);
	  	console.log(cant);
	  	
	  	switch (periodo.plazo){
		  	case "Bimestral":
		  		cant = ((cant%2)? cant+1:cant)/2;
		  		break;
		  	case "Trimestral":
		  		cant = ((cant%3)? cant+1:cant)/3;
		  		break;
		  	case "Tetramestral":
		  		cant = ((cant%4)? cant+1:cant)/4;
		  		break;
		  	case "Semestral":
		  		cant = ((cant%6)? cant+1:cant)/6;
		  		break;
		  	case "Anual":
		  		cant = ((cant%12)? cant+1:cant)/12;
		  		break;
		}

	  	console.log(cant);
	  	plazos = [];
	  	rc.periodo.planPago = [];
	  	for(var j=1; j<= cant; j++){
		  	var elAnio = fechaInicial.year();
		  	var numero = "";		  
		  	numero = moment(fechaInicial).isoWeek();
		  	
		  	var objeto = {no: j, numero : numero, pagada : 0, anio : elAnio , fecha: fechaInicial.format()};
		  	rc.periodo.planPago.push(angular.copy(objeto));
		  	switch (periodo.plazo){
		  		case "Semanal":
		  		case "Mensual":
		  			fechaInicial.add(1, aumento);
		  			break;
		  		case "Bimestral":
		  			fechaInicial.add(2, aumento);
		  			break;
		  		case "Trimestral":
		  			fechaInicial.add(3, aumento);
		  			break;
		  		case "Tetramestral":
		  			fechaInicial.add(4, aumento);
		  			break;
		  		case "Semestral":
		  			fechaInicial.add(6, aumento);
		  			break;
		  		case "Anual":
		  			fechaInicial.add(12, aumento);
		  			break;
		  	}	  
		  		  	
	  	}
	  	console.log(rc.periodo.planPago);
	}
	
};