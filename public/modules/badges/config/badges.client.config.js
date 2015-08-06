'use strict';

// Configuring the Articles module
angular.module('badges').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Badges', 'badges', 'dropdown', '/badges(/create)?');
		Menus.addSubMenuItem('topbar', 'badges', 'List Badges', 'badges');
		Menus.addSubMenuItem('topbar', 'badges', 'New Badge', 'badges/create');
	}
]);