(function() {
	'use strict';

	angular
		.module('app')
		.factory('settings', settings);

	settings.$inject = ['$log', '$http'];

	function settings($log, $http) {
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
			TOSVersion : "0",
			broken_addons : [],
			getBrokenAddons : getBrokenAddons,
			isAddonOutdated : isAddonOutdated,
			isBrokenAddon : isBrokenAddon,
			getClientXML : getClientXML,
			addonList : {},
			JTos : {},
			ITos : {}
		};

		service.getBrokenAddons($http, service);

		return service;


		async function getBrokenAddons($http, service)
		{
			let taskIToS = new Promise((resolve) => {
				var url = "https://raw.githubusercontent.com/MizukiBelhi/Addons/master/broken-addons.json";
				$http.get(url + "?" + Date.now(), {cache: false}).then(function (res){
					console.log("ToSVersion: "+service.TOSVersion)
					service.TOSVersion = res.data.tosversion;
					resolve(res)
				});
			})
			let taskJToS = new Promise((resolve) => {
				// const url = "https://raw.githubusercontent.com/JToSAddon/Addons/master/broken-addons.json";
				const url = "https://raw.githubusercontent.com/weizlogy/Addons/master/broken-addons.json";
				$http.get(url + "?" + Date.now(), {cache: false}).then(function (res){
					resolve(res)
				});
			})
			await Promise.all([taskIToS, taskJToS]).then((res) => {
				for (let i = 0; i < res.length; i++) {
					angular.forEach(res[i].data.addons, function(addon){
  					console.log('BrokenAddon -> ' + JSON.stringify(addon))
						service.broken_addons.push(addon);
					});
				}
			}).catch((error) => {
				console.log(error)
			})
		}

		function isBrokenAddon(addon)
		{
			var i;
			for (i = 0; i < this.broken_addons.length; i++) {
				var baddon = this.broken_addons[i];

				if(((baddon.author === addon.author) && (("v"+baddon.version) === addon.fileVersion) && (baddon.file === addon.file)))
					return true;
			}
			return false;
		}

		function isAddonOutdated(addon)
		{
			if(addon.tosversion < this.TOSVersion)
				return true;
			return false;
		}


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
			return getTreeOfSaviorDirectory(function(treeOfSaviorDirectory) {
				var treeOfSaviorDataDirectory = treeOfSaviorDirectory + "/data/";
				const fs = require('fs');

				var addonData = [];

				// var semregex = /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/ig;
				const semregex = /\_(?<file>.+?)-(?<unicode>.+?)-(?<version>v.+?)\.ipf/i;

				fs.readdirSync(treeOfSaviorDataDirectory).forEach(file => {
					if(file.charAt(0) == "_") //addons installed with the manager start with _
					{
						// var filen = file.substr(1, file.length-4); //also removing .ipf
						// var filesplit = filen.split("-");

						let regexedFile = semregex.exec(file).groups
						let filename = regexedFile['file']

						//this is all we can gather from the file
						// addonData[filesplit[0]] = {};
						// addonData[filesplit[0]]["file"] = filesplit[0];
						// addonData[filesplit[0]]["extension"] = "ipf";
						// addonData[filesplit[0]]["unicode"] = filesplit[1];
						// addonData[filesplit[0]]["fileVersion"] = semregex.exec(filen); //filesplit[2];
						// addonData[filesplit[0]]["isInstalled"] = true;
						// addonData[filesplit[0]]["installedFileVersion"] = semregex.exec(filen);
						addonData[filename] = {};
						addonData[filename]["file"] = regexedFile['file'];
						addonData[filename]["extension"] = "ipf";
						addonData[filename]["unicode"] = regexedFile['unicode'];
						addonData[filename]["fileVersion"] = regexedFile['version'];  // if it missing, semver version error occured. why.
						addonData[filename]["isInstalled"] = true;
						addonData[filename]["installedFileVersion"] = regexedFile['version'];
					}
					//console.log(addonData);
					return callback(addonData);
				});
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

		async function getClientXML() {
			const fs = require('fs');
			const xml2js = require('xml2js');

      return new Promise((resolve) => {
				getTreeOfSaviorDirectory((treeOfSaviorDirectory) => {
					const target = treeOfSaviorDirectory + "/release/client.xml";
					let clientXML = fs.readFileSync(target, "utf8")
					new xml2js.Parser({ explicitArray: false }).parseString(clientXML, (error, result) => {
  					resolve(result)
					});
				});
			});
		}
	}
})();
