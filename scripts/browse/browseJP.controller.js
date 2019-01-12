(function() {
	'use strict';

	angular
		.module('app')
		.controller('BrowseControllerJP', BrowseControllerJP);

	BrowseControllerJP.$inject = [
    '$scope', '$http', 'addonretrieverJP', 'installer','settings', '$log',
    '$translate'
  ];

	function BrowseControllerJP(
    $scope, $http, addonretriever,installer, settings, $log,
     $translate
  ) {
		let vm = this;
		vm.sort ="name"
    vm.addonsLoading = true;

    $scope.$on('ShowAddonDetail', (e, data) => {
      $log.debug(e, data)
      vm.addon = data;
      vm.isShowDetail = true;
    });

		addonretriever.getAddons(function(addons, addonList) {
			vm.addons = addons;
			vm.addonsLoading = false;
			settings.addonList = addonList;
		});

		addonretriever.getDependencies(function(dependencies) {
			$log.info(JSON.stringify(dependencies));
		});

		$scope.updateAllAddons = function(){
			let updatelist = '';
			for(const i = 0;i<vm.addons.length - 1;i++){
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
	}
})();
