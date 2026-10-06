import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from '@/components/booking/calendar';

const TODAY = '2026-10-06';

type Props = Partial<React.ComponentProps<typeof Calendar>>;

function setup(props: Props = {}) {
  const onSelect = vi.fn();
  const user = userEvent.setup();
  render(<Calendar today={TODAY} onSelect={onSelect} {...props} />);
  return { onSelect, user };
}

const day = (label: string) => screen.getByRole('button', { name: label });
const dayButtons = () => [...document.querySelectorAll<HTMLButtonElement>('button[data-date]')];
const cellOf = (label: string) => day(label).closest('[role="gridcell"]') as HTMLElement;

describe('Calendar: rendering', () => {
  it('shows the current month as a labelled grid with weekday headers', () => {
    setup();
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ]);
    expect(dayButtons()).toHaveLength(31);
  });

  it('opens on the month of the current selection', () => {
    setup({ selected: '2026-11-15' });
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(day('Sunday, 15 November 2026')).toBeInTheDocument();
  });

  it('renders 29 days for February in a leap year', () => {
    setup({ selected: '2028-02-10' });
    expect(dayButtons()).toHaveLength(29);
  });

  it('marks today with aria-current and gives each day a full spoken label', () => {
    setup();
    expect(day('Tuesday, 6 October 2026')).toHaveAttribute('aria-current', 'date');
    expect(day('Wednesday, 7 October 2026')).not.toHaveAttribute('aria-current');
  });
});

