var nibbleOnCode = angular.module('nibbleOnCode', [

	'ngRoute',
	'ui.router',
	'ngResource',
	'nibbleOnCode'
		
	]);

nibbleOnCode.controller('nocCtl', ['$scope', function($scope) {
}]);
nibbleOnCode.controller('nocExperimentCtl', ['$q', '$scope', 'nibbleOnCodeSvc', function($q, $scope, nibbleOnCodeSvc) {
	var runTest,
		runMongoOpt,
		runNodeOpt,
		runNgOpt,
		tot,
		testObj;

	runMongoOpt = function() {
		var start = Date.now(),
			end,
			tagsHash,
			tagsKeys;
		return nibbleOnCodeSvc.getTags().then(function(response){

			tagsHash = nibbleOnCodeSvc.fetchTags();
			tagsKeys = Object.keys(tagsHash).sort(function(a, b){
				return tagsHash[b]-tagsHash[a];
			});

			end = Date.now();
			return end-start;
			
		});
	}

	runNodeOpt = function() {
		var start = Date.now(),
			end,
			tagsHash,
			tagsKeys;

		return nibbleOnCodeSvc.getTags2().then(function(response){
			tagsHash = nibbleOnCodeSvc.fetchTags();
			tagsKeys = Object.keys(tagsHash).sort(function(a, b){
				return tagsHash[b]-tagsHash[a];
			});
			end = Date.now();
			return end-start;
		});
	}

	runNgOpt = function() {
		var start = Date.now(),
			end,
			blogs,
			tags = [],
			tagsHash = {},
			tagsKeys;

		return nibbleOnCodeSvc.getBlogs().then(function(response){
			

			blogs = nibbleOnCodeSvc.fetchBlogs();
			blogs.forEach(function(blog){
				tags = tags.concat(blog.tags);
			});
			tags.forEach(function(tag){
				if (tagsHash[tag]) tagsHash[tag] += 1;
				else tagsHash[tag] = 1;
			})


			tagsKeys = Object.keys(tagsHash).sort(function(a, b){
				return tagsHash[b]-tagsHash[a];
			});
			end = Date.now();
			return end-start;
		});
	}

	runTest = function(runs, callback) {
		var res = 0,
			promises = [];
		runs = runs || 1000;
		

		return $q(function(resolve){
			for (var i = 0; i < runs; i++){
				promises.push(callback());
			}
			$q.all(promises).then(function(results){
				resolve(results.reduce(function(prev, curr){
					return prev+curr;
				}));
			});
		});


	}
	$scope.runs = 5;
	$scope.runATest = function(whichTest){
		console.log($scope.runs);
		runTest($scope.runs, testObj[whichTest]).then(function(result){
			$scope[whichTest] = result;
		});
	}
	$scope.redisKey = "";
	$scope.validateRedis = function(redisKey){
		nibbleOnCodeSvc.validateRedis(redisKey).then(function(result){
			$scope.validRedisKey = true;
		}, function(error){
		});
	}

	testObj = {
		'mongoRes': runMongoOpt,
		'nodeRes': runNodeOpt,
		'angularRes': runNgOpt
	}


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
		.state('experiment', {
			url: '/experiment',
			templateUrl: 'views/experiment.html',
			controller: 'nocExperimentCtl'
		})
		
}]);

nibbleOnCode.factory('nibbleOnCodeSvc', ['$resource', '$http', function($resource, $httpProvider){

		
	var blogs,
		blogSource,
		tagSource,
		tags,
		//Async functions
		getBlogs,
		getTags,
		getTags2,
		validateRedis,
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
	getTags2 = function(filename) {
		filename = filename || '';
		tagSource = $resource('http://162.243.145.82:3000/node/getTags2/'+filename);
		return tagSource.get(function(response){
			tags = response.data;

		
		}).$promise;
	}
	validateRedis = function(redisKey) {
		$httpProvider.defaults.headers.get = {};
		$httpProvider.defaults.headers.get.redislockkey = redisKey;
		redisSource = $resource('http://162.243.145.82:3000/node/validateRedisLock', {},{
			query: {
				method: 'GET',
				data: false,
				headers: {'redislockkey': redisKey}
			}});
		return redisSource.get(function(response){
			//console.log(response);
		}, function(error){
			//console.log(error);	
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
		getTags2: getTags2,
		fetchBlogs: fetchBlogs,
		fetchTags: fetchTags,
		validateRedis: validateRedis
		
	}


}]);

