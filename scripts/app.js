(function () {
		'use strict';

		angular.module('app', [
				'ui.router',
				'ngResource',
				'ngMaterial',
				'ngAnimate',
				'ngCookies',
				'pascalprecht.translate'
		])
		.config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$translateProvider' ,function($stateProvider, $urlRouterProvider, $mdThemingProvider, $translateProvider) {
			
			$translateProvider.useStaticFilesLoader({
				prefix: 'locales/',
				suffix: '.json'
			});
			$translateProvider.preferredLanguage('ja');
			$translateProvider.fallbackLanguage('en');
			// $translateProvider	.useMissingTranslationHandlerLog();
			$translateProvider.useLocalStorage();
			$translateProvider.useSanitizeValueStrategy('escaped', 'sanitizeParameters');

			$urlRouterProvider.otherwise("/tab");

			$stateProvider
				.state('settings', {
					url: '/settings',
					templateUrl: 'views/settings.html',
					controller: 'SettingsController as vm'
				})
				.state('JToS', {
					url: '/browseJP',
					templateUrl: 'views/browse.html',
					controller: 'BrowseControllerJP as browseController'
				})
				.state('IToS', {
					url: '/browse',
					templateUrl: 'views/browse.html',
					controller: 'BrowseController as browseController'
				})
				.state('installed', {
					url: '/installed',
					templateUrl: 'views/installed.html',
					controller: 'InstalledController as vm'
				});

			$mdThemingProvider.theme('default')
				.primaryPalette('blue')
				.accentPalette('light-green')
				.warnPalette('red');
				}
		]);
})();
