(function() {
	'use strict';

	angular
		.module('app')
		.factory('readmeretriever', readmeretriever);

	readmeretriever.$inject = ['$log'];

	function readmeretriever($log) {
		var service = {
			getReadme : getReadme
		};

		return service;

		function getReadme(addon, callback) {
			var request = require('request');

			getReadmeUrl(addon, function(readmeUrl) {
				$log.info(`Retrieving readme for ${addon.name} at ${readmeUrl}`);
				var fileRequest = request.get(readmeUrl, function(error, response, body) {
					$log.info(`readme status code: ${response.statusCode}`);

					if(response.statusCode === 200) {
						$log.info("Retrieving readme successful.");
						return callback(true, body);
					}else{
						getReadmeUrlByName(addon, function(readmeUrl) {
							$log.info(`Retrieving readme for ${addon.name} at ${readmeUrl}`);
							var fileRequest = request.get(readmeUrl, function(error, response, body) {
								$log.info(`readme status code: ${response.statusCode}`);
								if(response.statusCode === 200) {
									$log.info("Retrieving readme successful.");
									return callback(true, body);
								}else{
									$log.info("Retrieving readme failed, trying second address.");
									getReadmeUrl2(addon, function(readmeUrl) {
										$log.info(`Retrieving readme for ${addon.name} at ${readmeUrl}`);
										var fileRequest = request.get(readmeUrl, function(error, response, body) {
											$log.info(`readme status code: ${response.statusCode}`);

											if(response.statusCode === 200) {
												$log.info("Retrieving readme successful.");
												return callback(true, body);
											}else{
												$log.info("Retrieving readme failed.");
												return callback(false);
											}
										});
									});
								}
							});
						});
					}
				});
			});
			
		}

		function getReadmeUrl(addon, callback) {
			var readmeUrl = `https://raw.githubusercontent.com/${addon.repo}/master/${addon.file}/README.md`;

			return callback(readmeUrl);
		}
		function getReadmeUrl2(addon, callback){
			var readmeUrl = `https://raw.githubusercontent.com/${addon.repo}/master/README.md`;

			return callback(readmeUrl);
		}
		function getReadmeUrlByName(addon,callback){
			var readmeUrl = `https://raw.githubusercontent.com/${addon.repo}/master/${addon.name.replace(/\s+/g, "")}/README.md`;

			return callback(readmeUrl);
		}
	}
})();
