//Start
var v = new Vue({
	el: "#app",
	data: {
		selectedSprite: 0,
		selectedTab: 0,
		projTitle: "Project Explorer",
		projectReady: 0,
		projectMessage: "",
		project: {},
		selectedAsset: -1
	},
	methods: {
		loadProject: methods.loadProject,
		promptForProject: methods.promptForProject
	}
});