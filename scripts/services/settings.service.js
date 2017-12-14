(function() {
	'use strict';

	angular
		.module('app')
		.factory('settings', settings);

	settings.$inject = ['$log'];

	function settings($log) {
		const storage = require('electron-json-storage');
		const addonsFile = "addons";
		const settingsFile = "settings";
		var isValidDirectory = false;
		var service = {
			addInstalledAddon : addInstalledAddon,
			removeInstalledAddon : removeInstalledAddon,
			getInstalledAddons : getInstalledAddons,
			getTreeOfSaviorDirectory : getTreeOfSaviorDirectory,
			saveTreeOfSaviorDirectory : saveTreeOfSaviorDirectory,
			getIsValidDirectory : getIsValidDirectory,
			setIsValidDirectory : setIsValidDirectory,
			saveTranslateDescription : saveTranslateDescription,
			getTranslateDescription:getTranslateDescription,
			doesTransDesc : true,
			translateDB : {},
			JTos : {},
			ITos : {}
		};

		return service;

		function addInstalledAddon(addon) {
			storage.get(addonsFile, function(error, data) {
				if(!data.installedAddons) {
					data.installedAddons = {};
				}

				data.installedAddons[addon.file] = addon;
				saveInstalledAddons(data);

				$log.info("Saved adding addon: " + addon.file);
			});
		}

		function removeInstalledAddon(addon) {
			storage.get(addonsFile, function(error, data) {
				if(error) {
					$log.error("Could not remove installed addon: " + error + " " + data);
				} else if(data.installedAddons[addon.file]) {
					delete data.installedAddons[addon.file];
					saveInstalledAddons(data);
					$log.info("Saved removing addon: " + addon.file);
				} else {
					$log.warn("Addon " + addon.file + " can't be removed because it is not installed.");
				}
			});
		}

		function getInstalledAddons(callback) {
			return storage.get(addonsFile, function(error, data) {
				if(error) {
					$log.error("Could not get installed addons: " + error);
				} else {
					return callback(data.installedAddons);
				}
			});
		}

		function saveInstalledAddons(data) {
			storage.set(addonsFile, data, function(error) {
				if(error) {
					$log.error(error + ": " + data);
				} else {
					$log.info("Wrote installed addon to settings: " + addonsFile);
				}
			});
		}

		function getTreeOfSaviorDirectory(callback) {
			return storage.get(settingsFile, function(error, data) {
				if(error) {
					$log.error("Could not get tree of savior directory: " + error);
				} else {
					return callback(data.treeOfSaviorDirectory);
				}
			});
		}

		function saveTreeOfSaviorDirectory(treeOfSaviorDirectory) {
			var settings = {
				treeOfSaviorDirectory : treeOfSaviorDirectory
			};

			storage.set(settingsFile, settings, function(error) {
				if(error) {
					$log.error("Could not save Tree of Savior directory: " + error + " " + settings);
				} else {
					$log.info("Wrote installed addon to settings: " + settings);
				}
			});
		}
		function getTranslateDescription(callback) {
				return storage.get('TranslateDescription', function(error, data) {
					if(error) {
						$log.error("Could not get does translate description: " + error);
					} else {
						service.translateDB = data.db || {}
						service.doesTransDesc = data.doesTransDesc || false
						if(callback)
							callback(data)
					}
				});
			}
		function saveTranslateDescription(){
			let settings = {
				db : service.translateDB,
				doesTransDesc : service.doesTransDesc
			};
			storage.set("TranslateDescription", settings, function(error) {
				if(error) {
					$log.error("Could not save does translate descriptions DB: " + error + " " + settings);
				} else {
					$log.info("Wrote does translate description DB: " + settings);
				}
			});	
		}

		function getIsValidDirectory() {
			return isValidDirectory;
		}

		function setIsValidDirectory(isValid) {
			isValidDirectory = isValid;
		}
	}
})();
