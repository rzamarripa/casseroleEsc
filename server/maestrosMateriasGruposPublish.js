Meteor.publish("maestrosMateriasGrupos", function(params){
	return MaestrosMateriasGrupos.find(params);
});