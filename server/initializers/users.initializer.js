Meteor.startup(function () {
  if (Meteor.users.find().count() === 0) {
    var usuario_id = Accounts.createUser({
      username: 'admin',
      password: '123qwe',
      profile : {
	      nombre: 'Súper Administrador',
	      estatus : true
      }
    });
    
    Roles.addUsersToRoles(usuario_id, 'admin');
  }
});