describe('Calendar: selection and range display', () => {
  it('circles only the selected date when one is given', () => {
    setup({ selected: '2026-10-06', rangeStart: '2026-10-06', rangeEnd: '2026-10-10' });
    expect(cellOf('Tuesday, 6 October 2026')).toHaveAttribute('aria-selected', 'true');
    expect(cellOf('Saturday, 10 October 2026')).toHaveAttribute('aria-selected', 'false');
  });

  it('circles both ends when no single date is given, and bands the days between', () => {
    setup({ rangeStart: '2026-10-06', rangeEnd: '2026-10-10' });
    expect(cellOf('Tuesday, 6 October 2026')).toHaveAttribute('aria-selected', 'true');
    expect(cellOf('Saturday, 10 October 2026')).toHaveAttribute('aria-selected', 'true');
    for (const label of [
      'Wednesday, 7 October 2026',
      'Thursday, 8 October 2026',
      'Friday, 9 October 2026',
    ]) {
      expect(cellOf(label).querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    }
    // The ends and days outside the range get no band.
    expect(cellOf('Tuesday, 6 October 2026').querySelector('[aria-hidden="true"]')).toBeNull();
    expect(cellOf('Sunday, 11 October 2026').querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

describe('Calendar: disabled dates', () => {
  it('disables dates before today by default and ignores clicks on them', async () => {
    const { onSelect, user } = setup();
    expect(day('Monday, 5 October 2026')).toHaveAttribute('aria-disabled', 'true');
    expect(day('Tuesday, 6 October 2026')).toHaveAttribute('aria-disabled', 'false');

    await user.click(day('Monday, 5 October 2026'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('honours minDate and maxDate, inclusive', async () => {
    const { onSelect, user } = setup({ minDate: '2026-10-10', maxDate: '2026-10-12' });
    const enabled = dayButtons()
      .filter((button) => button.getAttribute('aria-disabled') === 'false')
      .map((button) => button.dataset.date);
    expect(enabled).toEqual(['2026-10-10', '2026-10-11', '2026-10-12']);

    await user.click(day('Tuesday, 13 October 2026'));
    expect(onSelect).not.toHaveBeenCalled();
    await user.click(day('Monday, 12 October 2026'));
    expect(onSelect).toHaveBeenCalledWith('2026-10-12');
  });

  it('calls onSelect with a plain date when an enabled day is clicked', async () => {
    const { onSelect, user } = setup();
    await user.click(day('Friday, 9 October 2026'));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('2026-10-09');
  });
});

describe('Calendar: month navigation', () => {
  it('moves between months and rolls over the year', async () => {
    const { user } = setup({ selected: '2026-12-15' });
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'January 2027' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument();
  });

  it('cannot go back past the first selectable month', async () => {
    const { user } = setup();
    const previous = screen.getByRole('button', { name: 'Previous month' });
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    await user.click(previous);
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('button', { name: 'Previous month' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
  });

  it('cannot go forward past the month of maxDate', async () => {
    const { user } = setup({ maxDate: '2026-11-20' });
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    const next = screen.getByRole('button', { name: 'Next month' });
    expect(next).toHaveAttribute('aria-disabled', 'true');
    await user.click(next);
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
  });
});

describe('Calendar: keyboard', () => {
  it('has exactly one tab stop among the days, on the selected date', () => {
    setup({ selected: '2026-10-14' });
    const tabbable = dayButtons().filter((button) => button.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBe(day('Wednesday, 14 October 2026'));
  });

  it('moves focus by day and week with the arrow keys, and updates the tab stop', async () => {
    const { user } = setup({ selected: '2026-10-14' });
    day('Wednesday, 14 October 2026').focus();

    await user.keyboard('{ArrowRight}');
    expect(day('Thursday, 15 October 2026')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(day('Thursday, 22 October 2026')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(day('Wednesday, 21 October 2026')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(day('Wednesday, 14 October 2026')).toHaveFocus();
    expect(dayButtons().filter((b) => b.tabIndex === 0)).toEqual([
      day('Wednesday, 14 October 2026'),
    ]);
  });

  it('jumps to the start and end of the week with Home and End', async () => {
    const { user } = setup({ selected: '2026-10-14' });
    day('Wednesday, 14 October 2026').focus();
    await user.keyboard('{Home}');
    expect(day('Sunday, 11 October 2026')).toHaveFocus();
    await user.keyboard('{End}');
    expect(day('Saturday, 17 October 2026')).toHaveFocus();
  });

  it('crosses into the next month when arrowing past its last day', async () => {
    const { user } = setup({ selected: '2026-10-31' });
    day('Saturday, 31 October 2026').focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(day('Sunday, 1 November 2026')).toHaveFocus();
  });

  it('changes month with PageDown and PageUp, clamping the day', async () => {
    const { user } = setup({ selected: '2027-01-31', today: '2026-10-06' });
    day('Sunday, 31 January 2027').focus();
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'February 2027' })).toBeInTheDocument();
    expect(day('Sunday, 28 February 2027')).toHaveFocus();
    await user.keyboard('{PageUp}');
    expect(screen.getByRole('grid', { name: 'January 2027' })).toBeInTheDocument();
  });

  it('changes year with Shift+PageDown', async () => {
    const { user } = setup({ selected: '2026-10-14' });
    day('Wednesday, 14 October 2026').focus();
    await user.keyboard('{Shift>}{PageDown}{/Shift}');
    expect(screen.getByRole('grid', { name: 'October 2027' })).toBeInTheDocument();
    expect(day('Thursday, 14 October 2027')).toHaveFocus();
  });

  it('does not navigate outside the selectable months', async () => {
    const { user } = setup({ selected: '2026-10-14', maxDate: '2026-10-31' });
    day('Wednesday, 14 October 2026').focus();
    await user.keyboard('{PageUp}');
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
    expect(day('Wednesday, 14 October 2026')).toHaveFocus();
  });

  it('selects the focused day with Enter and Space', async () => {
    const { onSelect, user } = setup({ selected: '2026-10-14' });
    day('Wednesday, 14 October 2026').focus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith('2026-10-15');
    await user.keyboard('{ArrowRight} ');
    expect(onSelect).toHaveBeenLastCalledWith('2026-10-16');
  });

  it('can focus a disabled day but does not select it', async () => {
    const { onSelect, user } = setup();
    day('Tuesday, 6 October 2026').focus();
    await user.keyboard('{ArrowLeft}');
    expect(day('Monday, 5 October 2026')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('ignores unrelated keys', async () => {
    const { onSelect, user } = setup({ selected: '2026-10-14' });
    day('Wednesday, 14 October 2026').focus();
    await user.keyboard('x');
    expect(day('Wednesday, 14 October 2026')).toHaveFocus();
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('Calendar: structure', () => {
  it('uses grid, row and gridcell roles with seven cells per row', () => {
    setup();
    const grid = screen.getByRole('grid');
    const rows = within(grid).getAllByRole('row');
    expect(rows).toHaveLength(6); // header + five weeks
    for (const row of rows.slice(1)) {
      expect(within(row).getAllByRole('gridcell')).toHaveLength(7);
    }
  });
});
