import axios from 'axios';

type Place = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: string[];
};

export async function getAddressesInformation(addresses: string[]) {
  const result: Array<[string, Place]> = [];

  for (const address of addresses) {
    const {data: places} = await axios.get<Place[]>(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {q: address, format: 'json'},
      },
    );

    const place =
      places.find(
        (place) => place.type === 'outpost' && place.name === 'Ozon',
      ) || places[0];

    if (place) {
      result.push([address, place]);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  return result;
}
