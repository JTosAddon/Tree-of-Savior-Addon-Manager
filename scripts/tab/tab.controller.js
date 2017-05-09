(function() {
	'use strict';

	angular
		.module('app')
		.controller('TabController', TabController);

	TabController.$inject = ['$scope', '$location',  '$anchorScroll', 'settings', '$state', 'SharedScopes', '$translate'];

	/* @ngInject */
	function TabController($scope, $location, $anchorScroll, settings, $state, SharedScopes, $translate) {
		var vm = this;

		vm.selectedIndex = 0;

		vm.isValidDirectory = function() {
			return settings.getIsValidDirectory();
		};

		vm.launchGame = function() {
			require("shell").openExternal("http://tos.nexon.co.jp/players");
		};

		$scope.$watch('vm.selectedIndex', function(current, old) {
			switch(current) {
				case 0:
					$location.url('/settings');
					break;

				case 1:
					$location.url('/browse');
					break;

				case 2:
					$location.url('/browseJP');
					break;
			}
		});
		vm.jumpTo = function () {
			$location.hash('top');
			$anchorScroll();
		}
		vm.showTab = function(){
			return (settings.JTos.isLoad && settings.ITos.isLoad);
		};

		vm.selectedLanguage = $translate.proposedLanguage() || $translate.preferredLanguage();
		vm.changeLang = function(lang) {
			$translate.use(lang);
		};

		$scope.reloadRoute = function() {
			$state.reload();
		};
		SharedScopes.setScope('TabController', $scope);
	}
})();
