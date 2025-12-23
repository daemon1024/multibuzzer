import axios from 'axios';
import { Buzzer } from '../lib/store';

axios.defaults.headers['Content-Type'] = 'application/json';
axios.defaults.headers['Accept'] = 'application/json';

const hostname = window.location.hostname;
const port = window.location.port;
const protocol = window.location.protocol;
const gameport = process.env.PORT || 4001;
const url = protocol + '//' + hostname + (port ? ':' + port : '');
const localUrl = `${protocol}//${hostname}:${gameport}`;

const LOBBY_SERVER = process.env.NODE_ENV === 'production' ? url : localUrl;
export const GAME_SERVER =
  process.env.NODE_ENV === 'production' ? url : localUrl;

export async function getRoom(roomId) {
  // convert to uppercase
  const cleanRoomId = roomId.toUpperCase();
  try {
    const response = await axios.get(
      `${LOBBY_SERVER}/games/${Buzzer.name}/${cleanRoomId}`
    );
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else {
      return { status: 500 };
    }
  }
}

export async function createRoom() {
  try {
    const response = axios.post(`${LOBBY_SERVER}/games/${Buzzer.name}/create`, {
      numPlayers: 200,
    });
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else {
      return { status: 500 };
    }
  }
}

export async function joinRoom(roomID, playerID, playerName) {
  try {
    const response = axios.post(
      `${LOBBY_SERVER}/games/${Buzzer.name}/${roomID}/join`,
      {
        playerID,
        playerName,
      }
    );
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else {
      return { status: 500 };
    }
  }
}

export async function leaveRoom(roomID, playerID, credentials) {
  try {
    const response = axios.post(
      `${LOBBY_SERVER}/games/${Buzzer.name}/${roomID}/leave`,
      {
        playerID,
        credentials,
      }
    );
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else {
      return { status: 500 };
    }
  }
}

// Calculate clock offset between client and server using NTP-like algorithm
// Returns offset in ms (positive = client ahead, negative = client behind)
export async function calculateClockOffset() {
  try {
    const samples = [];
    // Take 3 samples and use the one with lowest latency for best accuracy
    for (let i = 0; i < 3; i++) {
      const t0 = Date.now();
      const response = await axios.get(`${LOBBY_SERVER}/api/time`);
      const t3 = Date.now();
      const serverTime = response.data.serverTime;

      // Round-trip time
      const rtt = t3 - t0;
      // Estimate server time at midpoint of request
      const estimatedServerTime = serverTime + rtt / 2;
      // Offset = client time - server time (at midpoint)
      const offset = (t0 + t3) / 2 - estimatedServerTime;

      samples.push({ offset, rtt });
    }
    // Use sample with lowest RTT for most accurate offset
    samples.sort((a, b) => a.rtt - b.rtt);
    return samples[0].offset;
  } catch (error) {
    console.error('Failed to calculate clock offset:', error);
    return 0; // Fallback to no offset
  }
}
