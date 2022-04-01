// Start

// Da funnis

window.isHomePage = window.isHomePage === undefined ? true : window.isHomePage
const v = new Vue({
	el: "#app",
	data: {
		version: "1.4.1",
		
		selectedSprite: 0,
		selectedTab: 0,
		
		projTitle: "Project Explorer",
		projectMessage: "",
		projectReady: -2,
		isHomePage: window.isHomePage,
		project: {},
		
		selectedAsset: -1,
		idInputVal: "",
		
		allowProjectLoads: window.isHomePage,
		
		isPrEx: false,
	},
	methods: methods,
	mounted: methods.init,
});

if (true || new URLSearchParams(location.search.substring(1)).has("afd")) {
	document.documentElement.classList.add("prex");
	v.isPrEx = true;
	v.version = "9000.0.1";
}