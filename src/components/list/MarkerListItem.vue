<!--
  - Copyright 2022 James Lyne
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  - http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
	<input :id="`marker-${id}`" type="radio" name="marker" v-bind:value="id" @click.prevent="pan">
	<label :for="`marker-${id}`" class="marker" :title="marker.tooltip" @click.prevent="pan">
		<img width="16" height="16" v-if="icon" class="marker__icon" :src="icon" alt="" />
		<SvgIcon v-else :name="defaultIcon" class="marker__icon"></SvgIcon>
		<span class="marker__text">
			<span class="marker__label">{{ marker.tooltip || messageUnnamed }}</span>
			<span class="marker__location">X: {{ location.x }}, Z: {{ location.z }}</span>
		</span>
	</label>
</template>

<script lang="ts">
import {defineComponent, computed} from 'vue';
import {useStore} from "vuex";
import {LiveAtlasMarker, LiveAtlasPathMarker, LiveAtlasPointMarker} from "@/index";
import {MutationTypes} from "@/store/mutation-types";
import SvgIcon from "@/components/SvgIcon.vue";
import {LiveAtlasMarkerType} from "@/util/markers";
import "@/assets/icons/marker_point.svg";
import "@/assets/icons/marker_line.svg";
import "@/assets/icons/marker_area.svg";
import "@/assets/icons/marker_circle.svg";

export default defineComponent({
	name: 'MarkerListItem',
	components: {SvgIcon},
	props: {
		id: {
			type: String,
			required: true,
		},
		marker: {
			type: Object as () => LiveAtlasMarker,
			required: true
		}
	},

	setup(props) {
		const store = useStore(),
			messageUnnamed = computed(() => store.state.messages.markersUnnamed),
			location = computed(() => ({
				x: Math.round(props.marker.location.x),
				z: Math.round(props.marker.location.z),
			})),
			icon = computed(() => {
				if('iconUrl' in props.marker) {
					return (props.marker as LiveAtlasPointMarker).iconUrl;
				}

				return undefined;
			}),
			defaultIcon = computed(() => {
				switch(props.marker.type) {
					case LiveAtlasMarkerType.POINT:
          default:
						return 'marker_point';
					case LiveAtlasMarkerType.AREA:
						return 'marker_area';
					case LiveAtlasMarkerType.LINE:
						return 'marker_line';
					case LiveAtlasMarkerType.CIRCLE:
						return 'marker_circle';
				}
			});

		const pan = () => {
			if(props.marker.type === LiveAtlasMarkerType.POINT) {
				store.commit(MutationTypes.SET_VIEW_TARGET, {
					location: props.marker.location,
				});
			} else {
				store.commit(MutationTypes.SET_VIEW_TARGET, {
					location: (props.marker as LiveAtlasPathMarker).bounds,
					options: {
						padding: [10, 10]
					}
				});
			}
		}

		return {
			icon,
			defaultIcon,
			messageUnnamed,
			pan,
			location,
		}
	}
});
</script>

<style lang="scss" scoped>
	input[type=radio] + .marker {
		display: flex;
		align-items: center;
		gap: 1.2rem;
		padding: 0.8rem 1rem;
		white-space: normal;

		.marker__icon {
			flex: 0 0 auto;
			width: 1.6rem;
			height: 1.6rem;
			max-width: none;
			position: static;
			margin: 0;
		}

		.marker__text {
			display: flex;
			flex-direction: column;
			gap: 0.3rem;
			min-width: 0;
		}

		.marker__label {
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.marker__location {
			display: block;
			font-size: 1.15rem;
			line-height: 1.2;
			font-family: var(--font-pixel);
			font-weight: 400;
			color: var(--text-subtle);
		}
	}
</style>
