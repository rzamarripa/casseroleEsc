Ocupaciones					= new Mongo.Collection("ocupaciones");
Ocupaciones.allow({
	insert: function () { return true; },
	update: function () { return true; },
	remove: function () { return true; }
});