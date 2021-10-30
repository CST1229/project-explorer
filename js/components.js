//Components
Vue.component("navbar", {
	template: `<div id="header">
	<div id="header-content">
		<span class="header-item logo">Project Explorer</span>
		<span class="header-item projtitle header-input">{{$parent.projTitle}}</span>
		<!--
		<input type="number" class="header-item projid header-input" placeholder="Enter a project ID...">
		-->
		<span class="header-item about button"><img v-on:click="$parent.promptForProject" src="img/load.svg" alt="Load Project"></span>
		<span class="header-item about button"><img onclick="alert('Project Explorer v1.1.1\\nA Scratch project.json viewer\\nBy CST1229\\n\\nCredits:\\nScratch, obiviously\\nTurboWarp, for providing a project API mirror that accepts cross-origin requests\\nA certain social media made by Jeffalo, for color scheme inspiration (more like stealing /s)\\nIconify, for the header icons\\nProbably others that I forgot\\n\\nThis site is not affiliated with Scratch, its Team or any other of its stuff.')" src="img/info.svg" alt="About"></span>
	</div>
</div>`
});
Vue.component("asset-li", {
	props: ["asset"],
	template: `<span
	class="asset-card"
	v-bind:class="{'active': $parent.selectedAsset == asset.id}"
	v-on:click="$parent.selectedAsset = asset.id">
	<div class="asset-name">{{asset.name}}</div>
	<div class="format-msg">({{asset.formatMsg}})</div>
	<div class="id-msg">{{Number(asset.id)+1}}</div>
</span>
`
});
Vue.component("sprite-info", {
	props: ["sprite"],
	template: `<div>
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
	v-on:click="$parent.selectedSprite = sprite.id; $parent.selectedAsset = -1"
>
	<span
		v-bind:class="{'sprites-highlighted': $parent.selectedSprite == sprite.id}"
	>{{sprite.name}}</span>
</div>`
});
Vue.component("sprite-tab", {
	props: ["name", "id"],
	template: `<span
	class="sprite-tab"
	v-on:click="$parent.selectedTab = id; $parent.selectedAsset = -1"
	v-bind:class="{'sprites-highlighted': $parent.selectedTab == id}"
	>{{name}}</span>`
});
Vue.component("asset-view", {
	props: ["asset"],
	template: `<div class="asset-viewer">
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
		<a :href="asset.url">Download</a>
		<span v-if="!asset.isSound">
			| <a target="_blank" :href="'https://gosoccerboy5.github.io/view-images/#' + asset.url">View (fullscreen)</a>
		</span>
	</div>
</div>`
});