import {GyverlampCard} from "./gyverlamp-card";
import {toggleState, updateBrightness, updateColorTemp, updateEffect} from "./lightMethods";

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
    let state = 'on'; //hass.states[instance.entity].state;

    if (state === 'on') {
        instance.mode = instance.mode === 'normal' ? 'settings' : 'normal';
        instance.settingsField = 'BRI';
    }
}

export function toggleSettingsField(instance: GyverlampCard) {
    instance.settingsField = instance.settingsField === 'BRI' ? 'SPD' : 'BRI';
}

export function eventsMainIcon(instance: GyverlampCard) {
    if (instance.handleEvents.mainIcon) {
        return;
    }

    let shadowRoot = instance.shadowRoot;
    if (shadowRoot) {
        let mainIcon = shadowRoot.querySelector('#mainIcon');

        if (mainIcon) {
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
            instance.handleEvents.mainIcon = true;
        }
    }
}
export function eventsSelect(instance: GyverlampCard) {
    if (instance.handleEvents.select) {
        return;
    }

    let shadowRoot = instance.shadowRoot;
    if (shadowRoot) {
        let effectSelect = shadowRoot.querySelector('#effectSelect');
        if (effectSelect) {
            effectSelect.addEventListener('change', (ev) => {
                // @ts-ignore
                updateEffect(this, ev.target.value);
            });
            instance.handleEvents.select = true;
        }
    }
}
export function eventsSlider(instance: GyverlampCard, type: string) {
    // @ts-ignore
    if (instance.handleEvents['slider' + type]) {
        return;
    }

    let shadowRoot = instance.shadowRoot;
    if (shadowRoot) {
        let slider = shadowRoot.querySelector('#sliderRange' + type);
        if (slider) {
            slider.addEventListener('slider-update', (ev) => {
                // @ts-ignore
                switch (type) {
                    case 'Bri':
                        // @ts-ignore
                        updateBrightness(instance, ev.detail.value);
                        break;
                    case 'Spd':
                        // @ts-ignore
                        updateColorTemp(instance, ev.detail.value);
                        break;
                    default:
                        break;
                }
            });

            let icon = shadowRoot.querySelector('#settings' + type);
            if (icon) {
                icon.addEventListener('click', () => {
                    toggleSettingsField(instance);
                })
            }

            // @ts-ignore
            instance.handleEvents['slider' + type] = true;
        }
    }
}
export function eventsSettingsIcon(instance: GyverlampCard) {
    if (instance.handleEvents.settingsIcon) {
        return;
    }

    let shadowRoot = instance.shadowRoot;
    if (shadowRoot) {
        let settingsIcon = shadowRoot.querySelector('#settingsIcon');

        if (settingsIcon) {
            settingsIcon.addEventListener('click', () => {
                toggleSettingsField(instance);
            });
            instance.handleEvents.settingsIcon = true;
        }
    }
}