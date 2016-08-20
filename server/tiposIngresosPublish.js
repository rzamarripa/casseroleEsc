Meteor.publish("tiposingresos", function(params){
	return TiposIngresos.find(params);
});