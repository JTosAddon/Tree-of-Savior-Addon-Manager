(function() {
	'use strict';
	angular
		.module('app')
		.factory('addonretrieverJP', addonretrieverJP);

	addonretrieverJP.$inject = ['$log', '$http', 'settings', '$translate','$q', '$sce'];

	function addonretrieverJP($log, $http, settings, $translate, $q, $sce) {
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
				var addonList = {};
				var sameAddons = [];
				var inList = [];
				var arr = [];
				var sourceArr = [];
				
				angular.forEach(JTos.data.sources, function(source) {
					var repo = `https://raw.githubusercontent.com/${source.repo}/master/addons.json`;

					arr.push( $http.get(repo + "?" + new Date().toString()).catch(angular.noop) );
					sourceArr.push(source);
				});

				$q.all(arr).then(function(sourceData){
					$log.info("src size: "+sourceData.length);
					var idx = 0;
					angular.forEach(sourceData, function(srcdata) {
						var source = sourceArr[idx];
						if(srcdata)
						{
							angular.forEach(srcdata.data, function(addon) {
								var repoValues = source.repo.split('/');

								addon.author = repoValues[0];
								addon.repo = repoValues[1];

								$log.info("Loading addon " + addon.name + " by " + addon.author);

								addon.shortname = addon.name;
								addon.nameSce = $sce.trustAsHtml(addon.name);
								if(addon.shortname.length > 25) {
									addon.shortname = addon.shortname.substring(0,24)+"...";
								}

								addon.twitterAccount = source.twitter
								$log.info(source.twitter);

								if (addon.twitterAccount) 
									addon.existTwitterAccount = true

								if(!addon.tosversion)
									addon.tosversion = settings.TOSVersion;

								for(var attributeName in source) {
									addon[attributeName] = source[attributeName];
								}

								addon.isOutdated = settings.isAddonOutdated(addon);
								addon.isBroken = settings.isBrokenAddon(addon);

								addon.descriptionSce = $sce.trustAsHtml(addon.description);

								addon.downloadUrl = "https://github.com/" + source.repo + "/releases/download/" + addon.releaseTag + "/" + addon.file + "-" + addon.fileVersion + "." + addon.extension;
								addon.isDownloading = false;

								if(installedAddons) {
									var installedAddon = installedAddons[addon.file];

									if(installedAddon) {
										addon.installedAddon = installedAddon;
										addon.isInstalled = true;
										var semver = require('semver');

										addon.installedFileVersion = installedAddon.fileVersion;

										try {
											$log.info("Update available for " + addon.name + "? " + semver.gt(addon.fileVersion, installedAddon.fileVersion));

											if(semver.gt(addon.fileVersion, installedAddon.fileVersion)) {
												addon.isUpdateAvailable = true;
											} else {
											   addon.isUpdateAvailable = false;
										   	}
									   	}catch(err) {
									   		$log.info("semver version error");
									   		addon.isUpdateAvailable = false;
									   	}
									} else {
										addon.isInstalled = false;
										addon.isUpdateAvailable = false;
									}
								}
								if(addon.date = JTos.date[addon.releaseTag])
								{
									addon.date = JTos.date[addon.releaseTag]
									var moment = require('moment')
									addon.dateParsed = moment(addon.date).format("YYYY年MM月DD日")
								}
								// get translate description
								addon.transDesc = {}
								let db = settings.translateDB
								if(db[addon.name] && (db[addon.name].fileVersion == addon.fileVersion) && Object.keys(db[addon.name].transDesc).length){
									addon.transDesc = JSON.parse(db[addon.name].transDesc);
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


								
								var doAddSame = false;

								var isPrimitive = typeof sameAddons !== 'object';
								var key, length;
								for (key = 0, length = sameAddons.length; key < length; key++) {
									if (isPrimitive || key in sameAddons) {
										var samead = sameAddons[key];

										var substr = addon.name.substring(0, (samead.name.length > addon.name.length ? addon.name.length : samead.name.length+1) );
										var sim = similarity(samead.name, substr);
										
										if(sim < 1.0) //if similiraty is not the same
										{
											if(sim >= 0.75) //if the similarity is >= 75% we add it to the list
											{
												var idx = addonList[samead.name].addons.indexOf(addon);
												if(idx == -1)
												{
													addon.similarto = samead.name;
													addonList[samead.name].addons.push(addon);

													doAddSame = false;

													break;
												}
											}else{
												if(!inList.includes(addon.name))
													doAddSame = true;
											}
										}else{
											if(!inList.includes(addon.name))
												doAddSame = true;
										}
									}
								}
								if(doAddSame || sameAddons.length === 0)
								{
									sameAddons.push({name: addon.name, obj: addon})
									inList.push(addon.name);
									addons.push(addon);
									addon.similarto = addon.name;

									addonList[addon.name] = {
										obj: addon,
										addons: [addon]
									};
								}
							});
						}
						idx++;
					});
					$log.info("finished");

					angular.forEach(addons, function(addon){
						var hasInstalled = false;

						angular.forEach(addonList[addon.name].addons, function(addonObj){
							var addonToCheck = addonObj;
							
							if(!hasInstalled)
							{
								//check for installed addons and swap									
								if(addonToCheck.isInstalled && addonToCheck.installedFileVersion == addonToCheck.fileVersion)
								{
									//addon gets replaced with addontocheck
									var idx = addons.indexOf(addon);
									addons[idx] = addonToCheck;

									hasInstalled = true;
								}
								//newest version to front
								var semver = require('semver');
								try {
									if(semver.gt(addonToCheck.fileVersion, addon.fileVersion))
									{
										var idx = addons.indexOf(addon);
										addons[idx] = addonToCheck;

									}
								}catch(err) {
									$log.info("semver version error");
								}
							}
						});

					});

					callback(addons, addonList);
				},function(reason) {
					console.dir(reason);
				});

			});

		}

		function getDependencies(callback) {
			$http.get(masterSources + "?" + new Date().toString(), {cache: false}).success(function(data) {
				return callback(data.dependencies);
			});
		}

		function similarity(s1, s2) {
			var longer = s1;
			var shorter = s2;
			if (s1.length < s2.length) {
				longer = s2;
				shorter = s1;
			}
			var longerLength = longer.length;
			if (longerLength == 0) {
				return 1.0;
			}
			return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
		}

		function similarity2(s1, s2){ var split1 = s1.split(' '); var split2 = s2.split(' '); var sum = 0; var max = 0; var temp = 0; for(var i=0; i<split1.length;i++){ max = 0; for(var j=0; j<split2.length;j++){ temp = similarity(split1[i], split2[j]); if(max < temp) max = temp; } sum += max / split1.length; } return sum; };

		function editDistance(s1, s2) {
			s1 = s1.toLowerCase();
			s2 = s2.toLowerCase();

			var costs = new Array();
			for (var i = 0; i <= s1.length; i++) {
				var lastValue = i;
				for (var j = 0; j <= s2.length; j++) {
					if (i == 0)
						costs[j] = j;
					else {
						if (j > 0) {
							var newValue = costs[j - 1];
							if (s1.charAt(i - 1) != s2.charAt(j - 1))
								newValue = Math.min(Math.min(newValue, lastValue),costs[j]) + 1;
							costs[j - 1] = lastValue;
							lastValue = newValue;
						}
					}
				}
			if (i > 0)
				costs[s2.length] = lastValue;
			}
			return costs[s2.length];
		}
	}
})();
