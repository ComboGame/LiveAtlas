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
	<section :class="{
		'sidebar__section': true,
		'section--collapsible': collapsible,
		'section--collapsed': collapsed
	}" :data-section="name">
		<h2 class="section__heading">
			<button :id="`${name}-heading`" type="button"
              @click.prevent="toggle" :title="title"
              :aria-expanded="!collapsed" :aria-controls="`${name}-content`">
				<span>
					<slot name="heading"></slot>
				</span>
				<SvgIcon v-if="collapsible" name="arrow" :class="{'section__arrow--collapsed': collapsed}"></SvgIcon>
			</button>
		</h2>
		<div :id="`${name}-content`" class="section__content" :aria-hidden="collapsed">
			<slot></slot>
		</div>
	</section>
</template>

<script lang="ts">
import {defineComponent, computed} from "vue";
import {LiveAtlasSidebarSection} from "@/index";
import {useStore} from "@/store";
import SvgIcon from "@/components/SvgIcon.vue";
import '@/assets/icons/arrow.svg';
import {MutationTypes} from "@/store/mutation-types";

export default defineComponent({
	name: 'SidebarSection',
	components: {SvgIcon},
	props: {
		name: {
			type: String as () => LiveAtlasSidebarSection,
			required: true,
		},
		collapsible: {
			type: Boolean,
			required: false,
			default: true,
		}
	},

	setup(props) {
		const store = useStore(),
			title = computed(() => store.state.messages.toggleTitle),
			collapsed = computed(() => store.state.ui.sidebar[props.name].collapsed),
			smallScreen = computed(() => store.state.ui.smallScreen);

		const toggle = () => {
			if(!props.collapsible) {
				return;
			}

			store.commit(MutationTypes.TOGGLE_SIDEBAR_SECTION_COLLAPSED_STATE, props.name);
		}

		return {
			title,
			collapsed,
			smallScreen,
			toggle,
		}
	}
});
</script>

<style lang="scss">
	@use '../../scss/placeholders' as *;

	.sidebar__section {
		@extend %panel;
		margin-bottom: var(--ui-element-spacing);
		box-sizing: border-box;
		width: 100%;
		max-width: 28rem;
		flex: 0 0 auto;
		padding: 1.4rem;
		background-color: rgba(20, 20, 24, 0.96);

		&[hidden] {
			display: none;
		}

		.section__heading {
			cursor: pointer;
			user-select: none;
			text-align: left;
			align-items: center;
			position: sticky;
			top: -0.2rem;
			z-index: 3;
			border-radius: inherit;
			margin: -1.4rem -1.4rem 0;
			background-color: var(--background-panel);

			&, button {
				padding: 1.4rem;
			}

			button {
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
				display: flex;
				font-family: var(--font-heading);
				font-size: 1.7rem;
				font-weight: 700;
				letter-spacing: -0.01em;
				background-color: transparent;
				color: var(--text-emphasis);
				width: calc(100% + 2.8rem);
				align-items: center;
				text-shadow: var(--text-shadow);
				padding: 1.2rem 1.6rem;
				line-height: 1.5;
				margin: -1.4rem;
				border-radius: inherit;

				&:hover {
					background-color: rgba(255, 255, 255, 0.03);
				}

				.svg-icon {
					margin-left: auto;
					width: 1.2rem;
					height: 1.2rem;
					color: var(--text-subtle);
					transform: rotate(180deg);
					transition: transform 0.3s cubic-bezier(.34, 1.56, .64, 1), color 0.2s ease;

					&.section__arrow--collapsed {
						transform: none;
					}
				}

				&:hover .svg-icon {
					color: var(--text-emphasis);
				}
			}

			&:hover, &:focus-visible, &.focus-visible, &:active {
				background-color: var(--background-panel);
			}
		}

		.section__content {
			padding: 0 0.5rem;
			margin: 0.4rem -.5rem 0;
			min-width: 0;
			position: relative;

			&:last-child {
				margin-bottom: 0;
			}
		}

		.section__search {
			margin-bottom: 1.2rem;
			padding: 0.9rem 1.2rem;
			box-sizing: border-box;
			width: 100%;
			position: sticky;
			top: 5rem;
			z-index: 3;
			font-size: 1.4rem;
			background-color: #18181B;

			&:focus {
				background-color: #18181B;
			}

			& + .section__skeleton {
				margin-top: 0;
			}
		}

		.section__skeleton {
			font-size: 1.4rem;
			color: var(--text-subtle);
			text-align: center;
			align-self: center;
			margin: 0.6rem 0 0.4rem;
		}

		&.section--collapsible.section--collapsed {
			.section__heading, .section__heading button {
				margin-bottom: -1.4rem;
			}

			.section__content {
				display: none;
			}
		}

		@media (max-width: 320px) {
			box-sizing: border-box;
			width: 100%;
		}
	}
</style>
