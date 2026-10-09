import { WalkChip, LinePill } from 'reisetavla-ds';

export const Alone = () => <WalkChip minutes={4} />;
export const InChain = () => (
  <div className="rt-chips">
    <WalkChip minutes={4} /><span className="rt-sep">›</span><LinePill mode="metro" code="5" />
    <span className="rt-sep">›</span><WalkChip minutes={3} />
  </div>
);
