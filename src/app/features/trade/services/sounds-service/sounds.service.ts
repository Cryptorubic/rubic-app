import { Injectable } from '@angular/core';
import { SoundEvent, soundsConfig } from './constants/sounds-config';
import { BlockchainName } from 'rubic-sdk';

@Injectable()
export class SoundsService {
  public playSound(soundEvent: SoundEvent, blockchain: BlockchainName): void {
    const sound = soundsConfig[blockchain]?.[soundEvent];

    if (sound) {
      sound.play();

      setTimeout(() => sound.pause(), 3000);
    }
  }
}
