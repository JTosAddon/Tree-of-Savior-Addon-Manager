(function() {
	'use strict';

	angular
		.module('app')
		.directive('addon', addon);

	function addon($log, $compile, $sce,  $location,  $anchorScroll ,installer, readmeretriever ,settings, $translate) {
		var directive = {
			scope: {},
			restrict: 'E',
			link: link,
			templateUrl: 'views/addon_small.html',
			controller: AddonController,
			controllerAs: "vm",
			bindToController: {
				addon: '='
			}
		};
		var isShowReadme = false;
		var isLoadedReadme = false;


		return directive;

		function link(scope, element, attrs) {

			scope.buttons = {
				download: 'img/download.png',
				more: 'img/more.png',
				uninstall: 'img/uninstall.png',
				update: 'img/update.png',
				notification: 'img/notification.png',
				style: {
					width: '32px',
					height: '32px'
				}
			}
			scope.photo = {
				twitter: 'img/twitter.png',
				github : 'img/GitHub-Mark-64px.png',
				dropdn : 'img/dropdown-arrow-down.png',
				style: {
					width: '16px',
					height: '16px'
				}
			};

			scope.install = function(addon) {
				var idx = settings.addonList[addon.similarto].addons.indexOf(addon);
				addon.isDownloading = true;
				installer.install(addon, scope, function() {
					addon.isDownloading = false;
					settings.addonList[addon.similarto].addons[idx] = addon;
				});
			}
			scope.uninstall = function(addon) {
				var idx = settings.addonList[addon.similarto].addons.indexOf(addon);
				installer.uninstall(addon, scope);
				//update the list
				settings.addonList[addon.similarto].addons[idx] = addon;
			}

			scope.update = function(addon) {
				var idx = settings.addonList[addon.similarto].addons.indexOf(addon);
				installer.update(addon, scope);
				settings.addonList[addon.similarto].addons[idx] = addon;
			}

			scope.openWebsite = function(addon) {
				// TODO: this needs to be a utility method
				var repoUrl = "https://github.com/" + addon.repo;
				require('electron').shell.openExternal(repoUrl);
			}

			scope.openIssues = function(addon) {
				var issuesUrl = "https://github.com/" + addon.repo + "/issues";
				require('electron').shell.openExternal(issuesUrl);
			}
			scope.openTwitter = function(addon) {
				var twitterUrl = "https://twitter.com/" + addon.twitterAccount;
				require('electron').shell.openExternal(twitterUrl);
			}

			scope.openReadme = function(addon) {
				if(addon.isLoadedReadme){
					addon.isShowReadme = true
					return;
				}
				$log.info("Opening readme");
				readmeretriever.getReadme(addon, function(success, readme) {
					if(success) {
						// var marked = require('marked');
						marked.setOptions({
							sanitize: true
						});
						scope.$apply(function() {
							var close = 
							addon.readme = $sce.trustAsHtml(marked(readme));
							console.log("readme: " + addon.readme);
							addon.isShowReadme = true
							addon.isLoadedReadme = true
					});
					}
				});
			}
			scope.closeReadme = function(addon){
				$log.info("Closing readme");
				addon.isShowReadme = false
				$location.hash(addon.name);
				$anchorScroll();		
			}
			
			scope.getDescription = addon =>{
				if(!settings.doesTransDesc || !addon.transDesc)
					return addon.description
				else
					return addon.transDesc[$translate.proposedLanguage()]	
			}

			scope.openDropdownMenu = function($mdOpenMenu, ev)
			{
      			$mdOpenMenu(ev);
			}

			scope.selectDropdown = function(selectedAddon)
			{
				scope.vm.addon = selectedAddon;
			}

			scope.getAddonList = function(selectedAddon)
			{
				return settings.addonList[selectedAddon.similarto].addons;
			}

			scope.safeApply = function(fn) {
				var phase = scope.$root.$$phase;
				if(phase == '$apply' || phase == '$digest') {
					if(fn && (typeof(fn) === 'function')) {
						fn();
					}
				} else {
					scope.$apply(fn);
				}
			};

			scope.changeToBig = function(addon)
			{
				$location.url('/browseBig');
				$location.selectedAddon = addon;
			}

			scope.doesTranslateDescription = ()=>{return settings.doesTransDesc}
		}
	}

	AddonController.$inject = ['$scope'];

	function AddonController($scope) {
		$scope.testFunction = function() {
			console.log("test function");
		}
	}
})();
