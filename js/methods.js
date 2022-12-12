// Import JSZip
import "../lib/jszip.min.js";
const JSZip = window.JSZip;
delete window.JSZip;

// Vue methods
let methods = {};

methods.showAboutScreen = function() {
	if (!this.isHomePage) return;

	this.clearFiles();
	
	this.projectReady = -2; 
	this.idInputVal = ""; 
	this.projTitle = "About";
	document.title = "Project Explorer";
};

methods.loadURL = async function(url) {
	this.fileMode = false;
	this.clearFiles();

	if (!this.allowProjectLoads) return;

	url = decodeURIComponent(url);

	if (url === "" || url === "#") {
		// Load about page if no hash is specified
		this.showAboutScreen();
		return;
	}
	
	this.projTitle = "Project";
	document.title = "Project - Project Explorer";
	// In case we already have a project loaded
	this.projectReady = 0;
		
	// If the URL does not contain a number, it is instantly not a valid project
	let id = url.match(/[-\d]+/);
	if (id) {
		id = id[0];
	}
	if (id < 1) {
		if (id === null) {
			this.projectMessage = url + " does not seem to contain a number.";
		} else {
			if (id < 0) {
				this.projectMessage = "...project IDs can't be negative?";
			} else if (id * 1 === 0){
				this.projectMessage = "Project IDs cannot be 0.";
			} else {
				// Just in case
				this.projectMessage = url + " does not seem to be a valid project URL or ID.";
			}
		}
		return;
	}
	
	// Loading message
	this.projectMessage = "Getting project...";

	let projTitle, token, originalToken;
	try {
		const apiResp = await fetch(`https://trampoline.turbowarp.org/proxy/projects/${id}`);

		if (apiResp.ok) {
			const apiJson = await apiResp.json();
			projTitle = apiJson.title;
			originalToken = apiJson.project_token;
		}
	} catch(e) {}

	// Allow specify token through a URL parameter
	token = new URLSearchParams(location.search.substring(1)).get("token")
		|| new URLSearchParams(location.hash.substring(location.hash.indexOf("?"))).get("token")
		|| new URLSearchParams(location.hash).get("token")
		|| originalToken;

	let response = await fetch(`https://projects.scratch.mit.edu/${id}?${
		new URLSearchParams({token}).toString()
	}`);
	let t = await response.text();

	if (projTitle !== undefined) {
		this.projTitle = projTitle;
		document.title = projTitle + " - Project Explorer";
	}

	if (!response.ok) {
		// Try again with the original token, just in case
		response = await fetch(`https://projects.scratch.mit.edu/${id}?${
			new URLSearchParams({originalToken}).toString()
		}`);
		t = await response.text();

		if (!response.ok) {
			this.projectMessage = `Project ID ${id} was either not found or is unshared.`;
			if (token !== originalToken) {
				this.projectMessage = ` The project token you specified might have expired.`;
			}
			return;
		}
	}

	this.loadFile(t);
};

// Clears all loaded files.
methods.clearFiles = function() {
	for (const name in this.files) {
		this.clearFile(name);
	}
}
methods.clearFile = function(name) {
	if (!this.files[name]) return;
	URL.revokeObjectURL(this.files[name]);
}

