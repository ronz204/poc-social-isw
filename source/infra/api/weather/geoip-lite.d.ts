// geoip-lite ships no types; only what the location adapter reads is declared.
declare module "geoip-lite" {
  export interface GeoipEntry {
    ll: [number, number];
    city: string;
  }
  const geoip: { lookup(ip: string): GeoipEntry | null };
  export default geoip;
}
