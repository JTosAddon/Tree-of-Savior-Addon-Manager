(function() {
	'use strict';

	angular
		.module('app')
		.controller('TabController', TabController);

	TabController.$inject = [
    '$scope', '$location',  '$anchorScroll', 'settings', '$state',
    '$translate' , '$http'
  ];

	/* @ngInject */
	function TabController(
    $scope, $location, $anchorScroll, settings, $state,
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

		// get language pack from local
    // 初回起動でHTTPリクエスト発行するしてやるのは性能的にアレなのでローカルから取得します
    // 必要なら起動後に別トリガーで（要らないと思うけど...
    // isFirstLoadも要らなくなるので一緒に消し込んでます。
		vm.locales = require('./locales/locales.json')

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
	}
})();
