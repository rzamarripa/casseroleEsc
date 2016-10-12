Meteor.publish("categoriasForos",function(options){
  return CategoriasForos.find(options);
});