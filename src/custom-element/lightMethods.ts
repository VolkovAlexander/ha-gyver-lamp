import {HomeAssistant} from "../ha-types";
import {GyverlampCard} from "./gyverlamp-card";

function callService(hass: HomeAssistant, entity: string, domain: string, method: string, params: Object) {
    let data = {
        entity_id: entity
    };
    Object.assign(data, params);
    return hass.callService(domain, method, data);
}

export function toggleState(instance: GyverlampCard) {
    const hass = instance.hass;
    const entity = instance.entity;

    callService(hass, entity, 'light', 'toggle', {}).then((r) => {
        console.log('toggleState'); console.log(r);
    });
}

export function updateBrightness(instance: GyverlampCard, brightness: string) {
    const hass = instance.hass;
    const entity = instance.entity;

    callService(hass, entity, 'light', 'turn_on', {
        'brightness': brightness
    }).then((r) => {
        console.log('updateBrightness'); console.log(r);
    });
}

export function updateColorTemp(instance: GyverlampCard, color_temp: string) {
    const hass = instance.hass;
    const entity = instance.entity;

    callService(hass, entity, 'light', 'turn_on', {
        'color_temp': color_temp
    }).then((r) => {
        console.log('updateColorTemp'); console.log(r);
    });
}

export function updateEffect(instance: GyverlampCard, effect: string) {
    const hass = instance.hass;
    const entity = instance.entity;
    const curBrightness = hass.states[entity].attributes.brightness;

    callService(hass, entity, 'light', 'turn_on', {
        'effect': effect,
        'brightness': curBrightness
    }).then((r) => {
        console.log('updateEffect'); console.log(r);
    });
}