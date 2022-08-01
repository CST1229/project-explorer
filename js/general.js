// Start

import methods from "./methods.js";
import "./components.js";

window.isHomePage = window.isHomePage === undefined ? true : window.isHomePage
window.v = new Vue({
	el: "#app",
	data: {
		version: "1.5.0",
		
		selectedSprite: 0,
		selectedTab: 0,
		selectedAsset: -1,
		
		projTitle: "Project Explorer",
		projectMessage: "",
		projectReady: -2,
		isHomePage: window.isHomePage,
		project: {},

		// Enables "file mode" - changes some things
		// to accomodate blob URLs
		fileMode: false,
		// List of said blob URLs
		files: {},
		
		idInputVal: "",

		ignoreHashChange: false,
		
		allowProjectLoads: window.isHomePage,
		
		// April Fools: Project Explore mode
		isPrEx: false,
	},
	methods,
	mounted: methods.init,
});

// Force Project Explore mode with ?afd
if (new URLSearchParams(location.search.substring(1)).has("afd")) {
	document.documentElement.classList.add("prex");
	v.isPrEx = true;
	v.version = "9000.0.2";
}