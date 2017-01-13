Meteor.publish("planPagos", function(options){
	return PlanPagos.find(options, {sort : {fecha : 1}});
});

Meteor.publish("pagosPorSemana", function(options){
	return PlanPagos.find(options, {sort : {fecha : 1}});
});