(function() {
	'use strict';

	angular
		.module('app')
		.controller('BrowseController', BrowseController);

	BrowseController.$inject = [
    '$scope', '$http', 'addonretriever', 'installer','settings', '$log',
    'SharedScopes', '$translate'
  ];

	function BrowseController(
    $scope, $http, addonretriever,installer, settings, $log,
    SharedScopes, $translate
  ) {
		const vm = this;
		vm.sort = "name";
		vm.isShowDetail = false

		// require('electron-json-storage').get('settingCol', function(error, col) {
		// 	console.log(col)
		//     vm.col = col
        //     if(typeof col == 'object' )
        //         vm.col = 50
        // });

		vm.addonsLoading = true;

		addonretriever.getAddons(function(addons, addonList) {
			vm.addons = addons;
			vm.addonsLoading = false;
			settings.addonList = addonList;
		});

		addonretriever.getDependencies(function(dependencies) {
			$log.info(JSON.stringify(dependencies));
		});

		// this.changeCol = ()=>{
		// 	require('electron-json-storage').set('settingCol',vm.col, error =>{
		// 		console.log(error)
		// 	})
		// }
	
		$scope.updateAllAddons = function(){
			let updatelist = '';
			for(let i = 0;i<vm.addons.length - 1;i++){
				let addon = vm.addons[i]
				if(addon.isUpdateAvailable){
					installer.update(vm.addons[i])
					updatelist += addon.name + '\n';			
				}
			}

			if(updatelist !== '')
				alert(`${updatelist}${$translate.instant('ADDONS.UPDATE_LIST_SUCCESS')}`);
			else
				alert($translate.instant('ADDONS.UPDATE_LIST_BLANK'));
		}
		// $scope.openReadme = function() {
		// 	if(!vm.isShowDetail){
		// 		return;
		// 	}
		// 	let addon = vm.addon
		// 	$log.info("Opening readme");
		// 	readmeretriever.getReadme(addon, function(success, readme) {
		// 		if(success) {
		// 			// var marked = require('marked');
		// 			marked.setOptions({
		// 				sanitize: true
		// 			});
		// 			scope.$apply(function() {
		// 				addon.readme = $sce.trustAsHtml(marked(readme));
		// 				console.log("readme: " + addon.readme);
		// 		});
		// 		}
		// 	});
		// }
		// $scope.reloadReadme = function(){
		// 	$scope.$apply();
		// }
		// $scope.testFunction = function(){
		// 	console.log(vm)
		// }
	}

})();
