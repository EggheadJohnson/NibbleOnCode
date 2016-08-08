var nibbleOnCode = angular.module('nibbleOnCode', [

	'ngRoute',
	'ui.router',
	'ngResource',
	'nibbleOnCode'
		
	]);

nibbleOnCode.controller('nocCtl', ['$scope', function($scope) {
}]);
nibbleOnCode.controller('nocHomeContentCtl', [function() {
}]);
nibbleOnCode.controller('nocHomeBlargCtl', [function() {
}]);
nibbleOnCode.controller('nocRightPanelCtl', ['$scope', '$stateParams', 'nibbleOnCodeSvc', function($scope, $stateParams, nibbleOnCodeSvc) {

	$scope.blogView = $stateParams.id !== undefined;
	nibbleOnCodeSvc.getTags($stateParams.id).then(function(response){
		$scope.tagsHash = nibbleOnCodeSvc.fetchTags();
		$scope.tagsKeys = Object.keys($scope.tagsHash).sort(function(a, b){
			return $scope.tagsHash[b]-$scope.tagsHash[a];
		});
		
	});
	$scope.addMoreTags = function(){
		$scope.tagsLimit += 5;
	}
}]);
nibbleOnCode.controller('nocMiddleOfPageCtl', ['$scope', '$state', '$stateParams', 'nibbleOnCodeSvc', function($scope, $state, $stateParams, nibbleOnCodeSvc) {
	var blogs,
		filterBlogs;
	$scope.tagsLimit = 5;
	$scope.tagSelected = "";
	nibbleOnCodeSvc.getBlogs().then(function(response){
		blogs = nibbleOnCodeSvc.fetchBlogs();
		$scope.blogsLength = blogs.length;
		$scope.blogs = filterBlogs();
	});
	$scope.changeTagSeclect = function(tag) {
		$scope.tagSelected = tag;
		$scope.blogs = filterBlogs();
	}
	filterBlogs = function() {
		if ($scope.tagSelected === "") return blogs;
		return blogs.filter(function(blog){
			return blog.tags.indexOf($scope.tagSelected) > -1;
		})
	}
}]);

nibbleOnCode.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){

	$urlRouterProvider.otherwise("/home");
	$stateProvider
		

		.state('core', {
			views: {
				'@': {
					templateUrl: 'views/coreUI.html',
					controller: 'nocCtl'
				},
				'middleOfPageStuff@core': {
					templateUrl: 'views/middleOfPageStuff.html',
					controller: 'nocMiddleOfPageCtl'
				},
				'bottomOfPageStuff@core': {
					templateUrl: 'views/footer.html'
				},
				'leftPanel@core': {
					templateUrl: 'views/leftPanel.html'
				},
				'rightPanel@core': {
					templateUrl: 'views/rightPanel.html',
					controller: 'nocRightPanelCtl'
				}

			}
		})
		.state('core.home', {
			url: '/home',
			views: {
				'topOfPageStuff@core': {
					templateUrl: 'views/navBarAndBanner.html'
				},
				'centerContent@core': {
					templateUrl: 'views/homeContent.html'
				},
				'rightPanel@core': {
					templateUrl: 'views/rightPanel.html',
					controller: 'nocRightPanelCtl'
				}

			}
		})
		.state('core.blog', {
			url: '/blog/:id',
			views: {
				'topOfPageStuff@core': {
					templateUrl: 'views/navBar.html'
				},
				'centerContent@core': {
					templateUrl: function ($stateParams) {
						return '/blogs/'+$stateParams.id;
					},
					controller: 'nocHomeBlargCtl'
				},
				'rightPanel@core': {
					templateUrl: 'views/rightPanel.html',
					controller: 'nocRightPanelCtl'
				}
			}
		})
		
}]);

nibbleOnCode.factory('nibbleOnCodeSvc', ['$resource', function($resource){

		
	var blogs,
		blogSource,
		tagSource,
		tags,
		//Async functions
		getBlogs,
		getTags,
		//Sync functions
		fetchBlogs,
		fetchTags,
		//Private functions
		parseTags;
	

	getBlogs = function(){
		blogSource = $resource('http://162.243.145.82:3000/node/getBlogInfo');
		return blogSource.get(function(response){
			blogs = response.data;

		
		}).$promise;
	};
	getTags = function(filename) {
		filename = filename || '';
		tagSource = $resource('http://162.243.145.82:3000/node/getTags/'+filename);
		return tagSource.get(function(response){
			tags = parseTags(response.data);

		
		}).$promise;
	}
	fetchBlogs = function(){
		return blogs;
	}
	fetchTags = function(){
		return tags;
	}
	
	parseTags = function(tags) {
		var tagsArray = [],
			tagsObject = {};
		tags.forEach(function(tag){
			tagsObject[tag._id] = tag.total;
		});
		return tagsObject;
	}


	return {
		getBlogs: getBlogs,
		getTags: getTags,
		fetchBlogs: fetchBlogs,
		fetchTags: fetchTags
		
	}


}]);

