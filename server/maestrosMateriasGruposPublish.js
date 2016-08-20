Meteor.publish("maestrosMateriasGrupos", function(params){
	console.log("maestrosMateriasGrupos", params);
	return MaestrosMateriasGrupos.find(params);
});