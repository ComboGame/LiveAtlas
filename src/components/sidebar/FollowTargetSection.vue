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
	<section class="sidebar__section following">
		<h2>{{ heading }}</h2>

		<div :class="{'following__target': true, 'following__target--hidden': target.hidden}">
			<PlayerImage v-if="imagesEnabled" :player="target" class="target__icon" width="48" height="48"></PlayerImage>
			<span class="target__name" v-html="target.displayName"></span>
			<span class="target__status">{{ status }}</span>
			<button type="button" class="target__location" @click="copyLocation">{{ location }}&#8288;</button>
			<button class="target__unfollow" type="button" :title="messageUnfollowTitle"
				@click.prevent="unfollow" :aria-label="messageUnfollow">
				<SvgIcon name="cross"></SvgIcon>
			</button>
		</div>
	</section>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue";
import {LiveAtlasPlayer} from "@/index";
import {useStore} from "@/store";
import {MutationTypes} from "@/store/mutation-types";
import {copyWithNotification} from '@/util';
import SvgIcon from "@/components/SvgIcon.vue";
import "@/assets/icons/cross.svg";
import PlayerImage from "@/components/PlayerImage.vue";

export default defineComponent({
	name: 'FollowTargetSection',
	components: {PlayerImage, SvgIcon},
	props: {
		target: {
			type: Object as () => LiveAtlasPlayer,
			required: true
		}
	},
	setup(props) {
		const store = useStore(),
			imagesEnabled = computed(() => store.state.components.players.showImages),

			heading = computed(() => store.state.messages.followingHeading),
			messageUnfollow = computed(() => store.state.messages.followingUnfollow),
			messageUnfollowTitle = computed(() => store.state.messages.followingTitleUnfollow),
			messageHidden = computed(() => store.state.messages.followingHidden),

			status = computed(() => {
				if (props.target.hidden) {
					return messageHidden.value;
				}

				const world = store.state.worlds.get(props.target.location.world || '');
				return world ? world.displayName : messageHidden.value;
			}),

			location = computed(() => {
				if (props.target.hidden) {
					return '';
				}

				return `${Math.floor(props.target.location.x)}, ${props.target.location.y}, ${Math.floor(props.target.location.z)}`;
			}),

			unfollow = () => {
				store.commit(MutationTypes.CLEAR_FOLLOW_TARGET, undefined);
			};

		return {
			imagesEnabled,
			unfollow,
			heading,
			messageUnfollow,
			messageUnfollowTitle,
			messageHidden,
			status,
			location,
			copyLocation: () => location.value && copyWithNotification(store, location.value),
		}
	},
});
</script>

<style lang="scss" scoped>
	.sidebar__section.following {
		margin-top: auto;
		flex: 0 0 auto;
		position: sticky;
		bottom: 0.2rem;
		z-index: 3;

		h2 {
			font-size: 1.1rem;
			line-height: 1;
			font-family: var(--font-body);
			font-weight: 600;
			letter-spacing: 0.14em;
			text-transform: uppercase;
			color: var(--text-subtle);
			display: flex;
			align-items: center;
			gap: 0.8rem;
			margin-bottom: 1.4rem;

			/* Индикатор «в эфире» */
			&:before {
				content: '';
				width: 0.8rem;
				height: 0.8rem;
				border-radius: 50%;
				background-color: var(--state-ok);
				animation: live-pulse 1.8s ease-out infinite;
			}
		}

		.following__target {
			display: grid;
			grid-template-columns: min-content 1fr;
			grid-template-rows: 1fr min-content min-content min-content 1fr;
			grid-template-areas: "icon ." "icon name" "icon status" "icon location" "icon .";
			grid-auto-flow: column;
			align-items: center;
			row-gap: 0.3rem;

			.target__unfollow {
				position: absolute;
				top: 1.2rem;
				right: 1.2rem;
				width: 2.8rem;
				height: 2.8rem;
				border-radius: 50%;
				background-color: var(--background-hover);

				&:hover {
					background-color: rgba(255, 255, 255, 0.12);
					color: #fff;
				}

				.svg-icon {
					width: 1.1rem !important;
					height: 1.1rem !important;
				}

				&:before {
					content: '';
					position: absolute;
					display: block;
					top: -1rem;
					right: -1rem;
					bottom: -1rem;
					left: -1rem;
				}
			}

			.target__icon {
				margin-right: 1.4rem;
				grid-area: icon;
				border-radius: 1rem;
				box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
			}

			.target__name {
				grid-area: name;
				color: var(--text-emphasis);
				font-weight: 600;
				font-size: 1.6rem;
			}

			.target__status {
				grid-area: status;
				font-size: 1.3rem;
				color: var(--text-subtle);
			}

			.target__location {
				grid-area: location;
				font-family: var(--font-pixel);
				font-size: 1.3rem;
				font-weight: 400;
				color: var(--text-base);
				cursor: pointer;
				text-align: left;
				background-color: transparent;
				padding: 0;
				line-height: 1.6rem;
				justify-self: start;

				&:hover {
					color: var(--text-emphasis);
					background-color: transparent;
				}
			}

			&.following__target--hidden {
				.target__icon {
					filter: grayscale(1);
					opacity: 0.5;
					box-shadow: 0 0 0 0.2rem var(--border-strong);
				}
			}

			> * {
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
		}

		@media (max-width: 480px), (max-height: 480px) {
			margin-top: 0;
		}
	}
</style>
