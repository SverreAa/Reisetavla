import type * as React from 'react';

export type Mode = 'bus' | 'coach' | 'rail' | 'metro' | 'tram' | 'water' | 'air' | 'foot';
export type IconName = Mode | 'pin' | 'me' | 'warn' | 'star' | 'share' | 'swap' | 'close' | 'board';

export interface IconProps { name: IconName; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;

export interface RootProps { /** Skjermoppsett: én kolonne, maks content-max, sidemarg space-16, space-14 mellom seksjoner. */ screen?: boolean; /** Tving tema; uten følger den systemet. */ theme?: 'light' | 'dark'; className?: string; children?: React.ReactNode }
/** Rotelement: setter font, tekstfarge, bg og knappenullstilling. Alle Reisetavla-komponenter må ligge inni Root. */
export declare function Root(props: RootProps): React.ReactElement;

export interface StatusBadgeProps { /** true = sanntid fra Entur (grønn, pulserer); false = eksempeldata (oransje). */ live?: boolean; label?: string }
export declare function StatusBadge(props: StatusBadgeProps): React.ReactElement;

export interface AppHeaderProps { live?: boolean; statusLabel?: string; /** false skjuler statusmerket. */ status?: boolean }
export declare function AppHeader(props: AppHeaderProps): React.ReactElement;

export interface NoteProps { children?: React.ReactNode }
export declare function Note(props: NoteProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'ghost'; icon?: IconName }
export declare function Button(props: ButtonProps): React.ReactElement;

export interface IconButtonProps { icon: IconName; /** Påkrevd: leses av skjermleser. */ label: string; pressed?: boolean; /** Innfelt variant inne i et kort (surface-2, ingen skygge). */ inset?: boolean; onClick?: () => void; className?: string }
export declare function IconButton(props: IconButtonProps): React.ReactElement;

export interface SavedChipProps { name: string; onOpen?: () => void; onRemove?: () => void }
export declare function SavedChip(props: SavedChipProps): React.ReactElement;

export interface SearchCardProps { from?: string; to?: string; idPrefix?: string; onSwap?: () => void; /** Tidsvalg og modusbrikker legges inn som barn. */ children?: React.ReactNode }
export declare function SearchCard(props: SearchCardProps): React.ReactElement;

export interface SegmentedControlProps { options: { id: string; label: string }[]; value: string; label?: string; onChange?: (id: string) => void }
export declare function SegmentedControl(props: SegmentedControlProps): React.ReactElement;

export interface ModeChipProps { mode: Exclude<Mode, 'foot'>; label?: string; pressed?: boolean; onClick?: () => void }
export declare function ModeChip(props: ModeChipProps): React.ReactElement;

export interface Suggestion { name: string; sub?: string; kind: 'me' | 'stop' | 'addr' }
export interface SuggestionListProps { items: Suggestion[] }
export declare function SuggestionList(props: SuggestionListProps): React.ReactElement;

export interface LinePillProps { mode: Mode; code?: string; /** Linjefarge fra Entur (#rrggbb) overstyrer modusfargen. */ colour?: string; textColour?: string }
export declare function LinePill(props: LinePillProps): React.ReactElement;

export interface WalkChipProps { minutes: number }
export declare function WalkChip(props: WalkChipProps): React.ReactElement;

export interface Leg { mode: Mode; duration?: number; minutes?: number; meters?: number; start?: string; end?: string; code?: string; colour?: string; textColour?: string; towards?: string; from?: string; to?: string; platform?: string; operator?: string; realtime?: boolean; late?: number }
export interface TripCardProps { dep: string; arr: string; /** Opprinnelig tid når avgangen er forsinket. */ wasDep?: string; duration: string; soon?: string; realtime?: boolean; platform?: string; legs: Leg[]; warnings?: string[]; cancelled?: boolean; open?: boolean }
export declare function TripCard(props: TripCardProps): React.ReactElement;

export interface DepartureRowProps { mode: Mode; code: string; colour?: string; textColour?: string; destination: string; platform?: string; operator?: string; realtime?: boolean; when: string; sub?: string; late?: boolean; cancelled?: boolean }
export declare function DepartureRow(props: DepartureRowProps): React.ReactElement;

export interface WarningLineProps { tone?: 'warn' | 'crit'; children?: React.ReactNode }
export declare function WarningLine(props: WarningLineProps): React.ReactElement;

export interface EmptyStateProps { title: string; text: string; action?: string; onAction?: () => void }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;

export interface SkeletonProps { count?: number }
export declare function Skeleton(props: SkeletonProps): React.ReactElement;

export interface BottomSheetProps { title: string; inline?: boolean; onClose?: () => void; children?: React.ReactNode }
export declare function BottomSheet(props: BottomSheetProps): React.ReactElement;

export interface ToastProps { inline?: boolean; children?: React.ReactNode }
export declare function Toast(props: ToastProps): React.ReactElement;

export interface TabBarProps { items?: { id: string; label: string; icon: IconName }[]; active: string; onChange?: (id: string) => void }
export declare function TabBar(props: TabBarProps): React.ReactElement;

export interface ResultHeaderProps { title: string; subtitle?: string; saved?: boolean }
export declare function ResultHeader(props: ResultHeaderProps): React.ReactElement;

declare global { interface Window { Reisetavla: Record<string, React.ComponentType<any>> } }
