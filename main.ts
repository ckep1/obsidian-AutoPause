import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface AudioPausePluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: AudioPausePluginSettings = {
	mySetting: 'default'
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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
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
			}
		});
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: AudioPausePlugin;

	constructor(app: App, plugin: AudioPausePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
