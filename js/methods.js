//Vue methods
let methods = {};

//Method to load a project
methods.loadProject = async function(id) {
	
	this.projTitle = "Project";
	var idnum;
	//In case we already have a project loaded
	this.projectReady = false;
	
	//If the ID is not a number, it is instantly not a valid project
	if ((isNaN(id) && !(id.includes("scratch.mit.edu/projects/"))) || id === "") {
		this.projectMessage = "Project ID is not a number. Make sure to use the project ID, not the URL.";
		return;
	} else {
		idnum = id.replace("https://", "").replace("http://", "").replace("scratch.mit.edu/projects/", "").replace("/", "")
	}
	
	function doProjectName() {
		//Fetch project name from ScratchDB
		fetch(`https://scratchdb.lefty.one/v3/project/info/${id}`)
			.then(async function(r) {
				if (!r.ok) return; 
				
				let t = await(r.text());
				
				try {JSON.parse(t);} catch(e) {return;}
				
				const J = JSON.parse(t);
				if (J.code) {return;}
				
				v.projTitle = J.title;
			})
	}
	
	//Init variables
	let t = "";
	let response = "";
	
	//Loading message
	this.projectMessage = "Getting project...";
	
	await fetch(`https://projects.scratch.mit.edu/${id}`)
		.then((resp) => {response = resp; return resp.text()})
		.then((text) => {t = text;});
	if (!response.ok) {
		this.projectMessage = "Project not found.";
	}
	try {
		JSON.parse(t);
	} catch(e) {
		if (t.startsWith("ScratchV")) {
			this.projectMessage = "Scratch 1.x projects are not supported.";
			doProjectName();
		}
		return;
	}
	const PROJECT = JSON.parse(t);
	if (PROJECT.code) {
		this.projectMessage = "Project not found.";
		return;
	}
	if (PROJECT.objName) {
		this.projectMessage = "Scratch 2.0 projects are not supported yet.";
		doProjectName();
		return;
	}
	
	this.projectMessage = "Loading project...";
	
	//Ready up project metadata
	this.project.meta = {};
	this.project.meta.scratchVer = PROJECT.meta.semver;
	this.project.meta.vmVer = PROJECT.meta.vm;
	this.project.meta.browserOS = PROJECT.meta.agent;
	
	this.project.blockCount = 0;
	this.project.commentCount = 0;
	
	this.project.sprites = [];
	//Add all sprites to our project
	for (const TARGETIDX in PROJECT.targets) {
		const TARGET = PROJECT.targets[TARGETIDX];
		const SPRITE = {};
		SPRITE.name = TARGET.name;
		SPRITE.id = TARGETIDX;
		
		//Common variables
		SPRITE.isStage = TARGET.isStage;
		if (!TARGET.isStage) {
			SPRITE.visible = TARGET.visible;
			SPRITE.visibleMsg = SPRITE.visible ? "Yes" : "No";
			SPRITE.x = TARGET.x;
			SPRITE.y = TARGET.y;
			SPRITE.size = TARGET.size;
			SPRITE.direction = TARGET.direction;
			SPRITE.draggable = TARGET.draggabble;
			SPRITE.draggableMsg = SPRITE.draggable ? "Yes" : "No";
			SPRITE.rotStyle = TARGET.rotationStyle;
		}
		SPRITE.costume = TARGET.currentCostume;
		
		//Code
		SPRITE.comments = TARGET.comments;
		SPRITE.blocks = TARGET.blocks;
		
		//Misc variables
		SPRITE.volume = TARGET.volume;
		SPRITE.layer = TARGET.layerOrder;
		if (TARGET.isStage) {
			SPRITE.tempo = TARGET.tempo;
			
			//Video
			SPRITE.vTrans = TARGET.videoTransparency;
			SPRITE.vState = TARGET.videoState;
			
			//Also broadcasts too
			SPRITE.broadcasts = TARGET.broadcasts;
		}
		
		//Store count
		SPRITE.blockCount = Object.keys(SPRITE.blocks).length;
		SPRITE.commentCount = Object.keys(SPRITE.comments).length;
		//Add to the totals as well
		this.project.blockCount += SPRITE.blockCount;
		this.project.commentCount += SPRITE.commentCount;
		
		const ASSETS_URL = "https://assets.scratch.mit.edu/";
		
		//Costumes
		SPRITE.costumes = [];
		for (const COSTIDX in TARGET.costumes) {
			const COST = TARGET.costumes[COSTIDX];
			SPRITE.costumes.push({
				name: COST.name,
				md5: COST.md5ext,
				format: COST.dataFormat,
				isSound: false,
				formatMsg: `${COST.dataFormat==="svg"?"Vector":"Bitmap"}, ${COST.dataFormat.toUpperCase()}`,
				url: `${ASSETS_URL}${COST.md5ext}`,
				id: COSTIDX
			});
		}
		
		//Sounds
		SPRITE.sounds = [];
		for (const SNDIDX in TARGET.sounds) {
			const SND = TARGET.sounds[SNDIDX];
			SPRITE.sounds.push({
				name: SND.name,
				md5: SND.md5ext,
				format: SND.dataFormat,
				isSound: true,
				formatMsg: SND.dataFormat.toUpperCase(),
				url: `${ASSETS_URL}${SND.md5ext}`,
				id: SNDIDX
			});
		}
		
		this.project.sprites.push(SPRITE);
	}
	
	//Finally, we are done, now we can show
	
	//Mimic Scratch behavior: If there is at least 1 non-stage sprite, show that by default
	if (this.project.sprites.length > 0) {
		this.selectedSprite = 1;
	} else {
		this.selectedSprite = 0;
	}
	this.projectMessage = "Done!";
	this.projectReady = true;
	this.projTitle = "Project";
	doProjectName();
}

methods.promptForProject = function() {
	let projID = prompt("Please enter a project ID. Only Scratch 3.0 projects work, and you can use unshared projects.")
	if (projID === null) return;
	this.loadProject(projID);
}

methods.showAboutScreen = function() {
	this.projectReady = -2; 
	this.idInputVal = ""; 
	this.projTitle = "About";
}
