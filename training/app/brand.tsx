export default function Brand({ light = false }: { light?: boolean }) {
  return <a href="/" className={`lighthouse-brand ${light ? 'on-dark' : ''}`} aria-label="Lighthouse SOC Training home"><img src="/lighthouse-mark.png" width="52" height="52" alt=""/><span>LIGHTHOUSE<small>SOC TRAINING</small></span></a>;
}
