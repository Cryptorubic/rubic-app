import { AddressBookResponse } from '../models/ton-utils-types';

export async function fetchFriendlyAddress(rawAddress: string): Promise<string> {
  const res = (await (
    await fetch(`https://toncenter.com/api/v3/addressBook?address=${rawAddress}`)
  ).json()) as AddressBookResponse;
  const friendly = Object.values(res)[0].user_friendly;
  return friendly;
}
