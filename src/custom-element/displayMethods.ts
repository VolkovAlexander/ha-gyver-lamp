import {GyverlampCard} from "./gyverlamp-card";
import {toggleState, updateBrightness, updateEffect, updateScale, updateSpeed} from "./lightMethods";

export function isIOS() {
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

export function handleStartClick(instance: GyverlampCard) {
    instance.pressStart = Date.now();
}

export function handleEndClick(instance: GyverlampCard, shortPressFunction: Function | null = null, longPressFunction: Function | null = null) {
    const SHORT_LATENCY = 500;

    let curTime = Date.now();
    if ((parseInt(String(curTime)) - parseInt(String(instance.pressStart))) > SHORT_LATENCY) {
        return typeof longPressFunction === 'function' ? longPressFunction() : null;
    } else {
        return typeof shortPressFunction === 'function' ? shortPressFunction() : null;
    }
}

export function toggleDisplayMode(instance: GyverlampCard) {
    let hass = instance.hass;
    let state = hass.states[instance.entity].state;

    if (state === 'on') {
        instance.mode = instance.mode === 'normal' ? 'settings' : 'normal';
        instance.settingsField = 'BRI';
    }
}

export function updateSettingsField(instance: GyverlampCard, value: string) {
    instance.settingsField = value;
}

export function eventsMainIcon(instance: GyverlampCard) {
    let shadowRoot = instance.shadowRoot;
    if (shadowRoot) {
        let mainIcon = shadowRoot.querySelector('#mainIcon');

        if (mainIcon && !mainIcon.getAttribute('data-listened')) {
            mainIcon.addEventListener(isIOS() ? 'touchstart' : 'mousedown', () => {
                handleStartClick(instance)
            });
            mainIcon.addEventListener(isIOS() ? 'touchend' : 'mouseup', () => {
                handleEndClick(instance,
                    () => {
                        instance.mode === 'settings' ? toggleDisplayMode(instance) : toggleState(instance)
                    },
                    () => {
                        toggleDisplayMode(instance)
                    }
                )
            });
            mainIcon.setAttribute('data-listened', 'true');
        }
    }
}
export function eventsSelect(instance: GyverlampCard) {
    let shadowRoot = instance.shadowRoot;
    if (shadowRoot) {
        let effectSelect = shadowRoot.querySelector('#effectSelect');
        if (effectSelect && !effectSelect.getAttribute('data-listened')) {
            effectSelect.addEventListener('change', (ev) => {
                // @ts-ignore
                updateEffect(instance, ev.target.value);
                
            });
            effectSelect.setAttribute('data-listened', 'true');
        }
    }
}
export function eventsSlider(instance: GyverlampCard, type: string) {
    let shadowRoot = instance.shadowRoot;
    if (shadowRoot) {
        let slider = shadowRoot.querySelector('#sliderRange' + type);
        if (slider && !slider.getAttribute('data-listened')) {
            slider.addEventListener('slider-update', (ev) => {
                // @ts-ignore
                switch (type) {
                    case 'Bri':
                        // @ts-ignore
                        updateBrightness(instance, ev.detail.value);
                        break;
                    case 'Spd':
                        // @ts-ignore
                        updateSpeed(instance, ev.detail.value);
                        break;
                    case 'Sca':
                        // @ts-ignore
                        updateScale(instance, ev.detail.value);
                        break;
                    default:
                        break;
                }
            });
            slider.setAttribute('data-listened', 'true');
        }
    }
}
export function eventsSettingsIcon(instance: GyverlampCard) {
    let shadowRoot = instance.shadowRoot;
    if (shadowRoot) {
        let icon = shadowRoot.querySelector('#selectSettingsField');
        if (icon && !icon.getAttribute('data-listened')) {
            icon.addEventListener('change', (ev) => {
                // @ts-ignore
                updateSettingsField(instance, ev.target.value);
            });
            icon.setAttribute('data-listened', 'true');
        }
    }
}