//Start
var v = new Vue({
	el: "#app",
	data: {
		selectedSprite: 0,
		selectedTab: 0,
		projTitle: "Project Explorer",
		projectReady: -2,
		projectMessage: "",
		project: {},
		selectedAsset: -1,
		idInputVal: ""
	},
	methods: methods
});

v.idInputVal = "";