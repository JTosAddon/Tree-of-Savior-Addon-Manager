(function() {
	'use strict';

	angular
		.module('app')
		.controller('SettingsController', SettingsController);

	SettingsController.$inject = ['$http','settings','$translate'];

	var xml2js = require('xml2js'),
	    parser = new xml2js.Parser(),
		moment = require('moment')

	/* @ngInject */
	function SettingsController($http,settings,$translate) {
		var vm = this;
		vm.thisVersion = require('./package.json').version;
		vm.latestVersion = vm.thisVersion
		var JTosSource = "https://raw.githubusercontent.com/JTosAddon/Addons/master/managers.json";
		getAddonsDate($http,vm,JTosSource,settings.JTos)
		var ITosSource = "https://raw.githubusercontent.com/JTosAddon/Addons/itos/managers.json";
		getAddonsDate($http,vm,ITosSource,settings.ITos)

		settings.getTreeOfSaviorDirectory(function(treeOfSaviorDirectory) {
			vm.treeOfSaviorDirectory = treeOfSaviorDirectory;
			validateDirectory();
		});

	

		vm.browseForDirectory = function() {
			var remote = require('electron').remote;
			var dialog = remote.dialog;
			var directories = dialog.showOpenDialog({ properties: ['openDirectory']});

			if(directories && directories.length > 0) {
				vm.treeOfSaviorDirectory = directories[0];
				settings.saveTreeOfSaviorDirectory(vm.treeOfSaviorDirectory);
				validateDirectory();
			}
		};

		vm.isValidDirectory = function() {
			return settings.getIsValidDirectory();
		};
		vm.isLatestVersion = function(){
			return (vm.thisVersion == vm.latestVersion)?true:false;
		}
		vm.resetInstalledAddons = function (){
			var data = {installedAddons:null}

			require('electron-json-storage').set("addons", data, function(error) {
				const defaultMessage = $translate.instant('SETTINGS.CLEAR_DEFAULT_ERROR');
				alert(error || defaultMessage);
			});
		}
		function validateDirectory() {
			var fs = require("fs");
			var exe = vm.treeOfSaviorDirectory + "/release/Client_tos.exe";

			fs.stat(exe, function(error, stat) {
				if(error == null) {
					settings.setIsValidDirectory(true);
				} else {
					settings.setIsValidDirectory(false);
				}
			});
		}
	}
	function getAddonsDate($http,vm,sourceUrl,setting){
		setting.date = {}
		$http.get(sourceUrl + "?" + new Date().toString(), {cache: false}).success(function(data) {
			setting.data = data;
			vm.latestVersion =  data.version || vm.latestVersion
			angular.forEach(data.sources, function(source) {
				_getAddonsDate($http,vm,setting,source,'')
			});
			setting.isLoad = true;
		});
	}
	function _getAddonsDate($http,vm,setting,source,nextPageUrl){
		var url = `https://github.com/${source.repo}/releases.atom` + nextPageUrl
		$http.get(url).success(function(sourceData) {
			parser.parseString(sourceData, function (err, result) {
				var entry = result.feed.entry
				for (var i in entry){
					var  date = entry[i].updated[0].replace(/T.*/,"").split(/-/)
					date[1] -=  1
					var releaseTag = entry[i].id[0].match(/[^\/]*$/)
					setting.date[releaseTag[0]] = moment(date)
				if( i == 9)
					_getAddonsDate($http,vm,setting,source,'?after='+releaseTag)
				}
			});
		});
	}
})();
