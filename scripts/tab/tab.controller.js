(function() {
	'use strict';

	angular
		.module('app')
		.controller('TabController',
      ['$location', '$anchorScroll', 'settings', '$state', '$translate', '$http', '$log', '$scope',
        function($location, $anchorScroll, settings, $state, $translate, $http, $log, $scope) {
      const vm = this;

      vm.selectedIndex = 0;

      $scope.$on('ToSInstallFolderChanged', (e, data) => {
        $log.debug(e, data)
        vm.isValidDirectory = data;
        // これだと状態変化を知るためにものすごい間隔で関数呼び出しされるのでやめたほうが良い
        // vm.isValidDirectory = function() {
        //   return settings.getIsValidDirectory();
        // };
      });

      vm.launchGame = function() {
  			const urlPath = $translate.instant('TOS.SITE_URL');
  			$log.debug(urlPath);

  			require('electron').shell.openExternal(urlPath);
  		};

      vm.selectSettingTab = () => {
        $location.url('/settings');
      };
      vm.selectIToSTab = () => {
        $location.url('/browse');
      };
      vm.selectJToSTab = () => {
        $location.url('/browseJP');
      };

  		vm.jumpTo = function () {
  			$location.hash('top');
  			$anchorScroll();
  		}

  		vm.showTab = function() {
  			return (settings.JTos.isLoad && settings.ITos.isLoad);
  		};

  		vm.openDiscord = function()	{
  			require('electron').shell.openExternal('https://discord.gg/hgxRFwy');
  		};

  		// get language pack from local
      // 初回起動でHTTPリクエスト発行するしてやるのは性能的にアレなのでローカルから取得します
      // 必要なら起動後に別トリガーで（要らないと思うけど...
      // isFirstLoadも要らなくなるので一緒に消し込んでます。
  		vm.locales = require('./locales/locales.json');

  		settings.getTranslateDescription(data => {
  			vm.doesTransDesc = data.doesTransDesc
  		})

  		vm.changeTranslateDescription = () => {
  			settings.doesTransDesc = vm.doesTransDesc
  			settings.saveTranslateDescription()
  		}

  		vm.selectedLanguage = $translate.proposedLanguage() || $translate.preferredLanguage();
  		vm.changeLang = function(lang) {
  			$translate.use(lang);
  		};

  		vm.reloadRoute = function() {
  			$state.reload();
  		};
  }]);
})();
