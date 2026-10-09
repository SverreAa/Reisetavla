import { LinePill } from 'reisetavla-ds';

export const Modes = () => (
  <div className="rt-chips">
    <LinePill mode="bus" code="31" /><LinePill mode="rail" code="R11" /><LinePill mode="metro" code="5" />
    <LinePill mode="tram" code="12" /><LinePill mode="water" code="B10" /><LinePill mode="coach" code="FB2" /><LinePill mode="air" code="WF 812" />
  </div>
);
export const EnturColour = () => <LinePill mode="rail" code="F2" colour="#949494" textColour="#ffffff" />;
export const NoCode = () => <LinePill mode="rail" />;
