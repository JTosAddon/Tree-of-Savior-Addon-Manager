(function() {
	'use strict';

	angular
		.module('app')
		.directive('addon', addon);

	function addon($log, $compile, $sce,  $location,  $anchorScroll ,installer, readmeretriever ,settings,$translate) {
		var directive = {
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
		var isShowReadme = false;
		var isLoadedReadme = false;

		return directive;

		function link(scope, element, attrs) {
			scope.install = function(addon) {
				addon.isDownloading = true;
				installer.install(addon, scope, function() {
					addon.isDownloading = false;
				});
			}
			scope.uninstall = function(addon) {
				installer.uninstall(addon, scope);
			}

			scope.update = function(addon) {
				installer.update(addon, scope);
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
