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
    
    .state('anon.pagosImprimir', {
      url: '/pagosImprimir/:id',
      templateUrl: 'client/pagos/pagosImprimir.ng.html',
      controller: 'PagosImprimirCtrl as pi',
      params: { 'semanas': ':semanas' },
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
      ncyBreadcrumb: {
		    label: "Hola"
		  },
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    },
    })
    .state('root.alumnos', {
      url: '/alumnos',
      templateUrl: 'client/alumnos/alumnos.ng.html',
      controller: 'AlumnosCtrl as al',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.nuevoAlumno', {
      url: '/nuevoAlumno',
      templateUrl: 'client/alumnos/form.ng.html',
      controller: 'AlumnosCtrl as al',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.editarAlumno', {
      url: '/editarAlumno/:id',
      templateUrl: 'client/alumnos/form.ng.html',
      controller: 'AlumnosDetalleCtrl as al',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.alumnoDetalle', {
      url: '/alumnos/:id',
      templateUrl: 'client/alumnos/detalle.ng.html',
      controller: 'AlumnosDetalleCtrl as al',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.ciclos', {
      url: '/ciclos',
      templateUrl: 'client/ciclos/ciclos.ng.html',
      controller: 'CiclosCtrl as cl',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
     .state('root.subCiclos', {
      url: '/subCiclos',
      templateUrl: 'client/subCiclos/subCiclos.ng.html',
      controller: 'SubCiclosCtrl as sub',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
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
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.materias', {
      url: '/materias',
      templateUrl: 'client/materias/materias.ng.html',
      controller: 'MateriasCtrl as mat',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.ocupaciones', {
      url: '/ocupaciones',
      templateUrl: 'client/ocupaciones/ocupaciones.ng.html',
      controller: 'OcupacionesCtrl as oc',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.tiposIngresos', {
      url: '/tiposIngresos',
      templateUrl: 'client/tiposingresos/tiposIngresos.ng.html',
      controller: 'TiposIngresosCtrl as tiping',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.empresas', {
      url: '/empresas',
      templateUrl: 'client/empresas/empresas.ng.html',
      controller: 'EmpresasCtrl as emp',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.estadoCivil', {
      url: '/estadoCivil',
      templateUrl: 'client/estadoCivil/estadoCivil.ng.html',
      controller: 'CivilesCtrl as civ',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.titulos', {
      url: '/titulos',
      templateUrl: 'client/titulos/titulos.ng.html',
      controller: 'TitulosCtrl as tit',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.secciones', {
      url: '/secciones/:campus_id',
      templateUrl: 'client/secciones/secciones.ng.html',
      controller: 'SeccionesCtrl as sec',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.nacionalidad', {
      url: '/nacionalidad',
      templateUrl: 'client/nacionalidad/nacionalidad.ng.html',
      controller: 'NacionalidadesCtrl as nac',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.planEstudio', {
      url: '/planEstudios',
      templateUrl: 'client/planEstudios/planEstudios.index.ng.html',
      controller: 'PlanEstudiosIndexCtrl as pl',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.nuevoPlanEstudio', {
      url: '/nuevoPlanEstudios',
      templateUrl: 'client/planEstudios/planEstudios.form.ng.html',
      controller: 'PlanEstudiosIndexCtrl as pl',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.editarPlanEstudio', {
      url: '/editarPlanEstudios/:id',
      templateUrl: 'client/planEstudios/planEstudios.form.ng.html',
      controller: 'PlanEstudiosIndexCtrl as pl',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.planEstudioDetalle', {
      url: '/planEstudios/:id',
      templateUrl: 'client/planEstudios/planEstudios.detalle.ng.html',
      controller: 'PlanEstudiosDetalleCtrl as pl',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.turnos', {
      url: '/turnos',
      templateUrl: 'client/turnos/turnos.ng.html',
      controller: 'TurnosCtrl as tn',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.grupos', {
      url: '/grupos',
      templateUrl: 'client/grupos/grupos.ng.html',
      controller: 'GruposCtrl as gp',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.grupoDetalle', {
      url: '/gruposDetalle/:id',
      templateUrl: 'client/grupos/gruposDetalle.ng.html',
      controller: 'GruposDetalleCtrl as gp',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.inscripciones', {
      url: '/inscripciones/:id',
      templateUrl: 'client/inscripciones/inscripciones.ng.html',
      controller: 'InscripcionesCtrl as ins',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.pagos', {
      url: '/pagos',
      templateUrl: 'client/pagos/buscarAlumno.ng.html',
      controller: 'PagosCtrl as pa',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
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
    .state('root.detallePagos', {
      url: '/pagos/:id',
      templateUrl: 'client/pagos/detallePagos.ng.html',
      controller: 'DetallePagosCtrl as pa',
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
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
		.state('root.grupo', {
      url: '/grupo/:id',
      templateUrl: 'client/grupos/form.ng.html',
      controller: 'NuevoGrupoCtrl as gp',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.editarGrupo', {
      url: '/grupo',
      templateUrl: 'client/grupos/form.ng.html',
      controller: 'NuevoGrupoCtrl as gp',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.generaciones', {
      url: '/generaciones',
      templateUrl: 'client/generaciones/generaciones.ng.html',
      controller: 'GeneracionesCtrl as gen',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
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
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })    
    .state('root.campusDetalle', {
      url: '/campusDetalle/:id',
      templateUrl: 'client/campus/campusDetalle.ng.html',
      controller: 'CampusDetalleCtrl as cd',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.avisos', {
      url: '/avisos',
      templateUrl: 'client/avisos/avisos.ng.html',
      controller: 'AvisosCtrl as av',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })    
    .state('root.aulas', {
      url: '/aulas',
      templateUrl: 'client/aulas/aulas.ng.html',
      controller: 'AulasCtrl as au',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.maestros', {
      url: '/maestros',
      templateUrl: 'client/maestros/maestros.ng.html',
      controller: 'MaestrosCtrl as maes',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.tareas', {
      url: '/tareas/:id/:maestros_id',
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
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.escuela', {
      url: '/escuela',
      templateUrl: 'client/escuela/escuela.ng.html',
      controller: 'EscuelaCtrl as escu',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.trabajadores', {
      url: '/trabajadores',
      templateUrl: 'client/empleados/trabajadores.ng.html',
      controller: 'TrabajadoresCtrl as emp',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
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
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })     
    .state('root.conceptosPago', {
      url: '/conceptosPago',
      templateUrl: 'client/conceptosPago/conceptosPago.ng.html',
      controller: 'ConceptosPagoCtrl as cp',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.conceptosComision', {
      url: '/conceptosComision',
      templateUrl: 'client/conceptosComision/conceptosComision.ng.html',
      controller: 'ConceptosComisionCtrl as ccm',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
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
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })       
    .state('root.vendedores', {
      url: '/vendedores',
      templateUrl: 'client/vendedores/vendedores.html',
      controller: 'VendedoresCtrl as v',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.coordinadores', {
      url: '/coordinadores',
      templateUrl: 'client/coordinadores/coordinadores.html',
      controller: 'CoordinadoresCtrl as c',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.prospectos', {
      url: '/prospectos/:vendedor_id/:etapaVenta_id',
      templateUrl: 'client/prospectos/prospectos.html',
      controller: 'ProspectosCtrl as fa',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.nuevoProspecto', {
      url: '/nuevoProspecto',
      templateUrl: 'client/prospectos/nuevoProspecto.html',
      controller: 'ProspectosCtrl as fa',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })        
    .state('root.prospecto', {
      url: '/prospecto/:id',
      templateUrl: 'client/prospectos/prospecto.html',
      controller: 'ProspectoCtrl as fa',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.actividades', {
      url: '/actividades',
      templateUrl: 'client/actividades/actividades.html',
      controller: 'ActividadesCtrl as ac',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
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
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.financiero', {
      url: '/financiero',
      templateUrl: 'client/gastos/financiero.ng.html',
      controller: 'FinancieroCtrl as fc',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.bitacora', {
      url: '/bitacora',
      templateUrl: 'client/bitacora/bitacora.ng.html',
      controller: 'BitacoraCtrl as bita',
      resolve: {
        "currentUser": ["$meteor", function($meteor){
          return $meteor.requireUser();
        }]
      }
    })
    .state('root.gastos', {
      url: '/gastos',
      templateUrl: 'client/gastos/gastos.ng.html',
      controller: 'GastosCtrl as gc',
      resolve: {
	      "currentUser": ["$meteor", function($meteor){
	        return $meteor.requireUser();
	      }]
	    }
    })
    .state('root.reporteCobranza', {
      url: '/reporte/cobranza',
      templateUrl: 'client/reportes/cobranza.ng.html',
      controller: 'CobranzaCtrl as cc',
      resolve: {
        "currentUser": ["$meteor", function($meteor){
          return $meteor.requireUser();
        }]
      }
    })
    .state('root.conceptosGasto', {
      url: '/conceptosGasto',
      templateUrl: 'client/conceptosGasto/conceptosGasto.ng.html',
      controller: 'ConceptosGastoCtrl as cgc',
      resolve: {
        "currentUser": ["$meteor", function($meteor){
          return $meteor.requireUser();
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
        "currentUser": ["$meteor", function($meteor){
          return $meteor.requireUser();
        }]
      }
    })
    .state('root.asistenciaGrupo', {
      url: '/asistenciaGrupo/:id/:materia_id',
      templateUrl: 'client/maestro/asistencias/asistencias.ng.html',
      controller: 'MaestroAsistenciasCtrl as masas',
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
    .state('root.verAsistencias', {
      url: '/verAsistencias/:id/:materia_id',
      templateUrl: 'client/maestro/asistencias/verAsistencias.ng.html',
      controller: 'MaestroVerAsistenciasCtrl as mast',
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
    .state('root.maestroGrupos', {
      url: '/gruposMaestro/:_id',
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
    .state('root.alumnoCalificaciones', {
      url: '/alumnoCalificaciones',
      templateUrl: 'client/alumno/calificaciones/calificaciones.ng.html',
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
						if(user.roles[0] == "gerenteVenta"){
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
						if(user.roles[0] == "coordinadorAcademico"){
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
    
    ; 
    
    
}]);     



//TODO ver mensaje de vendedores