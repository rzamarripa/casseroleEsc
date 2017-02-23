
angular.module('casserole',
  [
    'angular-meteor',
    'ngMaterial',    
    'ngAnimate',
    'ngCookies',
    'ngSanitize',    
    'toastr',
    'ui.router',
    'ui.grid',
    'smartadmin',
    'datePicker',
    'ui.calendar',
    'ui.bootstrap',
    'checklist-model',
    'ncy-angular-breadcrumb',
    'angularUtils.directives.dirPagination',
    'angular-meteor.auth',
    'ngFileUpload'
  ]
)
/*

if (Meteor.isCordova) {
  angular.element(document).on('deviceready', onReady);
}
else {
  angular.element(document).ready(onReady);
}
 
function onReady() {
  angular.bootstrap(document, ['casserole']);
}
*/

$( "html" ).attr({
    lang: "es"
});

NProgress.configure({ easing: 'ease', speed: 500 });
