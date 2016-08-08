var nibbleOnCode = angular.module('nibbleOnCode', [function(){
	console.log('module');
}]);

nibbleOnCode.controller('nocHeaderCtl', [function() {
	console.log('headerctl');
}]);
nibbleOnCode.controller('nocContentCtl', [function() {
	console.log('contentctl');
}]);

nibbleOnCode.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){
	 console.log('config');
	$urlRouterProvider.otherwise("/home");
	$stateProvider

		.state('home',
			{
				url: '/home',
				templateUrl: 'views/header.html',
				controller: 'nocHeaderCtl'
				
			
			})
		// .state('home.content',
		// 	{
		// 		templateUrl: 'views/homeContent.html',
		// 		controller: 'nocContentCtl'	
		// 	})

}]);
