(function() {
	'use strict';
	angular
		.module('app')
		.factory('addonretrieverJP', addonretrieverJP);

	addonretrieverJP.$inject = ['$log', '$http', 'settings', '$translate'];

	function addonretrieverJP($log, $http, settings,$translate) {
		var masterSources = "https://raw.githubusercontent.com/JTosAddon/Addons/master/managers.json";

		var service = {
			getAddons : getAddons,
			getDependencies : getDependencies
		};
		var existTwitterAccount = false		
		return service;

		function getAddons(callback) {
			var JTos = settings.JTos
			settings.getInstalledAddons(function(installedAddons) {
				if(!JTos.data){
					$http.get(masterSources + "?" + new Date().toString(), {cache: false}).success(function(data) {
						JTos.data = data;
					});
				}
				var addons = [];
				angular.forEach(JTos.data.sources, function(source) {
					var repo = `https://raw.githubusercontent.com/${source.repo}/master/addons.json`;
					
					$http.get(repo + "?" + new Date().toString()).success(function(sourceData) {
						angular.forEach(sourceData, function(addon) {

							var repoValues = source.repo.split('/');

							addon.author = repoValues[0];
							addon.repo = repoValues[1];

							$log.info("Loading addon " + addon.name + " by " + addon.author);

							addon.twitterAccount = source.twitter
							$log.info(source.twitter);

							if (addon.twitterAccount) 
								addon.existTwitterAccount = true
								
							for(var attributeName in source) {
								addon[attributeName] = source[attributeName];
							}

							addon.downloadUrl = "https://github.com/" + source.repo + "/releases/download/" + addon.releaseTag + "/" + addon.file + "-" + addon.fileVersion + "." + addon.extension;
							addon.isDownloading = false;

							if(installedAddons) {
								var installedAddon = installedAddons[addon.file];

								if(installedAddon) {
									addon.installedAddon = installedAddon;
									addon.isInstalled = true;
									var semver = require('semver');

									addon.installedFileVersion = installedAddon.fileVersion;

									$log.info("Update available for " + addon.name + "? " + semver.gt(addon.fileVersion, installedAddon.fileVersion));

									if(semver.gt(addon.fileVersion, installedAddon.fileVersion)) {
										addon.isUpdateAvailable = true;
									} else {
										addon.isUpdateAvailable = false;
									}
								} else {
									addon.isInstalled = false;
									addon.isUpdateAvailable = false;
								}
							}
							addon.date = JTos.date[addon.releaseTag]
							var moment = require('moment')
							addon.dateParsed = moment(addon.date).format("YYYY年MM月DD日")

							// get translate description
							addon.transDesc = {}
							let db = settings.translateDB
							if(db[addon.name] && (db[addon.name].fileVersion == addon.fileVersion) && Object.keys(db[addon.name].transDesc).length){
								addon.transDesc = JSON.parse(db[addon.name].transDesc)
							}else{
								var request = require('request')
								request.get({
									url:"https://antima-bot-lowlier-columbarium.au-syd.mybluemix.net/users/",
									headers: {
									"content-type": "text/plane"
									},
									qs : {
									name : addon.name,
									fileVersion : addon.fileVersion,
									lang : $translate.proposedLanguage() ||  $translate.preferredLanguage(),
									repo: source.repo
									}
								},function (error, response, body) {
									if (!error && response.statusCode == 200) {
										addon.transDesc = body
										db[addon.name] = {
											fileVersion : addon.fileVersion,
											transDesc : body
										}
										settings.saveTranslateDescription()
									} else {
									console.log('error: '+ response.statusCode);
									}
								})
							}
							addon.isShowThisDescription = lang =>{
								if (!settings.doesTransDesc && !lang)
									return true
								if(settings.doesTransDesc && lang == window.localStorage.getItem('NG_TRANSLATE_LANG_KEY'))
									return true
								return false
							}
							addons.push(addon);
						});
					});
				});
				return callback(addons);
			});

		}

		function getDependencies(callback) {
			$http.get(masterSources + "?" + new Date().toString(), {cache: false}).success(function(data) {
				return callback(data.dependencies);
			});
		}
	}
})();
