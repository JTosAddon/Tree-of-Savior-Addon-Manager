(function() {
	'use strict';

	angular
		.module('app')
		.controller('TabController', TabController);

	TabController.$inject = [
    '$scope', '$location',  '$anchorScroll', 'settings', '$state', 'SharedScopes',
    '$translate' , '$http'
  ];

	/* @ngInject */
	function TabController(
    $scope, $location, $anchorScroll, settings, $state, SharedScopes,
    $translate , $http
  ) {
		var vm = this;

		vm.selectedIndex = 0;

		vm.isValidDirectory = function() {
			return settings.getIsValidDirectory();
		};

		vm.launchGame = function() {
			const urlPath = $translate.instant('TOS.SITE_URL')
			console.log(urlPath)

			require('electron').shell.openExternal(urlPath);
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
		vm.openDiscord = function()	{
			require('electron').shell.openExternal('https://discord.gg/hgxRFwy');
		};

		// get language pack
		let fs = require('fs')
		vm.isFirstLoad = false
		$http.get('https://raw.githubusercontent.com/JTosAddon/Tree-of-Savior-Addon-Manager/master/locales/locales.json' + "?" + new Date().toString(), {cache: false}).success(function(data) {
			vm.locales = data;
			angular.forEach(data, function(lang) {
				$http.get(`https://raw.githubusercontent.com/JTosAddon/Tree-of-Savior-Addon-Manager/master/locales/${lang}.json` + "?" + new Date().toString()).success(function(sourceData) {
					try {fs.statSync(`locales/${lang}.json`)}catch(e){console.log(e);vm.isFirstLoad = true}
					fs.writeFile(`locales/${lang}.json`,JSON.stringify(sourceData, null, '    '))
				})
			})
		})
		// vm.locales = require('./locales/locales.json')				

		settings.getTranslateDescription(data=>{
			vm.doesTransDesc = data.doesTransDesc
		})

		vm.changeTranslateDescription = ()=>{
			settings.doesTransDesc = vm.doesTransDesc
			settings.saveTranslateDescription()
		}

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
