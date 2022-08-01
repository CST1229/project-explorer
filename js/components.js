// Components
Vue.component("navbar", {
	template: `<div id="header">
	<div id="header-content">
		<span class="header-item logo button" v-on:click="$root.setHash('')" title="(click to see about page)">
			<img v-if="$root.isPrEx" src="img/icon-prex.svg">
			<img v-else src="img/icon.svg">
			<span class="name">Project Explore<span v-if="!$root.isPrEx">r</span><s v-else>r</s></span>
		</span>
		<span class="header-item projtitle header-input">{{$root.projTitle}}</span>
		<input v-if="$root.allowProjectLoads" id="projIDInput" v-model="$root.idInputVal" v-on:change="$root.setHash($root.idInputVal)" class="header-item projid header-input" placeholder="Enter a project ID/URL...">
		<span v-if="$root.allowProjectLoads" class="header-item button" v-on:click="$root.filePicker()">
			<img class="upload-image" title="Upload File" alt="Upload File" src="img/upload.svg">
		</span>
		<input v-on:change="$root.uploadFile()" accept=".sb3, .json" type="file" id="upload-input">
	</div>
</div>`
});
Vue.component("asset-li", {
	props: ["asset"],
	template: `<span
	class="asset-card"
	v-bind:class="{'active': $root.selectedAsset == asset.id}"
	v-on:click="$root.selectedAsset = asset.id">
	<div class="asset-name">{{asset.name}}</div>
	<div class="format-msg">({{asset.formatMsg}})</div>
	<div class="id-msg">{{Number(asset.id)+1}}</div>
</span>
`
});
Vue.component("sprite-info", {
	props: ["sprite"],
	template: `<div>
	<h2>{{sprite.name}}</h2>
	<div v-if="sprite.msg">
		<span class="proj-msg">{{sprite.msg}}</span><br><br>
	</div>
	<div v-if="!sprite.isStage">
		<b>Position:</b> {{sprite.x}}, {{sprite.y}}<br>
		<b>Direction:</b> {{sprite.direction}}<br>
		<b>Size:</b> {{sprite.size}}<br>
		<b>Visible:</b> {{sprite.visibleMsg}}<br>
	</div>
	<b>Current costume:</b> {{sprite.costumes[sprite.costume].name}}<br>
	<b>Volume:</b> {{sprite.volume}}<br>
	<b>Layer:</b> {{sprite.layer}}<br>
	<div v-if="!sprite.isStage">
		<b>Draggable:</b> {{sprite.draggableMsg}}<br>
		<b>Rotation style:</b> {{sprite.rotStyle}}<br>
	</div>
</div>
`
});
Vue.component("code-info", {
	props: ["sprite"],
	template: `<div>
	<b>Blocks:</b> {{sprite.blockCount}}<br>
	<b>Comments:</b> {{sprite.commentCount}}<br>
</div>
`
});
Vue.component("sprite-list", {
	props: ["sprite"],
	template: `<div
	class="sprites-li"
	v-on:click="$root.selectedSprite = sprite.id; $root.selectedAsset = -1"
	v-bind:class="{'sprites-highlighted': $root.selectedSprite == sprite.id}"
>
	<span>{{sprite.name}}</span>
</div>`
});
Vue.component("sprite-tab", {
	props: ["name", "id"],
	template: `<span
	class="sprite-tab"
	v-on:click="$root.selectedTab = id; $root.selectedAsset = -1"
	v-bind:class="{'sprites-highlighted': $root.selectedTab == id}"
	>{{name}}</span>`
});
Vue.component("asset-view", {
	props: ["asset"],
	template: `<div class="asset-viewer" v-bind:key="asset.id">
	<div v-if="!asset.isSound" class="image-viewer">
		<img :src="asset.url">
	</div>
	<div v-else class="sound-viewer">
		<audio controls>
			<source :src="asset.url">
		</audio>
	</div>
	<span class="asset-name">{{asset.name}}</span>
	<div class="download-button">
		<a :href="asset.url" :download="asset.name">Download</a>
		<span v-if="!asset.isSound && !$root.fileMode">
			| <a target="_blank" :href="'https://gosoccerboy5.github.io/view-images/#' + asset.url">View (fullscreen)</a>
		</span>
	</div>
</div>`
});
