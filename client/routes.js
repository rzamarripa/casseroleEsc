angular.module("casserole").run(function ($rootScope, $state, toastr) {
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    switch(error) {
      case "AUTH_REQUIRED":
        $state.go('anon.login');
        break;
      case "FORBIDDEN":
        //$state.go('root.home');
        break;
      case "UNAUTHORIZED":
      	toastr.error("Acceso Denegado");
				toastr.error("No tiene permiso para ver esta opción");
        break;
      default:
        $state.go('internal-client-error');
    }
  });
  $rootScope.$on('$stateChangeStart', function(next, current) { 
    NProgress.set(0.2);
  });
  $rootScope.$on('$stateChangeSuccess', function(next, current) { 
    NProgress.set(1.0);
  });
});

angular.module('casserole').config(['$injector', function ($injector) {
  var $stateProvider = $injector.get('$stateProvider');
  var $urlRouterProvider = $injector.get('$urlRouterProvider');
  var $locationProvider = $injector.get('$locationProvider');

  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
  /***************************
   * Anonymous Routes
   ***************************/
  $stateProvider
    .state('anon', {
      url: '',
      abstract: true,
      template: '<ui-view/>'
    })
    
    .state('anon.login', {
      url: '/login',
      templateUrl: 'client/login/login.ng.html',
      controller: 'LoginCtrl',
      controllerAs: 'lc'
    })
    .state('anon.logout', {
      url: '/logout',
      resolve: {
        'logout': ['$meteor', '$state', 'toastr', function ($meteor, $state, toastr) {
          return $meteor.logout().then(
            function () {
	            toastr.success("Vuelva pronto.");
              $state.go('anon.login');
            },
            function (error) {
              toastr.error(error.reason);
            }
          );
        }]
      }
    })
    .state('anon.pagosImprimir', {
      url: '/pagosImprimir/:pago/:alumno_id',
      templateUrl: 'client/pagos/pagosImprimir.ng.html',
      controller: 'PagosImprimirCtrl as pi',
     // params: { 'semanas': ':semanas' , 'id' : ':id'},
    });
  /***************************
   * Login Users Routes
   ***************************/
  $stateProvider
    .state('root', {
      url: '',
      abstract: true,
      templateUrl: 'client/layouts/root.ng.html',
      controller: 'RootCtrl as ro',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.home', {
      url: '/',
      templateUrl: 'client/home/home.ng.html',      
      controller: 'HomeCtrl as ho',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin" || user.roles[0] == "coordinadorAcademico" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director" || user.roles[0] == "gerenteVenta" || user.roles[0] == "vendedor" || user.roles[0] == "maestro" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.dashboard', {
      url: '/dashboard',
      templateUrl: 'client/dashboard/dashboard.html',      
      controller: 'DashboardCtrl as da',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director" || user.roles[0] == "coordinadorFinanciero"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.actualizarCalificaciones', {
      url: '/actualizarCalificaciones/:alumno_id/:inscripcion_id',
      templateUrl: 'client/alumnos/actualizarCalificaciones.html',      
      controller: 'ActualizarCalificacionesCtrl as ac',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.deudores', {
      url: '/deudores',
      templateUrl: 'client/planPagos/deudores/deudores.html',      
      controller: 'DeudoresCtrl as de',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.deudoresGrupo', {
      url: '/deudoresGrupo',
      templateUrl: 'client/planPagos/deudoresGrupo/deudoresGrupo.html',      
      controller: 'DeudoresGrupoCtrl as co',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "director" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.cobranza', {
      url: '/cobranza',
      templateUrl: 'client/planPagos/cobranza/cobranza.html',      
      controller: 'CobranzaCtrl as oc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin" || user.roles[0] == "coordinadorAcademico" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.alumnos', {
      url: '/alumnos',
      templateUrl: 'client/alumnos/alumnos.ng.html',
      controller: 'AlumnosCtrl as al',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.nuevoAlumno', {
      url: '/nuevoAlumno',
      templateUrl: 'client/alumnos/form.ng.html',
      controller: 'AlumnosCtrl as al',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.editarAlumno', {
      url: '/editarAlumno/:alumno_id',
      templateUrl: 'client/alumnos/form.ng.html',
      controller: 'AlumnosDetalleCtrl as al',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director" || user.roles[0] == "recepcionista" || user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.alumnoDetalle', {
      url: '/alumnos/:alumno_id',
      templateUrl: 'client/alumnos/detalle.ng.html',
      controller: 'AlumnosDetalleCtrl as al',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "recepcionista" || user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.convenios', {
      url: '/convenios/:alumno_id',
      templateUrl: 'client/planPagos/convenios/convenios.html',
      controller: 'ConveniosCtrl as co',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "director" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.ciclos', {
      url: '/ciclos',
      templateUrl: 'client/ciclos/ciclos.ng.html',
      controller: 'CiclosCtrl as cl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })    
    .state('root.mensajes', {
      url: '/mensajes',
      templateUrl: 'client/mensajes/mensajes.html',
      controller: 'MensajesCtrl as mm',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "maestro" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.subCiclos', {
      url: '/subCiclos',
      templateUrl: 'client/subCiclos/subCiclos.ng.html',
      controller: 'SubCiclosCtrl as sub',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
     .state('root.periodos', {
      url: '/periodos',
      templateUrl: 'client/periodos/periodos.ng.html',
      controller: 'PeriodosCtrl as per',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.deptosAcademicos', {
      url: '/deptosAcademicos',
      templateUrl: 'client/deptosAcademicos/deptosAcademicos.ng.html',
      controller: 'DeptosAcademicosCtrl as da',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.materias', {
      url: '/materias',
      templateUrl: 'client/materias/materias.ng.html',
      controller: 'MateriasCtrl as mat',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.ocupaciones', {
      url: '/ocupaciones',
      templateUrl: 'client/ocupaciones/ocupaciones.ng.html',
      controller: 'OcupacionesCtrl as oc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico"  || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.tiposIngresos', {
      url: '/tiposIngresos',
      templateUrl: 'client/tiposingresos/tiposIngresos.ng.html',
      controller: 'TiposIngresosCtrl as tiping',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.empresas', {
      url: '/empresas',
      templateUrl: 'client/empresas/empresas.ng.html',
      controller: 'EmpresasCtrl as emp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.estadoCivil', {
      url: '/estadoCivil',
      templateUrl: 'client/estadoCivil/estadoCivil.ng.html',
      controller: 'CivilesCtrl as civ',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.titulos', {
      url: '/titulos',
      templateUrl: 'client/titulos/titulos.ng.html',
      controller: 'TitulosCtrl as tit',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.secciones', {
      url: '/secciones/:campus_id',
      templateUrl: 'client/secciones/secciones.ng.html',
      controller: 'SeccionesCtrl as sec',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.nacionalidad', {
      url: '/nacionalidad',
      templateUrl: 'client/nacionalidad/nacionalidad.ng.html',
      controller: 'NacionalidadesCtrl as nac',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.planEstudio', {
      url: '/planEstudios',
      templateUrl: 'client/planEstudios/planEstudios.html',
      controller: 'PlanEstudiosIndexCtrl as pl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.nuevoPlanEstudio', {
      url: '/nuevoPlanEstudios',
      templateUrl: 'client/planEstudios/form.html',
      controller: 'PlanEstudiosIndexCtrl as pl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.editarPlanEstudio', {
      url: '/editarPlanEstudios/:id',
      templateUrl: 'client/planEstudios/form.html',
      controller: 'PlanEstudiosIndexCtrl as pl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.planEstudioDetalle', {
      url: '/planEstudios/:id',
      templateUrl: 'client/planEstudios/detalle.html',
      controller: 'PlanEstudiosDetalleCtrl as pl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.turnos', {
      url: '/turnos',
      templateUrl: 'client/turnos/turnos.ng.html',
      controller: 'TurnosCtrl as tn',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.grupos', {
      url: '/grupos',
      templateUrl: 'client/grupos/grupos.ng.html',
      controller: 'GruposCtrl as gp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.grupoDetalle', {
      url: '/gruposDetalle/:grupo_id',
      templateUrl: 'client/grupos/gruposDetalle.ng.html',
      controller: 'GruposDetalleCtrl as gp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.inscripciones', {
      url: '/inscripciones/:id',
      templateUrl: 'client/inscripciones/inscripciones.ng.html',
      controller: 'InscripcionesCtrl as ins',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.archivos', {
      url: '/archivos/:id',
      templateUrl: 'client/archivos/archivos.ng.html',
      controller: 'ArchivosCtrl as ar',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.inscripcionNueva', {
      url: '/nuevaInscripcion',
      templateUrl: 'client/inscripciones/form.ng.html',
      controller: 'NuevaInscripcionCtrl as ins',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.agregarInscripcion', {
      url: '/agregarInscripcion/:alumno_id',
      templateUrl: 'client/inscripciones/formAgregarInscripcion.ng.html',
      controller: 'AgregarInscripcionCtrl as ins',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
		.state('root.grupo', {
      url: '/grupo/:id',
      templateUrl: 'client/grupos/form.ng.html',
      controller: 'NuevoGrupoCtrl as gp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.editarGrupo', {
      url: '/grupo',
      templateUrl: 'client/grupos/form.ng.html',
      controller: 'NuevoGrupoCtrl as gp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.generaciones', {
      url: '/generaciones',
      templateUrl: 'client/generaciones/generaciones.ng.html',
      controller: 'GeneracionesCtrl as gen',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.instituciones', {
      url: '/instituciones',
      templateUrl: 'client/instituciones/instituciones.ng.html',
      controller: 'InstitucionesCt rl',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.campus', {
      url: '/campus',
      templateUrl: 'client/campus/campus.ng.html',
      controller: 'CampusCtrl as cp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })    
    .state('root.campusDetalle', {
      url: '/campusDetalle/:id',
      templateUrl: 'client/campus/campusDetalle.ng.html',
      controller: 'CampusDetalleCtrl as cd',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.avisos', {
      url: '/avisos',
      templateUrl: 'client/avisos/avisos.ng.html',
      controller: 'AvisosCtrl as av',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })    
    .state('root.aulas', {
      url: '/aulas',
      templateUrl: 'client/aulas/aulas.ng.html',
      controller: 'AulasCtrl as au',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.maestros', {
      url: '/maestros',
      templateUrl: 'client/maestros/maestros.ng.html',
      controller: 'MaestrosCtrl as maes',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.tareas', {
      url: '/tareas/:id/:maestros_id/:materia_id/:grupo_id',
      templateUrl: 'client/maestro/tareas/tareas.ng.html',
      controller: 'TareasCtrl as tarea',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.documentos', {
      url: '/documentos',
      templateUrl: 'client/documentos/documentos.ng.html',
      controller: 'DocumentosCtrl as doc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.escuela', {
      url: '/escuela',
      templateUrl: 'client/escuela/escuela.ng.html',
      controller: 'EscuelaCtrl as escu',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.recepcionistas', {
      url: '/recepcionistas',
      templateUrl: 'client/recepcionistas/recepcionistas.html',
      controller: 'RecepcionistasCtrl as re',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.nuevoHorario', {
      url: '/nuevoHorario/:id',
      templateUrl: 'client/horarios/form.ng.html',
      controller: 'HorarioDetalleCtrl as ho',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })     
    .state('root.rvoe', {
      url: '/rvoe',
      templateUrl: 'client/rvoe/rvoe.ng.html',
      controller: 'RvoeCtrl as rv',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })     
    .state('root.conceptosPago', {
      url: '/conceptosPago',
      templateUrl: 'client/conceptosPago/conceptosPago.ng.html',
      controller: 'ConceptosPagoCtrl as cp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.conceptos', {
      url: '/conceptos',
      templateUrl: 'client/conceptos/conceptos.ng.html',
      controller: 'ConceptosCtrl as con',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.conceptosComision', {
      url: '/conceptosComision',
      templateUrl: 'client/conceptosComision/conceptosComision.ng.html',
      controller: 'ConceptosComisionCtrl as ccm',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })    
    .state('root.editarHorario', {
      url: '/editarHorario/:id',
      templateUrl: 'client/horarios/form.ng.html',
      controller: 'HorarioDetalleCtrl as ho',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.listarHorarios', {
      url: '/horarios',
      templateUrl: 'client/horarios/horarios.ng.html',
      controller: 'HorariosCtrl as ho',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.gerentesVenta', {
      url: '/gerentesVenta',
      templateUrl: 'client/gerentesVenta/gerentesVenta.html',
      controller: 'GerentesVentaCtrl as gv',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })       
    .state('root.vendedores', {
      url: '/vendedores',
      templateUrl: 'client/vendedores/vendedores.html',
      controller: 'VendedoresCtrl as v',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.coordinadores', {
      url: '/coordinadores',
      templateUrl: 'client/coordinadores/coordinadores.html',
      controller: 'CoordinadoresCtrl as c',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.prospectos', {
      url: '/prospectos/:vendedor_id/:etapaVenta_id',
      templateUrl: 'client/prospectos/prospectos.html',
      controller: 'ProspectosCtrl as fa',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "vendedor" || user.roles[0] == "gerenteVenta"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.nuevoProspecto', {
      url: '/nuevoProspecto',
      templateUrl: 'client/prospectos/nuevoProspecto.html',
      controller: 'ProspectosCtrl as fa',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "vendedor"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })        
    .state('root.prospecto', {
      url: '/prospecto/:id',
      templateUrl: 'client/prospectos/prospecto.html',
      controller: 'ProspectoCtrl as fa',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "vendedor"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.actividades', {
      url: '/actividades',
      templateUrl: 'client/actividades/actividades.html',
      controller: 'ActividadesCtrl as ac',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "vendedor"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('anon.pizarron', {
      url: '/pizarron/:grupoId',
      templateUrl: 'client/pizarron/pizarron.ng.html',
      controller: 'PizarronCtrl',
      controllerAs: 'pzc',
      
    })
    .state('root.etapasVenta', {
      url: '/etapasVenta',
      templateUrl: 'client/etapasVenta/etapasVenta.html',
      controller: 'EtapasVentaCtrl as ev',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "director" || user.roles[0] == "gerenteVenta"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.financiero', {
      url: '/financiero',
      templateUrl: 'client/gastos/financiero.ng.html',
      controller: 'FinancieroCtrl as fc',
     resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "director" || user.roles[0] == "gerenteVenta" || user.roles[0] == 'recepcionista'){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.bitacora', {
      url: '/bitacora',
      templateUrl: 'client/bitacora/bitacora.ng.html',
      controller: 'BitacoraCtrl as bita',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.gastos', {
      url: '/gastos',
      templateUrl: 'client/gastos/gastos.ng.html',
      controller: 'GastosCtrl as gc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.conceptosGasto', {
      url: '/conceptosGasto',
      templateUrl: 'client/conceptosGasto/conceptosGasto.ng.html',
      controller: 'ConceptosGastoCtrl as cgc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })    
    .state('root.agregarGasto', {
      url: '/agregarGasto/:tipoGasto',
      templateUrl: 'client/gastos/agregarGasto.ng.html',
      controller: 'AgregarGastoCtrl as gc',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.cuentas', {
      url: '/cuentas',
      templateUrl: 'client/cuentas/cuentas.ng.html',
      controller: 'CuentasCtrl as cc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.asistenciaGrupo', {
      url: '/asistenciaGrupo/:grupo_id/:materia_id/:maestro_id/:id',
      templateUrl: 'client/maestro/asistencias/asistencias.ng.html',
      controller: 'MaestroAsistenciasCtrl as masas',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(Roles.userIsInRole(Meteor.userId(), ['maestro']) || Roles.userIsInRole(Meteor.userId(), ['coordinadorAcademico'])){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}						
         });
       }]
      }
    })       
    .state('root.verAsistencias', {
      url: '/verAsistencias/:grupo_id/:materia_id/:maestro_id',
      templateUrl: 'client/maestro/asistencias/verAsistencias.ng.html',
      controller: 'MaestroVerAsistenciasCtrl as mast',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "maestro" || user.roles[0] == "coordinadorAcademico" || user.roles[0] == "recepcionista" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.gruposMaestro', {
      url: '/gruposMaestro/:grupo_id',
      templateUrl: 'client/maestro/grupos/grupos.ng.html',
      controller: 'MaestroGruposCtrl as masgrupo',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "maestro"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.alumnoGrupos', {
      url: '/alumnoGrupos/:alumno_id',
      templateUrl: 'client/alumno/grupos/alumnoGrupos.html',
      controller: 'AlumnoGruposCtrl as ag',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "alumno"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.alumnoAsistencias', {
      url: '/alumnoAsistencias/:alumno_id/:grupo_id/:materia_id',
      templateUrl: 'client/alumno/asistencias/alumnoAsistencias.html',
      controller: 'AlumnoAsistenciasCtrl as aa',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "alumno"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.maestroForos', {
      url: '/maestroForos/:grupo_id',
      templateUrl: 'client/maestro/foros/foros.html',
      controller: 'ForosCtrl as f',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "maestro" || user.roles[0] == "alumno" || user.roles[0] == "coordinadorAcademico"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.alumnoForos', {
      url: '/alumnoForos/:grupo_id',
      templateUrl: 'client/alumno/foros/foros.html',
      controller: 'AlumnoForosCtrl as f',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "alumno" || user.roles[0] == "coordinadorAcademico"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.foroDetalle', {
      url: '/foroDetalle/:foro_id/:grupo_id',
      templateUrl: 'client/maestro/foros/detalleForo.html',
      controller: 'DetalleForoCtrl as df',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "maestro" || user.roles[0] == "alumno" || user.roles[0] == "coordinadorAcademico"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })
    .state('root.categoriasForos', {
      url: '/categoriasForos',
      templateUrl: 'client/categoriasForos/categoriasForos.html',
      controller: 'CategoriasForosCtrl as cf',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
      }
    })    
    .state('root.capturarCalificaciones', {
      url: '/capturarCalificaciones/:grupo_id/:materia_id/:maestro_id',
      templateUrl: 'client/maestro/calificaciones/calificar.html',
      controller: 'CalificarCtrl as ca',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "maestro" || user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.verCalificaciones', {
      url: '/verCalificaciones/:grupo_id/:materia_id/:maestro_id',
      templateUrl: 'client/maestro/calificaciones/verCalificaciones.html',
      controller: 'VerCalificacionesCtrl as vercal',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "maestro" || user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.resumenAcademico', {
      url: '/resumenAcademico',
      templateUrl: 'client/resumenAcademico/resumenAcademico.html',
      controller: 'ResumenAcademicoCtrl as ra',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.alumnoCalificaciones', {
      url: '/alumnoCalificaciones',
      templateUrl: 'client/alumno/calificaciones/calificaciones.html',
      controller: 'AlumnoCalificacionesCtrl',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "alumno"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.gerenteVendedores', {
      url: '/gerenteVendedores',
      templateUrl: 'client/gerentesVenta/gerenteVendedores.html',
      controller: 'GerenteVendedoresCtrl as gv',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "gerenteVenta" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.prospectosPorVendedor', {
      url: '/prospectosPorVendedor',
      templateUrl: 'client/gerentesVenta/prospectosPorVendedor.html',
      controller: 'prospectosPorVendedorCtrl as pv',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "gerenteVenta"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.planeacionClase', {
      url: '/planeacionClase/:grupo_id/:materia_id/:maestro_id',
      templateUrl: 'client/planeaciones/planeacionClase.html',
      controller: 'PlaneacionClaseCtrl as pc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "maestro"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.revisarPlaneaciones', {
      url: '/revisarPlaneaciones/:materia_id/:maestro_id/:grupo_id',
      templateUrl: 'client/planeaciones/revisarPlaneacionClase.html',
      controller: 'RevisarPlaneacionClaseCtrl as pc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.panelPlaneaciones', {
      url: '/panelPlaneaciones',
      templateUrl: 'client/planeaciones/panelPlaneacionesClase.html',
      controller: 'PanelPlaneacionesClaseCtrl as pc',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })    
    .state('root.gruposActivos', {
      url: '/gruposActivos',
      templateUrl: 'client/gruposActivos/gruposActivos.html',
      controller: 'GruposActivosCtrl as ga',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}
         });
       }]
    	}
    })
    .state('root.detalleGastos', {
      url: '/detalleGastos/:semana/:anio',
      templateUrl: 'client/gastos/detalleGastos.html',
      controller: 'DetalleGastosCtrl as da',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         	});
       	}]
    	}
    })
    .state('root.pagosSemana', {
      url: '/pagosSemana/:semana/:anio',
      templateUrl: 'client/planPagos/pagosSemana/pagosSemana.html',
      controller: 'PagosSemanaCtrl as de',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico" || user.roles[0] == "director" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "recepcionista"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
					});
				}]
			}
    })
    .state('root.tipoPublicidad', {
      url: '/tipoPublicidad',
      templateUrl: 'client/tipoPublicidad/tipoPublicidad.html',
      controller: 'TipoPublicidadCtrl as tp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    }) 
    .state('root.mediosPublicidad', {
      url: '/mediosPublicidad',
      templateUrl: 'client/mediosPublicidad/mediosPublicidad.ng.html',
      controller: 'MediosPublicidadCtrl as mp',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "admin"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    }) 

    ////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////

    .state('root.nuevoCalendario', {
      url: '/nuevoCalendario/:id',
      templateUrl: 'client/calendarios/form.html',
      controller: 'CalendarioDetalleCtrl as ca',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    }) 
    .state('root.calendarios', {
      url: '/calendarios',
      templateUrl: 'client/calendarios/calendarios.html',
      controller: 'CalendariosCtrl as ca',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.editarCalendario', {
      url: '/editarCalendario/:id',
      templateUrl: 'client/calendarios/form.html',
      controller: 'CalendarioDetalleCtrl as ca',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "coordinadorAcademico"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })    
    .state('root.alumnoMuro', {
      url: '/muro',
      templateUrl: 'client/alumno/muro/muro.html',
      controller: 'AlumnoMuroCtrl as m',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "alumno"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.alumnoPerfil', {
      url: '/alumnoPerfil/:alumno_id',
      templateUrl: 'client/alumno/perfil/perfil.html',
      controller: 'AlumnoPerfilCtrl as a',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.alumnoCalendario', {
      url: '/alumnoCalendario',
      templateUrl: 'client/alumno/calendario/calendario.html',
      controller: 'AlumnoCalendarioCtrl as c',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "alumno"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.alumnoKardex', {
      url: '/alumnoKardex',
      templateUrl: 'client/alumno/kardex/kardex.html',
      controller: 'AlumnoKardexCtrl as k',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "alumno"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.alumnoPagos', {
      url: '/alumnoPagos',
      templateUrl: 'client/alumno/pagos/pagos.html',
      controller: 'AlumnoPagosCtrl as p',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "alumno"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.prospectosPorMedioPublicidad', {
      url: '/prospectosPorMedioPublicidad',
      templateUrl: 'client/gerentesVenta/prospectosPorMedioPublicidad/prospectosPorMedioPublicidad.html',
      controller: 'ProspectosPorMedioPublicidadCtrl as p',
      resolve: {
				"currentUser": ["$meteor", "toastr", function($meteor, toastr){
					return $meteor.requireValidUser(function(user) {
						if(user.roles[0] == "gerenteVenta" || user.roles[0] == "director"){
							return true;
						}else{
							return 'UNAUTHORIZED'; 
						}					 	
         });
       }]
    	}
    })
    .state('root.historialOtrosPagos', {
      url: '/historialOtrosPagos/:alumno_id',
      templateUrl: 'client/planPagos/historial/historialOtrosPagos.html',
      controller: 'HistorialOtrosPagosCtrl as co',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director" || user.roles[0] == "recepcionista"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('root.historialComentarios', {
      url: '/historialComentarios/:alumno_id',
      templateUrl: 'client/alumno/historialComentarios/historialComentarios.html',
      controller: 'HistorialComentariosCtrl as hc',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "director" || user.roles[0] == "recepcionista" || user.roles[0] == "coordinadorAcademico"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('root.cambiarRangoPlanPagos', {
      url: '/cambiarRangoPlanPagos',
      templateUrl: 'client/admin/cambiarRangoPlanPagos/cambiarRangoPlanPagos.html',
      controller: 'CambiarRangoPlanPagosCtrl as cpp',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "director" || user.roles[0] == "admin"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('root.notas', {
      url: '/notas',
      templateUrl: 'client/admin/notas.html',
      //controller: 'CambiarRangoPlanPagosCtrl as cpp',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "director" || user.roles[0] == "admin"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })    
    .state('root.reporteComisiones', {
      url: '/reporteComisiones',
      templateUrl: 'client/reportes/reporteComisiones.html',
      controller: 'ReporteComisionesCtrl as rc',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "director" || user.roles[0] == "admin"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    .state('root.cambiarSeccion', {
      url: '/cambiarSeccion',
      templateUrl: 'client/secciones/cambiarSeccion.html',
      controller: 'CambiarSeccionCtrl as cs',
      resolve: {
        "currentUser": ["$meteor", "toastr", function($meteor, toastr){
          return $meteor.requireValidUser(function(user) {
            if(user.roles[0] == "director" || user.roles[0] == "recepcionista" || user.roles[0] == "coordinadorAcademico" || user.roles[0] == "coordinadorFinanciero" || user.roles[0] == "admin"){
              return true;
            }else{
              return 'UNAUTHORIZED'; 
            }           
         });
       }]
      }
    })
    ;
}]);