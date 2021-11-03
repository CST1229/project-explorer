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

const loadHash = (h) => {
	let hashText = h.substring(1);
	v.idInputVal = hashText;
	v.loadProject(hashText);
}

if (location.hash) {
	loadHash(location.hash);
} else {
	v.idInputVal = "";
}

window.addEventListener("hashchange", ()=>{loadHash(location.hash);}, false);