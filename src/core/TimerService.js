// src/core/TimerService.js
import { Store } from './Store.js';

export const TimerService = {
    _fastingInterval: null,
    _exerciseInterval: null,

    startTick() {
        this.stopTick();
        this._fastingInterval = setInterval(() => {
            if (Store.state.fasting.running && Store.state.fasting.startTime) {
                const elapsedSeconds = Math.floor((Date.now() - Store.state.fasting.startTime) / 1000);
                Store.notify('timerTick', elapsedSeconds);
            }
        }, 1000);
    },

    stopTick() {
        clearInterval(this._fastingInterval);
    },

    startExerciseCountdown(seconds, onComplete) {
        this.stopExercise();
        let remaining = seconds;
        Store.notify('exerciseTick', remaining);

        this._exerciseInterval = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                this.stopExercise();
                onComplete();
            } else {
                Store.notify('exerciseTick', remaining);
            }
        }, 1000);
    },

    stopExercise() {
        clearInterval(this._exerciseInterval);
    }
};