angular
  .module('casserole')
  .controller('ArchivosCtrl', ArchivosCtrl);
 
function ArchivosCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams, Upload) {
	$reactive(this).attach($scope);
  // upload later on form submit or something similar
  
  this.file = {};
  this.submit = function() {
    console.log(this.file);
    Upload.upload({
        url: '/public/archivosAlumnos',
        data: {file: this.file, 'username': Meteor.userId()}
    }).then(function (resp) {
        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
    }, function (resp) {
        console.log('Error status: ' + resp.status);
    }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.filed.name);
    });
  }
};
