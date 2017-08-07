(function() {
	'use strict';

	angular
		.module('app')
		.controller('BrowseControllerJP', BrowseControllerJP);

	BrowseControllerJP.$inject = [
    '$scope', '$http', 'addonretrieverJP', 'installer','settings', '$log',
    'SharedScopes', '$translate'
  ];

	function BrowseControllerJP(
    $scope, $http, addonretriever,installer, settings, $log,
    SharedScopes, $translate
  ) {
		const vm = this;
		this.sort ="name"

		addonretriever.getAddons(function(addons) {
			vm.addons = addons;
		});

		addonretriever.getDependencies(function(dependencies) {
			$log.info(JSON.stringify(dependencies));
		});

		$scope.updateAllAddons = function(){
			const updatelist = '';

			for(let i = 0;i< vm.addons.length - 1;i++){
				let addon = vm.addons[i]

				if(addon.isUpdateAvailable){
					installer.update(addon)
					updatelist += addon.name + '\n';
				}
			}

			if(updatelist !== ''){
				alert(`${updatelist}${$translate.inject('ADDONS.UPDATE_LIST_SUCCESS')}`);

				setTimeout(()=>{
					SharedScopes.getScope('TabController').reloadRoute()
				}, 3000)
			} else {
        alert($translate.instant('ADDONS.UPDATE_LIST_BLANK'));
			}
		}
	}
})();
