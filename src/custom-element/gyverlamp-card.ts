import { HomeAssistant } from "../ha-types";
import { html, css, LitElement, CSSResultGroup, TemplateResult } from "lit";
import { property } from "lit/decorators";
import { ICardConfig } from "../types";

import { icon } from '@fortawesome/fontawesome-svg-core';
import { faLightbulb, faSun } from '@fortawesome/free-regular-svg-icons';
import { faChevronDown, faChevronUp, faExclamation, faGaugeHigh } from '@fortawesome/free-solid-svg-icons';

import '../components/range-slider.js';

import cardStyles from "./card.css";

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
    private mode: string = "normal";

    @property({ attribute: false })
    private settingsField: string = "BRI";

    private entity: string = "";

    // @ts-ignore
    protected _hass: HomeAssistant = {};
    private longPressStart: Number = 0;

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

    /**
     * Called every time when entity config is updated
     * @param config Card configuration (yaml converted to JSON)
     */
    setConfig(config: ICardConfig): void {
        this.entity = config.entity;
        this.name = config.name || "";
    }

    private toggleDisplayMode() {
        this.mode = this.mode === 'normal' ? 'settings' : 'normal';
        this.settingsField = 'BRI';
    }

    private toggleSettingsField() {
        this.settingsField = this.settingsField === 'BRI' ? 'SPD' : 'BRI';
    }

    private handleMainIconClick()
    {
        console.log(this.mode);
        if (this.mode === 'settings') {
            this.toggleDisplayMode();
        } else {
            this.toggleState();
        }
    }

    private toggleState() {
        this._hass.callService("light", "toggle", {
            entity_id: this.entity
        }).then(r => {
        });
    }
    private handleAttrChange(ev: CustomEvent) {
        let data = {
            entity_id: this.entity
        }

        let fieldName = ev.detail.field;
        // @ts-ignore
        data[fieldName] = ev.detail['value'];
        this._hass.callService("light", "turn_on", data).then(r => {
        });
    }
    private handleEffectChange(effect: String) {
        // @ts-ignore
        let curBri = this.states.attributes.brightness;

        let data = {
            entity_id: this.entity,
            brightness: curBri,
            effect: effect
        };
        this._hass.callService("light", "turn_on", data).then(r => {
        });
    }

    private handleMouseDown() {
        this.longPressStart = Date.now();
    }
    private handleMouseUp(shortClickFunction: Function, longClickFunction: Function) {
        let latency = parseInt(String(Date.now())) - parseInt(String(this.longPressStart));
        if (latency >= 500 && typeof longClickFunction === 'function') {
            longClickFunction();
        } else {
            shortClickFunction();
        }
    }

    protected isIOS() {
        return [
                'iPad Simulator',
                'iPhone Simulator',
                'iPod Simulator',
                'iPad',
                'iPhone',
                'iPod'
            ].includes(navigator.platform)
            // iPad on iOS 13 detection
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    }

    /**
     * Renders the card when the update is requested (when any of the properties are changed)
     */
    render(): TemplateResult {
        let self = this;

        let hass: HomeAssistant = this._hass;

        let states = hass.states[this.entity];
        let mode = this.mode;
        let settingsField = this.settingsField;

        let state = states.state;
        let brightness = parseInt(states.attributes.brightness);
        let color_temp = parseInt(states.attributes.color_temp);
        let EFF = states.attributes.effect;
        let EFFS = states.attributes.effect_list;

        let displayName = this.name || states.attributes.friendly_name;
        let displayState = state === 'unavailable' ? 'Нет доступа' : (states.attributes.effect || 'Не задано');

        let mainIcon = icon(faLightbulb).node;
        let settingsIcon = settingsField === 'BRI' ? icon(faSun).node : icon(faGaugeHigh).node;

        let iconHtml = html`
            <div class="icon" 
                    @mousedown="${this.handleMouseDown}"
                    @mouseup="${() => this.handleMouseUp(
                    function() { return self.isIOS() ? {} : self.handleMainIconClick()},
                    function() { return self.isIOS() ? {} : (state === 'on' ? self.toggleDisplayMode() : self.handleMainIconClick())}
                    )}"
                    @touchstart="${this.handleMouseDown}"
                    @touchend="${() => this.handleMouseUp(
                    function() { return !self.isIOS() ? {} : self.handleMainIconClick()},
                    function() { return !self.isIOS() ? {} : (state === 'on' ? self.toggleDisplayMode() : self.handleMainIconClick())}
                    )}"
            >
                <div class="unavailable-icon">
                    ${icon(faExclamation).node}
                </div>
                ${mainIcon}
            </div>
        `;

        let nameHtml = this.mode === 'settings' ? html`` : html`
            <div class="name truncate">
                ${displayName}
                <small class="secondary">${displayState}</small>
                <select class="effect-select" name="lamp_effect"
                        @change="${(ev: { target: { value: String; }; }) => this.handleEffectChange(ev.target.value)}"
                >
                    ${EFFS.map((option: String) => html`
                                        <option value="${option}" ?selected=${EFF === option}>${option}</option>
                                    `)}
                </select>
            </div>
        `;

        let settingsRow = this.mode === 'normal' ? html`` : (
            this.settingsField === 'BRI' ? html`
                <div class="settings-row">
                    <range-slider
                            .min=${1}
                            .max=${255}
                            .value=${brightness}
                            field="brightness"
                            @slider-value-changed="${(ev: CustomEvent) => this.handleAttrChange(ev)}"
                    ></range-slider>
                    <div class="settings" @click="${() => this.toggleSettingsField()}">
                        ${icon(faSun).node}
                    </div>
                </div>
            ` : html`
                <div class="settings-row">
                    <range-slider
                            class="settings-speed"
                            .min=${1}
                            .max=${255}
                            .value=${color_temp}
                            field="color_temp"
                            @slider-value-changed="${(ev: CustomEvent) => this.handleAttrChange(ev)}"
                    ></range-slider>
                    <div class="settings" @click="${() => this.toggleSettingsField()}">
                        ${icon(faGaugeHigh).node}
                    </div>
                </div>
            `
        )

        return html`
            <ha-card>
                <div class="card-content">
                    <div>
                        <div class="entity-row state-${state} mode-${mode}">
                            ${iconHtml}
                            ${nameHtml}
                            ${settingsRow}
                        <div>
                    </div>
                </div>
            </ha-card>
        `;
    }
}