import type { User } from '@core/entities/User';

type RawUsers = Record<string, unknown>;

export function normalizeUsersJson(raw: RawUsers): Record<string, User[]> {
  const out: Record<string, User[]> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (!Array.isArray(value)) {
      throw new Error(`Invalid users.json format for key "${key}". Expected array.`);
    }

    out[key] = value.map((u: any) => ({
      username: String(u.username ?? ''),
      password: String(u.password ?? ''),
      firstName: String(u.firstName ?? ''),
      lastName: String(u.lastName ?? ''),
      postalCode: String(u.postalCode ?? '')
    }));
  }

  return out;
}