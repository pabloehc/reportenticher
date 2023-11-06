<?php

return [
	'routes' => [
		// this tells Nextcloud to link GET requests to /index.php/apps/reportenricher/ with the "mainPage" method of the PageController class
		['name' => 'page#mainPage', 'url' => '/', 'verb' => 'GET'],
		// this tells Nextcloud to link PUT requests to /index.php/apps/reportenricher/config with the "saveConfig" method of the PageController class
		['name' => 'page#saveConfig', 'url' => '/config', 'verb' => 'PUT'],
	],
];