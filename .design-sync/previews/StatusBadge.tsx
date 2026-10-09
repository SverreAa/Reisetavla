import { StatusBadge } from 'reisetavla-ds';

export const Live = () => <StatusBadge live />;
export const ExampleData = () => <StatusBadge live={false} />;
export const Connecting = () => <StatusBadge label="Kobler til" />;
