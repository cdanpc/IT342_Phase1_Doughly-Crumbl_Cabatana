import type { ReactNode, MouseEvent } from 'react';
import './Table.css';

// ---------------------------------------------------------------------------
// TableContainer — scrollable card shell
// ---------------------------------------------------------------------------
interface TableContainerProps {
  children: ReactNode;
  className?: string;
}
export function TableContainer({ children, className = '' }: TableContainerProps) {
  return (
    <div className={`ui-table-container${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table — the <table> itself
// ---------------------------------------------------------------------------
interface TableProps {
  children: ReactNode;
  minWidth?: number;
  className?: string;
}
export function Table({ children, minWidth, className = '' }: TableProps) {
  return (
    <table
      className={`ui-table${className ? ` ${className}` : ''}`}
      style={minWidth ? { minWidth } : undefined}
    >
      {children}
    </table>
  );
}

// ---------------------------------------------------------------------------
// TableHead / TableBody
// ---------------------------------------------------------------------------
interface TableSectionProps {
  children: ReactNode;
}
export function TableHead({ children }: TableSectionProps) {
  return <thead>{children}</thead>;
}
export function TableBody({ children }: TableSectionProps) {
  return <tbody>{children}</tbody>;
}

// ---------------------------------------------------------------------------
// TableRow
// ---------------------------------------------------------------------------
interface TableRowProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLTableRowElement>) => void;
  className?: string;
}
export function TableRow({ children, onClick, className = '' }: TableRowProps) {
  return (
    <tr
      className={`ui-table-row${onClick ? ' ui-table-row--clickable' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Th — header cell
// ---------------------------------------------------------------------------
type Align = 'left' | 'center' | 'right';

interface ThProps {
  children?: ReactNode;
  align?: Align;
  className?: string;
}
export function Th({ children, align = 'left', className = '' }: ThProps) {
  return (
    <th
      scope="col"
      className={`ui-table-th${align !== 'left' ? ` ui-table-th--${align}` : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </th>
  );
}

// ---------------------------------------------------------------------------
// Td — data cell
// ---------------------------------------------------------------------------
interface TdProps {
  children?: ReactNode;
  align?: Align;
  bold?: boolean;
  semibold?: boolean;
  className?: string;
}
export function Td({ children, align = 'left', bold, semibold, className = '' }: TdProps) {
  const modifiers = [
    align !== 'left' ? `ui-table-td--${align}` : '',
    bold ? 'ui-table-td--bold' : '',
    semibold ? 'ui-table-td--semibold' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <td className={`ui-table-td${modifiers ? ` ${modifiers}` : ''}`}>
      {children}
    </td>
  );
}

// ---------------------------------------------------------------------------
// TableEmpty — full-width empty row shown when there are no results
// ---------------------------------------------------------------------------
interface TableEmptyProps {
  colSpan: number;
  message?: string;
}
export function TableEmpty({ colSpan, message = 'No records found.' }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="ui-table-empty">
        {message}
      </td>
    </tr>
  );
}
