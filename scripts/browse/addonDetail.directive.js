(function() {
	'use strict';

	angular
		.module('app')
		.directive('detailaddon', addon);

	function addon($log, $compile, $sce,  $location,  $anchorScroll ,installer, readmeretriever ,settings, $translate) {
		const directive = {
			scope: {},
			restrict: 'E',
			link: link,
			templateUrl: 'views/addonDetail.html',
			controller: detailAddonController,
			controllerAs: "vm",
			bindToController: {
				addon: '='
			}
		};
		let isShowReadme = false;
		let isLoadedReadme = false;


		return directive;
		function link(scope, element, attrs) {

			scope.buttons = {
				download: 'img/download.png',
				more: 'img/more.png',
				uninstall: 'img/uninstall.png',
				update: 'img/update.png',
				notification: 'img/notification.png',
                back:"img/back.png",
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
				const idx = settings.addonList[addon.similarto].addons.indexOf(addon);
				addon.isDownloading = true;
				installer.install(addon, scope, function() {
					addon.isDownloading = false;
					settings.addonList[addon.similarto].addons[idx] = addon;
				});
			}
			scope.uninstall = function(addon) {
				const idx = settings.addonList[addon.similarto].addons.indexOf(addon);
				installer.uninstall(addon, scope);
				//update the list
				settings.addonList[addon.similarto].addons[idx] = addon;
			}

			scope.update = function(addon) {
				const idx = settings.addonList[addon.similarto].addons.indexOf(addon);
				installer.update(addon, scope);
				settings.addonList[addon.similarto].addons[idx] = addon;
			}

			scope.openWebsite = function(addon) {
				// TODO: this needs to be a utility method
				const repoUrl = "https://github.com/" + addon.repo;
				require('electron').shell.openExternal(repoUrl);
			}

			scope.openIssues = function(addon) {
				const issuesUrl = "https://github.com/" + addon.repo + "/issues";
				require('electron').shell.openExternal(issuesUrl);
			}
			scope.openTwitter = function(addon) {
				const twitterUrl = "https://twitter.com/" + addon.twitterAccount;
				require('electron').shell.openExternal(twitterUrl);
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
				const phase = scope.$root.$$phase;
				if(phase == '$apply' || phase == '$digest') {
					if(fn && (typeof(fn) === 'function')) {
						fn();
					}
				} else {
					scope.$apply(fn);
				}
			};

            scope.goBack = (addon)=>{
                let browseController = scope.$parent.browseController
                browseController.isShowDetail = false
				$location.hash(addon.name);
				$anchorScroll();
                browseController.addon = {}
            }

			scope.doesTranslateDescription = ()=>{return settings.doesTransDesc}
		}
	}

	detailAddonController.$inject = ['$scope'];

	function detailAddonController($scope) {
        const vm = this
		$scope.testFunction = function() {
			console.log("test function");
		}
	}
})();
