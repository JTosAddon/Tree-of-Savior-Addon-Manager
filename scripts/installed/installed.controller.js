(function() {
	'use strict';

	angular
		.module('app')
		.controller('InstalledController', InstalledController);

	InstalledController.$inject = ['settings'];

	function InstalledController(settings) {
		const vm = this;

		settings.getInstalledAddons(function(installedAddons) {
			vm.installedAddons = installedAddons;
		});
	}
})();
