<script lang="ts">
import {defineComponent, onMounted, onUnmounted} from "vue";
import {LiveAtlasBrandConfig} from "@/index";
import {BrandControl} from "@/leaflet/control/BrandControl";
import LiveAtlasLeafletMap from "@/leaflet/LiveAtlasLeafletMap";

export default defineComponent({
	props: {
		brand: {
			type: Object as () => LiveAtlasBrandConfig,
			required: true,
		},
		leaflet: {
			type: Object as () => LiveAtlasLeafletMap,
			required: true,
		}
	},

	setup(props) {
		const control = new BrandControl({
			position: 'topleft',
			brand: props.brand,
		});

		onMounted(() => props.leaflet.addControl(control));
		onUnmounted(() => props.leaflet.removeControl(control));
	},

	render() {
		return null;
	}
})
</script>
