import { LitElement, html, css } from 'lit';

class RangeSlider extends LitElement {
    static get properties() {
        return {
            /**
             * Flag whether the slider is disabled or not.
             * @type {boolean}
             */
            disabled: {
                reflect: true,
                type: Boolean
            },

            /**
             * The minimum value.
             * @type {number}
             */
            min: { type: Number },

            /**
             * The maximum value.
             * @type {number}
             */
            max: { type: Number },

            /**
             * The interval of the value.
             * @type {number}
             */
            step: { type: Number },

            /**
             * The value.
             * @type {number}
             */
            value: { type: Number },

            suffix: {type: String},
            field: {type: String},
        };
    }

    constructor() {
        super();

        this.disabled = false;
        this.min = 0;
        this.max = 100;
        this.value = 0;
        this._actualMin = this.min;
        this._actualMax = this.max;
        this._input = {};
        this._slider = {};
        this._thumb = {};
    }

    async firstUpdated() {
        this._input = this.shadowRoot.querySelector('input');
        this._slider = this.shadowRoot.querySelector('.range-slider');
        this._thumb = this.shadowRoot.querySelector('.range-thumb');
        this._actualMin = this.min;
        this._actualMax = this.max;

        if (this.step) {
            const minRemainder = this.min % this.step;
            const maxRemainder = this.max % this.step;

            // The behavior of HTML input[type=range] does not allow the slider to be
            // moved to the min/max values if those properties are not multiples of the
            // step property.
            // To be able to move the slider to the min/max values:
            // Set the min to the closest multiple of step lower than the min value provided.
            if (minRemainder !== 0) {
                this.min = this.min - minRemainder;
            }

            // Set the max to the closest multiple of step higher than the max value provided.
            if (maxRemainder !== 0) {
                this.max = this.max + this.step - maxRemainder;
            }
        }
    }

    longIntToPercentage(val) {
        return parseInt((parseFloat(val) / 255.0) * 100.0);
    }

    updated(changedProps) {
        if (changedProps.has('value')) {
            this._updateSlider();
        }
    }

    static styles = css`
        :host {
          --slider-background: rgba(255, 152, 0, 0.1);
          --slider-height: 30px;
          --slider-radius: calc(var(--slider-height) / 2);
          --slider-value-color: rgba(255, 152, 0, 1);
          --slider-value-background: rgba(255, 152, 0, 0.8);
          --slider-value-width: 0;
          --thumb-color: rgba(255, 152, 0, 1);
          --thumb-diameter: var(--slider-height);
          --thumb-offset: 100px;
            display: inline-block;
            width: 100%;
        }

        .range-controller {
            display: flex;
            flex-direction: row;
            justify-content: start;
            align-items: center;
        }
        .range-value-display {
            width: calc(var(--slider-height) + var(--slider-height));
            height: var(--slider-height);
            overflow: hidden;
            margin: 0 10px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
        }
        .range-container {
          position: relative;
          width: 100%;
          height: var(--slider-height);
          overflow: hidden;
          border-radius: calc(var(--slider-radius) / 2);
        }

        .range-slider,
        .range-slider-value {
          height: var(--slider-height);
          position: absolute;
        }

        .range-slider {
          background: var(--slider-background);
          width: 100%;
        }
    
        .range-slider-value {
          background: var(--slider-value-background);
          width: var(--slider-value-width);
        }
    
        .range-thumb {
          background: var(--thumb-color);
          border-top-right-radius: calc(var(--slider-radius) / 2);
          border-bottom-right-radius: calc(var(--slider-radius) / 2);
          height: var(--thumb-diameter);
          position: absolute;
          transform: translateX(var(--thumb-offset));
          width: var(--thumb-diameter);
        }
    
        input {
          display: inline-block;
          height: var(--thumb-diameter);
          margin: 0;
          opacity: 0;
          position: relative;
          width: 100%;
          -webkit-appearance: none;
        }
        
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 40px;
          width: 40px;
          background: #ffffff;
          cursor: pointer;
          margin-top: -14px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
          box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
        }
    
        :host([disabled]) {
          --slider-background: #d9d9d9;
          --slider-value-color: #a8a8a8;
          --thumb-color: #f0f0f0;
        }
  `;

    render() {
        return html`
        <div class="range-controller">
            <div class="range-container">
                <div class="range-slider"></div>
                <div class="range-slider-value"></div>
                <div class="range-thumb"></div>
                <input
                    max=${this.max}
                    min=${this.min}
                    step=${this.step}
                    type="range"
                    value=${this.value}
                    ?disabled=${this.disabled}
                    @input=${this._changeHandler}
                    @change=${this.changedValue}
                />
            </div>
            <div class="range-value-display">
                ${this.longIntToPercentage(this.value)}%
            </div>
        </div>
    `;
    }

    /**
     * Sets the slider value.
     */
    _changeHandler() {
        const { value } = this._input;

        this.value = value > this._actualMax
            ? this._actualMax
            : value < this._actualMin
                ? this._actualMin
                : value;
    }

    changedValue() {
        const { value } = this._input;
        const options = {
            detail: {value: value, field: this.field},
            bubbles: true,
            composed: true
        };
        this.dispatchEvent(new CustomEvent('slider-value-changed', options));
    }

    /**
     * Updates the slider's value width and thumb position (UI).
     * @event change
     */
    _updateSlider() {
        const min = this.min < this._actualMin ? this._actualMin : this.min;
        const max = this.max > this._actualMax ? this._actualMax : this.max;
        const percentage = (this.value - min) / (max - min);
        const thumbWidth = this._thumb.offsetWidth;
        const sliderWidth = this._slider.offsetWidth;
        const sliderValueWidth = `${percentage * 100}%`;
        const thumbOffset = `${(sliderWidth - thumbWidth) * percentage}px`;

        this.style.setProperty('--slider-value-width', sliderValueWidth);
        this.style.setProperty('--thumb-offset', thumbOffset);

        // Dispatch the change event for range-slider. (For event handlers.)
        this.dispatchEvent(new Event('change'));

        console.log('here!');
    }
}

customElements.define('range-slider', RangeSlider);