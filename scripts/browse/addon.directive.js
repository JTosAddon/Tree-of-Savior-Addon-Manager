(function() {
	'use strict';

	angular
		.module('app')
		.directive('addon', addon);

	function addon($log, $compile ,installer, settings, $translate) {
		const directive = {
			scope: {},
			restrict: 'E',
			link: link,
			templateUrl: 'views/addon.html',
			controller: AddonController,
			controllerAs: "vm",
			bindToController: {
				addon: '='
			}
		};

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

			scope.getDescription = addon => {
        let desc = addon.description;
				if(settings.doesTransDesc && addon.transDesc) {
          desc = addon.transDesc[$translate.proposedLanguage()];
          if (!desc) {
            desc = addon.description;
          }
        }
        return desc;
			}

      scope.toggleDescription = addon => {
        scope.showFullDesc = !scope.showFullDesc;
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
        // 複数バージョン表示に都合３回この処理を呼んでいて
        // なぜか知らないけれども結構遅いのでキャッシュしておくことにします
        // return settings.addonList[selectedAddon.similarto].addons;
        scope.directiveAddonList = settings.addonList[selectedAddon.similarto].addons;
        return scope.directiveAddonList
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

			scope.doesTranslateDescription = ()=>{return settings.doesTransDesc}
		}
	}

	AddonController.$inject = ['$scope',"readmeretriever","$sce"];

	function AddonController($scope,readmeretriever,$sce) {
		let browseController = $scope.$parent.$parent.browseController
		$scope.changeToBig = function(addon) {
			console.log('show detail '+addon.name)
			browseController.addon = addon
			browseController.isShowDetail = true
			if(!addon.readme)
				readmeretriever.getReadme(addon, function(success, readme) {
					if(success) {
						console.log(readme)
						const marked = require('marked');
						marked.setOptions({
							sanitize: true
						});
						readme = $sce.trustAsHtml(marked(readme));
						addon.readme = readme
						$scope.$parent.$parent.$apply()
					}
				});
		}
	}
})();
