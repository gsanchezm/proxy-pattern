import fs from 'node:fs';
import path from 'node:path';

export type CapabilityProfileFile = {
  capabilities: Array<{
    name: string;
    caps: Record<string, any>;
  }>;
};

export class CapabilityProfileLoader {
  static load(platform: 'android' | 'ios', profileName: string): CapabilityProfileFile {
    const filePath = path.resolve(process.cwd(), 'capabilities', platform, `${profileName}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Capabilities profile not found: ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as CapabilityProfileFile;
  }

  static selectCaps(profile: CapabilityProfileFile, preferredName?: string): Record<string, any> {
    const list = profile.capabilities ?? [];
    if (list.length === 0) throw new Error('Capabilities file has no entries in "capabilities" array.');

    // If name provided, select by name; otherwise select first
    if (preferredName) {
      const match = list.find(x => x.name === preferredName);
      if (!match) {
        const names = list.map(x => x.name).join(', ');
        throw new Error(`Capability name "${preferredName}" not found. Available: ${names}`);
      }
      return match.caps;
    }

    return list[0].caps;
  }
}