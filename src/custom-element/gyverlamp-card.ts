import { HomeAssistant } from "../ha-types";
import { html, css, LitElement, CSSResultGroup, TemplateResult, PropertyValues } from "lit";
import { property } from "lit/decorators";
import { ICardConfig } from "../types";

import { icon } from '@fortawesome/fontawesome-svg-core';
import { faLightbulb } from '@fortawesome/free-regular-svg-icons';
import { faExclamation, faBolt, faWater, faFire } from '@fortawesome/free-solid-svg-icons';

import '../components/range-slider.js';

import cardStyles from "./card.css";

import {eventsMainIcon, eventsSelect, eventsSettingsIcon, eventsSlider} from "./displayMethods";

/**
 * Main card class definition
 */
export class GyverlampCard extends LitElement {
    @property({ attribute: false })
    private name: string = "";

    @property({ attribute: false })
    private states: object = {
        attributes: {}
    };

    @property({ attribute: false })
    mode: string = "normal";

    @property({ attribute: false })
    settingsField: string = "BRI";

    entity: string = "";
    pressStart: Number = 0;

    // @ts-ignore
    _hass: HomeAssistant;

    /**
     * CSS for the card
     */
    static get styles(): CSSResultGroup {
        return [
            css(<TemplateStringsArray><any>[cardStyles]),
            css`
            `
        ];
    }

    /**
     * Called on every hass update
     */
    set hass(hass: HomeAssistant) {
        if (!this.entity || !hass.states[this.entity]) {
            return;
        }

        this._hass = hass;
        this.states = hass.states[this.entity];
    }

    get hass() {
        return this._hass;
    }

    /**
     * Called every time when entity config is updated
     * @param config Card configuration (yaml converted to JSON)
     */
    setConfig(config: ICardConfig): void {
        this.entity = config.entity;
        this.name = config.name || "";
    }

    firstUpdated() {
        eventsMainIcon(this);
        eventsSelect(this);
        eventsSlider(this, 'Bri');
        eventsSlider(this, 'Spd');
        eventsSlider(this, 'Sca');
        eventsSettingsIcon(this);
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        eventsMainIcon(this);
        eventsSelect(this);
        eventsSlider(this, 'Bri');
        eventsSlider(this, 'Spd');
        eventsSlider(this, 'Sca');
        eventsSettingsIcon(this);
    }

    /**
     * Renders the card when the update is requested (when any of the properties are changed)
     */
    render(): TemplateResult {
        let hass: HomeAssistant = this.hass;
        let entity: string = this.entity;
        let state = hass.states[entity].state;
        let mode = this.mode;

        console.log(hass.states[entity]);

        const lightParams = {
            state: hass.states[entity].state,
            name: this.name || hass.states[entity].attributes.friendly_name,
            effect: hass.states[entity].state === 'on' ? hass.states[entity].attributes.effect : 'Нет доступа',
            effects: hass.states[entity].attributes.effect_list || [],
            brightness: hass.states[entity].attributes.brightness,
            speed: hass.states[entity].attributes.rgb_color[0],
            scale: hass.states[entity].attributes.rgb_color[1],
        }

        const unavailableIcon = lightParams.state === 'unavailable' ? html`<div class="unavailable-icon">${icon(faExclamation).node}</div>` : html``;
        let iconHtml = html`
            <div id="mainIcon" class="icon">
                ${unavailableIcon}
                ${icon(faLightbulb).node}
            </div>
        `;

        const nameHtml = this.mode === 'settings' ? html`` : html`
            <div class="name truncate">
                ${lightParams.name}
                <small class="secondary">${lightParams.effect}</small>
                <select id="effectSelect" class="effect-select" name="lamp_effect" >
                    ${lightParams.effects.map((option: String) => html`<option value="${option}" ?selected=${lightParams.effect === option}>${option}</option>`)}
                </select>
            </div>
        `;

        let settingsRow = html``;
        let settingsFaIcon = icon(faFire).node;
        switch(this.settingsField) {
            case 'BRI':
                settingsFaIcon = icon(faFire).node;
                break;
            case 'SPD':
                settingsFaIcon = icon(faBolt).node;
                break;
            case 'SCA':
                settingsFaIcon = icon(faWater).node;
                break;
        }

        let settingsIcon =  this.mode === 'normal' ? html`` : html`
            <div class="settings">
                ${settingsFaIcon}
                <select id="selectSettingsField" class="effect-select">
                    <option value="BRI">Яркость</option>
                    <option value="SPD">Скорость</option>
                    <option value="SCA">Масштаб</option>
                </select>
            </div>
        `;

        if (this.mode === 'settings' && this.settingsField === 'BRI') {
            settingsRow = html`
                <div class="settings-row">
                    <range-slider
                            id="sliderRangeBri"
                            .min=${1}
                            .max=${255}
                            .value=${lightParams.brightness}
                    ></range-slider>
                </div>
            `;
        }

        if (this.mode === 'settings' && this.settingsField === 'SPD') {
            settingsRow = html`
                <div class="settings-row">
                    <range-slider
                            id="sliderRangeSpd"
                            .min=${1}
                            .max=${255}
                            .value=${lightParams.speed}
                    ></range-slider>
                </div>
            `;
        }

        if (this.mode === 'settings' && this.settingsField === 'SCA') {
            settingsRow = html`
                <div class="settings-row">
                    <range-slider
                            id="sliderRangeSca"
                            .min=${1}
                            .max=${255}
                            .value=${lightParams.scale}
                    ></range-slider>
                </div>
            `;
        }

        return html`
            <ha-card>
                <div class="card-content">
                    <div>
                        <div class="entity-row state-${state} mode-${mode}">
                            ${iconHtml}
                            ${nameHtml}
                            ${settingsRow}
                            ${settingsIcon}
                        <div>
                    </div>
                </div>
            </ha-card>
        `;
    }
}