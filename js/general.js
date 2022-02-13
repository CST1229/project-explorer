//Start
window.isHomePage = window.isHomePage === undefined ? true : window.isHomePage
var v = new Vue({
	el: "#app",
	data: {
		version: "1.4",
		
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
	},
	methods: methods,
	mounted: methods.init,
});