methods.loadFile = async function(file) {
	this.clearFiles();
	let PROJECT = null;

	this.fileMode = false;

	let text;
	if (file instanceof Blob) {
		text = await file.text();
	} else {
		text = file;
	}

	try {
		PROJECT = JSON.parse(text);
	} catch(e) {
		if (text.startsWith("PK")) {
			try {
				// This file is either an SB3, or SB2 or some other zip -
				// enable file mode and pass its project.json
				// to PROJECT
				this.fileMode = true;

				this.projectMessage = "Loading zip...";

				const zip = await JSZip.loadAsync(await file.arrayBuffer());

				let fileCount = Object.keys(zip.files).length;
				let filesLoaded = 0;

				this.projectMessage = `Loading zip... (${filesLoaded}/${fileCount})`;

				for (const filename in zip.files) {
					const entry = zip.files[filename];
					
					if (entry.dir) {
						return;
					};

					this.clearFile(entry.name);
					if (entry.name === "project.json") {
						try {
							PROJECT = JSON.parse(await entry.async("string"));
						} catch(e) {}
					} else {
						// Create a File so we can specify the MIME type for SVGs to work
						const file = new File([await entry.async("arraybuffer")], entry.name, {
							type: entry.name.endsWith(".svg") ? "image/svg+xml" : "",
						});

						this.files[entry.name] = 
							URL.createObjectURL(file);
					}
					this.projectMessage = `Loading zip... (${++filesLoaded}/${fileCount})`;
				}

				if (!PROJECT) {
					this.projectMessage =
						"This zip file is missing a project.json - is it even an SB3?";
					return;
				}
			} catch(e) {
				console.error("error loading zip:", e);
				this.projectMessage = "Error loading zip: " + e.toString();
				return;
			}
		} else {
			if (file.startsWith("ScratchV")) {
				this.projectMessage = "Scratch 1.x projects are not supported.";
			} else {
				this.projectMessage =
					"This project doesn't seem to be a valid project.json or zip file.";
			}
			return;
		}
	}

	if (PROJECT.code) {
		console.log("the error which is sent in json for some reason")
		this.projectMessage = "Project not found.";
		return;
	}
	if (PROJECT.objName) {
		this.projectMessage = "Scratch 2.0 projects are not supported yet.";
		return;
	}

	if (!PROJECT.targets) {
		this.projectMessage = "This file doesn't seem to be a valid SB3 project.json.";
		return;
	}
	
	this.projectMessage = "Loading project...";
	
	// Ready up project metadata
	this.project.meta = {};
	this.project.meta.scratchVer = PROJECT.meta.semver;
	this.project.meta.vmVer = PROJECT.meta.vm;
	this.project.meta.browserOS = PROJECT.meta.agent;
	
	this.project.blockCount = 0;
	this.project.commentCount = 0;
	
	// Why not
	this.project.original = PROJECT;
	
	this.project.sprites = [];
	// Add all sprites to our project
	for (const TARGETIDX in PROJECT.targets) {
		const TARGET = PROJECT.targets[TARGETIDX];
		const SPRITE = {};
		SPRITE.name = TARGET.name;
		SPRITE.id = TARGETIDX;
		
		// Common variables
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
		
		// Code
		SPRITE.comments = TARGET.comments;
		SPRITE.blocks = TARGET.blocks;
		
		// Misc variables
		SPRITE.volume = TARGET.volume;
		SPRITE.layer = TARGET.layerOrder;
		if (TARGET.isStage) {
			SPRITE.tempo = TARGET.tempo;
			
			// Video
			SPRITE.vTrans = TARGET.videoTransparency;
			SPRITE.vState = TARGET.videoState;
			
			// Also broadcasts too
			SPRITE.broadcasts = TARGET.broadcasts;
		}
		
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
		
		// Store count
		SPRITE.blockCount = Object.keys(SPRITE.blocks).length;
		SPRITE.commentCount = Object.keys(SPRITE.comments).length;
		// Add to the totals as well
		this.project.blockCount += SPRITE.blockCount;
		this.project.commentCount += SPRITE.commentCount;
		
		const ASSETS_URL = "https://assets.scratch.mit.edu/get_image/.%2E/";
		
		// Costumes
		SPRITE.costumes = [];
		for (const COSTIDX in TARGET.costumes) {
			const COST = TARGET.costumes[COSTIDX];

			if (this.fileMode) {
				if (!this.files[COST.md5ext]) {
					this.projectMessage =
						`Error in sprite "${
							SPRITE.name
						}": file for costume "${
							COST.name
						}" (${COST.md5ext}) is missing`;
					return;
				}
			}

			SPRITE.costumes.push({
				name: COST.name,
				md5: COST.md5ext,
				format: COST.dataFormat,
				isSound: false,
				formatMsg:
					`${
						COST.dataFormat === "svg" ? "Vector" : "Bitmap"
					}, ${
						COST.dataFormat.toUpperCase()
					}`,
				url: this.fileMode ? this.files[COST.md5ext] : `${ASSETS_URL}${COST.md5ext}`,
				id: COSTIDX
			});
		}
		
		// Sounds
		SPRITE.sounds = [];
		for (const SNDIDX in TARGET.sounds) {
			const SND = TARGET.sounds[SNDIDX];

			if (this.fileMode) {
				if (!this.files[SND.md5ext]) {
					this.projectMessage =
						`Error in sprite "${
							SPRITE.name
						}": file for sound "${
							SND.name
						}" (${SND.md5ext}) is missing`;
					return;
				}
			}

			SPRITE.sounds.push({
				name: SND.name,
				md5: SND.md5ext,
				format: SND.dataFormat,
				isSound: true,
				formatMsg: SND.dataFormat.toUpperCase(),
				url: this.fileMode ? this.files[SND.md5ext] : `${ASSETS_URL}${SND.md5ext}`,
				id: SNDIDX
			});
		}
		
		this.project.sprites.push(SPRITE);
	}
	
	// Finally, we are done, now we can show
	
	// Mimic Scratch behavior: If there is at least 1 non-stage sprite, show that by default
	if (this.project.sprites.length > 0) {
		this.selectedSprite = 1;
	} else {
		this.selectedSprite = 0;
	}
	
	this.projectMessage = "Done!";
	this.projectReady = 1;
}

methods.init = function() {
	const loadHash = (h) => {
		this.ignoreHashChange = false;

		let hashText = h.substring(1);
		this.idInputVal = decodeURIComponent(hashText);
		this.loadURL(hashText);
	}
	
	window.addEventListener("hashchange", () => {
		if (this.ignoreHashChange) {
			this.ignoreHashChange = false;
			return;
		}
		loadHash(location.hash);
	}, true);
	
	if (window.location.hash && window.location.hash !== "#file") {
		loadHash(window.location.hash);
	} else {
		this.idInputVal = "";
		methods.showAboutScreen();
	}
};

methods.setHash = function(hash) {
	this.ignoreHashChange = false;
	window.location.hash = "#" + encodeURIComponent(hash);
};

methods.filePicker = function() {
	const input = document.getElementById("upload-input");
	if (!input) return;

	input.click();
};

methods.uploadFile = function() {
	const input = document.getElementById("upload-input");
	if (!input) return;

	this.ignoreHashChange = true;
	location.hash = "#file";

	this.idInputVal = "";

	const file = input.files[0];
	input.value = null;

	this.projectReady = 0;
	this.projectMessage = "Loading file...";
	
	this.projTitle = file.name;
	document.title = file.name + " - Project Explorer";

	this.loadFile(file);
};

export default methods;
