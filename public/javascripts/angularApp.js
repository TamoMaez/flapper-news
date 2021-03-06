var app = angular.module('flapperNews', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider
	.state('home', {
		url: '/home',
		templateUrl: '/home.html',
		controller: 'MainCtrl',
		resolve: {
			postPromise: ['posts', 'git', function(posts, git){
				return posts.getAll();
			}]
		}
	})
	.state('posts', {
	  url: '/posts/{id}',
	  templateUrl: '/posts.html',
	  controller: 'PostsCtrl',
	  resolve: {
		  post: ['$stateParams', 'posts', function($stateParams, posts){
			  return posts.get($stateParams.id);
			}]
		}
	})
	.state('commits', {
	  url: '/commits',
	  templateUrl: '/commits.html',
	  controller: 'CommitCtrl',
	  resolve: {
		  postPromise: ['git', function(git){
			  return git.get();;
			}]
		}
	})
	.state('login', {
		url: '/login',
		templateUrl: '/login.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'auth', function($state, auth){
			if(auth.isLoggedIn()){
			  $state.go('home');
			}
		}]
	})
	.state('register', {
	  url: '/register',
	  templateUrl: '/register.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
		if(auth.isLoggedIn()){
		  $state.go('home');
		}
	  }]
	});
	console.log($stateProvider);
	$urlRouterProvider.otherwise('home');
}])

.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};
	
	auth.isLoggedIn = function(){
		var token = auth.getToken();
		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		}else return false;
	}
	
	auth.saveToken = function(token){
		$window.localStorage['flapper-news-token'] = token;
	};
	
	auth.getToken = function(){
		return $window.localStorage['flapper-news-token'];
	}
	
	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.username;
		}
	}
	
	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	}
	
	auth.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	}
	
	auth.logOut = function(){
		$window.localStorage.removeItem('flapper-news-token');
	}
	
	return auth;
}])

.factory('posts', ['$http', 'auth', function($http, auth){
	var o = {
		posts: []
	};
	
	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res){
			console.log(res.data);
			return res.data;
		});
	}
	
	o.getAll = function() {
		return $http.get('/posts').success(function(data){
		  angular.copy(data, o.posts);
		  console.log(data);
		});
	};
	
	o.create = function(post) {
		return $http.post('/posts', post, {
			headers: {Authorization : 'Bearer ' + auth.getToken()}
		}).success(function(data){
			data.author = auth.currentUser;
			o.posts.push(data);
		})
	}
	
	o.upvote = function(post){
		return $http.put('/posts/' + post._id + '/upvote', null, {
			headers: {Authorization : 'Bearer ' + auth.getToken()}
		}).success(function(data){
				post.upvotes ++;
		})
	}
	
	o.addComment = function(id, comment) {
	  return $http.post('/posts/' + id + '/comments', comment, {
			headers: {Authorization : 'Bearer ' + auth.getToken()}
		});
	};
	
	o.upvoteComment = function(post, comment){
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
			headers: {Authorization : 'Bearer ' + auth.getToken()}
		}).success(function(data){
				comment.upvotes ++;
			})
	}
	
	return o;
}])

.factory('git', ['$http', function($http){
	var repo = {};
	
	repo.get = function() {
		return $http.get("https://api.github.com/repos/TamoMaez/flapper-news").then(function(res){
			angular.copy(res.data, repo);
			return $http.get("https://api.github.com/repositories/" + repo.id + "/commits").then(function(result){
				repo.commits = result.data;
			});
		});
	}
	
	return repo;
}])

.controller('MainCtrl', ['$scope', 'posts', 'auth', function($scope, posts, auth){
  $scope.posts = posts.posts;
  $scope.isLoggedIn = auth.isLoggedIn;
  
  $scope.addPost = function(){
	  if(!$scope.title || $scope.title === "") return;
	  posts.create({
		  title: $scope.title, 
		  link: $scope.link,
		  description: $scope.description,
		  author: "user"
	  });
	  $scope.title = "";
	  $scope.link = "";
  }
  
  $scope.upvote = function(post){
	  posts.upvote(post);
  }
}])

.controller('PostsCtrl', ['$scope', '$stateParams', 'posts', 'post', 'auth', function($scope, $stateParams, posts, post, auth){
	$scope.post = post;
	$scope.isLoggedIn = auth.isLoggedIn;
	
	$scope.addComment = function(){
		  if($scope.body === '') { return; }
		  posts.addComment(post._id, {
			body: $scope.body,
			author: 'user',
		  }).success(function(comment) {
			$scope.post.comments.push(comment);
		  });
		  $scope.body = '';
	};
	
	$scope.upvote = function(comment){
		posts.upvoteComment(post, comment);
	}
}])

.controller('AuthCtrl', ['$scope', '$state', 'auth', function($scope, $state, auth){
	$scope.user = {};
	
	$scope.register = function(){
		auth.register($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		});
	};
	
	$scope.logIn = function(){
		auth.logIn($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(){
			$state.go('home');
		});
	};
}])

.controller('CommitCtrl', ['$scope', 'git', function($scope, git){
	  $scope.repo = git;	  
}])

.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);