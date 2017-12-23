(function() {
	'use strict';

	angular
		.module('app')
		.controller('AddonBigController', AddonBigController);

	AddonBigController.$inject = [
    '$scope', '$http', 'addonretriever', 'installer','settings', '$log',
    'SharedScopes', '$translate', '$location', 'readmeretriever', '$sce'
  ];

	function AddonBigController(
    $scope, $http, addonretriever,installer, settings, $log,
    SharedScopes, $translate, $location, readmeretriever, $sce
  ) {
		const vm = this;
		this.sort = "name";

		this.buttons = {
			download: 'img/download.png',
			more: 'img/more.png',
			uninstall: 'img/uninstall.png',
			update: 'img/update.png',
			back: 'img/back.png',
			style: {
				width: '32px',
				height: '32px'
			}
		}

		this.photo = {
			twitter: 'img/twitter.png',
			github : 'img/GitHub-Mark-64px.png',
			dropdn : 'img/dropdown-arrow-down.png',
			style: {
				width: '16px',
				height: '16px'
			}
		};

		require('electron-json-storage').get('settingCol', function(error, col) {
			console.log(col)
			vm.col = col
			if(typeof col == 'object' )
				vm.col = 50
		});


		this.addon = $location.selectedAddon;

		readmeretriever.getReadme(this.addon, function(success, readme) {
			if(success) {
				// var marked = require('marked');
				marked.setOptions({
					sanitize: true
				});

				vm.addon.readme = $sce.trustAsHtml(marked(readme));

				$scope.$apply();
			}
		});

		$scope.goBack = function()
		{
			window.history.back();
		}

		$scope.getAddonList = function(selectedAddon)
		{
			return settings.addonList[selectedAddon.similarto].addons;
		}

		$scope.doesTranslateDescription = ()=>{return settings.doesTransDesc}

		$scope.getDescription = addon =>{
			if(!settings.doesTransDesc || !addon.transDesc)
				return addon.description
			else
				return addon.transDesc[$translate.proposedLanguage()]	
		}

		$scope.install = function(addon) {
			addon.isDownloading = true;
			installer.install(addon, $scope, function() {
				addon.isDownloading = false;
			});
		}
		$scope.uninstall = function(addon) {
			installer.uninstall(addon, $scope);
		}

		$scope.update = function(addon) {
			installer.update(addon, $scope);
		}

		$scope.openWebsite = function(addon) {
			// TODO: this needs to be a utility method
			var repoUrl = "https://github.com/" + addon.repo;
			require('electron').shell.openExternal(repoUrl);
		}

		$scope.openIssues = function(addon) {
			var issuesUrl = "https://github.com/" + addon.repo + "/issues";
			require('electron').shell.openExternal(issuesUrl);
		}
		$scope.openTwitter = function(addon) {
			var twitterUrl = "https://twitter.com/" + addon.twitterAccount;
			require('electron').shell.openExternal(twitterUrl);
		}
	}
})();
