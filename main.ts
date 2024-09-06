import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface AudioPausePluginSettings {
	resetToBeginning: boolean;
}

const DEFAULT_SETTINGS: AudioPausePluginSettings = {
	resetToBeginning: false
}

export default class AudioPausePlugin extends Plugin {
	settings: AudioPausePluginSettings;
	private audioElements: HTMLAudioElement[] = [];

	async onload() {
		await this.loadSettings();

		console.log('Loading AudioPausePlugin');

		this.registerDomEvent(document, 'play', (evt: Event) => {
			const target = evt.target as HTMLAudioElement;
			if (target instanceof HTMLAudioElement) {
				this.pauseOtherAudio(target);
				if (!this.audioElements.includes(target)) {
					this.audioElements.push(target);
				}
			}
		}, true);

		this.addSettingTab(new AudioPauseSettingTab(this.app, this));
	}

	onunload() {
		console.log('Unloading AudioPausePlugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private pauseOtherAudio(currentAudio: HTMLAudioElement) {
		this.audioElements.forEach(audio => {
			if (audio !== currentAudio && !audio.paused) {
				audio.pause();
				if (this.settings.resetToBeginning) {
					audio.currentTime = 0;
				}
			}
		});
	}
}

class AudioPauseSettingTab extends PluginSettingTab {
	plugin: AudioPausePlugin;

	constructor(app: App, plugin: AudioPausePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Reset to beginning')
			.setDesc('When enabled, other audio clips will be reset to the beginning instead of just pausing.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.resetToBeginning)
				.onChange(async (value) => {
					this.plugin.settings.resetToBeginning = value;
					await this.plugin.saveSettings();
				}));
	}
}
