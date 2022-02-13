//Vue methods
let methods = {};

methods.loadProject = async function(url) {
	
	if (!this.allowProjectLoads) return;
	
	this.projTitle = "Project";
	//In case we already have a project loaded
	this.projectReady = false;
		
	//If the URL does not contain a number, it is instantly not a valid project
	let id = url.match(/[-\d]+/);
	if (id) {
		id = id[0];
	}
	if (id < 1) {
		console.log(id, "is less than 1")
		if (id === null) {
			console.log("id is null")
			this.projectMessage = url + " does not seem to contain a number.";
		} else {
			if (id < 0) {
				console.log(id, "is negative")
				this.projectMessage = "...project IDs can't be negative?";
			} else if (id * 1 === 0){
				console.log("id is zero")
				this.projectMessage = "Project IDs cannot be 0.";
			} else {
				//Just in case
				console.log(id, "is invalid")
				this.projectMessage = url + " does not seem to be a valid project URL or ID.";
			}
		}
		return;
	}
	
	console.log("check passed")
	history.pushState(null, "", "#" + id);
	
	function doProjectName() {
		//Fetch project name from ScratchDB
		fetch(`https://scratchdb.lefty.one/v3/project/info/${id}`)
			.then(async function(r) {
				if (!r.ok) return; 
				
				let t = await(r.text());
				
				try {JSON.parse(t);} catch(e) {return;}
				
				const J = JSON.parse(t);
				
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
		console.log("404")
		this.projectMessage = `Project ID ${id} was not found.`;
	}
	try {
		JSON.parse(t);
	} catch(e) {
		if (t.startsWith("ScratchV")) {
			console.log("scratch 1.4")
			this.projectMessage = "Scratch 1.x projects are not supported.";
			doProjectName();
		}
		return;
	}
	const PROJECT = JSON.parse(t);
	if (PROJECT.code) {
		console.log("the error which is sent in json for some reason")
		this.projectMessage = "Project not found.";
		return;
	}
	if (PROJECT.objName) {
		console.log("scratch 2.0")
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
	
	//Why not
	this.project.original = PROJECT;
	
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
		
		//EASTER EGG
		const msgComment = Object.values(SPRITE.comments).find((c)=>c.text.startsWith("PrExMsg\n"))
		if (msgComment) {
			SPRITE.msg = msgComment.text.substring(8);
		}
		if (TARGET.isStage) {
			const gMsgComment = Object.values(SPRITE.comments).find((c)=>c.text.startsWith("PrExGeneralMsg\n"))
			if (gMsgComment) {
				this.project.generalMsg = gMsgComment.text.substring(15);
			}
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
	console.log("ebic")
	doProjectName();
}

methods.showAboutScreen = function() {
	if (!this.isHomePage) return;
	
	this.projectReady = -2; 
	this.idInputVal = ""; 
	this.projTitle = "About";
}

methods.init = function() {
	const loadHash = (h) => {
		let hashText = h.substring(1);
		this.idInputVal = hashText;
		this.loadProject(hashText);
	}
	
	window.addEventListener("hashchange", ()=>{loadHash(location.hash);}, false);
	
	if (window.location.hash) {
		loadHash(window.location.hash);
	} else {
		this.idInputVal = "";
		methods.showAboutScreen();
	}
}