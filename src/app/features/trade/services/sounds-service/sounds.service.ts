import { Injectable } from '@angular/core';
import { SoundEvent, soundsConfig } from './constants/sounds-config';
import { BlockchainName } from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SoundsService {
  private readonly _currSound$ = new BehaviorSubject<null | HTMLAudioElement>(null);

  public playSound(soundEvent: SoundEvent, blockchain: BlockchainName): void {
    const sound = soundsConfig[blockchain]?.[soundEvent];

    if (sound) {
      const currSound = this._currSound$.getValue();
      if (currSound) {
        currSound.pause();
        currSound.currentTime = 0;
      }

      sound.play();
      this._currSound$.next(sound);

      setTimeout(() => {
        if (sound === this._currSound$.getValue() && !sound.paused) {
          sound.pause();
          sound.currentTime = 0;
          this._currSound$.next(null);
        }
      }, 3000);
    }
  }
}
