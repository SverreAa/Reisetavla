import { CrowdMeter } from 'reisetavla-ds';

export const Levels = () => (
  <div className="rt-crowd">
    <span className="rt-crowd-title">Passasjerer</span>
    <CrowdMeter code="F2" level={1} />
    <CrowdMeter code="2" level={2} />
    <CrowdMeter code="19" level={3} />
  </div>
);
export const OnBoard = () => <CrowdMeter level={3} label="Trangt om bord" />;
